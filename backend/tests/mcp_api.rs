use std::{sync::Arc, time::Duration};

use axum::{
    Router,
    body::Body,
    http::{Request, StatusCode},
    response::Response,
};
use base64::{Engine, engine::general_purpose::STANDARD};
use http_body_util::BodyExt;
use portfolio_backend::{AppState, contact::ContactMessage, mcp, storage::Store};
use serde_json::{Value, json};
use tower::ServiceExt;

struct Fixture {
    app: Router,
    store: Arc<Store>,
    token: String,
    token_id: i64,
    first_contact: i64,
}

fn fixture() -> Fixture {
    let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
    let (token_id, token) = store.create_token("Tests MCP").unwrap();
    let contact = |subject: &str| ContactMessage {
        name: "Une personne".into(),
        email: "visitor@example.org".parse().unwrap(),
        subject: subject.into(),
        message: "Un message privé envoyé depuis le formulaire du portfolio.".into(),
    };
    let first_contact = store
        .save_contact(&contact("Premier contact"), "sent")
        .unwrap();
    let read = store
        .save_contact(&contact("Deuxième contact"), "failed")
        .unwrap();
    store.update_contact_status(read, "read").unwrap();
    let archived = store
        .save_contact(&contact("Troisième contact"), "unconfigured")
        .unwrap();
    store.update_contact_status(archived, "archived").unwrap();
    store
        .create_link("Umami", "https://umami.example.org", "Mesure d’audience")
        .unwrap();
    let state = AppState::with_store(None, None, store.clone(), None, false).unwrap();
    Fixture {
        app: mcp::routes().with_state(state),
        store,
        token,
        token_id,
        first_contact,
    }
}

fn legacy_request(token: Option<&str>, payload: Value) -> Request<Body> {
    let mut builder = Request::builder()
        .method("POST")
        .uri("/mcp")
        .header("host", "portfolio.example.org")
        .header("content-type", "application/json")
        .header("accept", "application/json, text/event-stream");
    if let Some(token) = token {
        builder = builder.header("authorization", format!("Bearer {token}"));
    }
    builder.body(Body::from(payload.to_string())).unwrap()
}

fn tool_request(token: &str, name: &str, arguments: Value) -> Request<Body> {
    legacy_request(
        Some(token),
        json!({
            "jsonrpc": "2.0", "id": 1, "method": "tools/call",
            "params": { "name": name, "arguments": arguments }
        }),
    )
}

fn modern_request(token: &str, method: &str, mut params: Value) -> Request<Body> {
    params["_meta"] = json!({
        "io.modelcontextprotocol/protocolVersion": "2026-07-28",
        "io.modelcontextprotocol/clientCapabilities": {}
    });
    let mut request = legacy_request(
        Some(token),
        json!({
            "jsonrpc": "2.0", "id": "modern-1", "method": method, "params": params
        }),
    );
    request
        .headers_mut()
        .insert("mcp-protocol-version", "2026-07-28".parse().unwrap());
    request
        .headers_mut()
        .insert("mcp-method", method.parse().unwrap());
    if let Some(name) = params["name"].as_str() {
        request
            .headers_mut()
            .insert("mcp-name", name.parse().unwrap());
    }
    request
}

async fn body(response: Response) -> Value {
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    serde_json::from_slice(&bytes).unwrap()
}

