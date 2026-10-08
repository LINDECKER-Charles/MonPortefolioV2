use std::{net::SocketAddr, sync::Arc, sync::Mutex};

use axum::{
    body::Body,
    extract::ConnectInfo,
    http::{Request, StatusCode},
    response::Response,
};
use http_body_util::BodyExt;
use portfolio_backend::{
    AppState,
    config::{SmtpConfig, SmtpTls},
    contact::ContactMessage,
    mail::{DeliveryError, DeliveryFuture, MailDelivery, SmtpDelivery},
    routes,
};
use serde_json::{Value, json};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tower::ServiceExt;

#[derive(Default)]
struct TestDelivery {
    sent: Mutex<Vec<ContactMessage>>,
    reject: bool,
}

impl MailDelivery for TestDelivery {
    fn deliver(&self, contact: ContactMessage) -> DeliveryFuture<'_> {
        Box::pin(async move {
            if self.reject {
                return Err(DeliveryError);
            }
            self.sent.lock().unwrap().push(contact);
            Ok(())
        })
    }
}

fn valid_form() -> Value {
    json!({
        "name": "  Une personne  ",
        "email": " visitor@example.org ",
        "subject": "  Un projet commun  ",
        "message": "  Bonjour, voici une idée à discuter.\nUne seconde ligne.  "
    })
}

fn request(body: String) -> Request<Body> {
    let mut request = Request::builder()
        .method("POST")
        .uri("/api/contact")
        .header("content-type", "application/json")
        .body(Body::from(body))
        .unwrap();
    request.extensions_mut().insert(ConnectInfo(
        "192.0.2.10:1234".parse::<SocketAddr>().unwrap(),
    ));
    request
}

async fn json_body(response: Response) -> Value {
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    serde_json::from_slice(&bytes).unwrap()
}

#[tokio::test]
async fn validates_and_delivers_trimmed_form_before_confirming_success() {
    let delivery = Arc::new(TestDelivery::default());
    let app = routes::router(AppState::new(Some(delivery.clone()), None));
    let response = app
        .oneshot(request(valid_form().to_string()))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(response.headers()["cache-control"], "no-store");
    let body = json_body(response).await;
    assert!(body["message"].as_str().unwrap().contains("envoyé"));
    let sent = delivery.sent.lock().unwrap();
    assert_eq!(sent.len(), 1);
    assert_eq!(sent[0].name, "Une personne");
    assert_eq!(sent[0].email.to_string(), "visitor@example.org");
    assert_eq!(sent[0].subject, "Un projet commun");
    assert_eq!(
        sent[0].message,
        "Bonjour, voici une idée à discuter.\nUne seconde ligne."
    );
}

#[tokio::test]
async fn rejects_missing_fields_header_injection_and_honeypot_without_sending() {
    let delivery = Arc::new(TestDelivery::default());
    let app = routes::router(AppState::new(Some(delivery.clone()), None));
    let missing = app.clone().oneshot(request("{}".into())).await.unwrap();
    assert_eq!(missing.status(), StatusCode::UNPROCESSABLE_ENTITY);
    let body = json_body(missing).await;
    assert_eq!(body["code"], "VALIDATION_ERROR");
    for field in ["name", "email", "subject", "message"] {
        assert!(body["fields"][field].is_string());
    }

    for field in ["name", "email", "subject"] {
        let mut form = valid_form();
        form[field] = "Injected\r\nBcc: attacker@example.org".into();
        let response = app
            .clone()
            .oneshot(request(form.to_string()))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
        assert!(json_body(response).await["fields"][field].is_string());
    }
    let mut form = valid_form();
    form["website"] = "https://spam.example".into();
    let response = app.oneshot(request(form.to_string())).await.unwrap();
    assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    assert_eq!(json_body(response).await["code"], "INVALID_FORM");
    assert!(delivery.sent.lock().unwrap().is_empty());
}

#[tokio::test]
async fn unavailable_or_rejected_delivery_never_returns_success() {
    let app = routes::router(AppState::new(None, None));
    let response = app
        .oneshot(request(valid_form().to_string()))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
    assert_eq!(json_body(response).await["code"], "CONTACT_UNAVAILABLE");

    let delivery = Arc::new(TestDelivery {
        reject: true,
        ..Default::default()
    });
    let app = routes::router(AppState::new(Some(delivery.clone()), None));
    let response = app
        .oneshot(request(valid_form().to_string()))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::BAD_GATEWAY);
    assert_eq!(json_body(response).await["code"], "DELIVERY_FAILED");
    assert!(delivery.sent.lock().unwrap().is_empty());
}

#[tokio::test]
async fn bounds_json_body_and_returns_structured_parse_errors() {
    let app = routes::router(AppState::new(None, None));
    let response = app.clone().oneshot(request("{".into())).await.unwrap();
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    assert_eq!(json_body(response).await["code"], "INVALID_REQUEST");
    let response = app
        .oneshot(request(" ".repeat(routes::MAX_BODY_BYTES + 1)))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::PAYLOAD_TOO_LARGE);
    assert_eq!(json_body(response).await["code"], "PAYLOAD_TOO_LARGE");
}

