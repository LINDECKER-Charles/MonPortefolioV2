use axum::{
    Router,
    body::Body,
    extract::ConnectInfo,
    http::{Request, StatusCode, header},
    response::Response,
};
use base64::{Engine, engine::general_purpose::STANDARD};
use http_body_util::BodyExt;
use portfolio_backend::{
    AppState,
    blog::{BlogInput, MediaRecord, MediaUpload},
    config::{AppEnvironment, BackofficeConfig},
    contact::ContactMessage,
    routes,
    storage::Store,
};
use serde_json::{Value, json};
use std::{io::Cursor, net::SocketAddr, path::PathBuf, sync::Arc, time::Duration};
use tower::ServiceExt;

fn app(store: Arc<Store>) -> (Router, String) {
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
    let cookie = format!(
        "portfolio_backoffice={}",
        store.create_session(Duration::from_secs(600)).unwrap()
    );
    (routes::router(state), cookie)
}

fn request(method: &str, path: &str, cookie: Option<&str>) -> Request<Body> {
    let mut builder = Request::builder()
        .method(method)
        .uri(path)
        .header(header::HOST, "portfolio.test")
        .header(header::ORIGIN, "https://portfolio.test")
        .header("x-backoffice-request", "1");
    if let Some(cookie) = cookie {
        builder = builder.header(header::COOKIE, cookie);
    }
    let mut request = builder.body(Body::empty()).unwrap();
    request.extensions_mut().insert(ConnectInfo(
        "192.0.2.11:1234".parse::<SocketAddr>().unwrap(),
    ));
    request
}

async fn body(response: Response) -> Value {
    serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes()).unwrap()
}

async fn report(app: &Router, cookie: &str) -> Value {
    let response = app
        .clone()
        .oneshot(request("GET", "/api/backoffice/storage", Some(cookie)))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    body(response).await
}

fn upload(
    store: &Store,
    filename: &str,
    width: u32,
    height: u32,
    format: image::ImageFormat,
) -> MediaRecord {
    let image = image::DynamicImage::ImageRgb8(image::RgbImage::from_fn(width, height, |x, y| {
        image::Rgb([(x % 251) as u8, (y % 241) as u8, ((x * y) % 239) as u8])
    }));
    let mut bytes = Cursor::new(Vec::new());
    image.write_to(&mut bytes, format).unwrap();
    store
        .create_blog_media(MediaUpload {
            filename: filename.into(),
            content_type: format.to_mime_type().into(),
            data_base64: STANDARD.encode(bytes.into_inner()),
        })
        .unwrap()
}

fn article(slug: &str, image: Option<&str>) -> BlogInput {
    let mut content =
        vec![json!({"type":"paragraph","content":[{"type":"text","text":"Une idée à partager."}]})];
    if let Some(src) = image {
        content.push(json!({"type":"image","attrs":{"src":src,"alt":"Une capture"}}));
    }
    serde_json::from_value(json!({
        "title": format!("Article {slug}"),
        "slug": slug,
        "excerpt": "Une explication de la démarche.",
        "content": {"type":"doc","content":content},
    }))
    .unwrap()
}

fn sum(categories: &Value) -> u64 {
    [
        "media_originals",
        "media_variants",
        "posts",
        "contacts",
        "system",
    ]
    .iter()
    .map(|name| categories[name].as_u64().unwrap())
    .sum()
}

struct TempDatabase(PathBuf);
impl Drop for TempDatabase {
    fn drop(&mut self) {
        for suffix in ["", "-wal", "-shm"] {
            let mut path = self.0.clone().into_os_string();
            path.push(suffix);
            let _ = std::fs::remove_file(path);
        }
    }
}

#[tokio::test]
async fn storage_requires_a_backoffice_session_and_no_mcp_token_opens_it() {
    let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
    let (app, _) = app(store.clone());
    let response = app
        .clone()
        .oneshot(request("GET", "/api/backoffice/storage", None))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    let (_, token) = store
        .create_token_with_scopes(
            "Tout",
            &["contacts:read", "blog:read", "blog:write", "blog:publish"].map(String::from),
        )
        .unwrap();
    let mut bearer = request("GET", "/api/backoffice/storage", None);
    bearer.headers_mut().insert(
        header::AUTHORIZATION,
        format!("Bearer {token}").parse().unwrap(),
    );
    assert_eq!(
        app.oneshot(bearer).await.unwrap().status(),
        StatusCode::UNAUTHORIZED
    );
}

