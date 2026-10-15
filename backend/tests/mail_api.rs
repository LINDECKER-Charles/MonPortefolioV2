//! Le serveur d’envoi réglé dans le backoffice, contre un faux serveur SMTP
//! local : aucun e-mail ne part sur Internet.
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
use base64::{Engine, engine::general_purpose::STANDARD};
use http_body_util::BodyExt;
use portfolio_backend::{
    AppState,
    config::{AppEnvironment, BackofficeConfig, SmtpConfig, SmtpTls},
    mail::{MailDelivery, SmtpDelivery},
    routes,
    storage::Store,
};
use serde_json::{Value, json};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tower::ServiceExt;

const PASSWORD: &str = "correct horse battery staple";
const MAILBOX_PASSWORD: &str = "mot-de-passe-de-la-boite-42";

fn credentials() -> BackofficeConfig {
    BackofficeConfig {
        email: "admin@example.org".into(),
        password: PASSWORD.into(),
        environment: AppEnvironment::Development,
        totp_encryption_key: Some([7; 32]),
    }
}

fn fixture(fallback: Option<Arc<dyn MailDelivery>>) -> (Router, Arc<Store>) {
    let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
    let state =
        AppState::with_store(fallback, None, store.clone(), Some(credentials()), true).unwrap();
    (routes::router(state), store)
}

fn request_from(
    method: &str,
    path: &str,
    body: Value,
    cookie: Option<&str>,
    peer: &str,
) -> Request<Body> {
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
    request
        .extensions_mut()
        .insert(ConnectInfo(peer.parse::<SocketAddr>().unwrap()));
    request
}

fn request(method: &str, path: &str, body: Value, cookie: Option<&str>) -> Request<Body> {
    request_from(method, path, body, cookie, "192.0.2.10:1234")
}

async fn body(response: Response) -> Value {
    serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes()).unwrap()
}

async fn send(app: &Router, request: Request<Body>) -> (StatusCode, Value) {
    let response = app.clone().oneshot(request).await.unwrap();
    let status = response.status();
    (status, body(response).await)
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
    cookie.split(';').next().unwrap().into()
}

#[derive(Clone, Copy, PartialEq)]
enum Behaviour {
    Accept,
    RefuseAuth,
    RefuseSender,
}

/// Un serveur SMTP en clair sur la boucle locale : il accepte tout, ou refuse
/// l’authentification, ou l’expéditeur. Le compte rendu garde chaque ligne reçue.
async fn fake_smtp(behaviour: Behaviour) -> (u16, Arc<Mutex<String>>) {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let port = listener.local_addr().unwrap().port();
    let transcript = Arc::new(Mutex::new(String::new()));
    let shared = transcript.clone();
    tokio::spawn(async move {
        while let Ok((stream, _)) = listener.accept().await {
            let transcript = shared.clone();
            tokio::spawn(async move {
                let (read, mut write) = stream.into_split();
                let mut lines = BufReader::new(read).lines();
                if write.write_all(b"220 fake.test ESMTP\r\n").await.is_err() {
                    return;
                }
                while let Ok(Some(line)) = lines.next_line().await {
                    transcript.lock().unwrap().push_str(&format!("{line}\n"));
                    let command = line.to_ascii_uppercase();
                    let reply: &[u8] = if command.starts_with("EHLO") {
                        b"250-fake.test\r\n250-AUTH PLAIN\r\n250 8BITMIME\r\n"
                    } else if command.starts_with("AUTH") {
                        if behaviour == Behaviour::RefuseAuth {
                            b"535 5.7.8 Authentication failed\r\n"
                        } else {
                            b"235 2.7.0 Authentication successful\r\n"
                        }
                    } else if command.starts_with("MAIL FROM") {
                        if behaviour == Behaviour::RefuseSender {
                            b"553 5.7.1 Sender address rejected\r\n"
                        } else {
                            b"250 OK\r\n"
                        }
                    } else if command.starts_with("RCPT TO")
                        || command.starts_with("NOOP")
                        || command.starts_with("RSET")
                    {
                        b"250 OK\r\n"
                    } else if command == "DATA" {
                        let _ = write.write_all(b"354 End with a dot\r\n").await;
                        while let Ok(Some(line)) = lines.next_line().await {
                            if line == "." {
                                break;
                            }
                            transcript.lock().unwrap().push_str(&format!("{line}\n"));
                        }
                        b"250 Accepted\r\n"
                    } else if command.starts_with("QUIT") {
                        let _ = write.write_all(b"221 Bye\r\n").await;
                        return;
                    } else {
                        b"502 Command not implemented\r\n"
                    };
                    if write.write_all(reply).await.is_err() {
                        return;
                    }
                }
            });
        }
    });
    (port, transcript)
}

