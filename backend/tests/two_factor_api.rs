use std::{net::SocketAddr, sync::Arc};

use axum::{
    Router,
    body::Body,
    extract::ConnectInfo,
    http::{Request, StatusCode, header},
    response::Response,
};
use http_body_util::BodyExt;
use portfolio_backend::{
    AppState,
    config::{AppEnvironment, BackofficeConfig},
    routes,
    storage::Store,
};
use serde_json::{Value, json};
use totp_rs::{Algorithm, Secret, TOTP};
use tower::ServiceExt;

const EMAIL: &str = "admin@example.org";
const PASSWORD: &str = "correct horse battery staple";

fn config(environment: AppEnvironment) -> BackofficeConfig {
    BackofficeConfig {
        email: EMAIL.into(),
        password: PASSWORD.into(),
        environment,
        totp_encryption_key: Some([42; 32]),
    }
}
fn app(store: Arc<Store>, environment: AppEnvironment) -> Router {
    routes::router(
        AppState::with_store(None, None, store, Some(config(environment)), true).unwrap(),
    )
}
fn request(path: &str, payload: Value, cookie: Option<&str>) -> Request<Body> {
    let mut builder = Request::builder()
        .method("POST")
        .uri(path)
        .header(header::HOST, "portfolio.test")
        .header(header::ORIGIN, "https://portfolio.test")
        .header(header::CONTENT_TYPE, "application/json")
        .header("x-backoffice-request", "1");
    if let Some(cookie) = cookie {
        builder = builder.header(header::COOKIE, cookie);
    }
    let mut request = builder.body(Body::from(payload.to_string())).unwrap();
    request.extensions_mut().insert(ConnectInfo(
        "192.0.2.10:1234".parse::<SocketAddr>().unwrap(),
    ));
    request
}
async fn body(response: Response) -> Value {
    serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes()).unwrap()
}
fn cookie(response: &Response, name: &str) -> String {
    response
        .headers()
        .get_all(header::SET_COOKIE)
        .iter()
        .filter_map(|v| v.to_str().ok())
        .find(|value| value.starts_with(&format!("{name}=")))
        .unwrap()
        .split(';')
        .next()
        .unwrap()
        .into()
}
async fn login(app: &Router) -> (String, Value) {
    let response = app
        .clone()
        .oneshot(request(
            "/api/backoffice/login",
            json!({"email":EMAIL,"password":PASSWORD}),
            None,
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let challenge = cookie(&response, "portfolio_backoffice_challenge");
    (challenge, body(response).await)
}
async fn setup(app: &Router, challenge: &str) -> Value {
    let response = app
        .clone()
        .oneshot(request(
            "/api/backoffice/2fa/setup",
            json!({}),
            Some(challenge),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    body(response).await
}
fn code(setup: &Value) -> String {
    let secret = Secret::Encoded(setup["secret"].as_str().unwrap().into())
        .to_bytes()
        .unwrap();
    TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        secret,
        Some("Portfolio".into()),
        EMAIL.into(),
    )
    .unwrap()
    .generate_current()
    .unwrap()
}

#[tokio::test]
async fn production_and_test_require_enrollment_then_one_time_recovery_and_reject_replay() {
    for environment in [AppEnvironment::Production, AppEnvironment::Test] {
        let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
        let app = app(store.clone(), environment);
        let (challenge, challenge_body) = login(&app).await;
        assert_eq!(
            challenge_body,
            json!({"authenticated":false,"two_factor_required":true,"enrollment_required":true})
        );
        assert!(
            !store
                .authenticate_session(challenge.split('=').nth(1).unwrap())
                .unwrap()
        );
        let before_setup = app
            .clone()
            .oneshot(request(
                "/api/backoffice/2fa/verify",
                json!({"code":"000000"}),
                Some(&challenge),
            ))
            .await
            .unwrap();
        assert_eq!(before_setup.status(), StatusCode::UNAUTHORIZED);
        let enrollment = setup(&app, &challenge).await;
        assert_eq!(
            enrollment["secret"],
            setup(&app, &challenge).await["secret"]
        );
        let imported = TOTP::from_url(enrollment["otpauth_url"].as_str().unwrap()).unwrap();
        assert_eq!(imported.algorithm, Algorithm::SHA1);
        assert_eq!(imported.digits, 6);
        assert_eq!(imported.step, 30);
        assert!(
            enrollment["qr_code_data_url"]
                .as_str()
                .unwrap()
                .starts_with("data:image/png;base64,")
        );
        let code = code(&enrollment);
        let response = app
            .clone()
            .oneshot(request(
                "/api/backoffice/2fa/verify",
                json!({"code":code}),
                Some(&challenge),
            ))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
        let session = cookie(&response, "portfolio_backoffice");
        assert!(
            store
                .authenticate_session(session.split('=').nth(1).unwrap())
                .unwrap()
        );
        let verified = body(response).await;
        let recovery = verified["recovery_codes"].as_array().unwrap();
        assert_eq!(recovery.len(), 8);
        assert_eq!(verified["authenticated"], true);
        // Le défi consommé ne peut créer une seconde session.
        let response = app
            .clone()
            .oneshot(request(
                "/api/backoffice/2fa/verify",
                json!({"code":code}),
                Some(&challenge),
            ))
            .await
            .unwrap();
        assert_eq!(body(response).await["code"], "CHALLENGE_EXPIRED");
        let (challenge, challenge_body) = login(&app).await;
        assert_eq!(challenge_body["enrollment_required"], false);
        // Un nouveau défi ne rend pas réutilisable le compteur TOTP précédent.
        let response = app
            .clone()
            .oneshot(request(
                "/api/backoffice/2fa/verify",
                json!({"code":code}),
                Some(&challenge),
            ))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
        assert_eq!(body(response).await["code"], "INVALID_TWO_FACTOR");
        let response = app
            .clone()
            .oneshot(request(
                "/api/backoffice/2fa/verify",
                json!({"code":recovery[0]}),
                Some(&challenge),
            ))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
        assert!(body(response).await.get("recovery_codes").is_none());
        let (challenge, _) = login(&app).await;
        let response = app
            .clone()
            .oneshot(request(
                "/api/backoffice/2fa/verify",
                json!({"code":recovery[0]}),
                Some(&challenge),
            ))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
        let response = app
            .clone()
            .oneshot(request(
                "/api/backoffice/2fa/verify",
                json!({"code":recovery[1]}),
                Some(&challenge),
            ))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}

#[tokio::test]
async fn only_development_skips_two_factor_and_email_is_required() {
    let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
    let dev = app(store.clone(), AppEnvironment::Development);
    for credentials in [
        json!({"email":"other@example.org","password":PASSWORD}),
        json!({"email":EMAIL,"password":"wrong password"}),
    ] {
        let response = dev
            .clone()
            .oneshot(request("/api/backoffice/login", credentials, None))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
        assert_eq!(body(response).await["code"], "UNAUTHORIZED");
    }
    let response = dev
        .clone()
        .oneshot(request(
            "/api/backoffice/login",
            json!({"email":"ADMIN@example.org","password":PASSWORD}),
            None,
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let session = cookie(&response, "portfolio_backoffice");
    assert_eq!(body(response).await["authenticated"], true);
    let token = session.split('=').nth(1).unwrap();
    assert!(store.authenticate_session(token).unwrap());
    // Le changement de politique ne conserve aucun accès sans second facteur.
    let prod = app(store.clone(), AppEnvironment::Production);
    assert!(!store.authenticate_session(token).unwrap());
    let (_, challenge) = login(&prod).await;
    assert_eq!(challenge["enrollment_required"], true);
}

#[tokio::test]
async fn setup_and_verification_enforce_origin_csrf_challenge_and_attempt_limit() {
    let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
    let app = app(store, AppEnvironment::Production);
    for path in ["/api/backoffice/2fa/setup", "/api/backoffice/2fa/verify"] {
        let response = app
            .clone()
            .oneshot(request(path, json!({"code":"000000"}), None))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
        let mut foreign = request(path, json!({"code":"000000"}), None);
        foreign
            .headers_mut()
            .insert(header::ORIGIN, "https://attacker.test".parse().unwrap());
        assert_eq!(
            app.clone().oneshot(foreign).await.unwrap().status(),
            StatusCode::FORBIDDEN
        );
        let mut no_csrf = request(path, json!({"code":"000000"}), None);
        no_csrf.headers_mut().remove("x-backoffice-request");
        assert_eq!(
            app.clone().oneshot(no_csrf).await.unwrap().status(),
            StatusCode::FORBIDDEN
        );
    }
    let (challenge, _) = login(&app).await;
    for _ in 0..5 {
        assert_eq!(
            app.clone()
                .oneshot(request(
                    "/api/backoffice/2fa/verify",
                    json!({"code":"invalid"}),
                    Some(&challenge)
                ))
                .await
                .unwrap()
                .status(),
            StatusCode::UNAUTHORIZED
        );
    }
    let response = app
        .clone()
        .oneshot(request(
            "/api/backoffice/2fa/setup",
            json!({}),
            Some(&challenge),
        ))
        .await
        .unwrap();
    assert_eq!(body(response).await["code"], "CHALLENGE_EXPIRED");
    let response = app
        .oneshot(request(
            "/api/backoffice/2fa/verify",
            json!({"code":"invalid"}),
            Some(&challenge),
        ))
        .await
        .unwrap();
    assert_eq!(body(response).await["code"], "CHALLENGE_EXPIRED");
}

#[tokio::test]
async fn concurrent_enrollment_challenges_cannot_replace_an_activated_secret() {
    let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
    let app = app(store, AppEnvironment::Production);
    let (first, _) = login(&app).await;
    let (second, _) = login(&app).await;
    let first_setup = setup(&app, &first).await;
    let second_setup = setup(&app, &second).await;
    assert_ne!(first_setup["secret"], second_setup["secret"]);
    let response = app
        .clone()
        .oneshot(request(
            "/api/backoffice/2fa/verify",
            json!({"code":code(&first_setup)}),
            Some(&first),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let response = app
        .clone()
        .oneshot(request(
            "/api/backoffice/2fa/verify",
            json!({"code":code(&second_setup)}),
            Some(&second),
        ))
        .await
        .unwrap();
    assert_eq!(body(response).await["code"], "CHALLENGE_EXPIRED");
    let response = app
        .oneshot(request(
            "/api/backoffice/2fa/setup",
            json!({}),
            Some(&second),
        ))
        .await
        .unwrap();
    assert_eq!(body(response).await["code"], "CHALLENGE_EXPIRED");
}
