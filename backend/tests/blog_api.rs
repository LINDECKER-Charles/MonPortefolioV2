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
    blog::{BlogError, BlogInput, MediaRecord, MediaUpload, unix_now},
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

fn encoded(image: image::DynamicImage, format: image::ImageFormat) -> Vec<u8> {
    let mut bytes = std::io::Cursor::new(Vec::new());
    image.write_to(&mut bytes, format).unwrap();
    bytes.into_inner()
}
/// Un dégradé légèrement bruité : en JPEG de qualité 100, les variantes l’allègent.
fn photo(width: u32, height: u32) -> Vec<u8> {
    let image = image::RgbImage::from_fn(width, height, |x, y| {
        let grain = (x.wrapping_mul(2_654_435_761) ^ y.wrapping_mul(40_503)) % 24;
        image::Rgb([(x / 8 % 256) as u8, (y / 6 % 256) as u8, (96 + grain) as u8])
    });
    let mut bytes = Vec::new();
    image::codecs::jpeg::JpegEncoder::new_with_quality(&mut bytes, 100)
        .encode_image(&image)
        .unwrap();
    bytes
}
fn upload(store: &Store, filename: &str, content_type: &str, bytes: &[u8]) -> MediaRecord {
    store
        .create_blog_media(MediaUpload {
            filename: filename.into(),
            content_type: content_type.into(),
            data_base64: STANDARD.encode(bytes),
        })
        .unwrap()
}