#[tokio::test]
async fn requires_revocable_mcp_bearer_and_never_accepts_admin_sessions() {
    let fixture = fixture();
    let payload = json!({ "jsonrpc": "2.0", "id": 1, "method": "tools/list" });
    let session = fixture
        .store
        .create_session(Duration::from_secs(60))
        .unwrap();
    for token in [None, Some("wrong-token"), Some(session.as_str())] {
        let mut request = legacy_request(token, payload.clone());
        request.headers_mut().insert(
            "cookie",
            format!("portfolio_admin={session}").parse().unwrap(),
        );
        let response = fixture.app.clone().oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
        assert!(response.headers().contains_key("www-authenticate"));
        let data = body(response).await.to_string();
        assert!(!data.contains("visitor@example.org"));
        assert!(!data.contains("Premier contact"));
        assert!(!data.contains(&fixture.token));
    }
    let valid = fixture
        .app
        .clone()
        .oneshot(legacy_request(Some(&fixture.token), payload.clone()))
        .await
        .unwrap();
    assert_eq!(valid.status(), StatusCode::OK);
    fixture.store.delete_token(fixture.token_id).unwrap();
    let revoked = fixture
        .app
        .oneshot(legacy_request(Some(&fixture.token), payload))
        .await
        .unwrap();
    assert_eq!(revoked.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn implements_legacy_handshake_and_empty_notification_responses() {
    let fixture = fixture();
    let response = fixture.app.clone().oneshot(legacy_request(Some(&fixture.token), json!({
        "jsonrpc": "2.0", "id": 7, "method": "initialize",
        "params": { "protocolVersion": "2025-11-25", "capabilities": {}, "clientInfo": { "name": "Tests", "version": "1" } }
    }))).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(response.headers()["cache-control"], "no-store");
    let data = body(response).await;
    assert_eq!(data["id"], 7);
    assert_eq!(data["result"]["protocolVersion"], "2025-11-25");
    assert!(data["result"]["capabilities"]["tools"].is_object());
    assert!(data["result"].get("resultType").is_none());
    let response = fixture
        .app
        .oneshot(legacy_request(
            Some(&fixture.token),
            json!({
                "jsonrpc": "2.0", "method": "notifications/initialized"
            }),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::ACCEPTED);
    assert!(
        response
            .into_body()
            .collect()
            .await
            .unwrap()
            .to_bytes()
            .is_empty()
    );
}

#[tokio::test]
async fn discovers_modern_capabilities_without_a_handshake() {
    let fixture = fixture();
    let response = fixture
        .app
        .oneshot(modern_request(&fixture.token, "server/discover", json!({})))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let data = body(response).await;
    assert_eq!(data["id"], "modern-1");
    assert_eq!(data["result"]["resultType"], "complete");
    assert_eq!(data["result"]["supportedVersions"][0], "2026-07-28");
    assert!(data["result"]["_meta"]["io.modelcontextprotocol/serverInfo"]["name"].is_string());
}

#[tokio::test]
async fn validates_modern_metadata_and_mirrored_headers_before_tools_run() {
    let fixture = fixture();
    for header in ["mcp-method", "mcp-name", "mcp-protocol-version"] {
        let mut request = modern_request(
            &fixture.token,
            "tools/call",
            json!({ "name": "contacts_summary" }),
        );
        request.headers_mut().remove(header);
        let response = fixture.app.clone().oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
        assert_eq!(body(response).await["error"]["code"], -32020);
    }
    let mut request = modern_request(
        &fixture.token,
        "tools/call",
        json!({ "name": "contacts_summary" }),
    );
    request
        .headers_mut()
        .insert("mcp-name", "get_contact_request".parse().unwrap());
    assert_eq!(
        body(fixture.app.clone().oneshot(request).await.unwrap()).await["error"]["code"],
        -32020
    );
    let mut request = legacy_request(
        Some(&fixture.token),
        json!({
            "jsonrpc": "2.0", "id": 1, "method": "tools/list",
            "params": { "_meta": { "io.modelcontextprotocol/protocolVersion": "2026-07-28" } }
        }),
    );
    request
        .headers_mut()
        .insert("mcp-protocol-version", "2026-07-28".parse().unwrap());
    request
        .headers_mut()
        .insert("mcp-method", "tools/list".parse().unwrap());
    assert_eq!(
        body(fixture.app.clone().oneshot(request).await.unwrap()).await["error"]["code"],
        -32602
    );
    let mut request = modern_request(
        &fixture.token,
        "tools/call",
        json!({ "name": "contacts_summary" }),
    );
    let encoded = format!("=?base64?{}?=", STANDARD.encode("contacts_summary"));
    request
        .headers_mut()
        .insert("mcp-name", encoded.parse().unwrap());
    let response = fixture.app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(
        body(response).await["result"]["structuredContent"]["new_count"],
        1
    );
}

#[tokio::test]
async fn advertises_supported_versions_for_unknown_versions() {
    let fixture = fixture();
    let mut request = legacy_request(
        Some(&fixture.token),
        json!({
            "jsonrpc": "2.0", "id": 5, "method": "tools/list"
        }),
    );
    request
        .headers_mut()
        .insert("mcp-protocol-version", "2099-01-01".parse().unwrap());
    let response = fixture.app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    let data = body(response).await;
    assert_eq!(data["error"]["code"], -32022);
    assert_eq!(data["error"]["data"]["requested"], "2099-01-01");
    assert!(
        data["error"]["data"]["supported"]
            .as_array()
            .unwrap()
            .contains(&json!("2026-07-28"))
    );
}

#[tokio::test]
async fn exposes_only_four_read_only_tools_and_no_settings_or_tokens() {
    let fixture = fixture();
    let response = fixture
        .app
        .oneshot(modern_request(&fixture.token, "tools/list", json!({})))
        .await
        .unwrap();
    let data = body(response).await;
    let tools = data["result"]["tools"].as_array().unwrap();
    assert_eq!(tools.len(), 4);
    for tool in tools {
        assert_eq!(tool["annotations"]["readOnlyHint"], true);
        assert_eq!(tool["annotations"]["destructiveHint"], false);
        assert_eq!(tool["inputSchema"]["additionalProperties"], false);
    }
    let serialized = data.to_string();
    assert!(!serialized.contains(&fixture.token));
    assert!(!serialized.contains("owner@example.org"));
}

#[tokio::test]
async fn summary_and_detail_reads_preserve_contact_statuses() {
    let fixture = fixture();
    let response = fixture
        .app
        .clone()
        .oneshot(tool_request(&fixture.token, "contacts_summary", json!({})))
        .await
        .unwrap();
    let data = body(response).await;
    let summary = &data["result"]["structuredContent"];
    assert_eq!(summary["total"], 3);
    assert_eq!(summary["new_count"], 1);
    assert_eq!(summary["read_count"], 1);
    assert_eq!(summary["archived_count"], 1);
    assert!(summary["newest_at"].is_string());
    let response = fixture
        .app
        .oneshot(tool_request(
            &fixture.token,
            "get_contact_request",
            json!({ "id": fixture.first_contact }),
        ))
        .await
        .unwrap();
    let data = body(response).await;
    assert_eq!(
        data["result"]["structuredContent"]["contact"]["email"],
        "visitor@example.org"
    );
    assert!(data["result"]["structuredContent"]["contact"]["message"].is_string());
    assert_eq!(
        fixture
            .store
            .get_contact(fixture.first_contact)
            .unwrap()
            .unwrap()
            .status,
        "new"
    );
    assert_eq!(fixture.store.contact_summary().unwrap().new, 1);
}

#[tokio::test]
async fn filters_and_paginates_without_leaking_message_bodies_or_addresses() {
    let fixture = fixture();
    let response = fixture
        .app
        .clone()
        .oneshot(tool_request(
            &fixture.token,
            "list_contact_requests",
            json!({ "status": "all", "limit": 1, "offset": 1 }),
        ))
        .await
        .unwrap();
    let data = body(response).await;
    let page = &data["result"]["structuredContent"];
    assert_eq!(page["total"], 3);
    assert_eq!(page["contacts"].as_array().unwrap().len(), 1);
    assert_eq!(page["contacts"][0]["subject"], "Deuxième contact");
    assert!(!data.to_string().contains("visitor@example.org"));
    assert!(!data.to_string().contains("Un message privé"));
    let response = fixture
        .app
        .oneshot(tool_request(
            &fixture.token,
            "list_contact_requests",
            json!({ "status": "new" }),
        ))
        .await
        .unwrap();
    let data = body(response).await;
    assert_eq!(data["result"]["structuredContent"]["total"], 1);
    assert_eq!(
        data["result"]["structuredContent"]["contacts"][0]["id"],
        fixture.first_contact
    );
}

#[tokio::test]
async fn rejects_mutation_attempts_and_invalid_pagination() {
    let fixture = fixture();
    for (tool, arguments) in [
        (
            "update_contact_status",
            json!({ "id": fixture.first_contact, "status": "read" }),
        ),
        ("delete_contact", json!({ "id": fixture.first_contact })),
        (
            "get_contact_request",
            json!({ "id": fixture.first_contact, "status": "read" }),
        ),
        ("get_contact_request", json!({ "id": "1" })),
        ("list_contact_requests", json!({ "status": "other" })),
        ("list_contact_requests", json!({ "limit": 0 })),
        ("list_contact_requests", json!({ "limit": 101 })),
        ("list_contact_requests", json!({ "limit": 1.5 })),
        ("list_contact_requests", json!({ "offset": -1 })),
        (
            "list_contact_requests",
            json!({ "offset": 4_294_967_296_u64 }),
        ),
        ("contacts_summary", json!({ "extra": true })),
    ] {
        let response = fixture
            .app
            .clone()
            .oneshot(tool_request(&fixture.token, tool, arguments))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
        assert_eq!(body(response).await["error"]["code"], -32602);
    }
    assert_eq!(
        fixture
            .store
            .get_contact(fixture.first_contact)
            .unwrap()
            .unwrap()
            .status,
        "new"
    );
    assert_eq!(fixture.store.contact_summary().unwrap().total, 3);
}

#[tokio::test]
async fn missing_contacts_return_a_tool_error_and_links_are_passive() {
    let fixture = fixture();
    let response = fixture
        .app
        .clone()
        .oneshot(tool_request(
            &fixture.token,
            "get_contact_request",
            json!({ "id": 999_999 }),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(body(response).await["result"]["isError"], true);
    let response = fixture
        .app
        .oneshot(tool_request(
            &fixture.token,
            "list_toolbox_links",
            json!({}),
        ))
        .await
        .unwrap();
    let data = body(response).await;
    assert_eq!(
        data["result"]["structuredContent"]["links"][0]["label"],
        "Umami"
    );
    assert_eq!(
        data["result"]["structuredContent"]["links"][0]["url"],
        "https://umami.example.org"
    );
}

#[tokio::test]
async fn rejects_cross_origin_and_non_json_requests_before_exposing_data() {
    let fixture = fixture();
    for origin in [
        "https://attacker.example",
        "null",
        "http://portfolio.example.org",
        "https://portfolio.example.org/path",
    ] {
        let mut request = tool_request(&fixture.token, "contacts_summary", json!({}));
        request
            .headers_mut()
            .insert("origin", origin.parse().unwrap());
        assert_eq!(
            fixture.app.clone().oneshot(request).await.unwrap().status(),
            StatusCode::FORBIDDEN
        );
    }
    let mut request = tool_request(&fixture.token, "contacts_summary", json!({}));
    request
        .headers_mut()
        .insert("origin", "https://portfolio.example.org".parse().unwrap());
    assert_eq!(
        fixture.app.clone().oneshot(request).await.unwrap().status(),
        StatusCode::OK
    );
    let mut request = tool_request(&fixture.token, "contacts_summary", json!({}));
    request
        .headers_mut()
        .insert("content-type", "text/plain".parse().unwrap());
    assert_eq!(
        fixture.app.clone().oneshot(request).await.unwrap().status(),
        StatusCode::UNSUPPORTED_MEDIA_TYPE
    );
    let mut request = tool_request(&fixture.token, "contacts_summary", json!({}));
    request
        .headers_mut()
        .insert("accept", "text/html".parse().unwrap());
    assert_eq!(
        fixture.app.oneshot(request).await.unwrap().status(),
        StatusCode::NOT_ACCEPTABLE
    );
}

#[tokio::test]
async fn rejects_batches_null_ids_and_tool_notifications() {
    let fixture = fixture();
    for payload in [
        json!([{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }]),
        json!({ "jsonrpc": "2.0", "id": null, "method": "tools/list" }),
        json!({ "jsonrpc": "2.0", "method": "tools/call", "params": { "name": "get_contact_request", "arguments": { "id": fixture.first_contact } } }),
    ] {
        let response = fixture
            .app
            .clone()
            .oneshot(legacy_request(Some(&fixture.token), payload))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
        assert_eq!(body(response).await["error"]["code"], -32600);
    }
    let mut request = legacy_request(Some(&fixture.token), json!({}));
    *request.body_mut() = Body::from("{");
    assert_eq!(
        body(fixture.app.clone().oneshot(request).await.unwrap()).await["error"]["code"],
        -32700
    );
    let mut request = legacy_request(Some(&fixture.token), json!({}));
    *request.body_mut() = Body::from(" ".repeat(24 * 1024 + 1));
    assert_eq!(
        fixture.app.oneshot(request).await.unwrap().status(),
        StatusCode::PAYLOAD_TOO_LARGE
    );
}

#[tokio::test]
async fn refuses_get_and_delete_without_opening_streams() {
    let fixture = fixture();
    for method in ["GET", "DELETE"] {
        let request = Request::builder()
            .method(method)
            .uri("/mcp")
            .header("authorization", format!("Bearer {}", fixture.token))
            .body(Body::empty())
            .unwrap();
        let response = fixture.app.clone().oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
        assert_eq!(response.headers()["allow"], "POST");
    }
}

#[tokio::test]
async fn bounds_authenticated_request_rate_separately_from_contact_submission() {
    let fixture = fixture();
    for _ in 0..120 {
        let request = legacy_request(
            Some(&fixture.token),
            json!({ "jsonrpc": "2.0", "id": 1, "method": "ping" }),
        );
        assert_eq!(
            fixture.app.clone().oneshot(request).await.unwrap().status(),
            StatusCode::OK
        );
    }
    let request = tool_request(&fixture.token, "contacts_summary", json!({}));
    let response = fixture.app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::TOO_MANY_REQUESTS);
    assert!(response.headers().contains_key("retry-after"));
}
