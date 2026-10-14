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
    blog::{BlogError, BlogInput, MediaUpload, unix_now},
    config::{AppEnvironment, BackofficeConfig},
    routes,
    storage::Store,
};
use serde_json::{Value, json};
use std::{
    net::SocketAddr,
    sync::Arc,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tower::ServiceExt;

fn input(slug: &str) -> BlogInput {
    serde_json::from_value(json!({"title":"Un article préparé","slug":slug,"excerpt":"Une explication de la démarche.","content":{"type":"doc","content":[{"type":"heading","attrs":{"level":2,"textAlign":null},"content":[{"type":"text","text":"Le contexte"}]},{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Une idée à partager."}]}]}})).unwrap()
}
fn fixture() -> (Router, Arc<Store>, String) {
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
    let cookie = format!(
        "portfolio_backoffice={}",
        store.create_session(Duration::from_secs(600)).unwrap()
    );
    (routes::router(state), store, cookie)
}
fn request(method: &str, path: &str, payload: Value, cookie: Option<&str>) -> Request<Body> {
    let mut builder = Request::builder()
        .method(method)
        .uri(path)
        .header(header::HOST, "portfolio.test")
        .header(header::ORIGIN, "https://portfolio.test")
        .header(header::CONTENT_TYPE, "application/json")
        .header("x-backoffice-request", "1");
    if let Some(cookie) = cookie {
        builder = builder.header(header::COOKIE, cookie);
    }
    let mut req = builder.body(Body::from(payload.to_string())).unwrap();
    req.extensions_mut().insert(ConnectInfo(
        "192.0.2.11:1234".parse::<SocketAddr>().unwrap(),
    ));
    req
}
async fn body(response: Response) -> Value {
    serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes()).unwrap()
}

#[tokio::test]
async fn drafts_previews_and_mutations_require_session_and_csrf() {
    let (app, store, cookie) = fixture();
    let post = store.create_blog_post(input("confidentiel")).unwrap();
    for path in [
        "/api/backoffice/blog/posts".to_owned(),
        format!("/api/backoffice/blog/posts/{}/preview", post.id),
        "/api/backoffice/blog/media".to_owned(),
    ] {
        assert_eq!(
            app.clone()
                .oneshot(request("GET", &path, json!(null), None))
                .await
                .unwrap()
                .status(),
            StatusCode::UNAUTHORIZED
        );
    }
    assert_eq!(
        app.clone()
            .oneshot(request(
                "GET",
                "/api/blog/posts/confidentiel",
                json!(null),
                None
            ))
            .await
            .unwrap()
            .status(),
        StatusCode::NOT_FOUND
    );
    let list = body(
        app.clone()
            .oneshot(request("GET", "/api/blog/posts", json!(null), None))
            .await
            .unwrap(),
    )
    .await;
    assert_eq!(list["total"], 0);
    let preview = body(
        app.clone()
            .oneshot(request(
                "GET",
                &format!("/api/backoffice/blog/posts/{}/preview", post.id),
                json!(null),
                Some(&cookie),
            ))
            .await
            .unwrap(),
    )
    .await;
    assert_eq!(preview["title"], "Un article préparé");
    let summary = body(
        app.clone()
            .oneshot(request(
                "GET",
                "/api/backoffice/blog/posts",
                json!(null),
                Some(&cookie),
            ))
            .await
            .unwrap(),
    )
    .await;
    assert_eq!(summary["posts"][0]["title"], "Un article préparé");
    assert!(summary["posts"][0].get("content").is_none());
    let mut csrf = request(
        "POST",
        &format!("/api/backoffice/blog/posts/{}/publish", post.id),
        json!({"revision":post.revision}),
        Some(&cookie),
    );
    csrf.headers_mut().remove("x-backoffice-request");
    assert_eq!(
        app.clone().oneshot(csrf).await.unwrap().status(),
        StatusCode::FORBIDDEN
    );
    let mut foreign = request(
        "POST",
        &format!("/api/backoffice/blog/posts/{}/publish", post.id),
        json!({"revision":post.revision}),
        Some(&cookie),
    );
    foreign
        .headers_mut()
        .insert(header::ORIGIN, "https://attacker.test".parse().unwrap());
    assert_eq!(
        app.oneshot(foreign).await.unwrap().status(),
        StatusCode::FORBIDDEN
    );
}

#[tokio::test]
async fn published_snapshot_is_unchanged_by_private_edits_and_public_list_omits_content() {
    let (app, store, cookie) = fixture();
    let draft = store.create_blog_post(input("version-validee")).unwrap();
    let published = store.publish_blog_post(draft.id, draft.revision).unwrap();
    let mut changes = published.fields.clone();
    changes.title = "Une modification encore privée".into();
    changes.slug = "autre-adresse".into();
    changes.revision = Some(published.revision);
    let edited = store.update_blog_post(draft.id, changes).unwrap();
    assert!(edited.has_unpublished_changes);
    let public = store.get_public_blog_post("version-validee").unwrap();
    assert_eq!(public.fields.title, "Un article préparé");
    assert!(!public.has_unpublished_changes);
    assert_eq!(public.updated_at, published.updated_at);
    assert!(matches!(
        store.get_public_blog_post("autre-adresse"),
        Err(BlogError::NotFound)
    ));
    let list = body(
        app.clone()
            .oneshot(request("GET", "/api/blog/posts", json!(null), None))
            .await
            .unwrap(),
    )
    .await;
    assert_eq!(list["posts"][0]["title"], "Un article préparé");
    assert!(list["posts"][0].get("content").is_none());
    let new = store.publish_blog_post(edited.id, edited.revision).unwrap();
    assert!(!new.has_unpublished_changes);
    assert!(matches!(
        store.get_public_blog_post("version-validee"),
        Err(BlogError::NotFound)
    ));
    assert_eq!(
        store
            .get_public_blog_post("autre-adresse")
            .unwrap()
            .fields
            .title,
        "Une modification encore privée"
    );
    let response = app
        .clone()
        .oneshot(request(
            "POST",
            &format!("/api/backoffice/blog/posts/{}/unpublish", new.id),
            json!({"revision":new.revision}),
            Some(&cookie),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(store.list_public_blog_posts(20, 0).unwrap().total, 0);
}

#[test]
fn rich_document_rejects_raw_html_active_urls_invalid_attrs_and_excessive_depth() {
    let store = Store::in_memory("owner@example.org").unwrap();
    for content in [
        json!({"type":"doc","content":[{"type":"html","attrs":{"html":"<script>bad()</script>"}}]}),
        json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Cliquer","marks":[{"type":"link","attrs":{"href":"javascript:alert(1)"}}]}]}]}),
        json!({"type":"doc","content":[{"type":"image","attrs":{"src":"data:image/svg+xml,test"}}]}),
        json!({"type":"doc","content":[{"type":"paragraph","attrs":{"style":"position:fixed"}}]}),
        json!({"type":"doc","content":[{"type":"heading","attrs":{"level":1}}]}),
        json!({"type":"doc","content":[{"type":"image","attrs":{"src":"/assets/../secret.png"}}]}),
    ] {
        let mut p = input("rejet");
        p.content = content;
        assert!(matches!(store.create_blog_post(p), Err(BlogError::Invalid)));
    }
    let mut nested = json!({"type":"paragraph"});
    for _ in 0..25 {
        nested = json!({"type":"blockquote","content":[nested]});
    }
    let mut p = input("profond");
    p.content = json!({"type":"doc","content":[nested]});
    assert!(matches!(store.create_blog_post(p), Err(BlogError::Invalid)));
    let mut p = input("valide");
    p.content = json!({"type":"doc","content":[{"type":"table","content":[{"type":"tableRow","content":[{"type":"tableHeader","attrs":{"colspan":1,"rowspan":1,"colwidth":null,"align":null},"content":[{"type":"paragraph","content":[{"type":"text","text":"Titre","marks":[{"type":"bold"},{"type":"link","attrs":{"href":"https://example.org","target":"_blank","rel":"noopener noreferrer nofollow","class":null,"title":null}}]}]}]}]}]},{"type":"orderedList","attrs":{"start":1},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Une étape"}]}]}]}]});
    assert!(store.create_blog_post(p).is_ok());
}

/// Les mêmes cas que le rendu Node et l’éditeur (site/server/blog-rendu.test.mjs).
const SHARED_RULES: &str = include_str!("../../site/tests/fixtures/liens-blog.json");

#[test]
fn links_and_images_follow_the_rule_shared_with_the_editor_and_the_renderer() {
    let rules: Value = serde_json::from_str(SHARED_RULES).unwrap();
    let cases = |group: &str, key: &str| -> Vec<String> {
        rules[group][key]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v.as_str().unwrap().to_owned())
            .collect()
    };
    let with_link = |href: &str| {
        let mut p = input("lien");
        p.content = json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"lien","marks":[{"type":"link","attrs":{"href":href}}]}]}]});
        p
    };
    let with_image = |src: &str| {
        let mut p = input("image");
        p.content =
            json!({"type":"doc","content":[{"type":"image","attrs":{"src":src,"alt":"x"}}]});
        p
    };
    for href in cases("liens", "admis") {
        assert!(with_link(&href).validate().is_ok(), "lien admis : {href}");
    }
    for href in cases("liens", "refuses") {
        assert!(
            matches!(with_link(&href).validate(), Err(BlogError::Invalid)),
            "lien refusé : {href}"
        );
    }
    for src in cases("images", "admises") {
        assert!(with_image(&src).validate().is_ok(), "image admise : {src}");
    }
    for src in cases("images", "refusees") {
        assert!(
            matches!(with_image(&src).validate(), Err(BlogError::Invalid)),
            "image refusée : {src}"
        );
        let mut p = input("couverture");
        p.cover_image = Some(src.clone());
        assert!(matches!(p.validate(), Err(BlogError::Invalid)));
    }
}

#[test]
fn revisions_prevent_lost_updates_and_reserved_slugs_survive_private_changes() {
    let store = Arc::new(Store::in_memory("owner@example.org").unwrap());
    let p = store.create_blog_post(input("reserve")).unwrap();
    let published = store.publish_blog_post(p.id, p.revision).unwrap();
    let mut changes = published.fields.clone();
    changes.revision = Some(published.revision);
    changes.slug = "nouvelle-adresse".into();
    let edited = store.update_blog_post(p.id, changes.clone()).unwrap();
    assert!(matches!(
        store.update_blog_post(p.id, changes),
        Err(BlogError::RevisionConflict)
    ));
    assert!(matches!(
        store.create_blog_post(input("reserve")),
        Err(BlogError::SlugConflict)
    ));
    assert!(matches!(
        store.delete_blog_post(p.id, p.revision),
        Err(BlogError::RevisionConflict)
    ));
    let mut a = edited.fields.clone();
    a.revision = Some(edited.revision);
    a.title = "Concurrent A".into();
    let mut b = a.clone();
    b.title = "Concurrent B".into();
    let first = store.clone();
    let second = store.clone();
    let id = p.id;
    let a = std::thread::spawn(move || first.update_blog_post(id, a));
    let b = std::thread::spawn(move || second.update_blog_post(id, b));
    let results = [a.join().unwrap(), b.join().unwrap()];
    assert_eq!(results.iter().filter(|r| r.is_ok()).count(), 1);
    assert_eq!(
        results
            .iter()
            .filter(|r| matches!(r, Err(BlogError::RevisionConflict)))
            .count(),
        1
    );
}

#[test]
fn schedules_publish_the_approved_snapshot_once_after_restart() {
    let path = std::env::temp_dir().join(format!(
        "portfolio-blog-{}-{}.sqlite3",
        std::process::id(),
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    ));
    let at = unix_now() + 120;
    let id;
    {
        let store = Store::open(&path, Some("owner@example.org")).unwrap();
        let p = store.create_blog_post(input("programme")).unwrap();
        id = p.id;
        let scheduled = store.schedule_blog_post(id, at, p.revision).unwrap();
        assert_eq!(scheduled.scheduled_revision, Some(scheduled.revision));
        assert!(!scheduled.has_unpublished_changes);
        let mut future = scheduled.fields;
        future.title = "Une retouche non reprogrammée".into();
        future.revision = Some(scheduled.revision);
        assert!(
            store
                .update_blog_post(id, future)
                .unwrap()
                .has_unpublished_changes
        );
        assert_eq!(store.list_public_blog_posts(20, 0).unwrap().total, 0);
        assert_eq!(store.publish_due_blog_posts(at - 1).unwrap(), 0);
    }
    {
        let store = Store::open(&path, None).unwrap();
        assert_eq!(store.publish_due_blog_posts(at).unwrap(), 1);
        let public = store.get_public_blog_post("programme").unwrap();
        assert_eq!(public.fields.title, "Un article préparé");
        assert_eq!(public.published_at, Some(at));
        assert_eq!(
            store.get_blog_post(id).unwrap().fields.title,
            "Une retouche non reprogrammée"
        );
        assert_eq!(store.publish_due_blog_posts(at + 60).unwrap(), 0);
        assert_eq!(store.get_blog_post(id).unwrap().status, "published");
        assert!(store.get_blog_post(id).unwrap().has_unpublished_changes);
    }
    std::fs::remove_file(path).unwrap();
}

fn png() -> Vec<u8> {
    let mut bytes = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut bytes, 1, 1);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder.write_header().unwrap();
        writer.write_image_data(&[0, 0, 0, 255]).unwrap();
    }
    bytes
}
#[tokio::test]
async fn raster_media_is_private_before_publication_and_checks_type_and_size() {
    let (app, store, cookie) = fixture();
    let bytes = png();
    for (mime, data) in [
        ("image/svg+xml", b"<svg></svg>".to_vec()),
        ("image/jpeg", bytes.clone()),
        (
            "image/png",
            vec![0; portfolio_backend::blog::MAX_IMAGE_BYTES + 1],
        ),
    ] {
        assert!(matches!(
            store.create_blog_media(MediaUpload {
                filename: "image.png".into(),
                content_type: mime.into(),
                data_base64: STANDARD.encode(data)
            }),
            Err(BlogError::Invalid)
        ));
    }
    let media = store
        .create_blog_media(MediaUpload {
            filename: "image.png".into(),
            content_type: "image/png".into(),
            data_base64: STANDARD.encode(&bytes),
        })
        .unwrap();
    assert!(matches!(
        store.get_public_blog_media(media.id),
        Err(BlogError::NotFound)
    ));
    let private = app
        .clone()
        .oneshot(request(
            "GET",
            &format!("/api/backoffice/blog/media/{}", media.id),
            json!(null),
            Some(&cookie),
        ))
        .await
        .unwrap();
    assert_eq!(private.status(), StatusCode::OK);
    assert_eq!(private.headers()[header::CONTENT_TYPE], "image/png");
    let mut p = input("illustration");
    p.cover_image = Some(media.url.clone());
    p.cover_alt = "Une image de démonstration".into();
    let post = store.create_blog_post(p).unwrap();
    let post = store.publish_blog_post(post.id, post.revision).unwrap();
    assert_eq!(store.get_public_blog_media(media.id).unwrap().bytes, bytes);
    store.unpublish_blog_post(post.id, post.revision).unwrap();
    assert!(matches!(
        store.get_public_blog_media(media.id),
        Err(BlogError::NotFound)
    ));
}

#[tokio::test]
async fn blog_route_limits_allow_documents_and_media_larger_than_contact_limit() {
    let (app, store, cookie) = fixture();
    let mut p = input("long-texte");
    p.content = json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"a".repeat(30_000)}]}]});
    let response = app
        .clone()
        .oneshot(request(
            "POST",
            "/api/backoffice/blog/posts",
            serde_json::to_value(p).unwrap(),
            Some(&cookie),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::CREATED);
    assert_eq!(store.list_blog_posts("all", 20, 0).unwrap().total, 1);
    let mut bytes = png();
    bytes.extend_from_slice(&vec![0; 30_000]);
    let response=app.oneshot(request("POST","/api/backoffice/blog/media",json!({"filename":"large.png","content_type":"image/png","data_base64":STANDARD.encode(bytes)}),Some(&cookie))).await.unwrap();
    assert_eq!(response.status(), StatusCode::CREATED);
}