#[tokio::test]
async fn imported_images_are_measured_and_get_lighter_variants_once_published() {
    let (app, store, cookie) = fixture();
    let original = photo(1800, 1125);
    assert!(original.len() < portfolio_backend::blog::MAX_IMAGE_BYTES);
    let large = upload(&store, "photo.jpg", "image/jpeg", &original);
    assert_eq!((large.width, large.height), (Some(1800), Some(1125)));
    assert_eq!(large.variants, vec![480, 960, 1600]);
    let variant = store.get_blog_media_variant(large.id, 960).unwrap();
    assert_eq!(variant.content_type, "image/jpeg");
    assert!(variant.bytes.len() < original.len());
    let decoded = image::load_from_memory(&variant.bytes).unwrap();
    assert_eq!((decoded.width(), decoded.height()), (960, 600));

    // Transparence : la variante reste transparente (WebP sans perte).
    let mut drawing = image::RgbaImage::new(1200, 800);
    for (x, y, pixel) in drawing.enumerate_pixels_mut() {
        if (x / 40 + y / 40) % 2 == 0 {
            *pixel = image::Rgba([0, 0, 0, 255]);
        }
    }
    let transparent = upload(
        &store,
        "trait.png",
        "image/png",
        &encoded(
            image::DynamicImage::ImageRgba8(drawing),
            image::ImageFormat::Png,
        ),
    );
    assert_eq!(
        (transparent.width, transparent.height),
        (Some(1200), Some(800))
    );
    for width in &transparent.variants {
        let variant = store
            .get_blog_media_variant(transparent.id, *width)
            .unwrap();
        assert_eq!(variant.content_type, "image/webp");
        assert!(
            image::load_from_memory(&variant.bytes)
                .unwrap()
                .color()
                .has_alpha()
        );
    }

    // Une petite image légère n’a aucune variante utile ; un GIF garde son animation.
    let small = upload(&store, "petite.png", "image/png", &png());
    assert_eq!((small.width, small.height), (Some(1), Some(1)));
    assert!(small.variants.is_empty());
    let gif = upload(
        &store,
        "anime.gif",
        "image/gif",
        &encoded(
            image::DynamicImage::ImageRgba8(image::RgbaImage::new(600, 300)),
            image::ImageFormat::Gif,
        ),
    );
    assert_eq!((gif.width, gif.height), (Some(600), Some(300)));
    assert!(gif.variants.is_empty());
    // Mais une image fixe, pour qui demande moins de mouvement.
    assert_eq!(gif.still, Some(600));
    let still = store.get_blog_media_variant(gif.id, 600).unwrap();
    assert!(image::load_from_memory(&still.bytes).is_ok());
    assert_eq!(
        serde_json::to_value(&gif).unwrap()["still"],
        json!(600),
        "la bibliothèque annonce l’image fixe"
    );
    assert!(serde_json::to_value(&large).unwrap().get("still").is_none());
    assert_eq!(
        store.blog_media_details([gif.url.clone()]).unwrap()[&gif.url],
        json!({"width":600,"height":300,"variants":[],"still":600})
    );

    // Plus de 40 millions de pixels : refusée avant tout décodage, avec sa raison.
    let mut huge = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut huge, 8000, 6000);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder.write_header().unwrap();
        writer.write_chunk(png::chunk::IDAT, &[]).unwrap();
    }
    assert!(matches!(
        store.create_blog_media(MediaUpload {
            filename: "immense.png".into(),
            content_type: "image/png".into(),
            data_base64: STANDARD.encode(huge),
        }),
        Err(BlogError::ImageTooLarge)
    ));

    // Une signature valide sans en-tête lisible est refusée ; tronquée après son
    // en-tête, l’image reste admise, mesurée par lui et sans variante.
    let mut truncated = original.clone();
    truncated.truncate(400);
    truncated.extend_from_slice(b"\xff\xd9");
    assert!(matches!(
        store.create_blog_media(MediaUpload {
            filename: "coupee.jpg".into(),
            content_type: "image/jpeg".into(),
            data_base64: STANDARD.encode(truncated),
        }),
        Err(BlogError::Invalid)
    ));
    let mut partial = original.clone();
    partial.truncate(4000);
    partial.extend_from_slice(b"\xff\xd9");
    let partial = upload(&store, "partielle.jpg", "image/jpeg", &partial);
    assert_eq!((partial.width, partial.height), (Some(1800), Some(1125)));
    assert!(partial.variants.is_empty());

    let get = |path: String, cookie: Option<String>| {
        let app = app.clone();
        async move {
            app.oneshot(request("GET", &path, json!(null), cookie.as_deref()))
                .await
                .unwrap()
        }
    };
    let variant_path = format!("/api/blog/media/{}/960", large.id);
    assert_eq!(
        get(variant_path.clone(), None).await.status(),
        StatusCode::NOT_FOUND,
        "une variante reste privée avant publication"
    );
    let private = get(
        format!("/api/backoffice/blog/media/{}/960", large.id),
        Some(cookie.clone()),
    )
    .await;
    assert_eq!(private.status(), StatusCode::OK);
    assert_eq!(private.headers()[header::CONTENT_TYPE], "image/jpeg");

    let mut p = input("images-mesurees");
    p.cover_image = Some(transparent.url.clone());
    p.cover_alt = "Un damier".into();
    p.content = json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Texte."}]},{"type":"image","attrs":{"src":large.url,"alt":"Une photo"}}]});
    let post = store.create_blog_post(p).unwrap();
    let preview = body(
        get(
            format!("/api/backoffice/blog/posts/{}/preview", post.id),
            Some(cookie.clone()),
        )
        .await,
    )
    .await;
    assert_eq!(
        preview["media"][&large.url],
        json!({"width":1800,"height":1125,"variants":[480,960,1600]})
    );
    store.publish_blog_post(post.id, post.revision).unwrap();
    let public = body(get("/api/blog/posts/images-mesurees".into(), None).await).await;
    assert_eq!(public["media"][&large.url]["width"], 1800);
    assert_eq!(public["media"][&transparent.url]["height"], 800);
    let list = body(get("/api/blog/posts".into(), None).await).await;
    assert_eq!(list["posts"][0]["media"][&transparent.url]["width"], 1200);
    assert!(
        list["posts"][0]["media"].get(&large.url).is_none(),
        "la liste ne décrit que la couverture"
    );
    let response = get(variant_path, None).await;
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(
        response.headers()[header::CONTENT_SECURITY_POLICY],
        "default-src 'none'; sandbox"
    );
    assert_eq!(
        get(format!("/api/blog/media/{}/700", large.id), None)
            .await
            .status(),
        StatusCode::NOT_FOUND
    );
}

/// Un JPEG d’appareil photo : EXIF avec orientation (6) et position GPS.
fn photo_with_gps() -> Vec<u8> {
    let mut tiff = b"MM\0\x2a\0\0\0\x08".to_vec();
    tiff.extend_from_slice(&[0, 2]);
    tiff.extend_from_slice(&[0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, 6, 0, 0]);
    tiff.extend_from_slice(&[0x88, 0x25, 0, 4, 0, 0, 0, 1, 0, 0, 0, 38]);
    tiff.extend_from_slice(&[0, 0, 0, 0]);
    tiff.extend_from_slice(&[0, 1, 0, 1, 0, 2, 0, 0, 0, 2, b'N', 0, 0, 0]);
    tiff.extend_from_slice(&[0, 0, 0, 0]);
    tiff.extend_from_slice(b"GPS-48.85N-2.35E");
    let plain = photo(300, 200);
    let mut bytes = plain[..2].to_vec();
    bytes.extend_from_slice(&[0xff, 0xe1]);
    bytes.extend_from_slice(&((tiff.len() + 8) as u16).to_be_bytes());
    bytes.extend_from_slice(b"Exif\0\0");
    bytes.extend_from_slice(&tiff);
    bytes.extend_from_slice(&plain[2..]);
    bytes
}

