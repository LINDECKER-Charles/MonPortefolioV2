//! File d’attente des gros envois : les imports d’images (backoffice et outil
//! MCP `blog_upload_media`) attendent leur tour avant que leur corps soit lu.
//!
//! Les images se décodent une à la fois (`blog_media`), mais chaque requête en
//! cours tient son corps en mémoire : le JSON reçu, la chaîne base64, l’image
//! décodée de base64 et son original nettoyé. Sans file, huit imports
//! simultanés de 4 Mio à côté d’une image lourde dépassaient les 256 Mio du
//! conteneur, et le noyau tuait le service, formulaire de contact compris.
//!
//! Une requête en attente ne lit pas son corps : il reste chez le client, que
//! TCP freine (contre-pression). Seul un corps qui peut dépasser
//! `LARGE_BODY_BYTES` attend avant sa lecture : `Content-Length` au-dessus du seuil,
//! ou absent avec un corps en flux. Un petit import, lui, prend sa place une fois
//! son corps lu, avant son traitement (`turn`) : un petit fichier peut coûter
//! autant à décoder qu’un gros. Les autres petites requêtes (appels MCP
//! ordinaires, formulaire de contact, atelier) ne l’attendent jamais.
use std::{future::poll_fn, pin::Pin, sync::Arc, time::Duration};

