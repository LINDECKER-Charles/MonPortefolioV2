use std::{sync::Arc, time::Duration};

use axum::{
    Router,
    body::Body,
    http::{Request, StatusCode},
    response::Response,
};
use base64::{Engine, engine::general_purpose::STANDARD};
use http_body_util::BodyExt;
use portfolio_backend::{
    AppState, admin,
    config::{AppEnvironment, BackofficeConfig},
    contact::ContactMessage,
    mcp,
    storage::Store,
};
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
    let (token_id, token) = store
        .create_token_with_scopes("Tests MCP", &["contacts:read".into(), "blog:read".into()])
        .unwrap();
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
    assert_eq!(data["result"]["ttlMs"], 300_000);
    assert_eq!(data["result"]["cacheScope"], "private");
}

#[tokio::test]
async fn modern_tool_catalogs_carry_private_cache_hints_and_legacy_ones_stay_unchanged() {
    let fixture = fixture();
    let modern = body(
        fixture
            .app
            .clone()
            .oneshot(modern_request(&fixture.token, "tools/list", json!({})))
            .await
            .unwrap(),
    )
    .await;
    assert_eq!(modern["result"]["resultType"], "complete");
    assert_eq!(modern["result"]["ttlMs"], 300_000);
    assert_eq!(modern["result"]["cacheScope"], "private");
    let mut legacy = legacy_request(
        Some(&fixture.token),
        json!({ "jsonrpc": "2.0", "id": 7, "method": "tools/list" }),
    );
    legacy
        .headers_mut()
        .insert("mcp-protocol-version", "2025-11-25".parse().unwrap());
    let legacy = body(fixture.app.oneshot(legacy).await.unwrap()).await;
    assert!(legacy["result"]["tools"].is_array());
    assert!(legacy["result"].get("ttlMs").is_none());
    assert!(legacy["result"].get("cacheScope").is_none());
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
async fn read_only_tokens_advertise_only_reads_and_no_settings_or_tokens() {
    let fixture = fixture();
    let response = fixture
        .app
        .oneshot(modern_request(&fixture.token, "tools/list", json!({})))
        .await
        .unwrap();
    let data = body(response).await;
    let tools = data["result"]["tools"].as_array().unwrap();
    assert_eq!(tools.len(), 9);
    for tool in tools {
        assert_eq!(tool["annotations"]["readOnlyHint"], true);
        assert_eq!(tool["annotations"]["destructiveHint"], false);
        assert_eq!(tool["inputSchema"]["additionalProperties"], false);
    }
    let serialized = data.to_string();
    assert!(!serialized.contains(&fixture.token));
    assert!(!serialized.contains("owner@example.org"));
    assert!(serialized.contains("blog_preview_post"));
    assert!(!serialized.contains("blog_publish_post"));
    assert!(!serialized.contains("blog_create_post"));
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
    *request.body_mut() = Body::from(" ".repeat(8 * 1024 * 1024 + 1));
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

fn draft() -> Value {
    json!({
        "title": "Écrire un article avec un aperçu",
        "slug": "article-avec-apercu",
        "excerpt": "Un brouillon relu avant sa publication.",
        "content": { "type": "doc", "content": [
            { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Une méthode de rédaction" }] },
            { "type": "paragraph", "content": [{ "type": "text", "text": "Le contenu préparé en brouillon reste privé jusqu’à la publication." }] }
        ] },
        "seo_title": "Une méthode de rédaction avec aperçu privé",
        "seo_description": "Préparer le contenu, vérifier les métadonnées et relire la version prévue avant de publier un article depuis le backoffice."
    })
}

fn blog_token(fixture: &Fixture, scopes: &[&str]) -> String {
    fixture
        .store
        .create_token_with_scopes(
            "Rédaction MCP",
            &scopes
                .iter()
                .map(|scope| (*scope).into())
                .collect::<Vec<_>>(),
        )
        .unwrap()
        .1
}

async fn invoke(fixture: &Fixture, token: &str, name: &str, args: Value) -> Value {
    let response = fixture
        .app
        .clone()
        .oneshot(tool_request(token, name, args))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    body(response).await["result"].clone()
}

#[tokio::test]
async fn existing_read_only_tokens_never_gain_blog_write_or_publish_permissions() {
    let fixture = fixture();
    for (name, arguments) in [
        ("blog_create_post", draft()),
        (
            "blog_upload_media",
            json!({ "filename": "image.png", "content_type": "image/png", "data_base64": "AAAA" }),
        ),
        ("blog_publish_post", json!({ "id": 1, "revision": 1 })),
        (
            "blog_schedule_post",
            json!({ "id": 1, "revision": 1, "scheduled_at": 4_102_444_800_i64 }),
        ),
        ("blog_unpublish_post", json!({ "id": 1, "revision": 1 })),
        ("blog_delete_post", json!({ "id": 1, "revision": 1 })),
        ("blog_delete_media", json!({ "id": 1 })),
    ] {
        let result = invoke(&fixture, &fixture.token, name, arguments).await;
        assert_eq!(result["isError"], true);
        assert_eq!(result["structuredContent"]["code"], "PERMISSION_DENIED");
    }
    let listed = invoke(&fixture, &fixture.token, "blog_list_posts", json!({})).await;
    assert_eq!(listed["structuredContent"]["total"], 0);
    assert!(fixture.store.authenticate_token(&fixture.token).unwrap());
}

#[tokio::test]
async fn draft_writers_can_preview_and_audit_but_publication_requires_its_own_scope() {
    let fixture = fixture();
    let writer = blog_token(&fixture, &["blog:read", "blog:write"]);
    let publisher = blog_token(&fixture, &["blog:read", "blog:write", "blog:publish"]);
    let created = invoke(&fixture, &writer, "blog_create_post", draft()).await;
    assert_eq!(created["isError"], false);
    let post = &created["structuredContent"];
    assert_eq!(post["status"], "draft");
    let identity = json!({ "id": post["id"] });
    let action = json!({ "id": post["id"], "revision": post["revision"] });

    let listed = invoke(&fixture, &writer, "blog_list_posts", json!({})).await;
    assert_eq!(listed["structuredContent"]["posts"][0]["id"], post["id"]);
    assert!(
        listed["structuredContent"]["posts"][0]
            .get("content")
            .is_none()
    );
    let full = invoke(&fixture, &writer, "blog_get_post", identity.clone()).await;
    assert_eq!(full["structuredContent"]["content"], draft()["content"]);

    let preview = invoke(&fixture, &writer, "blog_preview_post", identity.clone()).await;
    assert_eq!(preview["isError"], false);
    assert_eq!(
        preview["structuredContent"]["post"]["content"],
        draft()["content"]
    );
    assert_eq!(
        preview["structuredContent"]["requires_backoffice_session"],
        true
    );
    assert_eq!(preview["structuredContent"]["indexable"], false);
    assert_eq!(
        preview["structuredContent"]["preview_url"],
        format!("/api/backoffice/blog/preview/{}", post["id"])
    );
    let audit = invoke(&fixture, &writer, "blog_seo_audit", identity.clone()).await;
    assert_eq!(audit["isError"], false);
    assert!(audit["structuredContent"]["score"].is_number());

    let denied = invoke(&fixture, &writer, "blog_publish_post", action.clone()).await;
    assert_eq!(denied["structuredContent"]["code"], "PERMISSION_DENIED");
    let denied_contact = invoke(&fixture, &writer, "contacts_summary", json!({})).await;
    assert_eq!(
        denied_contact["structuredContent"]["code"],
        "PERMISSION_DENIED"
    );
    let published = invoke(&fixture, &publisher, "blog_publish_post", action.clone()).await;
    assert_eq!(published["isError"], false);
    assert_eq!(published["structuredContent"]["status"], "published");
    let stale = invoke(&fixture, &publisher, "blog_unpublish_post", action).await;
    assert_eq!(stale["isError"], true);
    assert_eq!(stale["structuredContent"]["code"], "REVISION_CONFLICT");

    let mut edit = draft();
    edit["id"] = post["id"].clone();
    edit["revision"] = published["structuredContent"]["revision"].clone();
    edit["title"] = json!("Un autre titre gardé en brouillon");
    let updated = invoke(&fixture, &writer, "blog_update_post", edit.clone()).await;
    assert_eq!(updated["isError"], false);
    assert_eq!(updated["structuredContent"]["title"], edit["title"]);
    let stale_edit = invoke(&fixture, &writer, "blog_update_post", edit).await;
    assert_eq!(stale_edit["structuredContent"]["code"], "REVISION_CONFLICT");
    let unpublished = invoke(
        &fixture,
        &publisher,
        "blog_unpublish_post",
        json!({ "id": post["id"], "revision": updated["structuredContent"]["revision"] }),
    )
    .await;
    assert_eq!(unpublished["isError"], false);
    assert_eq!(unpublished["structuredContent"]["status"], "draft");
}

#[tokio::test]
async fn publisher_can_schedule_and_delete_with_revision_checked_at_every_action() {
    let fixture = fixture();
    let publisher = blog_token(&fixture, &["blog:read", "blog:write", "blog:publish"]);
    let created = invoke(&fixture, &publisher, "blog_create_post", draft()).await;
    let post = &created["structuredContent"];
    let future = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
        + 3_600;
    let scheduled = invoke(
        &fixture,
        &publisher,
        "blog_schedule_post",
        json!({ "id": post["id"], "revision": post["revision"], "scheduled_at": future }),
    )
    .await;
    assert_eq!(scheduled["isError"], false);
    assert_eq!(scheduled["structuredContent"]["status"], "scheduled");
    let stale = invoke(
        &fixture,
        &publisher,
        "blog_delete_post",
        json!({ "id": post["id"], "revision": post["revision"] }),
    )
    .await;
    assert_eq!(stale["structuredContent"]["code"], "REVISION_CONFLICT");
    let deleted = invoke(
        &fixture,
        &publisher,
        "blog_delete_post",
        json!({ "id": post["id"], "revision": scheduled["structuredContent"]["revision"] }),
    )
    .await;
    assert_eq!(deleted["structuredContent"]["deleted"], true);
    let missing = invoke(
        &fixture,
        &publisher,
        "blog_get_post",
        json!({ "id": post["id"] }),
    )
    .await;
    assert_eq!(missing["isError"], true);
    assert_eq!(missing["structuredContent"]["code"], "NOT_FOUND");
}

#[tokio::test]
async fn blog_argument_validation_errors_are_actionable_tool_results_and_never_mutate() {
    let fixture = fixture();
    let publisher = blog_token(&fixture, &["blog:read", "blog:write", "blog:publish"]);
    let mut unsafe_draft = draft();
    unsafe_draft["content"] = json!({ "type": "doc", "content": [{ "type": "html", "text": "<script>alert(1)</script>" }] });
    for (name, arguments) in [
        ("blog_create_post", unsafe_draft),
        (
            "blog_create_post",
            json!({ "title": "Titre", "slug": "titre", "content": draft()["content"], "status": "published" }),
        ),
        (
            "blog_create_post",
            json!({ "title": "Titre", "slug": "titre", "content": draft()["content"], "revision": 1 }),
        ),
        ("blog_list_posts", json!({ "limit": 0 })),
        ("blog_list_posts", json!({ "offset": -1 })),
        ("blog_list_posts", json!({ "status": "hidden" })),
        ("blog_get_post", json!({ "id": "1" })),
        ("blog_list_media", json!({ "extra": true })),
        (
            "blog_update_post",
            json!({ "id": 1, "title": "Titre", "slug": "titre", "content": draft()["content"] }),
        ),
        ("blog_publish_post", json!({ "id": 1, "revision": 0 })),
        (
            "blog_schedule_post",
            json!({ "id": 1, "revision": 1, "scheduled_at": "demain" }),
        ),
        (
            "blog_upload_media",
            json!({ "filename": "script.svg", "content_type": "image/svg+xml", "data_base64": "PHN2Zz4=" }),
        ),
    ] {
        let result = invoke(&fixture, &publisher, name, arguments).await;
        assert_eq!(result["isError"], true, "{name}: {result}");
        assert!(result["structuredContent"]["code"].is_string());
    }
    assert_eq!(
        fixture.store.list_blog_posts("all", 20, 0).unwrap().total,
        0
    );
}

#[tokio::test]
async fn catalog_scopes_and_annotations_describe_actual_blog_effects() {
    let fixture = fixture();
    let publisher = blog_token(&fixture, &["blog:read", "blog:write", "blog:publish"]);
    let response = fixture
        .app
        .clone()
        .oneshot(modern_request(&publisher, "tools/list", json!({})))
        .await
        .unwrap();
    let result = body(response).await;
    let tools = result["result"]["tools"].as_array().unwrap();
    assert_eq!(tools.len(), 13);
    for tool in tools {
        let name = tool["name"].as_str().unwrap();
        assert!(name.starts_with("blog_"));
        assert_eq!(tool["inputSchema"]["additionalProperties"], false);
        assert_eq!(tool["annotations"]["openWorldHint"], false);
        if matches!(name, "blog_create_post" | "blog_upload_media") {
            assert_eq!(tool["annotations"]["readOnlyHint"], false);
            assert_eq!(tool["annotations"]["destructiveHint"], false);
            assert_eq!(tool["annotations"]["idempotentHint"], false);
        } else if matches!(
            name,
            "blog_update_post"
                | "blog_publish_post"
                | "blog_schedule_post"
                | "blog_unpublish_post"
                | "blog_delete_post"
                | "blog_delete_media"
        ) {
            assert_eq!(tool["annotations"]["readOnlyHint"], false);
            assert_eq!(tool["annotations"]["destructiveHint"], true);
            assert_eq!(tool["annotations"]["idempotentHint"], true);
        } else {
            assert_eq!(tool["annotations"]["readOnlyHint"], true);
        }
    }

    // Le préréglage « Rédaction » du backoffice : tout lire, écrire des brouillons, rien publier.
    let writer = blog_token(&fixture, &["blog:read", "blog:write"]);
    let response = fixture
        .app
        .clone()
        .oneshot(modern_request(&writer, "tools/list", json!({})))
        .await
        .unwrap();
    let result = body(response).await;
    let mut names: Vec<&str> = result["result"]["tools"]
        .as_array()
        .unwrap()
        .iter()
        .map(|tool| tool["name"].as_str().unwrap())
        .collect();
    names.sort_unstable();
    assert_eq!(
        names,
        [
            "blog_create_post",
            "blog_get_post",
            "blog_list_media",
            "blog_list_posts",
            "blog_preview_post",
            "blog_seo_audit",
            "blog_update_post",
            "blog_upload_media",
        ]
    );
}

#[tokio::test]
async fn only_admin_sessions_can_create_tokens_with_explicit_consistent_permissions() {
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
    let app = admin::routes(state.clone()).with_state(state);
    let session = store.create_session(Duration::from_secs(60)).unwrap();
    let request = |payload: Value, authenticated: bool| {
        let mut builder = Request::builder()
            .method("POST")
            .uri("/api/backoffice/tokens")
            .header("host", "portfolio.example.org")
            .header("origin", "https://portfolio.example.org")
            .header("content-type", "application/json")
            .header("x-backoffice-request", "1");
        if authenticated {
            builder = builder.header("cookie", format!("portfolio_backoffice={session}"));
        }
        builder.body(Body::from(payload.to_string())).unwrap()
    };
    let full =
        json!({ "name": "Publication", "scopes": ["blog:read", "blog:write", "blog:publish"] });
    let denied = app
        .clone()
        .oneshot(request(full.clone(), false))
        .await
        .unwrap();
    assert_eq!(denied.status(), StatusCode::UNAUTHORIZED);
    for scopes in [
        json!([]),
        json!(["blog:write"]),
        json!(["blog:read", "blog:publish"]),
        json!(["contacts:write"]),
        json!(["blog:read", "blog:read"]),
    ] {
        let response = app
            .clone()
            .oneshot(request(
                json!({ "name": "Interdit", "scopes": scopes }),
                true,
            ))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }
    assert!(store.list_tokens().unwrap().is_empty());
    // Sans `scopes`, un accès lit seulement le blog : les demandes de contact se demandent exprès.
    let read = app
        .clone()
        .oneshot(request(json!({ "name": "Lecture par défaut" }), true))
        .await
        .unwrap();
    assert_eq!(read.status(), StatusCode::CREATED);
    let read = body(read).await;
    assert_eq!(read["scopes"], json!(["blog:read"]));
    assert_eq!(
        store
            .authenticate_token_scopes(read["token"].as_str().unwrap())
            .unwrap()
            .unwrap(),
        vec!["blog:read"]
    );
    let contacts = app
        .clone()
        .oneshot(request(
            json!({ "name": "Demandes", "scopes": ["contacts:read", "blog:read"] }),
            true,
        ))
        .await
        .unwrap();
    assert_eq!(contacts.status(), StatusCode::CREATED);
    assert_eq!(
        body(contacts).await["scopes"],
        json!(["contacts:read", "blog:read"])
    );
    let published = app.oneshot(request(full, true)).await.unwrap();
    assert_eq!(published.status(), StatusCode::CREATED);
    let published = body(published).await;
    assert_eq!(
        published["scopes"],
        json!(["blog:read", "blog:write", "blog:publish"])
    );
    let scopes = store
        .authenticate_token_scopes(published["token"].as_str().unwrap())
        .unwrap()
        .unwrap();
    assert_eq!(scopes, vec!["blog:read", "blog:write", "blog:publish"]);
    let listing = serde_json::to_string(&store.list_tokens().unwrap()).unwrap();
    assert!(!listing.contains(published["token"].as_str().unwrap()));
}

#[tokio::test]
async fn publishers_delete_only_images_that_no_article_cites() {
    let fixture = fixture();
    let writer = blog_token(&fixture, &["blog:read", "blog:write"]);
    let publisher = blog_token(&fixture, &["blog:read", "blog:write", "blog:publish"]);
    let png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=";
    let mut ids = Vec::new();
    for filename in ["libre.png", "citee.png"] {
        let media = invoke(
            &fixture,
            &writer,
            "blog_upload_media",
            json!({ "filename": filename, "content_type": "image/png", "data_base64": png }),
        )
        .await;
        assert_eq!(media["isError"], false);
        assert_eq!(media["structuredContent"]["width"], 1);
        ids.push(media["structuredContent"]["id"].as_i64().unwrap());
    }
    let mut cited = draft();
    cited["cover_image"] = json!(format!("/api/blog/media/{}", ids[1]));
    cited["cover_alt"] = json!("Un point");
    assert_eq!(
        invoke(&fixture, &writer, "blog_create_post", cited).await["isError"],
        false
    );
    // Une suppression est définitive : un jeton d’écriture importe, mais ne détruit rien.
    for token in [&writer, &blog_token(&fixture, &["blog:read"])] {
        let denied = invoke(
            &fixture,
            token,
            "blog_delete_media",
            json!({ "id": ids[0] }),
        )
        .await;
        assert_eq!(denied["structuredContent"]["code"], "PERMISSION_DENIED");
    }
    let deleted = invoke(
        &fixture,
        &publisher,
        "blog_delete_media",
        json!({ "id": ids[0] }),
    )
    .await;
    assert_eq!(
        deleted["structuredContent"],
        json!({ "deleted": true, "id": ids[0] })
    );
    let refused = invoke(
        &fixture,
        &publisher,
        "blog_delete_media",
        json!({ "id": ids[1] }),
    )
    .await;
    assert_eq!(refused["isError"], true);
    assert_eq!(refused["structuredContent"]["code"], "MEDIA_IN_USE");
}