#[tokio::test]
async fn a_published_photo_never_leaves_with_its_gps_position() {
    let (app, store, _) = fixture();
    let original = photo_with_gps();
    let media = upload(&store, "vacances.jpg", "image/jpeg", &original);
    // L’orientation reste appliquée : 300 × 200 tournée d’un quart de tour.
    assert_eq!((media.width, media.height), (Some(200), Some(300)));
    let mut p = input("photo-gps");
    p.cover_image = Some(media.url.clone());
    p.cover_alt = "Une photo".into();
    let post = store.create_blog_post(p).unwrap();
    store.publish_blog_post(post.id, post.revision).unwrap();
    let mut paths = vec![media.url.clone()];
    paths.extend(media.variants.iter().map(|w| format!("{}/{w}", media.url)));
    for path in paths {
        let response = app
            .clone()
            .oneshot(request("GET", &path, json!(null), None))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK, "{path}");
        let bytes = response.into_body().collect().await.unwrap().to_bytes();
        assert!(
            !bytes.windows(3).any(|w| w == b"GPS"),
            "{path} ne porte aucune position"
        );
        let decoded = image::load_from_memory(&bytes).unwrap();
        assert!(decoded.width() > 0, "{path} reste lisible");
    }
}

#[test]
fn images_imported_before_measurement_are_measured_at_startup() {
    let path = std::env::temp_dir().join(format!(
        "portfolio-media-{}-{}.sqlite3",
        std::process::id(),
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    ));
    {
        let connection = rusqlite::Connection::open(&path).unwrap();
        connection.execute_batch("CREATE TABLE blog_media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,filename TEXT NOT NULL,content_type TEXT NOT NULL,
            data BLOB NOT NULL,created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));").unwrap();
        connection
            .execute(
                "INSERT INTO blog_media(filename,content_type,data) VALUES('ancienne.jpg','image/jpeg',?1),('illisible.png','image/png',?2)",
                rusqlite::params![photo(1000, 500), b"\x89PNG\r\n\x1a\n".to_vec()],
            )
            .unwrap();
    }
    let store = Store::open(&path, Some("owner@example.org")).unwrap();
    let media = store.list_blog_media(10, 0).unwrap();
    let old = media.iter().find(|m| m.filename == "ancienne.jpg").unwrap();
    assert_eq!((old.width, old.height), (Some(1000), Some(500)));
    // Réencodée à sa largeur, l’image de qualité 100 gagne plus de 10 % : 1 000 est servie aussi.
    assert_eq!(old.variants, vec![480, 960, 1000]);
    let unreadable = media
        .iter()
        .find(|m| m.filename == "illisible.png")
        .unwrap();
    assert_eq!((unreadable.width, unreadable.height), (None, None));
    drop(store);
    for suffix in ["", "-wal", "-shm"] {
        let _ = std::fs::remove_file(format!("{}{suffix}", path.display()));
    }
}