#[tokio::test]
async fn rate_limits_invalid_attempts_and_does_not_trust_spoofed_forwarding() {
    let app = routes::router(AppState::new(None, Some("secret".repeat(8))));
    for index in 0..5 {
        let mut attempt = request("{".into());
        attempt.headers_mut().insert(
            "x-contact-client-ip",
            format!("203.0.113.{}", index + 1).parse().unwrap(),
        );
        let response = app.clone().oneshot(attempt).await.unwrap();
        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    }
    let response = app.oneshot(request("{".into())).await.unwrap();
    assert_eq!(response.status(), StatusCode::TOO_MANY_REQUESTS);
    assert!(
        response.headers()["retry-after"]
            .to_str()
            .unwrap()
            .parse::<u64>()
            .unwrap()
            > 0
    );
    assert_eq!(json_body(response).await["code"], "RATE_LIMITED");
}

#[tokio::test]
async fn authenticated_proxy_keeps_client_limits_separate() {
    let token = "a".repeat(64);
    let app = routes::router(AppState::new(None, Some(token.clone())));
    for index in 0..6 {
        let mut attempt = request("{".into());
        attempt
            .extensions_mut()
            .insert(ConnectInfo("127.0.0.1:4321".parse::<SocketAddr>().unwrap()));
        attempt
            .headers_mut()
            .insert("x-contact-proxy-token", token.parse().unwrap());
        attempt.headers_mut().insert(
            "x-contact-client-ip",
            format!("203.0.113.{}", index + 1).parse().unwrap(),
        );
        assert_eq!(
            app.clone().oneshot(attempt).await.unwrap().status(),
            StatusCode::BAD_REQUEST
        );
    }
}

#[tokio::test]
async fn health_and_unknown_routes_use_consistent_responses() {
    let app = routes::router(AppState::new(None, None));
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(json_body(response).await["status"], "ok");
    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/absent")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
    assert_eq!(json_body(response).await["code"], "NOT_FOUND");
}

#[tokio::test]
async fn smtp_acceptance_uses_fixed_recipient_sender_and_visitor_reply_to() {
    for accept in [true, false] {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let port = listener.local_addr().unwrap().port();
        let relay = tokio::spawn(async move {
            let (stream, _) = listener.accept().await.unwrap();
            let (read, mut write) = stream.into_split();
            let mut lines = BufReader::new(read).lines();
            write.write_all(b"220 local.test ESMTP\r\n").await.unwrap();
            let mut transcript = String::new();
            while let Some(line) = lines.next_line().await.unwrap() {
                transcript.push_str(&line);
                transcript.push('\n');
                if line.starts_with("EHLO") {
                    write
                        .write_all(b"250-local.test\r\n250 8BITMIME\r\n")
                        .await
                        .unwrap();
                } else if line.starts_with("MAIL FROM:") || line.starts_with("RCPT TO:") {
                    write.write_all(b"250 OK\r\n").await.unwrap();
                } else if line == "DATA" {
                    write.write_all(b"354 End with a dot\r\n").await.unwrap();
                    while let Some(line) = lines.next_line().await.unwrap() {
                        if line == "." {
                            break;
                        }
                        transcript.push_str(&line);
                        transcript.push('\n');
                    }
                    let status: &[u8] = if accept {
                        b"250 Accepted\r\n"
                    } else {
                        b"550 Rejected\r\n"
                    };
                    write.write_all(status).await.unwrap();
                    break;
                } else {
                    panic!("Unexpected SMTP command");
                }
            }
            transcript
        });
        let delivery = SmtpDelivery::new(
            SmtpConfig {
                host: "127.0.0.1".into(),
                port,
                username: None,
                password: None,
                from: "sender@example.org".parse().unwrap(),
                tls: SmtpTls::None,
            },
            "owner@example.org".parse().unwrap(),
        )
        .unwrap();
        let app = routes::router(AppState::new(Some(Arc::new(delivery)), None));
        let response = app
            .oneshot(request(valid_form().to_string()))
            .await
            .unwrap();
        assert_eq!(
            response.status(),
            if accept {
                StatusCode::OK
            } else {
                StatusCode::BAD_GATEWAY
            }
        );
        let transcript = relay.await.unwrap();
        assert!(transcript.contains("MAIL FROM:<sender@example.org>"));
        assert!(transcript.contains("RCPT TO:<owner@example.org>"));
        let reply_to = transcript
            .lines()
            .find(|line| line.starts_with("Reply-To:"))
            .unwrap();
        assert!(reply_to.contains("<visitor@example.org>"));
        assert!(!transcript.contains("RCPT TO:<visitor@example.org>"));
    }
}