fn local_settings(port: u16) -> Value {
    json!({
        "enabled": true,
        "host": "127.0.0.1",
        "port": port,
        "security": "none",
        "username": "boite@example.org",
        "password": MAILBOX_PASSWORD,
        "from": "boite@example.org",
    })
}

fn contact_form(subject: &str) -> Value {
    json!({"name":"Une personne","email":"visitor@example.org","subject":subject,"message":"Bonjour, une idée à partager."})
}

#[tokio::test]
async fn settings_are_validated_and_the_password_is_never_returned() {
    let (app, _) = fixture(None);
    let cookie = login(&app).await;
    let (status, initial) = send(
        &app,
        request("GET", "/api/backoffice/mail", json!(null), Some(&cookie)),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(initial["source"], "none");
    assert_eq!(initial["active"], false);
    assert!(initial["settings"].is_null());
    assert_eq!(initial["recipient"], "owner@example.org");
    assert_eq!(initial["password_storage"], true);
    assert_eq!(initial["allowed_ports"], json!([465, 587, 25, 2525]));

    let (status, refused) = send(
        &app,
        request(
            "PUT",
            "/api/backoffice/mail",
            json!({"enabled":true,"host":"https://smtp.hostinger.com","port":8080,"security":"ssl","username":"","from":"pas-une-adresse"}),
            Some(&cookie),
        ),
    )
    .await;
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
    assert_eq!(refused["code"], "VALIDATION_ERROR");
    for field in ["host", "port", "security", "from"] {
        assert!(refused["fields"][field].is_string(), "{field}");
    }
    for host in ["smtp.hostinger.com:465", "smtp.hostinger.com/x", "a b"] {
        let (status, refused) = send(
            &app,
            request(
                "PUT",
                "/api/backoffice/mail",
                json!({"enabled":true,"host":host,"port":465,"security":"tls","from":"contact@example.org"}),
                Some(&cookie),
            ),
        )
        .await;
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
        assert!(refused["fields"]["host"].is_string());
    }
    let hostinger = json!({
        "enabled": true, "host": "smtp.hostinger.com", "port": 465, "security": "tls",
        "username": "contact@example.org", "from": "contact@example.org",
    });
    let (status, missing) = send(
        &app,
        request(
            "PUT",
            "/api/backoffice/mail",
            hostinger.clone(),
            Some(&cookie),
        ),
    )
    .await;
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
    assert!(missing["fields"]["password"].is_string());

    let mut with_password = hostinger.clone();
    with_password["password"] = json!(MAILBOX_PASSWORD);
    let response = app
        .clone()
        .oneshot(request(
            "PUT",
            "/api/backoffice/mail",
            with_password,
            Some(&cookie),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let text = String::from_utf8(
        response
            .into_body()
            .collect()
            .await
            .unwrap()
            .to_bytes()
            .to_vec(),
    )
    .unwrap();
    assert!(!text.contains(MAILBOX_PASSWORD));
    let saved: Value = serde_json::from_str(&text).unwrap();
    assert_eq!(saved["source"], "settings");
    assert_eq!(saved["active"], true);
    assert_eq!(saved["settings"]["host"], "smtp.hostinger.com");
    assert_eq!(saved["settings"]["security"], "tls");
    assert_eq!(saved["settings"]["password_set"], true);
    assert!(saved["settings"].get("password").is_none());
    let (_, session) = send(
        &app,
        request("GET", "/api/backoffice/session", json!(null), Some(&cookie)),
    )
    .await;
    assert_eq!(session["smtp_configured"], true);

    // Laissé vide, le mot de passe enregistré reste.
    let mut blank = hostinger.clone();
    blank["password"] = json!("");
    let (status, kept) = send(
        &app,
        request("PUT", "/api/backoffice/mail", blank, Some(&cookie)),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(kept["settings"]["password_set"], true);
    let (status, kept) = send(
        &app,
        request(
            "PUT",
            "/api/backoffice/mail",
            hostinger.clone(),
            Some(&cookie),
        ),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(kept["settings"]["password_set"], true);

    // Le seul mode change, au même port : le mot de passe est à saisir de nouveau.
    let mut switched = hostinger.clone();
    switched["security"] = json!("starttls");
    let (status, refused) = send(
        &app,
        request("PUT", "/api/backoffice/mail", switched, Some(&cookie)),
    )
    .await;
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
    assert!(refused["fields"].get("security").is_none());
    assert!(
        refused["fields"]["password"]
            .as_str()
            .unwrap()
            .starts_with("Ressaisissez le mot de passe")
    );

    // Sans identifiant, pas d’authentification : le mot de passe part.
    let mut anonymous = hostinger.clone();
    anonymous["username"] = json!("");
    let (status, dropped) = send(
        &app,
        request("PUT", "/api/backoffice/mail", anonymous, Some(&cookie)),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(dropped["settings"]["password_set"], false);

    let mut unknown = hostinger.clone();
    unknown["secret"] = json!("x");
    let (status, invalid) = send(
        &app,
        request("PUT", "/api/backoffice/mail", unknown, Some(&cookie)),
    )
    .await;
    assert!(status.is_client_error());
    assert_eq!(invalid["code"], "INVALID_REQUEST");

    let (status, forgotten) = send(
        &app,
        request("DELETE", "/api/backoffice/mail", json!(null), Some(&cookie)),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(forgotten["source"], "none");
    assert!(forgotten["settings"].is_null());

    // Ni lecture ni réglage sans session, ni sans l’en-tête du backoffice.
    let (status, _) = send(
        &app,
        request("GET", "/api/backoffice/mail", json!(null), None),
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
    let mut forged = request("PUT", "/api/backoffice/mail", hostinger, Some(&cookie));
    forged.headers_mut().remove("x-backoffice-request");
    assert_eq!(
        app.clone().oneshot(forged).await.unwrap().status(),
        StatusCode::FORBIDDEN
    );
}

#[tokio::test]
async fn the_saved_password_never_follows_another_server_or_username() {
    let (first, _) = fake_smtp(Behaviour::Accept).await;
    let (other, other_transcript) = fake_smtp(Behaviour::Accept).await;
    let (app, _) = fixture(None);
    let cookie = login(&app).await;
    let (status, _) = send(
        &app,
        request(
            "PUT",
            "/api/backoffice/mail",
            local_settings(first),
            Some(&cookie),
        ),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    // Un autre port, un autre hôte ou un autre identifiant, sans mot de passe :
    // refusé, le mot de passe est à saisir de nouveau.
    let mut moved = local_settings(other);
    moved["password"] = json!("");
    let mut renamed_host = local_settings(first);
    renamed_host["host"] = json!("localhost");
    renamed_host.as_object_mut().unwrap().remove("password");
    let mut renamed_user = local_settings(first);
    renamed_user["username"] = json!("autre@example.org");
    renamed_user.as_object_mut().unwrap().remove("password");
    for changed in [moved.clone(), renamed_host, renamed_user] {
        let (status, refused) = send(
            &app,
            request("PUT", "/api/backoffice/mail", changed, Some(&cookie)),
        )
        .await;
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
        assert!(
            refused["fields"]["password"]
                .as_str()
                .unwrap()
                .starts_with("Ressaisissez le mot de passe")
        );
    }

    // Envoi coupé : le changement passe, mais le mot de passe est oublié.
    moved["enabled"] = json!(false);
    let (status, view) = send(
        &app,
        request("PUT", "/api/backoffice/mail", moved.clone(), Some(&cookie)),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(view["settings"]["password_set"], false);
    moved["enabled"] = json!(true);
    let (status, _) = send(
        &app,
        request("PUT", "/api/backoffice/mail", moved, Some(&cookie)),
    )
    .await;
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
    let (status, _) = send(
        &app,
        request(
            "POST",
            "/api/backoffice/mail/test",
            json!({}),
            Some(&cookie),
        ),
    )
    .await;
    assert_eq!(status, StatusCode::CONFLICT);
    let lines = other_transcript.lock().unwrap().clone();
    assert!(!lines.contains("AUTH"), "{lines}");
    assert!(!lines.contains(&STANDARD.encode(MAILBOX_PASSWORD)));
}

#[tokio::test]
async fn without_an_encryption_key_a_password_cannot_be_saved() {
    let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
    let mut config = credentials();
    config.totp_encryption_key = None;
    let state = AppState::with_store(None, None, store, Some(config), true).unwrap();
    let app = routes::router(state);
    let cookie = login(&app).await;
    let (_, view) = send(
        &app,
        request("GET", "/api/backoffice/mail", json!(null), Some(&cookie)),
    )
    .await;
    assert_eq!(view["password_storage"], false);
    let (status, refused) = send(
        &app,
        request(
            "PUT",
            "/api/backoffice/mail",
            local_settings(2525),
            Some(&cookie),
        ),
    )
    .await;
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
    assert!(
        refused["fields"]["password"]
            .as_str()
            .unwrap()
            .contains("BACKOFFICE_TOTP_ENCRYPTION_KEY")
    );
}

#[tokio::test]
async fn the_test_email_reaches_the_contact_address_then_waits_its_turn() {
    let (port, transcript) = fake_smtp(Behaviour::Accept).await;
    let (app, _) = fixture(None);
    let cookie = login(&app).await;
    let (status, refused) = send(
        &app,
        request(
            "POST",
            "/api/backoffice/mail/test",
            json!({}),
            Some(&cookie),
        ),
    )
    .await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(refused["code"], "SMTP_NOT_CONFIGURED");
    let (status, _) = send(
        &app,
        request(
            "PUT",
            "/api/backoffice/mail",
            local_settings(port),
            Some(&cookie),
        ),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let (status, sent) = send(
        &app,
        request(
            "POST",
            "/api/backoffice/mail/test",
            json!({}),
            Some(&cookie),
        ),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{sent}");
    assert_eq!(sent["result"], "sent");
    assert_eq!(sent["recipient"], "owner@example.org");
    assert!(!sent.to_string().contains(MAILBOX_PASSWORD));
    let lines = transcript.lock().unwrap().clone();
    assert!(lines.contains("MAIL FROM:<boite@example.org>"));
    assert!(lines.contains("RCPT TO:<owner@example.org>"));
    assert!(lines.contains("Subject: [Portfolio] E-mail"));
    let auth = lines
        .lines()
        .find(|line| line.starts_with("AUTH PLAIN "))
        .unwrap();
    let decoded = STANDARD
        .decode(auth.trim_start_matches("AUTH PLAIN "))
        .unwrap();
    assert_eq!(
        decoded,
        format!("\0boite@example.org\0{MAILBOX_PASSWORD}").into_bytes(),
        "Le mot de passe déchiffré est celui saisi."
    );

    let response = app
        .clone()
        .oneshot(request(
            "POST",
            "/api/backoffice/mail/test",
            json!({}),
            Some(&cookie),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::TOO_MANY_REQUESTS);
    assert!(response.headers().contains_key(header::RETRY_AFTER));
    assert_eq!(body(response).await["code"], "RATE_LIMITED");
}

#[tokio::test]
async fn the_test_email_names_each_failure_without_any_secret() {
    let closed = {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        listener.local_addr().unwrap().port()
    };
    let (refuse_auth, _) = fake_smtp(Behaviour::RefuseAuth).await;
    let (refuse_sender, _) = fake_smtp(Behaviour::RefuseSender).await;
    for (port, code) in [
        (closed, "SMTP_CONNECTION_FAILED"),
        (refuse_auth, "SMTP_AUTH_FAILED"),
        (refuse_sender, "SMTP_SENDER_REJECTED"),
    ] {
        let (app, _) = fixture(None);
        let cookie = login(&app).await;
        let (status, _) = send(
            &app,
            request(
                "PUT",
                "/api/backoffice/mail",
                local_settings(port),
                Some(&cookie),
            ),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        let (status, failure) = send(
            &app,
            request(
                "POST",
                "/api/backoffice/mail/test",
                json!({}),
                Some(&cookie),
            ),
        )
        .await;
        assert_eq!(status, StatusCode::BAD_GATEWAY, "{code}");
        assert_eq!(failure["code"], code);
        let text = failure.to_string();
        assert!(!text.contains(MAILBOX_PASSWORD));
        assert!(!text.contains("boite@example.org"));
        assert!(!text.contains("5.7"));
    }
}

#[tokio::test]
async fn notifications_follow_the_current_setting_without_a_restart() {
    let (port, transcript) = fake_smtp(Behaviour::Accept).await;
    let (app, store) = fixture(None);
    let cookie = login(&app).await;
    let post = |subject: &str, peer: &str| {
        request_from("POST", "/api/contact", contact_form(subject), None, peer)
    };
    let latest = |store: &Store| {
        store.list_contacts("all", 1, 0).unwrap().contacts[0]
            .delivery_status
            .clone()
    };
    let (status, _) = send(&app, post("Avant le réglage", "192.0.2.21:1")).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(latest(&store), "unconfigured");

    send(
        &app,
        request(
            "PUT",
            "/api/backoffice/mail",
            local_settings(port),
            Some(&cookie),
        ),
    )
    .await;
    let (status, _) = send(&app, post("Après le réglage", "192.0.2.22:1")).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(latest(&store), "sent");
    assert!(
        transcript
            .lock()
            .unwrap()
            .contains("Subject: [Portfolio] =?utf-8?b?")
            || transcript
                .lock()
                .unwrap()
                .contains("Subject: [Portfolio] Apr")
    );
    assert!(transcript.lock().unwrap().contains("Reply-To:"));

    let mut off = local_settings(port);
    off["enabled"] = json!(false);
    off["password"] = json!("");
    let (_, view) = send(
        &app,
        request("PUT", "/api/backoffice/mail", off, Some(&cookie)),
    )
    .await;
    assert_eq!(view["active"], false);
    let (status, _) = send(&app, post("Envoi coupé", "192.0.2.23:1")).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(latest(&store), "unconfigured");

    // Un serveur qui ne répond plus : la demande reste conservée et le dit.
    let closed = {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        listener.local_addr().unwrap().port()
    };
    send(
        &app,
        request(
            "PUT",
            "/api/backoffice/mail",
            local_settings(closed),
            Some(&cookie),
        ),
    )
    .await;
    let (status, _) = send(&app, post("Serveur muet", "192.0.2.24:1")).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(latest(&store), "failed");
}

#[tokio::test]
async fn a_saved_setting_overrides_the_environment_until_it_is_forgotten() {
    let (port, transcript) = fake_smtp(Behaviour::Accept).await;
    let environment = SmtpDelivery::new(SmtpConfig {
        host: "127.0.0.1".into(),
        port,
        username: None,
        password: None,
        from: "environnement@example.org".parse().unwrap(),
        tls: SmtpTls::None,
    })
    .unwrap();
    let (app, store) = fixture(Some(Arc::new(environment)));
    let cookie = login(&app).await;
    let (_, view) = send(
        &app,
        request("GET", "/api/backoffice/mail", json!(null), Some(&cookie)),
    )
    .await;
    assert_eq!(view["source"], "environment");
    assert_eq!(view["active"], true);
    assert_eq!(view["environment"]["host"], "127.0.0.1");
    assert_eq!(view["environment"]["security"], "none");
    assert_eq!(view["environment"]["from"], "environnement@example.org");

    let mut off = local_settings(port);
    off["enabled"] = json!(false);
    let (_, view) = send(
        &app,
        request("PUT", "/api/backoffice/mail", off, Some(&cookie)),
    )
    .await;
    assert_eq!(view["source"], "settings");
    assert_eq!(view["active"], false);
    let (_, session) = send(
        &app,
        request("GET", "/api/backoffice/session", json!(null), Some(&cookie)),
    )
    .await;
    assert_eq!(session["smtp_configured"], false);
    send(
        &app,
        request_from(
            "POST",
            "/api/contact",
            contact_form("Coupé"),
            None,
            "192.0.2.31:1",
        ),
    )
    .await;
    assert_eq!(
        store.list_contacts("all", 1, 0).unwrap().contacts[0].delivery_status,
        "unconfigured"
    );
    assert!(
        !transcript
            .lock()
            .unwrap()
            .contains("environnement@example.org")
    );

    let (_, view) = send(
        &app,
        request("DELETE", "/api/backoffice/mail", json!(null), Some(&cookie)),
    )
    .await;
    assert_eq!(view["source"], "environment");
    assert_eq!(view["active"], true);
    send(
        &app,
        request_from(
            "POST",
            "/api/contact",
            contact_form("Repli"),
            None,
            "192.0.2.32:1",
        ),
    )
    .await;
    assert_eq!(
        store.list_contacts("all", 1, 0).unwrap().contacts[0].delivery_status,
        "sent"
    );
    assert!(
        transcript
            .lock()
            .unwrap()
            .contains("MAIL FROM:<environnement@example.org>")
    );
}