#[tokio::test]
async fn an_image_is_deleted_only_when_no_version_cites_it() {
    let (app, store, cookie) = fixture();
    let unused = upload(&store, "libre.jpg", "image/jpeg", &photo(1200, 600));
    let used = upload(&store, "citee.png", "image/png", &png());
    let mut p = input("citation");
    p.og_image = Some(used.url.clone());
    let post = store.create_blog_post(p).unwrap();
    let delete = |id: i64, cookie: Option<String>| {
        let app = app.clone();
        async move {
            app.oneshot(request(
                "DELETE",
                &format!("/api/backoffice/blog/media/{id}"),
                json!(null),
                cookie.as_deref(),
            ))
            .await
            .unwrap()
        }
    };
    assert_eq!(
        delete(unused.id, None).await.status(),
        StatusCode::UNAUTHORIZED
    );
    let response = delete(unused.id, Some(cookie.clone())).await;
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(body(response).await, json!({"deleted":true,"id":unused.id}));
    assert!(matches!(
        store.get_blog_media_variant(unused.id, 480),
        Err(BlogError::NotFound)
    ));
    assert_eq!(
        delete(unused.id, Some(cookie.clone())).await.status(),
        StatusCode::NOT_FOUND
    );
    let response = delete(used.id, Some(cookie.clone())).await;
    assert_eq!(response.status(), StatusCode::CONFLICT);
    assert_eq!(body(response).await["code"], "MEDIA_IN_USE");
    // Publiée puis retirée de la version de travail : la version publique la cite encore.
    let published = store.publish_blog_post(post.id, post.revision).unwrap();
    let mut changes = published.fields.clone();
    changes.og_image = None;
    changes.revision = Some(published.revision);
    let edited = store.update_blog_post(post.id, changes).unwrap();
    assert!(matches!(
        store.delete_blog_media(used.id),
        Err(BlogError::MediaInUse)
    ));
    store.publish_blog_post(edited.id, edited.revision).unwrap();
    store.delete_blog_media(used.id).unwrap();

    // Programmée puis retirée de la version de travail : la version programmée la
    // cite encore, et sortirait sans elle à l’échéance.
    let planned = upload(&store, "programmee.png", "image/png", &png());
    let mut p = input("programmation");
    p.og_image = Some(planned.url.clone());
    let post = store.create_blog_post(p).unwrap();
    let scheduled = store
        .schedule_blog_post(post.id, unix_now() + 3600, post.revision)
        .unwrap();
    let mut changes = scheduled.fields.clone();
    changes.og_image = None;
    changes.revision = Some(scheduled.revision);
    let edited = store.update_blog_post(post.id, changes).unwrap();
    assert!(matches!(
        store.delete_blog_media(planned.id),
        Err(BlogError::MediaInUse)
    ));
    // La programmation annulée, plus rien ne la cite.
    store
        .unpublish_blog_post(edited.id, edited.revision)
        .unwrap();
    store.delete_blog_media(planned.id).unwrap();
}

/// L’article de test du rendu (site/tests/fixtures, e2e blog-article.spec.ts) :
/// ce que le site affiche doit d’abord être un document que la validation admet.
#[test]
fn the_rendering_fixture_is_a_publishable_document() {
    let store = Store::in_memory("owner@example.org").unwrap();
    // Autant d’images importées (identifiants 1 à n) que la fixture en décrit.
    let media: Value = serde_json::from_str(include_str!(
        "../../site/tests/fixtures/article-complet-media.json"
    ))
    .unwrap();
    for n in 1..=media["images"].as_object().unwrap().len() {
        upload(&store, &format!("fixture-{n}.png"), "image/png", &png());
    }
    let fixture: BlogInput = serde_json::from_str(include_str!(
        "../../site/tests/fixtures/article-complet.json"
    ))
    .unwrap();
    let post = store.create_blog_post(fixture).unwrap();
    store.publish_blog_post(post.id, post.revision).unwrap();
    assert_eq!(
        store
            .get_public_blog_post("article-complet")
            .unwrap()
            .fields
            .og_image
            .as_deref(),
        Some("/api/blog/media/6")
    );
}

/// L’inventaire du schéma des articles (site/tests/fixtures/schema-blog.json),
/// que le rendu Node vérifie aussi : chaque valeur admise passe, chaque valeur
/// refusée et chaque attribut absent de l’inventaire sont refusés.
const SCHEMA: &str = include_str!("../../site/tests/fixtures/schema-blog.json");
const RENDERING_FIXTURE: &str = include_str!("../../site/tests/fixtures/article-complet.json");

/// Fusionne `attrs` dans les attributs de base d’un nœud.
fn with_attrs(base: Value, attrs: &Value) -> Value {
    let mut merged = base;
    for (key, value) in attrs.as_object().unwrap() {
        merged[key] = value.clone();
    }
    merged
}

