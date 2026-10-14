use std::{
    collections::HashMap,
    net::{IpAddr, SocketAddr},
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use axum::{
    Json, Router,
    extract::{ConnectInfo, FromRequest, Path, Query, Request, State},
    http::{HeaderMap, StatusCode, header},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use rand::rngs::OsRng;
use serde::Deserialize;
use serde_json::{Value, json};
use tokio::sync::Semaphore;
use url::Url;

use crate::{
    AppState,
    config::BackofficeConfig,
    error::ApiError,
    storage::{MAX_TOKENS, StoreError, TokenCreationError, TwoFactorResult},
};
use subtle::ConstantTimeEq;

const SESSION_TTL: Duration = Duration::from_secs(12 * 60 * 60);
const COOKIE_NAME: &str = "portfolio_backoffice";
const CHALLENGE_COOKIE: &str = "portfolio_backoffice_challenge";
const CHALLENGE_TTL: Duration = Duration::from_secs(10 * 60);
const LOGIN_WINDOW: Duration = Duration::from_secs(60);

pub(crate) struct AdminAuth {
    password_hash: Option<String>,
    config: Option<BackofficeConfig>,
    secure_cookie: bool,
    attempts: Mutex<HashMap<IpAddr, (Instant, u32)>>,
    verification_slots: Arc<Semaphore>,
    factor_attempts: Mutex<HashMap<IpAddr, (Instant, u32)>>,
}

impl AdminAuth {
    pub(crate) fn new(
        config: Option<BackofficeConfig>,
        password_hash: Option<String>,
        secure_cookie: bool,
    ) -> Self {
        Self {
            password_hash,
            config,
            secure_cookie,
            attempts: Mutex::new(HashMap::new()),
            verification_slots: Arc::new(Semaphore::new(2)),
            factor_attempts: Mutex::new(HashMap::new()),
        }
    }

    fn check_limit(&self, address: IpAddr) -> Result<(), ApiError> {
        check_attempts(&self.attempts, address, 5)
    }

    fn check_factor_limit(&self, address: IpAddr) -> Result<(), ApiError> {
        check_attempts(&self.factor_attempts, address, 20)
    }
}

fn check_attempts(
    attempts: &Mutex<HashMap<IpAddr, (Instant, u32)>>,
    address: IpAddr,
    limit: u32,
) -> Result<(), ApiError> {
    let now = Instant::now();
    let mut attempts = attempts.lock().map_err(|_| storage_error(StoreError))?;
    attempts.retain(|_, (started, _)| now.duration_since(*started) < LOGIN_WINDOW);
    if let Some((started, count)) = attempts.get_mut(&address) {
        if *count >= limit {
            return Err(ApiError::rate_limited(
                LOGIN_WINDOW
                    .saturating_sub(now.duration_since(*started))
                    .as_secs()
                    + 1,
            ));
        }
        *count += 1;
    } else {
        if attempts.len() >= 10_000 {
            return Err(ApiError::rate_limited(60));
        }
        attempts.insert(address, (now, 1));
    }
    Ok(())
}

pub fn hash_password(password: &str) -> Result<String, String> {
    if !(12..=1_024).contains(&password.len()) {
        return Err("Le mot de passe doit contenir 12 à 1 024 octets".into());
    }
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|_| "Impossible de produire l’empreinte du mot de passe".into())
}

pub fn validate_password_hash(value: &str) -> Result<(), String> {
    let hash = PasswordHash::new(value).map_err(|_| {
        "L’empreinte stockée du mot de passe doit être une empreinte Argon2id valide".to_owned()
    })?;
    let parameters = hash.params;
    let valid = hash.algorithm.as_str() == "argon2id"
        && hash.version == Some(19)
        && hash.hash.is_some()
        && hash.salt.is_some()
        && parameters
            .get_decimal("m")
            .is_some_and(|m| (19_456..=32_768).contains(&m))
        && parameters
            .get_decimal("t")
            .is_some_and(|t| (2..=10).contains(&t))
        && parameters
            .get_decimal("p")
            .is_some_and(|p| (1..=8).contains(&p));
    if valid {
        Ok(())
    } else {
        Err("L’empreinte stockée du mot de passe doit utiliser Argon2id v19 (mémoire 19 456–32 768 Kio, 2–10 passes, 1–8 voies)".into())
    }
}

pub fn routes(state: AppState) -> Router<AppState> {
    let protected = Router::new()
        .route("/api/backoffice/session", get(session))
        .route("/api/backoffice/logout", post(logout))
        .route("/api/backoffice/contacts", get(contacts))
        .route(
            "/api/backoffice/contacts/{id}",
            axum::routing::patch(update_contact).delete(delete_contact),
        )
        .route(
            "/api/backoffice/settings",
            get(settings).put(update_settings),
        )
        .route("/api/backoffice/links", get(links).post(create_link))
        .route(
            "/api/backoffice/links/{id}",
            axum::routing::put(update_link).delete(delete_link),
        )
        .route("/api/backoffice/tokens", get(tokens).post(create_token))
        .route(
            "/api/backoffice/tokens/{id}",
            axum::routing::delete(delete_token),
        )
        .route_layer(middleware::from_fn_with_state(state, require_session));
    Router::new()
        .merge(protected)
        .route("/api/backoffice/login", post(login))
        .route("/api/backoffice/2fa/setup", post(setup_two_factor))
        .route("/api/backoffice/2fa/verify", post(verify_two_factor))
}

pub(crate) fn storage_error(_: StoreError) -> ApiError {
    ApiError::new(
        StatusCode::SERVICE_UNAVAILABLE,
        "STORAGE_UNAVAILABLE",
        "Le service est temporairement indisponible.",
    )
}

fn unauthorized() -> ApiError {
    ApiError::new(
        StatusCode::UNAUTHORIZED,
        "UNAUTHORIZED",
        "Une connexion au backoffice est nécessaire.",
    )
}
fn invalid() -> ApiError {
    ApiError::new(
        StatusCode::UNPROCESSABLE_ENTITY,
        "VALIDATION_ERROR",
        "Vérifiez les champs du formulaire.",
    )
}
/// Le plafond d’accès MCP (storage::MAX_TOKENS) : une règle à expliquer, pas une panne.
fn token_limit_reached() -> ApiError {
    ApiError::new(
        StatusCode::CONFLICT,
        "TOKEN_LIMIT_REACHED",
        format!(
            "Le portfolio compte déjà {MAX_TOKENS} accès MCP, le maximum. Révoquez un accès inutilisé pour en créer un autre."
        ),
    )
}
fn not_found() -> ApiError {
    ApiError::new(
        StatusCode::NOT_FOUND,
        "NOT_FOUND",
        "Cet élément n’existe pas.",
    )
}
fn changed(found: bool) -> Result<Json<Value>, ApiError> {
    if found {
        Ok(Json(json!({"ok":true})))
    } else {
        Err(not_found())
    }
}

pub(crate) fn check_origin(headers: &HeaderMap) -> Result<(), ApiError> {
    let Some(origin) = headers.get(header::ORIGIN) else {
        return Ok(());
    };
    let denied = || {
        ApiError::new(
            StatusCode::FORBIDDEN,
            "INVALID_ORIGIN",
            "Cette origine n’est pas autorisée.",
        )
    };
    let origin = origin
        .to_str()
        .ok()
        .and_then(|value| Url::parse(value).ok())
        .ok_or_else(denied)?;
    if !matches!(origin.scheme(), "https" | "http")
        || origin.host_str().is_none()
        || origin.path() != "/"
        || !origin.username().is_empty()
        || origin.password().is_some()
        || origin.query().is_some()
        || origin.fragment().is_some()
    {
        return Err(denied());
    }
    let host = headers
        .get(header::HOST)
        .and_then(|header| header.to_str().ok())
        .ok_or_else(denied)?;
    let expected = Url::parse(&format!("{}://{host}", origin.scheme())).map_err(|_| denied())?;
    if expected.host_str() != origin.host_str()
        || expected.port_or_known_default() != origin.port_or_known_default()
        || expected.path() != "/"
        || !expected.username().is_empty()
        || expected.query().is_some()
        || expected.fragment().is_some()
    {
        return Err(denied());
    }
    Ok(())
}

pub(crate) fn check_mutation(headers: &HeaderMap) -> Result<(), ApiError> {
    check_origin(headers)?;
    if headers
        .get("x-backoffice-request")
        .is_none_or(|value| value != "1")
    {
        return Err(ApiError::new(
            StatusCode::FORBIDDEN,
            "CSRF_REJECTED",
            "Cette requête n’est pas autorisée.",
        ));
    }
    Ok(())
}

fn cookie<'a>(headers: &'a HeaderMap, name: &str) -> Option<&'a str> {
    headers
        .get(header::COOKIE)?
        .to_str()
        .ok()?
        .split(';')
        .find_map(|cookie| cookie.trim().strip_prefix(&format!("{name}=")))
}
fn session_cookie(headers: &HeaderMap) -> Option<&str> {
    cookie(headers, COOKIE_NAME)
}
fn set_cookie(response: &mut Response, state: &AppState, name: &str, token: &str, ttl: Duration) {
    let secure = if state.admin_auth.secure_cookie {
        "; Secure"
    } else {
        ""
    };
    response.headers_mut().append(
        header::SET_COOKIE,
        format!(
            "{name}={token}; Path=/api/backoffice; Max-Age={}; HttpOnly; SameSite=Strict{secure}",
            ttl.as_secs()
        )
        .parse()
        .expect("generated authentication cookie"),
    );
}
fn authenticated_response(
    state: &AppState,
    token: &str,
    recovery_codes: Option<Vec<String>>,
) -> Response {
    let mut body = json!({"authenticated":true,"smtp_configured":state.delivery.is_some()});
    if let Some(codes) = recovery_codes {
        body["recovery_codes"] = json!(codes);
    }
    let mut response = Json(body).into_response();
    set_cookie(&mut response, state, COOKIE_NAME, token, SESSION_TTL);
    set_cookie(&mut response, state, CHALLENGE_COOKIE, "", Duration::ZERO);
    response
}