#[tokio::test]
async fn storage_lists_every_image_with_the_articles_that_cite_it() {
    let database = TempDatabase(std::env::temp_dir().join(format!(
        "portfolio-storage-{:016x}.sqlite3",
        rand::random::<u64>()
    )));
    let store = Arc::new(Store::open(&database.0, Some("owner@example.org")).unwrap());
    let (app, cookie) = app(store.clone());
    let cited = upload(&store, "capture.jpg", 1200, 800, image::ImageFormat::Jpeg);
    let unused = upload(&store, "logo.png", 120, 80, image::ImageFormat::Png);
    // Publié avec l’image, puis retirée de la version de travail : la version
    // publiée la cite encore.
    let post = store
        .create_blog_post(article("avec-image", Some(&cited.url)))
        .unwrap();
    let post = store.publish_blog_post(post.id, post.revision).unwrap();
    let mut retouche = article("avec-image", None);
    retouche.revision = Some(post.revision);
    store.update_blog_post(post.id, retouche).unwrap();
    let draft = store.create_blog_post(article("sans-image", None)).unwrap();
    store
        .save_contact(
            &ContactMessage {
                name: "Une personne".into(),
                email: "person@example.org".parse().unwrap(),
                subject: "Projet".into(),
                message: "Bonjour à vous".into(),
            },
            "unconfigured",
        )
        .unwrap();

    let value = report(&app, &cookie).await;
    let disk = &value["disk"];
    assert!(disk["total"].as_u64().unwrap() >= disk["available"].as_u64().unwrap());
    assert!(disk["available"].as_u64().unwrap() > 0);
    let database_report = &value["database"];
    let file = database_report["file"].as_u64().unwrap();
    let wal = database_report["wal"].as_u64().unwrap();
    let size = database_report["size"].as_u64().unwrap();
    let free = database_report["free"].as_u64().unwrap();
    assert!(file > 0);
    // Les pages de la base, rangées par catégorie ou libres, sont dans le fichier ou son journal.
    assert_eq!(sum(&value["categories"]) + free, size);
    assert!(sum(&value["categories"]) <= file + wal);
    let categories = &value["categories"];
    assert!(categories["media_originals"].as_u64().unwrap() >= cited.size + unused.size);
    assert!(categories["media_variants"].as_u64().unwrap() > 0);
    assert!(categories["posts"].as_u64().unwrap() > 0);
    assert!(categories["system"].as_u64().unwrap() > 0);
    assert_eq!(value["contacts"]["count"], 1);
    assert_eq!(value["contacts"]["size"], categories["contacts"]);

    let media = value["media"].as_array().unwrap();
    assert_eq!(media.len(), 2);
    assert_eq!(media[0]["id"], cited.id, "la plus lourde d’abord");
    assert!(media[0]["total"].as_u64() >= media[1]["total"].as_u64());
    assert_eq!(media[0]["filename"], "capture.jpg");
    assert_eq!(media[0]["content_type"], "image/jpeg");
    assert_eq!(
        (media[0]["width"].clone(), media[0]["height"].clone()),
        (json!(1200), json!(800))
    );
    assert_eq!(media[0]["size"], cited.size);
    assert_eq!(media[0]["variants"]["widths"], json!(cited.variants));
    assert_eq!(media[0]["variants"]["count"], cited.variants.len());
    assert_eq!(
        media[0]["total"].as_u64().unwrap(),
        cited.size + media[0]["variants"]["size"].as_u64().unwrap()
    );
    assert_eq!(media[0]["url"], cited.url);
    assert_eq!(
        media[0]["admin_url"],
        format!("/api/backoffice/blog/media/{}", cited.id)
    );
    assert_eq!(
        media[0]["posts"],
        json!([{"id":post.id,"slug":"avec-image","title":"Article avec-image","status":"published"}])
    );
    assert_eq!(media[1]["id"], unused.id);
    assert_eq!(media[1]["posts"], json!([]));

    let posts = value["posts"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert!(posts[0]["size"].as_u64() >= posts[1]["size"].as_u64());
    // Le publié garde deux versions : il pèse plus que le brouillon.
    assert_eq!(posts[0]["id"], post.id);
    assert_eq!(posts[1]["id"], draft.id);
    assert_eq!(posts[1]["status"], "draft");
    assert_eq!(posts[1]["title"], "Article sans-image");

    // La même règle refuse de supprimer l’image citée et laisse partir l’autre.
    let refused = app
        .clone()
        .oneshot(request(
            "DELETE",
            &format!("/api/backoffice/blog/media/{}", cited.id),
            Some(&cookie),
        ))
        .await
        .unwrap();
    assert_eq!(refused.status(), StatusCode::CONFLICT);
    assert_eq!(body(refused).await["code"], "MEDIA_IN_USE");
    let deleted = app
        .clone()
        .oneshot(request(
            "DELETE",
            &format!("/api/backoffice/blog/media/{}", unused.id),
            Some(&cookie),
        ))
        .await
        .unwrap();
    assert_eq!(deleted.status(), StatusCode::OK);
    let value = report(&app, &cookie).await;
    let ids: Vec<&Value> = value["media"]
        .as_array()
        .unwrap()
        .iter()
        .map(|media| &media["id"])
        .collect();
    assert_eq!(ids, vec![&json!(cited.id)]);
    drop(app);
    drop(store);
}

#[tokio::test]
async fn an_in_memory_database_reports_no_disk_and_no_file() {
    let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
    let (app, cookie) = app(store);
    let value = report(&app, &cookie).await;
    assert_eq!(value["disk"], Value::Null);
    assert_eq!(value["database"]["file"], Value::Null);
    assert_eq!(value["database"]["wal"], Value::Null);
    let size = value["database"]["size"].as_u64().unwrap();
    assert!(size > 0);
    assert_eq!(
        sum(&value["categories"]) + value["database"]["free"].as_u64().unwrap(),
        size
    );
    assert_eq!(value["media"], json!([]));
    assert_eq!(value["posts"], json!([]));
    assert_eq!(
        value["contacts"],
        json!({"count":0,"size":value["categories"]["contacts"]})
    );
}