/// Un document minimal où le nœud `kind` porte `attrs`, à une place que la validation admet.
fn placed(kind: &str, attrs: &Value) -> Value {
    let text = json!({"type":"text","text":"x"});
    let paragraph = json!({"type":"paragraph","content":[text]});
    let doc = |block: Value| json!({"type":"doc","content":[block]});
    let table = |row: Value| doc(json!({"type":"table","content":[row]}));
    let cell = |kind: &str, attrs: &Value| json!({"type":kind,"attrs":attrs,"content":[paragraph]});
    match kind {
        "doc" => json!({"type":"doc","attrs":attrs,"content":[paragraph]}),
        "paragraph" => doc(json!({"type":"paragraph","attrs":attrs,"content":[text]})),
        "heading" => doc(
            json!({"type":"heading","attrs":with_attrs(json!({"level":2}), attrs),"content":[text]}),
        ),
        "text" => {
            doc(json!({"type":"paragraph","content":[{"type":"text","text":"x","attrs":attrs}]}))
        }
        "hardBreak" => {
            doc(json!({"type":"paragraph","content":[text,{"type":"hardBreak","attrs":attrs}]}))
        }
        "horizontalRule" => doc(json!({"type":"horizontalRule","attrs":attrs})),
        "bulletList" | "orderedList" => doc(
            json!({"type":kind,"attrs":attrs,"content":[{"type":"listItem","content":[paragraph]}]}),
        ),
        "listItem" => doc(
            json!({"type":"bulletList","content":[{"type":"listItem","attrs":attrs,"content":[paragraph]}]}),
        ),
        "blockquote" => doc(json!({"type":"blockquote","attrs":attrs,"content":[paragraph]})),
        "codeBlock" => doc(json!({"type":"codeBlock","attrs":attrs,"content":[text]})),
        "image" => doc(
            json!({"type":"image","attrs":with_attrs(json!({"src":"/api/blog/media/1"}), attrs)}),
        ),
        "table" => doc(
            json!({"type":"table","attrs":attrs,"content":[{"type":"tableRow","content":[cell("tableCell", &json!({}))]}]}),
        ),
        "tableRow" => table(
            json!({"type":"tableRow","attrs":attrs,"content":[cell("tableCell", &json!({}))]}),
        ),
        "tableCell" | "tableHeader" => {
            table(json!({"type":"tableRow","content":[cell(kind, attrs)]}))
        }
        _ => panic!("nœud absent de placed() : {kind}"),
    }
}

/// Un paragraphe dont le texte porte la marque `mark` avec `attrs`.
fn marked(mark: &str, attrs: &Value) -> Value {
    let attrs = if mark == "link" {
        with_attrs(json!({"href":"/blog"}), attrs)
    } else {
        attrs.clone()
    };
    json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"x","marks":[{"type":mark,"attrs":attrs}]}]}]})
}

fn validates(content: Value) -> Result<(), BlogError> {
    let mut p = input("schema");
    p.content = content;
    p.validate()
}

#[test]
fn every_node_mark_and_attribute_of_the_shared_schema_is_validated_as_listed() {
    let schema: Value = serde_json::from_str(SCHEMA).unwrap();
    let groups = [
        ("noeuds", placed as fn(&str, &Value) -> Value),
        ("marques", marked),
    ];
    // Tous les noms d’attributs connus, plus des noms qu’aucun nœud n’admet.
    let mut names = std::collections::BTreeSet::from(["style", "id", "onclick", "html", "src-set"]);
    for (group, _) in groups {
        for spec in schema[group].as_object().unwrap().values() {
            names.extend(spec.as_object().unwrap().keys().map(String::as_str));
        }
    }
    let sample = |name: &str| -> Value {
        for (group, _) in groups {
            for spec in schema[group].as_object().unwrap().values() {
                if let Some(value) = spec[name]["admis"]
                    .as_array()
                    .and_then(|values| values.iter().find(|v| !v.is_null()))
                {
                    return value.clone();
                }
            }
        }
        json!("x")
    };
    for (group, build) in groups {
        for (kind, spec) in schema[group].as_object().unwrap() {
            assert!(
                validates(build(kind, &json!({}))).is_ok(),
                "{kind} sans attribut"
            );
            let spec = spec.as_object().unwrap();
            for (name, values) in spec {
                for value in values["admis"].as_array().unwrap() {
                    assert!(
                        validates(build(kind, &json!({ name: value }))).is_ok(),
                        "{kind}.{name} = {value} doit passer"
                    );
                }
                for value in values["refuses"].as_array().unwrap() {
                    assert!(
                        matches!(
                            validates(build(kind, &json!({ name: value }))),
                            Err(BlogError::Invalid)
                        ),
                        "{kind}.{name} = {value} doit être refusé"
                    );
                }
            }
            for name in names.iter().filter(|name| !spec.contains_key(**name)) {
                assert!(
                    matches!(
                        validates(build(kind, &json!({ *name: sample(name) }))),
                        Err(BlogError::Invalid)
                    ),
                    "{kind} n’admet pas l’attribut {name}"
                );
            }
        }
    }
    for kind in ["html", "iframe", "script", "mention", "taskList", "details"] {
        let node = json!({"type":"doc","content":[{"type":kind,"content":[{"type":"paragraph"}]}]});
        assert!(
            matches!(validates(node), Err(BlogError::Invalid)),
            "nœud {kind}"
        );
        let mark = json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"x","marks":[{"type":kind}]}]}]});
        assert!(
            matches!(validates(mark), Err(BlogError::Invalid)),
            "marque {kind}"
        );
    }
}