pub(crate) async fn require_session(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, ApiError> {
    if state.admin_auth.password_hash.is_none() {
        return Err(unauthorized());
    }
    let authenticated = if let Some(token) = session_cookie(request.headers()) {
        state
            .store
            .authenticate_session(token)
            .map_err(storage_error)?
    } else {
        false
    };
    if !authenticated {
        return Err(unauthorized());
    }
    check_origin(request.headers())?;
    if !matches!(
        *request.method(),
        axum::http::Method::GET | axum::http::Method::HEAD
    ) {
        check_mutation(request.headers())?;
    }
    Ok(next.run(request).await)
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Login {
    email: String,
    password: String,
}

async fn login(
    State(state): State<AppState>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    request: Request,
) -> Result<Response, ApiError> {
    check_mutation(request.headers())?;
    state.admin_auth.check_limit(crate::routes::client_ip(
        peer,
        request.headers(),
        state.proxy_token.as_deref(),
    ))?;
    let old_challenge = cookie(request.headers(), CHALLENGE_COOKIE).map(str::to_owned);
    let old_session = session_cookie(request.headers()).map(str::to_owned);
    let Json(payload) =
        Json::<Login>::from_request(request, &state)
            .await
            .map_err(|rejection| {
                ApiError::new(
                    rejection.status(),
                    "INVALID_REQUEST",
                    "La requête reçue est invalide.",
                )
            })?;
    let config = state.admin_auth.config.as_ref().ok_or_else(|| {
        ApiError::new(
            StatusCode::SERVICE_UNAVAILABLE,
            "BACKOFFICE_DISABLED",
            "Le backoffice n’est pas configuré.",
        )
    })?;
    let hash = state
        .admin_auth
        .password_hash
        .clone()
        .ok_or_else(unauthorized)?;
    if payload.password.len() > 1_024 || payload.email.len() > 254 {
        return Err(unauthorized());
    }
    let expected_email = config.email.clone();
    let permit = state
        .admin_auth
        .verification_slots
        .clone()
        .try_acquire_owned()
        .map_err(|_| ApiError::rate_limited(2))?;
    let verified = tokio::task::spawn_blocking(move || {
        // Calculer Argon2 même si l’adresse ne correspond pas, pour ne pas exposer l’identifiant.
        let _permit = permit;
        let correct_password = PasswordHash::new(&hash).is_ok_and(|hash| {
            Argon2::default()
                .verify_password(payload.password.as_bytes(), &hash)
                .is_ok()
        });
        let email = payload.email.trim().to_ascii_lowercase();
        correct_password && bool::from(expected_email.as_bytes().ct_eq(email.as_bytes()))
    })
    .await
    .map_err(|_| storage_error(StoreError))?;
    if !verified {
        return Err(unauthorized());
    }
    if let Some(token) = old_challenge {
        state
            .store
            .delete_challenge(&token)
            .map_err(storage_error)?;
    }
    if let Some(token) = old_session {
        state.store.delete_session(&token).map_err(storage_error)?;
    }
    if !config.environment.requires_two_factor() {
        let token = state
            .store
            .create_session(SESSION_TTL)
            .map_err(storage_error)?;
        return Ok(authenticated_response(&state, &token, None));
    }
    let (token, enrollment) = state
        .store
        .create_challenge(CHALLENGE_TTL)
        .map_err(storage_error)?;
    let mut response = Json(
        json!({"authenticated":false,"two_factor_required":true,"enrollment_required":enrollment}),
    )
    .into_response();
    set_cookie(
        &mut response,
        &state,
        CHALLENGE_COOKIE,
        &token,
        CHALLENGE_TTL,
    );
    set_cookie(&mut response, &state, COOKIE_NAME, "", Duration::ZERO);
    Ok(response)
}

fn expired_challenge() -> ApiError {
    ApiError::new(
        StatusCode::UNAUTHORIZED,
        "CHALLENGE_EXPIRED",
        "La vérification a expiré. Connectez-vous à nouveau.",
    )
}

async fn setup_two_factor(
    State(state): State<AppState>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    check_mutation(&headers)?;
    state
        .admin_auth
        .check_factor_limit(crate::routes::client_ip(
            peer,
            &headers,
            state.proxy_token.as_deref(),
        ))?;
    let config = state
        .admin_auth
        .config
        .as_ref()
        .filter(|config| config.environment.requires_two_factor())
        .ok_or_else(expired_challenge)?;
    let key = config
        .totp_encryption_key
        .as_ref()
        .ok_or_else(expired_challenge)?;
    let token = cookie(&headers, CHALLENGE_COOKIE).ok_or_else(expired_challenge)?;
    let secret = state
        .store
        .enrollment_secret(token, key)
        .map_err(storage_error)?
        .ok_or_else(expired_challenge)?;
    let totp = crate::two_factor::totp(secret, &config.email).map_err(storage_error)?;
    let url = totp.get_url();
    let qr = crate::two_factor::qr_code(&url).map_err(storage_error)?;
    Ok(Json(
        json!({"secret":totp.get_secret_base32(),"otpauth_url":url,"qr_code_data_url":qr}),
    ))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct TwoFactorCode {
    code: String,
}

async fn verify_two_factor(
    State(state): State<AppState>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    request: Request,
) -> Result<Response, ApiError> {
    check_mutation(request.headers())?;
    state
        .admin_auth
        .check_factor_limit(crate::routes::client_ip(
            peer,
            request.headers(),
            state.proxy_token.as_deref(),
        ))?;
    let config = state
        .admin_auth
        .config
        .as_ref()
        .filter(|config| config.environment.requires_two_factor())
        .ok_or_else(expired_challenge)?;
    let key = config
        .totp_encryption_key
        .as_ref()
        .ok_or_else(expired_challenge)?;
    let token = cookie(request.headers(), CHALLENGE_COOKIE)
        .ok_or_else(expired_challenge)?
        .to_owned();
    let Json(payload) = Json::<TwoFactorCode>::from_request(request, &state)
        .await
        .map_err(|rejection| {
            ApiError::new(
                rejection.status(),
                "INVALID_REQUEST",
                "La requête reçue est invalide.",
            )
        })?;
    if payload.code.len() > 128 {
        return Err(invalid());
    }
    match state
        .store
        .verify_two_factor(&token, payload.code.trim(), key, SESSION_TTL)
        .map_err(storage_error)?
    {
        TwoFactorResult::Verified {
            session,
            recovery_codes,
        } => Ok(authenticated_response(&state, &session, recovery_codes)),
        TwoFactorResult::Expired => Err(expired_challenge()),
        TwoFactorResult::Invalid => Err(ApiError::new(
            StatusCode::UNAUTHORIZED,
            "INVALID_TWO_FACTOR",
            "Ce code est incorrect ou a déjà été utilisé.",
        )),
    }
}

async fn session(State(state): State<AppState>) -> Json<Value> {
    Json(json!({"authenticated":true,"smtp_configured":state.delivery.is_some()}))
}

async fn logout(State(state): State<AppState>, headers: HeaderMap) -> Result<Response, ApiError> {
    if let Some(token) = session_cookie(&headers) {
        state.store.delete_session(token).map_err(storage_error)?;
    }
    if let Some(token) = cookie(&headers, CHALLENGE_COOKIE) {
        state.store.delete_challenge(token).map_err(storage_error)?;
    }
    let mut response = Json(json!({"ok":true})).into_response();
    set_cookie(&mut response, &state, COOKIE_NAME, "", Duration::ZERO);
    set_cookie(&mut response, &state, CHALLENGE_COOKIE, "", Duration::ZERO);
    Ok(response)
}

#[derive(Deserialize)]
#[serde(default, deny_unknown_fields)]
struct ContactQuery {
    status: String,
    limit: u32,
    offset: u32,
}
impl Default for ContactQuery {
    fn default() -> Self {
        Self {
            status: "new".into(),
            limit: 50,
            offset: 0,
        }
    }
}

async fn contacts(
    State(state): State<AppState>,
    Query(query): Query<ContactQuery>,
) -> Result<Json<crate::storage::ContactPage>, ApiError> {
    if !matches!(query.status.as_str(), "new" | "read" | "archived" | "all")
        || !(1..=100).contains(&query.limit)
    {
        return Err(invalid());
    }
    Ok(Json(
        state
            .store
            .list_contacts(&query.status, query.limit, query.offset)
            .map_err(storage_error)?,
    ))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct StatusChange {
    status: String,
}
async fn update_contact(
    State(state): State<AppState>,
    Path(id): Path<i64>,
    Json(payload): Json<StatusChange>,
) -> Result<Json<Value>, ApiError> {
    if !matches!(payload.status.as_str(), "new" | "read" | "archived") {
        return Err(invalid());
    }
    changed(
        state
            .store
            .update_contact_status(id, &payload.status)
            .map_err(storage_error)?,
    )
}
async fn delete_contact(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Value>, ApiError> {
    changed(state.store.delete_contact(id).map_err(storage_error)?)
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Settings {
    email: String,
}
async fn settings(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    Ok(Json(
        json!({"email":state.store.contact_email().map_err(storage_error)?}),
    ))
}
async fn update_settings(
    State(state): State<AppState>,
    Json(payload): Json<Settings>,
) -> Result<Json<Value>, ApiError> {
    let email = payload.email.trim();
    if !crate::config::valid_contact_email(email) {
        return Err(invalid());
    }
    state
        .store
        .set_contact_email(email)
        .map_err(storage_error)?;
    Ok(Json(json!({"email":email})))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct LinkInput {
    label: String,
    url: String,
    #[serde(default)]
    description: String,
}
impl LinkInput {
    fn validate(mut self) -> Result<Self, ApiError> {
        self.label = self.label.trim().into();
        self.url = self.url.trim().into();
        self.description = self.description.trim().into();
        if !(1..=100).contains(&self.label.chars().count())
            || self.description.chars().count() > 500
            || self.url.len() > 2_048
            || self.label.chars().any(char::is_control)
            || self.description.chars().any(char::is_control)
            || self.url.chars().any(char::is_control)
        {
            return Err(invalid());
        }
        let url = Url::parse(&self.url).map_err(|_| invalid())?;
        if !matches!(url.scheme(), "http" | "https")
            || url.host_str().is_none()
            || !url.username().is_empty()
            || url.password().is_some()
        {
            return Err(invalid());
        }
        self.url = url.to_string();
        Ok(self)
    }
}
async fn links(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    Ok(Json(
        json!({"links":state.store.list_links().map_err(storage_error)?}),
    ))
}
async fn create_link(
    State(state): State<AppState>,
    Json(payload): Json<LinkInput>,
) -> Result<(StatusCode, Json<Value>), ApiError> {
    let link = payload.validate()?;
    let id = state
        .store
        .create_link(&link.label, &link.url, &link.description)
        .map_err(storage_error)?;
    Ok((
        StatusCode::CREATED,
        Json(json!({"id":id,"label":link.label,"url":link.url,"description":link.description})),
    ))
}
async fn update_link(
    State(state): State<AppState>,
    Path(id): Path<i64>,
    Json(payload): Json<LinkInput>,
) -> Result<Json<Value>, ApiError> {
    let link = payload.validate()?;
    changed(
        state
            .store
            .update_link(id, &link.label, &link.url, &link.description)
            .map_err(storage_error)?,
    )
}
async fn delete_link(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Value>, ApiError> {
    changed(state.store.delete_link(id).map_err(storage_error)?)
}

async fn tokens(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    Ok(Json(
        json!({"tokens":state.store.list_tokens().map_err(storage_error)?}),
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct TokenInput {
    name: String,
    #[serde(default = "default_token_scopes")]
    scopes: Vec<String>,
}

fn default_token_scopes() -> Vec<String> {
    vec!["contacts:read".into(), "blog:read".into()]
}

pub(crate) fn valid_token_scopes(scopes: &[String]) -> bool {
    !scopes.is_empty()
        && scopes.len() <= 4
        && scopes.iter().enumerate().all(|(index, scope)| {
            matches!(
                scope.as_str(),
                "contacts:read" | "blog:read" | "blog:write" | "blog:publish"
            ) && !scopes[..index].contains(scope)
        })
        && (!scopes.iter().any(|scope| scope == "blog:write")
            || scopes.iter().any(|scope| scope == "blog:read"))
        && (!scopes.iter().any(|scope| scope == "blog:publish")
            || scopes.iter().any(|scope| scope == "blog:write"))
}
async fn create_token(
    State(state): State<AppState>,
    Json(payload): Json<TokenInput>,
) -> Result<(StatusCode, Json<Value>), ApiError> {
    let name = payload.name.trim();
    if !(1..=100).contains(&name.chars().count())
        || name.chars().any(char::is_control)
        || !valid_token_scopes(&payload.scopes)
    {
        return Err(invalid());
    }
    let (id, token) = state
        .store
        .create_token_with_scopes(name, &payload.scopes)
        .map_err(|error| match error {
            TokenCreationError::LimitReached => token_limit_reached(),
            TokenCreationError::Store(error) => storage_error(error),
        })?;
    Ok((
        StatusCode::CREATED,
        Json(json!({"id":id,"name":name,"token":token,"scopes":payload.scopes})),
    ))
}
async fn delete_token(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Value>, ApiError> {
    changed(state.store.delete_token(id).map_err(storage_error)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_default_hash_but_rejects_hash_exceeding_container_memory_budget() {
        let hash = hash_password("correct horse battery staple").unwrap();
        assert!(validate_password_hash(&hash).is_ok());
        // Modifier uniquement les paramètres PHC évite tout calcul ou allocation de 256 Mio.
        let excessive_memory = hash.replace("m=19456", "m=262144");
        assert_ne!(excessive_memory, hash);
        assert!(validate_password_hash(&excessive_memory).is_err());
        assert!(validate_password_hash(&hash.replace("m=19456", "m=32768")).is_ok());
        assert!(validate_password_hash(&hash.replace("m=19456", "m=32769")).is_err());
    }
}
