use std::{
    net::SocketAddr,
    sync::{Arc, Mutex},
};

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
    contact::ContactMessage,
    mail::{DeliveryError, DeliveryFuture, MailDelivery},
    routes,
    storage::Store,
};
use serde_json::{Value, json};
use tower::ServiceExt;

const PASSWORD: &str = "correct horse battery staple";

fn credentials() -> BackofficeConfig {
    BackofficeConfig {
        email: "admin@example.org".into(),
        password: PASSWORD.into(),
        environment: AppEnvironment::Development,
        totp_encryption_key: None,
    }
}

fn fixture(delivery: Option<Arc<dyn MailDelivery>>) -> (Router, Arc<Store>) {
    let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
    let state =
        AppState::with_store(delivery, None, store.clone(), Some(credentials()), true).unwrap();
    (routes::router(state), store)
}

fn request(method: &str, path: &str, body: Value, cookie: Option<&str>) -> Request<Body> {
    let mut builder = Request::builder()
        .method(method)
        .uri(path)
        .header(header::HOST, "portfolio.test")
        .header(header::ORIGIN, "https://portfolio.test")
        .header("x-backoffice-request", "1")
        .header(header::CONTENT_TYPE, "application/json");
    if let Some(cookie) = cookie {
        builder = builder.header(header::COOKIE, cookie);
    }
    let mut request = builder.body(Body::from(body.to_string())).unwrap();
    request.extensions_mut().insert(ConnectInfo(
        "192.0.2.10:1234".parse::<SocketAddr>().unwrap(),
    ));
    request
}

async fn body(response: Response) -> Value {
    serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes()).unwrap()
}