/// Le chemin (indices de `content`) de chaque nœud d’un document, racine comprise.
fn node_paths(node: &Value, at: &mut Vec<usize>, out: &mut Vec<Vec<usize>>) {
    out.push(at.clone());
    for (index, child) in node["content"].as_array().into_iter().flatten().enumerate() {
        at.push(index);
        node_paths(child, at, out);
        at.pop();
    }
}
fn node_at<'a>(root: &'a mut Value, path: &[usize]) -> &'a mut Value {
    path.iter()
        .fold(root, |node, &index| &mut node["content"][index])
}

#[test]
fn every_node_of_the_rendering_fixture_refuses_unknown_attributes_and_unsafe_values() {
    let fixture: BlogInput = serde_json::from_str(RENDERING_FIXTURE).unwrap();
    assert!(fixture.validate().is_ok());
    let mut paths = Vec::new();
    node_paths(&fixture.content, &mut Vec::new(), &mut paths);
    let refused = |path: &[usize], change: &dyn Fn(&mut Value)| {
        let mut p = fixture.clone();
        change(node_at(&mut p.content, path));
        matches!(p.validate(), Err(BlogError::Invalid))
    };
    let (mut links, mut headings, mut images) = (0, 0, 0);
    for path in &paths {
        let kind = node_at(&mut fixture.content.clone(), path)["type"]
            .as_str()
            .unwrap()
            .to_owned();
        assert!(
            refused(path, &|node| node["attrs"]["style"] =
                json!("position:fixed")),
            "attribut inconnu sur {kind} {path:?}"
        );
        assert!(
            refused(path, &|node| node["html"] = json!("<b>x</b>")),
            "clé inconnue sur {kind} {path:?}"
        );
        if !path.is_empty() {
            assert!(
                refused(path, &|node| node["type"] = json!("html")),
                "type inconnu à la place de {kind} {path:?}"
            );
        }
        match kind.as_str() {
            "heading" => {
                headings += 1;
                for level in [1, 5] {
                    assert!(
                        refused(path, &|node| node["attrs"]["level"] = json!(level)),
                        "titre {path:?} de niveau {level}"
                    );
                }
            }
            "image" => {
                images += 1;
                for src in [
                    "/assets/demo.png",
                    "/images/charles.webp",
                    "https://example.org/x.png",
                    "javascript:alert(1)",
                ] {
                    assert!(
                        refused(path, &|node| node["attrs"]["src"] = json!(src)),
                        "image {path:?} en {src}"
                    );
                }
            }
            "text" => {
                assert!(
                    refused(path, &|node| node["marks"] = json!([{"type":"script"}])),
                    "marque inconnue sur {path:?}"
                );
                let marks = fixture_marks(&fixture.content, path);
                for (index, mark) in marks.iter().enumerate() {
                    if mark["type"] != "link" {
                        continue;
                    }
                    links += 1;
                    for href in [
                        "javascript:alert(1)",
                        "JaVaScRiPt:alert(1)",
                        "mailto:owner@example.org",
                        "data:text/html,x",
                        "//evil.test/",
                    ] {
                        assert!(
                            refused(path, &|node| node["marks"][index]["attrs"]["href"] =
                                json!(href)),
                            "lien {path:?} vers {href}"
                        );
                    }
                }
            }
            _ => {}
        }
    }
    assert!(
        links >= 5 && headings >= 5 && images >= 5,
        "l’article de test garde des liens ({links}), des titres ({headings}) et des images ({images})"
    );
}
fn fixture_marks(content: &Value, path: &[usize]) -> Vec<Value> {
    let mut root = content.clone();
    node_at(&mut root, path)["marks"]
        .as_array()
        .cloned()
        .unwrap_or_default()
}