use axum::{
    Extension,
    body::{Body, HttpBody},
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use tokio::sync::{OwnedSemaphorePermit, Semaphore};

use crate::{AppState, error::ApiError};

/// Deux imports à la fois : l’un se décode pendant que l’autre attend son
/// tour de décodage avec son corps déjà lu. Mesuré dans un conteneur de
/// 320 Mio (`compose.deploy.yaml`, allocateur réglé par `backend/Dockerfile`),
/// une image lourde et 8 à 48 imports de 4 Mio à la fois montent à 171 Mio de
/// mémoire anonyme, et 48 clients qui enchaînent leurs imports pendant 30 s à
/// 175 Mio, contre 168 Mio pour le pire import seul ; une place de plus
/// ajouterait un corps sans rien accélérer, puisque le décodage reste un à la
/// fois.
pub const UPLOAD_SLOTS: usize = 2;
/// Au-delà de 64 Kio, un corps passe par la file : une image de plus de 48 Kio
/// une fois en base64. Un appel MCP ordinaire ou un article tient en dessous ;
/// un article plus long n’est pas une image et ne passe pas par ces routes.
pub const LARGE_BODY_BYTES: u64 = 64 * 1024;
/// Attente au plus : 10 s. Le relais Node (`DELAI_API`) et l’atelier
/// abandonnent une requête à 20 s ; il en reste 10 pour l’import lui-même
/// (moins d’une seconde pour le pire cas mesuré), et la réponse 503 arrive
/// avant qu’ils abandonnent.
pub const UPLOAD_WAIT: Duration = Duration::from_secs(10);
/// Délai conseillé au client (`Retry-After`), en secondes.
const RETRY_AFTER_SECONDS: u64 = 10;
/// Un corps refusé est lu et jeté avant la réponse, jusqu’à 9 Mio (au-delà de
/// la plus grande requête admise, 8 Mio pour le MCP) et pendant 5 s au plus :
/// fermer une connexion dont le corps n’est pas lu la réinitialise (RST), et
/// le client perdrait la réponse.
const DRAIN_BYTES: usize = 9 * 1024 * 1024;
const DRAIN_WAIT: Duration = Duration::from_secs(5);

#[derive(Clone)]
pub(crate) struct UploadQueue {
    slots: Arc<Semaphore>,
    wait: Duration,
}

impl UploadQueue {
    pub(crate) fn new(wait: Duration) -> Self {
        Self {
            slots: Arc::new(Semaphore::new(UPLOAD_SLOTS)),
            wait,
        }
    }
}

/// La place d’un gros envoi, tant que la requête ou son traitement la garde.
/// Un traitement hors des fils d’Axum (`spawn_blocking`) la garde jusqu’au
/// bout : il continue même si le client ferme sa connexion.
#[derive(Clone)]
pub(crate) struct UploadTurn {
    _permit: Arc<OwnedSemaphorePermit>,
}

/// Middleware des routes qui reçoivent des images, posé après l’authentification.
pub(crate) async fn wait_turn(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response {
    if !is_large(&request) {
        return next.run(request).await;
    }
    let Some(turn) = acquire(&state.upload_queue).await else {
        return refuse(request).await;
    };
    request.extensions_mut().insert(turn.clone());
    let response = next.run(request).await;
    drop(turn);
    response
}

/// La place d’un import pour son traitement : celle que `wait_turn` a prise
/// avant de lire un gros corps, sinon une place prise maintenant, son petit
/// corps déjà lu. Un petit fichier peut coûter autant à décoder qu’un gros (un
/// GIF de 15 Kio et de 18,7 Mpx) : sans place, une rafale de petits imports
/// occupait autant de fils de traitement, qui gardent chacun la mémoire qu’ils
/// ont libérée, et le service mourait faute de mémoire. Après `UPLOAD_WAIT`,
/// la réponse est la même que pour un gros envoi (`503 UPLOAD_BUSY`).
pub(crate) async fn turn(
    state: &AppState,
    taken: Option<UploadTurn>,
) -> Result<UploadTurn, ApiError> {
    match taken {
        Some(turn) => Ok(turn),
        None => acquire(&state.upload_queue).await.ok_or_else(busy),
    }
}

async fn acquire(queue: &UploadQueue) -> Option<UploadTurn> {
    let permit = tokio::time::timeout(queue.wait, queue.slots.clone().acquire_owned())
        .await
        .ok()?
        .ok()?;
    Some(UploadTurn {
        _permit: Arc::new(permit),
    })
}

fn busy() -> ApiError {
    ApiError::new(
        StatusCode::SERVICE_UNAVAILABLE,
        "UPLOAD_BUSY",
        "D’autres images sont en cours d’import. Réessayez dans quelques secondes.",
    )
    .with_retry_after(RETRY_AFTER_SECONDS)
}

/// `Content-Length` au-dessus du seuil, ou absent avec un corps en flux.
fn is_large(request: &Request) -> bool {
    request
        .body()
        .size_hint()
        .upper()
        .is_none_or(|bytes| bytes > LARGE_BODY_BYTES)
}

async fn refuse(request: Request) -> Response {
    let mut body = request.into_body();
    let drained = matches!(
        tokio::time::timeout(DRAIN_WAIT, drain(&mut body)).await,
        Ok(true)
    );
    let mut response = busy().into_response();
    if drained {
        return response;
    }
    // Corps trop long ou trop lent : la connexion ne sera pas réutilisée.
    response
        .headers_mut()
        .insert(axum::http::header::CONNECTION, "close".parse().unwrap());
    response
}

/// Lit le corps morceau par morceau sans le garder ; `true` s’il est lu jusqu’au bout.
async fn drain(body: &mut Body) -> bool {
    let mut read = 0;
    while read <= DRAIN_BYTES {
        match poll_fn(|context| Pin::new(&mut *body).poll_frame(context)).await {
            Some(Ok(frame)) => read += frame.data_ref().map_or(0, |data| data.len()),
            Some(Err(_)) => return false,
            None => return true,
        }
    }
    false
}

/// La place prise par `wait_turn`, si la requête est passée par la file.
pub(crate) type MaybeTurn = Option<Extension<UploadTurn>>;

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{Router, middleware, routing::post};
    use http_body_util::{BodyExt, channel::Channel};
    use tower::ServiceExt;

    fn app(wait: Duration) -> (Router, Arc<Semaphore>) {
        let state = AppState::new(None, None).with_upload_wait(wait);
        let slots = state.upload_queue.slots.clone();
        let app = Router::new()
            .route(
                "/import",
                post(|body: Body| async move {
                    let bytes = body.collect().await.unwrap().to_bytes();
                    bytes.len().to_string()
                }),
            )
            .layer(middleware::from_fn_with_state(state.clone(), wait_turn))
            .with_state(state);
        (app, slots)
    }

    /// Les deux places prises par des envois en cours.
    async fn taken(slots: &Semaphore) {
        while slots.available_permits() > 0 {
            tokio::task::yield_now().await;
        }
    }

    fn request(body: Body) -> Request {
        Request::post("/import").body(body).unwrap()
    }

    /// Un gros envoi en cours : son corps arrive en flux et ne finit pas avant `send_data`.
    fn streaming() -> (http_body_util::channel::Sender<axum::body::Bytes>, Request) {
        let (sender, body) = Channel::<axum::body::Bytes>::new(1);
        (sender, request(Body::new(body)))
    }

    async fn text(response: Response) -> String {
        String::from_utf8(
            response
                .into_body()
                .collect()
                .await
                .unwrap()
                .to_bytes()
                .to_vec(),
        )
        .unwrap()
    }

    #[tokio::test]
    async fn a_third_large_request_waits_while_two_are_read_and_a_small_one_passes() {
        let (app, slots) = app(Duration::from_secs(30));
        let (mut first, request_one) = streaming();
        let (second, request_two) = streaming();
        let one = tokio::spawn(app.clone().oneshot(request_one));
        let two = tokio::spawn(app.clone().oneshot(request_two));
        taken(&slots).await;
        // Content-Length au-dessus du seuil : la troisième attend sa place.
        let large = vec![b'a'; LARGE_BODY_BYTES as usize + 1];
        let mut third = tokio::spawn(app.clone().oneshot(request(Body::from(large))));
        assert!(
            tokio::time::timeout(Duration::from_millis(200), &mut third)
                .await
                .is_err(),
            "la troisième grosse requête attend"
        );
        // Une petite requête ne passe jamais par la file.
        let small = app
            .clone()
            .oneshot(request(Body::from(vec![b'a'; 1024])))
            .await
            .unwrap();
        assert_eq!(small.status(), StatusCode::OK);
        assert_eq!(text(small).await, "1024");
        // La première finit : sa place revient à la troisième.
        first.send_data("fin".into()).await.unwrap();
        drop(first);
        assert_eq!(text(one.await.unwrap().unwrap()).await, "3");
        let third = tokio::time::timeout(Duration::from_secs(5), third)
            .await
            .expect("la troisième passe dès qu’une place se libère")
            .unwrap()
            .unwrap();
        assert_eq!(text(third).await, (LARGE_BODY_BYTES + 1).to_string());
        drop(second);
        assert_eq!(two.await.unwrap().unwrap().status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn a_large_request_waiting_too_long_gets_a_503_with_retry_after() {
        let (app, slots) = app(Duration::from_millis(100));
        let (_first, request_one) = streaming();
        let (_second, request_two) = streaming();
        let _one = tokio::spawn(app.clone().oneshot(request_one));
        let _two = tokio::spawn(app.clone().oneshot(request_two));
        taken(&slots).await;
        let response = app
            .clone()
            .oneshot(request(Body::from(vec![b'a'; 200_000])))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
        assert_eq!(response.headers()["retry-after"], "10");
        assert!(!response.headers().contains_key("connection"));
        let body: serde_json::Value = serde_json::from_str(&text(response).await).unwrap();
        assert_eq!(body["code"], "UPLOAD_BUSY");
        // Un corps en flux sans fin n’est pas lu au-delà de DRAIN_BYTES.
        let (sender, endless) = streaming();
        let feeder = tokio::spawn(async move {
            let mut sender = sender;
            let chunk = axum::body::Bytes::from(vec![0u8; 1024 * 1024]);
            while sender.send_data(chunk.clone()).await.is_ok() {}
        });
        let response = app.oneshot(endless).await.unwrap();
        assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
        assert_eq!(response.headers()["connection"], "close");
        feeder.abort();
    }

    /// Bloque le traitement des images (`blog_media::TURN`) jusqu’à ce que le
    /// canal rendu soit lâché.
    fn hold_processing() -> std::sync::mpsc::Sender<()> {
        let (release, released) = std::sync::mpsc::channel::<()>();
        let (locked, is_locked) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let _turn = crate::blog_media::TURN
                .lock()
                .unwrap_or_else(std::sync::PoisonError::into_inner);
            locked.send(()).unwrap();
            let _ = released.recv();
        });
        is_locked.recv().unwrap();
        release
    }

    async fn places_become(slots: &Semaphore, expected: usize) {
        tokio::time::timeout(Duration::from_secs(5), async {
            while slots.available_permits() != expected {
                tokio::time::sleep(Duration::from_millis(5)).await;
            }
        })
        .await
        .unwrap_or_else(|_| panic!("{expected} places libres attendues"));
    }

    #[tokio::test]
    async fn an_import_keeps_its_place_until_processed_even_if_its_client_leaves() {
        use crate::{
            config::{AppEnvironment, BackofficeConfig},
            storage::Store,
        };
        use axum::http::header;
        use base64::{Engine, engine::general_purpose::STANDARD};

        let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
        let state = AppState::with_store(
            None,
            None,
            store.clone(),
            Some(BackofficeConfig {
                email: "admin@example.org".into(),
                password: "correct horse battery staple".into(),
                environment: AppEnvironment::Development,
                totp_encryption_key: None,
            }),
            false,
        )
        .unwrap();
        let slots = state.upload_queue.slots.clone();
        let app = crate::routes::router(state);
        let cookie = format!(
            "portfolio_backoffice={}",
            store.create_session(Duration::from_secs(600)).unwrap()
        );
        let (_, token) = store
            .create_token_with_scopes("Imports", &["blog:read".into(), "blog:write".into()])
            .unwrap();
        // Un PNG d’un pixel suivi de 70 000 octets : plus de 64 Kio en base64.
        let mut image = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut image, 1, 1);
            encoder.set_color(png::ColorType::Rgba);
            let mut writer = encoder.write_header().unwrap();
            writer.write_image_data(&[0, 0, 0, 255]).unwrap();
        }
        image.extend_from_slice(&[0; 70_000]);
        let upload = serde_json::json!({
            "filename": "grande.png",
            "content_type": "image/png",
            "data_base64": STANDARD.encode(&image),
        });
        let post = |path: &str, payload: serde_json::Value| {
            Request::post(path)
                .header(header::HOST, "portfolio.test")
                .header(header::ORIGIN, "https://portfolio.test")
                .header(header::CONTENT_TYPE, "application/json")
                .header("x-backoffice-request", "1")
                .header(header::COOKIE, &cookie)
                .header(header::AUTHORIZATION, format!("Bearer {token}"))
                .header(header::ACCEPT, "application/json, text/event-stream")
                .body(Body::from(payload.to_string()))
                .unwrap()
        };
        let mcp = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {"name": "blog_upload_media", "arguments": upload},
        });
        for (way, request) in [
            (
                "backoffice",
                post("/api/backoffice/blog/media", upload.clone()),
            ),
            ("MCP", post("/mcp", mcp)),
        ] {
            let release = hold_processing();
            let pending = tokio::spawn(app.clone().oneshot(request));
            places_become(&slots, UPLOAD_SLOTS - 1).await;
            // Le corps est lu, le traitement attend son tour : le client part.
            tokio::time::sleep(Duration::from_millis(100)).await;
            pending.abort();
            let _ = pending.await;
            tokio::time::sleep(Duration::from_millis(50)).await;
            assert_eq!(
                slots.available_permits(),
                UPLOAD_SLOTS - 1,
                "{way} : le traitement garde sa place après le départ du client"
            );
            drop(release);
            places_become(&slots, UPLOAD_SLOTS).await;
        }
        assert_eq!(store.list_blog_media(10, 0).unwrap().len(), 2);
    }
}