async fn login(app: &Router) -> String {
    let response = app
        .clone()
        .oneshot(request(
            "POST",
            "/api/backoffice/login",
            json!({"email":"admin@example.org","password":PASSWORD}),
            None,
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let cookie = response.headers()[header::SET_COOKIE].to_str().unwrap();
    assert!(cookie.contains("HttpOnly"));
    assert!(cookie.contains("SameSite=Strict"));
    assert!(cookie.contains("Secure"));
    assert!(cookie.contains("Path=/api/backoffice"));
    cookie.split(';').next().unwrap().into()
}

fn form() -> Value {
    json!({"name":"Une personne","email":"visitor@example.org","subject":"Projet commun","message":"Bonjour, une idée à partager."})
}

#[tokio::test]
async fn backoffice_requires_session_and_rejects_csrf_and_foreign_origins() {
    let (app, _) = fixture(None);
    for path in ["session", "contacts", "settings", "links", "tokens"] {
        assert_eq!(
            app.clone()
                .oneshot(request(
                    "GET",
                    &format!("/api/backoffice/{path}"),
                    json!(null),
                    None
                ))
                .await
                .unwrap()
                .status(),
            StatusCode::UNAUTHORIZED
        );
    }
    let mut attempt = request(
        "POST",
        "/api/backoffice/login",
        json!({"email":"admin@example.org","password":PASSWORD}),
        None,
    );
    attempt.headers_mut().remove("x-backoffice-request");
    assert_eq!(
        app.clone().oneshot(attempt).await.unwrap().status(),
        StatusCode::FORBIDDEN
    );
    let cookie = login(&app).await;
    let mut update = request(
        "PUT",
        "/api/backoffice/settings",
        json!({"email":"changed@example.org"}),
        Some(&cookie),
    );
    update.headers_mut().remove("x-backoffice-request");
    assert_eq!(
        app.clone().oneshot(update).await.unwrap().status(),
        StatusCode::FORBIDDEN
    );
    for origin in [
        "https://attacker.test",
        "null",
        "https://portfolio.test.attacker.test",
        "https://portfolio.test:444",
        "https://portfolio.test/path",
    ] {
        let mut update = request(
            "PUT",
            "/api/backoffice/settings",
            json!({"email":"changed@example.org"}),
            Some(&cookie),
        );
        update
            .headers_mut()
            .insert(header::ORIGIN, origin.parse().unwrap());
        assert_eq!(
            app.clone().oneshot(update).await.unwrap().status(),
            StatusCode::FORBIDDEN
        );
    }
    assert_eq!(
        app.clone()
            .oneshot(request(
                "POST",
                "/api/backoffice/logout",
                json!({}),
                Some(&cookie)
            ))
            .await
            .unwrap()
            .status(),
        StatusCode::OK
    );
    assert_eq!(
        app.oneshot(request(
            "GET",
            "/api/backoffice/session",
            json!(null),
            Some(&cookie)
        ))
        .await
        .unwrap()
        .status(),
        StatusCode::UNAUTHORIZED
    );
}

#[tokio::test]
async fn failed_login_is_rate_limited_and_disabled_backoffice_stays_private() {
    let (app, _) = fixture(None);
    for _ in 0..5 {
        assert_eq!(
            app.clone()
                .oneshot(request(
                    "POST",
                    "/api/backoffice/login",
                    json!({"email":"admin@example.org","password":"incorrect"}),
                    None
                ))
                .await
                .unwrap()
                .status(),
            StatusCode::UNAUTHORIZED
        );
    }
    let response = app
        .oneshot(request(
            "POST",
            "/api/backoffice/login",
            json!({"email":"admin@example.org","password":PASSWORD}),
            None,
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::TOO_MANY_REQUESTS);
    assert!(response.headers().contains_key(header::RETRY_AFTER));
    let app = routes::router(AppState::new(None, None));
    assert_eq!(
        app.clone()
            .oneshot(request(
                "POST",
                "/api/backoffice/login",
                json!({"email":"admin@example.org","password":PASSWORD}),
                None
            ))
            .await
            .unwrap()
            .status(),
        StatusCode::SERVICE_UNAVAILABLE
    );
    assert_eq!(
        app.oneshot(request(
            "GET",
            "/api/backoffice/contacts",
            json!(null),
            None
        ))
        .await
        .unwrap()
        .status(),
        StatusCode::UNAUTHORIZED
    );
}

#[tokio::test]
async fn stores_contacts_without_smtp_and_supports_workflow_and_pagination() {
    let (app, store) = fixture(None);
    let response = app
        .clone()
        .oneshot(request("POST", "/api/contact", form(), None))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let cookie = login(&app).await;
    let response = app
        .clone()
        .oneshot(request(
            "GET",
            "/api/backoffice/contacts",
            json!(null),
            Some(&cookie),
        ))
        .await
        .unwrap();
    let page = body(response).await;
    assert_eq!(page["total"], 1);
    assert_eq!(page["new_count"], 1);
    assert_eq!(page["contacts"][0]["delivery_status"], "unconfigured");
    assert!(
        page["contacts"][0]["created_at"]
            .as_str()
            .unwrap()
            .ends_with('Z')
    );
    let id = page["contacts"][0]["id"].as_i64().unwrap();
    for status in ["read", "archived", "new"] {
        assert_eq!(
            app.clone()
                .oneshot(request(
                    "PATCH",
                    &format!("/api/backoffice/contacts/{id}"),
                    json!({"status":status}),
                    Some(&cookie)
                ))
                .await
                .unwrap()
                .status(),
            StatusCode::OK
        );
        assert_eq!(store.get_contact(id).unwrap().unwrap().status, status);
    }
    let response = app
        .clone()
        .oneshot(request(
            "GET",
            "/api/backoffice/contacts?status=all&limit=1&offset=1",
            json!(null),
            Some(&cookie),
        ))
        .await
        .unwrap();
    let page = body(response).await;
    assert_eq!(page["total"], 1);
    assert_eq!(page["contacts"], json!([]));
    for query in ["status=invalid", "limit=0", "limit=101"] {
        assert_eq!(
            app.clone()
                .oneshot(request(
                    "GET",
                    &format!("/api/backoffice/contacts?{query}"),
                    json!(null),
                    Some(&cookie)
                ))
                .await
                .unwrap()
                .status(),
            StatusCode::UNPROCESSABLE_ENTITY
        );
    }
    assert_eq!(
        app.clone()
            .oneshot(request(
                "PATCH",
                &format!("/api/backoffice/contacts/{id}"),
                json!({"status":"invalid"}),
                Some(&cookie)
            ))
            .await
            .unwrap()
            .status(),
        StatusCode::UNPROCESSABLE_ENTITY
    );
    assert_eq!(
        app.clone()
            .oneshot(request(
                "DELETE",
                &format!("/api/backoffice/contacts/{id}"),
                json!({}),
                Some(&cookie)
            ))
            .await
            .unwrap()
            .status(),
        StatusCode::OK
    );
    assert!(store.get_contact(id).unwrap().is_none());
    assert_eq!(
        app.oneshot(request(
            "DELETE",
            &format!("/api/backoffice/contacts/{id}"),
            json!({}),
            Some(&cookie)
        ))
        .await
        .unwrap()
        .status(),
        StatusCode::NOT_FOUND
    );
}

struct Delivery {
    store: Arc<Store>,
    recipients: Mutex<Vec<String>>,
    reject: bool,
}
impl MailDelivery for Delivery {
    fn deliver(&self, _contact: ContactMessage, recipient: lettre::Address) -> DeliveryFuture<'_> {
        Box::pin(async move {
            assert!(
                self.store
                    .list_contacts("all", 50, 0)
                    .unwrap()
                    .contacts
                    .iter()
                    .any(|contact| contact.delivery_status == "pending")
            );
            self.recipients.lock().unwrap().push(recipient.to_string());
            if self.reject {
                Err(DeliveryError)
            } else {
                Ok(())
            }
        })
    }
}

#[tokio::test]
async fn changing_settings_updates_public_email_and_smtp_recipient_without_restart() {
    for reject in [false, true] {
        let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
        let delivery = Arc::new(Delivery {
            store: store.clone(),
            recipients: Mutex::new(vec![]),
            reject,
        });
        let app = routes::router(
            AppState::with_store(
                Some(delivery.clone()),
                None,
                store.clone(),
                Some(credentials()),
                true,
            )
            .unwrap(),
        );
        let cookie = login(&app).await;
        assert_eq!(
            app.clone()
                .oneshot(request(
                    "PUT",
                    "/api/backoffice/settings",
                    json!({"email":"changed@example.org"}),
                    Some(&cookie)
                ))
                .await
                .unwrap()
                .status(),
            StatusCode::OK
        );
        let config = body(
            app.clone()
                .oneshot(request("GET", "/api/config/contact", json!(null), None))
                .await
                .unwrap(),
        )
        .await;
        assert_eq!(config["email"], "changed@example.org");
        let response = app
            .clone()
            .oneshot(request("POST", "/api/contact", form(), None))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            *delivery.recipients.lock().unwrap(),
            vec!["changed@example.org"]
        );
        assert_eq!(
            store.list_contacts("all", 50, 0).unwrap().contacts[0].delivery_status,
            if reject { "failed" } else { "sent" }
        );
        for email in [
            "bad@example.org\r\nBcc: bad@example.org",
            "<script>@example.org",
            "a\"@example.org",
            "bad..email@example.org",
        ] {
            assert_eq!(
                app.clone()
                    .oneshot(request(
                        "PUT",
                        "/api/backoffice/settings",
                        json!({"email":email}),
                        Some(&cookie)
                    ))
                    .await
                    .unwrap()
                    .status(),
                StatusCode::UNPROCESSABLE_ENTITY
            );
        }
    }
}

#[tokio::test]
async fn manages_toolbox_and_mcp_tokens_without_reexposing_secrets() {
    let (app, store) = fixture(None);
    let cookie = login(&app).await;
    for url in [
        "javascript:alert(1)",
        "data:text/html,hello",
        "https://password:secret@example.org",
        "file:///tmp/file",
    ] {
        assert_eq!(
            app.clone()
                .oneshot(request(
                    "POST",
                    "/api/backoffice/links",
                    json!({"label":"Lien","url":url}),
                    Some(&cookie)
                ))
                .await
                .unwrap()
                .status(),
            StatusCode::UNPROCESSABLE_ENTITY
        );
    }
    let response = app
        .clone()
        .oneshot(request(
            "POST",
            "/api/backoffice/links",
            json!({"label":"Umami","url":"https://stats.example.org","description":"Audience"}),
            Some(&cookie),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::CREATED);
    let id = body(response).await["id"].as_i64().unwrap();
    assert_eq!(store.list_links().unwrap()[0].label, "Umami");
    assert_eq!(
        app.clone()
            .oneshot(request(
                "PUT",
                &format!("/api/backoffice/links/{id}"),
                json!({"label":"Grafana","url":"https://grafana.example.org","description":""}),
                Some(&cookie)
            ))
            .await
            .unwrap()
            .status(),
        StatusCode::OK
    );
    assert_eq!(store.list_links().unwrap()[0].label, "Grafana");
    assert_eq!(
        app.clone()
            .oneshot(request(
                "DELETE",
                &format!("/api/backoffice/links/{id}"),
                json!({}),
                Some(&cookie)
            ))
            .await
            .unwrap()
            .status(),
        StatusCode::OK
    );
    let response = app
        .clone()
        .oneshot(request(
            "POST",
            "/api/backoffice/tokens",
            json!({"name":"Ordinateur"}),
            Some(&cookie),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::CREATED);
    let created = body(response).await;
    let token = created["token"].as_str().unwrap();
    let id = created["id"].as_i64().unwrap();
    assert_eq!(token.len(), 64);
    assert!(store.authenticate_token(token).unwrap());
    let response = app
        .clone()
        .oneshot(request(
            "GET",
            "/api/backoffice/tokens",
            json!(null),
            Some(&cookie),
        ))
        .await
        .unwrap();
    let listing = body(response).await;
    assert!(!listing.to_string().contains(token));
    assert!(listing["tokens"][0]["last_used_at"].is_string());
    let mut bearer = request("GET", "/api/backoffice/contacts", json!(null), None);
    bearer.headers_mut().insert(
        header::AUTHORIZATION,
        format!("Bearer {token}").parse().unwrap(),
    );
    assert_eq!(
        app.clone().oneshot(bearer).await.unwrap().status(),
        StatusCode::UNAUTHORIZED
    );
    assert_eq!(
        app.clone()
            .oneshot(request(
                "DELETE",
                &format!("/api/backoffice/tokens/{id}"),
                json!({}),
                Some(&cookie)
            ))
            .await
            .unwrap()
            .status(),
        StatusCode::OK
    );
    assert!(!store.authenticate_token(token).unwrap());
}

#[tokio::test]
async fn changing_admin_password_invalidates_previous_sessions() {
    let (app, store) = fixture(None);
    let cookie = login(&app).await;
    let mut rotated = credentials();
    rotated.password = "rotated configuration password".into();
    AppState::with_store(None, None, store, Some(rotated), true).unwrap();
    assert_eq!(
        app.oneshot(request(
            "GET",
            "/api/backoffice/session",
            json!(null),
            Some(&cookie)
        ))
        .await
        .unwrap()
        .status(),
        StatusCode::UNAUTHORIZED
    );
}
