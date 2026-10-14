//! Contenus structurés, versions publiées et programmation persistent dans SQLite.
use std::{
    sync::Arc,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use axum::{
    Json, Router,
    extract::{DefaultBodyLimit, Path, Query, State},
    http::{StatusCode, header},
    middleware,
    response::{IntoResponse, Response},
    routing::{get, post},
};
use base64::{Engine, engine::general_purpose::STANDARD};
use rusqlite::{Connection, OptionalExtension, params};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use url::Url;

use crate::{
    AppState,
    error::ApiError,
    storage::{Store, StoreError},
};

pub const MAX_DOCUMENT_BYTES: usize = 256 * 1024;
pub const MAX_IMAGE_BYTES: usize = 4 * 1024 * 1024;
pub const MAX_BLOG_BODY_BYTES: usize = MAX_DOCUMENT_BYTES + 32 * 1024;
pub const MAX_MEDIA_BODY_BYTES: usize = MAX_IMAGE_BYTES * 4 / 3 + 16 * 1024;

#[derive(Debug)]
pub enum BlogError {
    Invalid,
    NotFound,
    RevisionConflict,
    SlugConflict,
    MediaInUse,
    ImageTooLarge,
    Storage,
}
impl BlogError {
    pub fn code(&self) -> &'static str {
        match self {
            Self::Invalid => "VALIDATION_ERROR",
            Self::NotFound => "NOT_FOUND",
            Self::RevisionConflict => "REVISION_CONFLICT",
            Self::SlugConflict => "SLUG_CONFLICT",
            Self::MediaInUse => "MEDIA_IN_USE",
            Self::ImageTooLarge => "IMAGE_TOO_LARGE",
            Self::Storage => "STORAGE_UNAVAILABLE",
        }
    }
    pub fn message(&self) -> &'static str {
        match self {
            Self::Invalid => "Vérifiez le contenu, les adresses et les champs de l’article.",
            Self::NotFound => "Cet article ou cette image n’existe pas.",
            Self::RevisionConflict => {
                "L’article a changé. Rechargez sa version avant de continuer."
            }
            Self::SlugConflict => "Cette adresse est déjà utilisée par un article.",
            Self::MediaInUse => {
                "Cette image est utilisée par un article. Retirez-la de ses versions avant de la supprimer."
            }
            Self::ImageTooLarge => {
                "Cette image dépasse 40 millions de pixels. Réduisez-la avant de l’importer."
            }
            Self::Storage => "Le service est temporairement indisponible.",
        }
    }
}
impl From<StoreError> for BlogError {
    fn from(_: StoreError) -> Self {
        Self::Storage
    }
}
impl From<rusqlite::Error> for BlogError {
    fn from(_: rusqlite::Error) -> Self {
        Self::Storage
    }
}
impl From<BlogError> for ApiError {
    fn from(error: BlogError) -> Self {
        let status = match error {
            BlogError::Invalid | BlogError::ImageTooLarge => StatusCode::UNPROCESSABLE_ENTITY,
            BlogError::NotFound => StatusCode::NOT_FOUND,
            BlogError::RevisionConflict | BlogError::SlugConflict | BlogError::MediaInUse => {
                StatusCode::CONFLICT
            }
            BlogError::Storage => StatusCode::SERVICE_UNAVAILABLE,
        };
        Self::new(status, error.code(), error.message())
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BlogInput {
    pub title: String,
    pub slug: String,
    #[serde(default)]
    pub excerpt: String,
    pub content: Value,
    #[serde(default)]
    pub cover_image: Option<String>,
    #[serde(default)]
    pub cover_alt: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub seo_title: String,
    #[serde(default)]
    pub seo_description: String,
    #[serde(default)]
    pub canonical_url: Option<String>,
    #[serde(default)]
    pub og_image: Option<String>,
    #[serde(default)]
    pub noindex: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub revision: Option<u64>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BlogPost {
    pub id: i64,
    #[serde(flatten)]
    pub fields: BlogInput,
    pub status: String,
    pub scheduled_at: Option<i64>,
    pub published_at: Option<i64>,
    pub created_at: String,
    pub updated_at: String,
    pub revision: u64,
    #[serde(default)]
    pub has_unpublished_changes: bool,
    #[serde(default)]
    pub scheduled_revision: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct BlogPage {
    pub posts: Vec<BlogPost>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MediaUpload {
    pub filename: String,
    pub content_type: String,
    pub data_base64: String,
}
#[derive(Debug, Serialize)]
pub struct MediaRecord {
    pub id: i64,
    pub filename: String,
    pub content_type: String,
    pub size: u64,
    pub url: String,
    pub created_at: String,
    /// Dimensions réelles, orientation comprise ; absentes si l’image n’a pas pu être mesurée.
    pub width: Option<u32>,
    pub height: Option<u32>,
    /// Largeurs servies sous `{url}/{largeur}`, de la plus petite à la plus grande.
    pub variants: Vec<u32>,
}
pub struct MediaData {
    pub content_type: String,
    pub bytes: Vec<u8>,
}

pub(crate) fn initialize(connection: &Connection) -> Result<(), StoreError> {
    connection.execute_batch("CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE,
        editable_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','scheduled','published')),
        scheduled_at INTEGER, scheduled_json TEXT, published_at INTEGER,
        published_json TEXT, published_slug TEXT UNIQUE,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        revision INTEGER NOT NULL DEFAULT 1);
        CREATE INDEX IF NOT EXISTS blog_schedule ON blog_posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
        CREATE TABLE IF NOT EXISTS blog_media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,filename TEXT NOT NULL,content_type TEXT NOT NULL,
        data BLOB NOT NULL,created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
        CREATE TABLE IF NOT EXISTS blog_media_variants (
        media_id INTEGER NOT NULL REFERENCES blog_media(id) ON DELETE CASCADE,
        width INTEGER NOT NULL,content_type TEXT NOT NULL,data BLOB NOT NULL,
        PRIMARY KEY(media_id,width));")?;
    let columns = connection
        .prepare("PRAGMA table_info(blog_media)")?
        .query_map([], |row| row.get::<_, String>(1))?
        .collect::<Result<Vec<_>, _>>()?;
    for column in ["width", "height"] {
        if !columns.iter().any(|name| name == column) {
            connection.execute(
                &format!("ALTER TABLE blog_media ADD COLUMN {column} INTEGER"),
                [],
            )?;
        }
    }
    // Les images importées avant la mesure reçoivent dimensions, variantes et
    // original sans métadonnées une fois. Chacune est d’abord marquée 0 × 0 :
    // une image illisible, ou qui ferait tomber le service, n’est jamais relue
    // à chaque démarrage.
    let pending: Vec<(i64, String)> = connection
        .prepare("SELECT id,content_type FROM blog_media WHERE width IS NULL ORDER BY id")?
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
        .collect::<Result<Vec<_>, _>>()?;
    for (id, content_type) in pending {
        connection.execute("UPDATE blog_media SET width=0,height=0 WHERE id=?1", [id])?;
        let bytes: Vec<u8> =
            connection.query_row("SELECT data FROM blog_media WHERE id=?1", [id], |r| {
                r.get(0)
            })?;
        if let Ok(processed) = crate::blog_media::process(&bytes, &content_type) {
            connection.execute(
                "UPDATE blog_media SET data=?2 WHERE id=?1",
                params![id, processed.original],
            )?;
            store_processed(connection, id, &processed)?;
        }
    }
    Ok(())
}

fn store_processed(
    connection: &Connection,
    id: i64,
    processed: &crate::blog_media::Processed,
) -> rusqlite::Result<()> {
    connection.execute(
        "UPDATE blog_media SET width=?2,height=?3 WHERE id=?1",
        params![id, processed.width, processed.height],
    )?;
    for variant in &processed.variants {
        connection.execute(
            "INSERT OR REPLACE INTO blog_media_variants(media_id,width,content_type,data) VALUES(?1,?2,?3,?4)",
            params![id, variant.width, variant.content_type, variant.bytes],
        )?;
    }
    Ok(())
}

fn bounded(value: &str, min: usize, max: usize) -> bool {
    (min..=max).contains(&value.chars().count())
        && !value
            .chars()
            .any(|c| c.is_control() && !matches!(c, '\n' | '\t'))
}
fn valid_slug(slug: &str) -> bool {
    !slug.is_empty()
        && slug.len() <= 100
        && !slug.starts_with('-')
        && !slug.ends_with('-')
        && !slug.contains("--")
        && slug
            .bytes()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'-')
}
fn safe_path(value: &str, prefix: &str) -> bool {
    value.starts_with(prefix)
        && value.len() <= 2048
        && !value.contains("..")
        && !value.contains("//")
        && value
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'/' | b'-' | b'_' | b'.'))
}
/// Seules les images importées s’affichent : le site ne sert aucun dossier
/// d’images d’auteur, et ses propres fichiers (`/images/`, `/og/`) changent
/// avec lui. Même règle dans server/blog.mjs et l’éditeur.
pub fn valid_image_url(value: &str) -> bool {
    value.strip_prefix("/api/blog/media/").is_some_and(|id| {
        !id.is_empty() && !id.starts_with('0') && id.bytes().all(|b| b.is_ascii_digit())
    })
}
fn web_url(value: &str) -> bool {
    value.len() <= 2048
        && !value.chars().any(char::is_control)
        && Url::parse(value).is_ok_and(|url| {
            matches!(url.scheme(), "http" | "https")
                && url.host_str().is_some()
                && url.username().is_empty()
                && url.password().is_none()
        })
}
fn anchor(value: &str) -> bool {
    !value.is_empty()
        && value
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_'))
}
/// Une seule règle de liens, reprise par l’éditeur (blog-editor.ts) et le rendu
/// (server/blog.mjs) : adresse http(s) absolue ; chemin du site, avec au besoin
/// des paramètres et une ancre sûrs (`/blog?page=2`, `/projets/omnicard#decisions`) ;
/// ancre d’un titre de l’article (`#le-contexte`).
fn link_url(value: &str) -> bool {
    let (rest, fragment) = value
        .split_once('#')
        .map_or((value, None), |(rest, fragment)| (rest, Some(fragment)));
    let (path, query) = rest
        .split_once('?')
        .map_or((rest, None), |(path, query)| (path, Some(query)));
    let internal = safe_path(path, "/")
        && query.is_none_or(|query| {
            !query.is_empty()
                && query.bytes().all(|b| {
                    b.is_ascii_alphanumeric() || matches!(b, b'=' | b'&' | b'-' | b'_' | b'.')
                })
        })
        && fragment.is_none_or(anchor);
    web_url(value) || internal || value.strip_prefix('#').is_some_and(anchor)
}

impl BlogInput {
    pub fn validate(&self) -> Result<(), BlogError> {
        if !bounded(&self.title, 1, 160)
            || self.title.trim().is_empty()
            || !valid_slug(&self.slug)
            || !bounded(&self.excerpt, 0, 500)
            || !bounded(&self.cover_alt, 0, 300)
            || !bounded(&self.seo_title, 0, 120)
            || !bounded(&self.seo_description, 0, 320)
            || self.tags.len() > 20
            || self
                .tags
                .iter()
                .any(|tag| !bounded(tag, 1, 50) || tag.trim().is_empty())
            || self
                .cover_image
                .as_deref()
                .is_some_and(|url| !valid_image_url(url))
            || self
                .og_image
                .as_deref()
                .is_some_and(|url| !valid_image_url(url))
            || self
                .canonical_url
                .as_deref()
                .is_some_and(|url| !web_url(url) || !url.starts_with("https://"))
            || self.content.to_string().len() > MAX_DOCUMENT_BYTES
        {
            return Err(BlogError::Invalid);
        }
        if self.content.get("type").and_then(Value::as_str) != Some("doc") {
            return Err(BlogError::Invalid);
        }
        let mut count = 0;
        validate_node(&self.content, None, 0, &mut count)
    }
    fn ready(&self) -> Result<(), BlogError> {
        self.validate()?;
        if self.excerpt.trim().is_empty()
            || !has_content(&self.content)
            || (self.cover_image.is_some() && self.cover_alt.trim().is_empty())
        {
            return Err(BlogError::Invalid);
        }
        Ok(())
    }
}

fn has_content(node: &Value) -> bool {
    node.get("text")
        .and_then(Value::as_str)
        .is_some_and(|text| !text.trim().is_empty())
        || node.get("type").and_then(Value::as_str) == Some("image")
        || node
            .get("content")
            .and_then(Value::as_array)
            .is_some_and(|children| children.iter().any(has_content))
}
fn attrs_valid(kind: &str, attrs: &Value) -> bool {
    let Some(attrs) = attrs.as_object() else {
        return attrs.is_null();
    };
    attrs.iter().all(|(key, value)| match (kind, key.as_str()) {
        ("paragraph" | "heading", "textAlign") => {
            value.is_null()
                || value
                    .as_str()
                    .is_some_and(|align| matches!(align, "left" | "center" | "right" | "justify"))
        }
        ("heading", "level") => value.as_u64().is_some_and(|n| (2..=4).contains(&n)),
        ("orderedList", "start") => {
            value.is_null() || value.as_u64().is_some_and(|n| (1..=1_000_000).contains(&n))
        }
        ("orderedList", "type") => {
            value.is_null()
                || value
                    .as_str()
                    .is_some_and(|n| matches!(n, "1" | "a" | "A" | "i" | "I"))
        }
        ("codeBlock", "language") => {
            value.is_null()
                || value.as_str().is_some_and(|v| {
                    v.len() <= 40
                        && v.bytes().all(|b| {
                            b.is_ascii_alphanumeric() || matches!(b, b'+' | b'#' | b'-' | b'_')
                        })
                })
        }
        ("image", "src") => value.as_str().is_some_and(valid_image_url),
        ("image", "alt" | "title") => {
            value.is_null() || value.as_str().is_some_and(|s| bounded(s, 0, 300))
        }
        ("image", "width" | "height") => {
            value.is_null() || value.as_u64().is_some_and(|n| (1..=10_000).contains(&n))
        }
        ("tableCell" | "tableHeader", "align") => {
            value.is_null()
                || value
                    .as_str()
                    .is_some_and(|align| matches!(align, "left" | "center" | "right" | "justify"))
        }
        ("tableCell" | "tableHeader", "colspan" | "rowspan") => {
            value.as_u64().is_some_and(|n| (1..=100).contains(&n))
        }
        ("tableCell" | "tableHeader", "colwidth") => {
            value.is_null()
                || value.as_array().is_some_and(|widths| {
                    widths.len() <= 100
                        && widths
                            .iter()
                            .all(|v| v.as_u64().is_some_and(|n| (1..=10_000).contains(&n)))
                })
        }
        ("table", "class") => value.is_null(),
        _ => false,
    })
}
fn validate_node(
    node: &Value,
    parent: Option<&str>,
    depth: usize,
    count: &mut usize,
) -> Result<(), BlogError> {
    *count += 1;
    if depth > 20 || *count > 5000 {
        return Err(BlogError::Invalid);
    }
    let object = node.as_object().ok_or(BlogError::Invalid)?;
    if object.keys().any(|key| {
        !matches!(
            key.as_str(),
            "type" | "attrs" | "content" | "text" | "marks"
        )
    }) {
        return Err(BlogError::Invalid);
    }
    let kind = node
        .get("type")
        .and_then(Value::as_str)
        .ok_or(BlogError::Invalid)?;
    let allowed = match parent {
        None => kind == "doc",
        Some("doc" | "blockquote" | "listItem" | "tableCell" | "tableHeader") => matches!(
            kind,
            "paragraph"
                | "heading"
                | "bulletList"
                | "orderedList"
                | "blockquote"
                | "codeBlock"
                | "horizontalRule"
                | "image"
                | "table"
        ),
        Some("paragraph" | "heading") => matches!(kind, "text" | "hardBreak"),
        Some("codeBlock") => kind == "text",
        Some("bulletList" | "orderedList") => kind == "listItem",
        Some("table") => kind == "tableRow",
        Some("tableRow") => matches!(kind, "tableCell" | "tableHeader"),
        _ => false,
    };
    if !allowed {
        return Err(BlogError::Invalid);
    }
    if let Some(attrs) = node.get("attrs")
        && !attrs_valid(kind, attrs)
    {
        return Err(BlogError::Invalid);
    }
    if kind == "heading"
        && !node
            .get("attrs")
            .and_then(|a| a.get("level"))
            .and_then(Value::as_u64)
            .is_some_and(|level| (2..=4).contains(&level))
    {
        return Err(BlogError::Invalid);
    }
    if kind == "image"
        && !node
            .get("attrs")
            .and_then(|a| a.get("src"))
            .and_then(Value::as_str)
            .is_some_and(valid_image_url)
    {
        return Err(BlogError::Invalid);
    }
    if kind == "text" {
        if !node
            .get("text")
            .and_then(Value::as_str)
            .is_some_and(|text| bounded(text, 1, 100_000))
            || node.get("content").is_some()
        {
            return Err(BlogError::Invalid);
        }
    } else if node.get("text").is_some() {
        return Err(BlogError::Invalid);
    }
    if let Some(marks) = node.get("marks") {
        if kind != "text" {
            return Err(BlogError::Invalid);
        }
        let marks = marks.as_array().ok_or(BlogError::Invalid)?;
        if marks.len() > 8 {
            return Err(BlogError::Invalid);
        }
        for mark in marks {
            let object = mark.as_object().ok_or(BlogError::Invalid)?;
            if object
                .keys()
                .any(|key| !matches!(key.as_str(), "type" | "attrs"))
            {
                return Err(BlogError::Invalid);
            }
            match mark.get("type").and_then(Value::as_str) {
                Some("bold" | "italic" | "strike" | "underline" | "code") => {
                    if mark.get("attrs").is_some_and(|a| {
                        !a.is_null() && a.as_object().is_none_or(|a| !a.is_empty())
                    }) {
                        return Err(BlogError::Invalid);
                    }
                }
                Some("link") => {
                    let attrs = mark
                        .get("attrs")
                        .and_then(Value::as_object)
                        .ok_or(BlogError::Invalid)?;
                    if !attrs
                        .get("href")
                        .and_then(Value::as_str)
                        .is_some_and(link_url)
                        || attrs.iter().any(|(key, value)| match key.as_str() {
                            "href" => false,
                            "target" => {
                                !(value.is_null()
                                    || value
                                        .as_str()
                                        .is_some_and(|s| matches!(s, "_blank" | "_self")))
                            }
                            "title" => {
                                !(value.is_null()
                                    || value.as_str().is_some_and(|v| bounded(v, 0, 300)))
                            }
                            "rel" | "class" => {
                                !(value.is_null()
                                    || value.as_str().is_some_and(|v| bounded(v, 0, 100)))
                            }
                            _ => true,
                        })
                    {
                        return Err(BlogError::Invalid);
                    }
                }
                _ => return Err(BlogError::Invalid),
            }
        }
    }
    if let Some(content) = node.get("content") {
        let content = content.as_array().ok_or(BlogError::Invalid)?;
        if matches!(kind, "text" | "image" | "horizontalRule" | "hardBreak") {
            return Err(BlogError::Invalid);
        }
        for child in content {
            validate_node(child, Some(kind), depth + 1, count)?;
        }
    }
    Ok(())
}

const POST_COLUMNS: &str = "id,editable_json,status,scheduled_at,published_at,created_at,updated_at,revision,published_json,scheduled_json";
fn post_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<BlogPost> {
    let mut fields: BlogInput = serde_json::from_str(&row.get::<_, String>(1)?)
        .map_err(|_| rusqlite::Error::InvalidQuery)?;
    fields.revision = None;
    let published: Option<String> = row.get(8)?;
    let scheduled: Option<String> = row.get(9)?;
    let published: Option<BlogPost> = published
        .as_deref()
        .map(serde_json::from_str)
        .transpose()
        .map_err(|_| rusqlite::Error::InvalidQuery)?;
    let mut scheduled: Option<BlogInput> = scheduled
        .as_deref()
        .map(serde_json::from_str)
        .transpose()
        .map_err(|_| rusqlite::Error::InvalidQuery)?;
    let scheduled_revision = scheduled.as_ref().and_then(|fields| fields.revision);
    if let Some(scheduled) = scheduled.as_mut() {
        scheduled.revision = None;
    }
    let has_unpublished_changes = published
        .as_ref()
        .is_some_and(|published| published.fields != fields)
        || scheduled
            .as_ref()
            .is_some_and(|scheduled| scheduled != &fields);
    Ok(BlogPost {
        id: row.get(0)?,
        fields,
        status: row.get(2)?,
        scheduled_at: row.get(3)?,
        published_at: row.get(4)?,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
        revision: row.get(7)?,
        has_unpublished_changes,
        scheduled_revision,
    })
}
fn find_post(connection: &Connection, id: i64) -> Result<BlogPost, BlogError> {
    connection
        .query_row(
            &format!("SELECT {POST_COLUMNS} FROM blog_posts WHERE id=?1"),
            [id],
            post_row,
        )
        .optional()?
        .ok_or(BlogError::NotFound)
}
fn same_revision(post: &BlogPost, revision: u64) -> Result<(), BlogError> {
    if post.revision == revision {
        Ok(())
    } else {
        Err(BlogError::RevisionConflict)
    }
}
fn available_slug(connection: &Connection, slug: &str, id: i64) -> Result<(), BlogError> {
    let taken: bool = connection.query_row("SELECT EXISTS(SELECT 1 FROM blog_posts WHERE id!=?1 AND (slug=?2 OR published_slug=?2 OR json_extract(scheduled_json,'$.slug')=?2))",params![id,slug],|r| r.get(0))?;
    if taken {
        Err(BlogError::SlugConflict)
    } else {
        Ok(())
    }
}
fn encode<T: Serialize>(value: &T) -> Result<String, BlogError> {
    serde_json::to_string(value).map_err(|_| BlogError::Storage)
}
/// Les images d’un article : contenu, couverture et partage.
fn media_refs(fields: &BlogInput) -> Vec<String> {
    fn walk(value: &Value, refs: &mut Vec<String>) {
        if let Some(src) = value
            .get("attrs")
            .and_then(|v| v.get("src"))
            .and_then(Value::as_str)
        {
            refs.push(src.to_owned());
        }
        if let Some(children) = value.get("content").and_then(Value::as_array) {
            for child in children {
                walk(child, refs);
            }
        }
    }
    let mut refs = Vec::new();
    walk(&fields.content, &mut refs);
    refs.extend(fields.cover_image.iter().cloned());
    refs.extend(fields.og_image.iter().cloned());
    refs
}
fn media_id(path: &str) -> Option<i64> {
    path.strip_prefix("/api/blog/media/")?.parse().ok()
}
fn check_media(connection: &Connection, fields: &BlogInput) -> Result<(), BlogError> {
    for path in media_refs(fields) {
        if let Some(id) = path.strip_prefix("/api/blog/media/") {
            let id = id.parse::<i64>().map_err(|_| BlogError::Invalid)?;
            let exists: bool = connection.query_row(
                "SELECT EXISTS(SELECT 1 FROM blog_media WHERE id=?1)",
                [id],
                |r| r.get(0),
            )?;
            if !exists {
                return Err(BlogError::Invalid);
            }
        }
    }
    Ok(())
}

impl Store {
    pub fn create_blog_post(&self, mut input: BlogInput) -> Result<BlogPost, BlogError> {
        input.validate()?;
        input.revision = None;
        let mut connection = self.connection()?;
        let tx = connection.transaction()?;
        available_slug(&tx, &input.slug, 0)?;
        check_media(&tx, &input)?;
        tx.execute(
            "INSERT INTO blog_posts(slug,editable_json) VALUES(?1,?2)",
            params![input.slug, encode(&input)?],
        )?;
        let post = find_post(&tx, tx.last_insert_rowid())?;
        tx.commit()?;
        Ok(post)
    }
    pub fn update_blog_post(&self, id: i64, mut input: BlogInput) -> Result<BlogPost, BlogError> {
        input.validate()?;
        let revision = input.revision.take().ok_or(BlogError::Invalid)?;
        let mut connection = self.connection()?;
        let tx = connection.transaction()?;
        let previous = find_post(&tx, id)?;
        same_revision(&previous, revision)?;
        available_slug(&tx, &input.slug, id)?;
        check_media(&tx, &input)?;
        tx.execute("UPDATE blog_posts SET slug=?2,editable_json=?3,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),revision=revision+1 WHERE id=?1",params![id,input.slug,encode(&input)?])?;
        let post = find_post(&tx, id)?;
        tx.commit()?;
        Ok(post)
    }
    pub fn get_blog_post(&self, id: i64) -> Result<BlogPost, BlogError> {
        find_post(&*self.connection()?, id)
    }
    pub fn list_blog_posts(
        &self,
        status: &str,
        limit: u32,
        offset: u32,
    ) -> Result<BlogPage, BlogError> {
        if !matches!(status, "all" | "draft" | "scheduled" | "published")
            || !(1..=100).contains(&limit)
        {
            return Err(BlogError::Invalid);
        }
        let connection = self.connection()?;
        let total = connection.query_row(
            "SELECT count(*) FROM blog_posts WHERE ?1='all' OR status=?1",
            [status],
            |r| r.get(0),
        )?;
        let mut query=connection.prepare(&format!("SELECT {POST_COLUMNS} FROM blog_posts WHERE ?1='all' OR status=?1 ORDER BY updated_at DESC,id DESC LIMIT ?2 OFFSET ?3"))?;
        let posts = query
            .query_map(params![status, limit, offset], post_row)?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(BlogPage {
            posts,
            total,
            limit,
            offset,
        })
    }
    pub fn publish_blog_post(&self, id: i64, revision: u64) -> Result<BlogPost, BlogError> {
        let mut connection = self.connection()?;
        let tx = connection.transaction()?;
        let post = find_post(&tx, id)?;
        same_revision(&post, revision)?;
        post.fields.ready()?;
        available_slug(&tx, &post.fields.slug, id)?;
        check_media(&tx, &post.fields)?;
        tx.execute("UPDATE blog_posts SET status='published',scheduled_at=NULL,scheduled_json=NULL,published_at=coalesce(published_at,?2),updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),revision=revision+1 WHERE id=?1",params![id,unix_now()])?;
        let mut post = find_post(&tx, id)?;
        post.has_unpublished_changes = false;
        tx.execute(
            "UPDATE blog_posts SET published_json=?2,published_slug=?3 WHERE id=?1",
            params![id, encode(&post)?, post.fields.slug],
        )?;
        tx.commit()?;
        Ok(post)
    }
    pub fn schedule_blog_post(
        &self,
        id: i64,
        scheduled_at: i64,
        revision: u64,
    ) -> Result<BlogPost, BlogError> {
        let now = unix_now();
        if scheduled_at <= now || scheduled_at > now + 5 * 366 * 24 * 60 * 60 {
            return Err(BlogError::Invalid);
        }
        let mut connection = self.connection()?;
        let tx = connection.transaction()?;
        let post = find_post(&tx, id)?;
        same_revision(&post, revision)?;
        post.fields.ready()?;
        available_slug(&tx, &post.fields.slug, id)?;
        check_media(&tx, &post.fields)?;
        let mut approved = post.fields;
        approved.revision = Some(revision + 1);
        tx.execute("UPDATE blog_posts SET status='scheduled',scheduled_at=?2,scheduled_json=?3,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),revision=revision+1 WHERE id=?1",params![id,scheduled_at,encode(&approved)?])?;
        let post = find_post(&tx, id)?;
        tx.commit()?;
        Ok(post)
    }
    pub fn unpublish_blog_post(&self, id: i64, revision: u64) -> Result<BlogPost, BlogError> {
        let mut connection = self.connection()?;
        let tx = connection.transaction()?;
        same_revision(&find_post(&tx, id)?, revision)?;
        tx.execute("UPDATE blog_posts SET status='draft',published_at=NULL,published_json=NULL,published_slug=NULL,scheduled_at=NULL,scheduled_json=NULL,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),revision=revision+1 WHERE id=?1",[id])?;
        let post = find_post(&tx, id)?;
        tx.commit()?;
        Ok(post)
    }
    pub fn delete_blog_post(&self, id: i64, revision: u64) -> Result<(), BlogError> {
        let mut connection = self.connection()?;
        let tx = connection.transaction()?;
        same_revision(&find_post(&tx, id)?, revision)?;
        tx.execute("DELETE FROM blog_posts WHERE id=?1", [id])?;
        tx.commit()?;
        Ok(())
    }
    pub fn list_public_blog_posts(&self, limit: u32, offset: u32) -> Result<BlogPage, BlogError> {
        if !(1..=100).contains(&limit) {
            return Err(BlogError::Invalid);
        }
        self.publish_due_blog_posts(unix_now())?;
        let connection = self.connection()?;
        let total = connection.query_row(
            "SELECT count(*) FROM blog_posts WHERE published_json IS NOT NULL",
            [],
            |r| r.get(0),
        )?;
        let mut query=connection.prepare("SELECT published_json FROM blog_posts WHERE published_json IS NOT NULL ORDER BY published_at DESC,id DESC LIMIT ?1 OFFSET ?2")?;
        let posts = query
            .query_map(params![limit, offset], |r| {
                serde_json::from_str::<BlogPost>(&r.get::<_, String>(0)?)
                    .map_err(|_| rusqlite::Error::InvalidQuery)
            })?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(BlogPage {
            posts,
            total,
            limit,
            offset,
        })
    }
    pub fn get_public_blog_post(&self, slug: &str) -> Result<BlogPost, BlogError> {
        self.publish_due_blog_posts(unix_now())?;
        let encoded:Option<String>=self.connection()?.query_row("SELECT published_json FROM blog_posts WHERE published_slug=?1 AND published_json IS NOT NULL",[slug],|r|r.get(0)).optional()?;
        serde_json::from_str(&encoded.ok_or(BlogError::NotFound)?).map_err(|_| BlogError::Storage)
    }
    /// La même transaction publie la version approuvée et consomme son échéance.
    /// Rejouer cet appel après redémarrage ne publie donc jamais deux fois.
    pub fn publish_due_blog_posts(&self, now: i64) -> Result<u64, BlogError> {
        let mut connection = self.connection()?;
        let tx = connection.transaction()?;
        let due: Vec<(i64, i64, String)> = {
            let mut query=tx.prepare("SELECT id,scheduled_at,scheduled_json FROM blog_posts WHERE status='scheduled' AND scheduled_at<=?1 ORDER BY scheduled_at,id")?;
            query
                .query_map([now], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))?
                .collect::<Result<Vec<_>, _>>()?
        };
        for (id, at, encoded) in &due {
            let mut fields: BlogInput =
                serde_json::from_str(encoded).map_err(|_| BlogError::Storage)?;
            fields.ready()?;
            available_slug(&tx, &fields.slug, *id)?;
            check_media(&tx, &fields)?;
            tx.execute("UPDATE blog_posts SET status='published',published_at=coalesce(published_at,?2),scheduled_at=NULL,scheduled_json=NULL,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),revision=revision+1 WHERE id=?1",params![id,at])?;
            let mut public = find_post(&tx, *id)?;
            fields.revision = None;
            public.fields = fields;
            public.has_unpublished_changes = false;
            public.scheduled_revision = None;
            tx.execute(
                "UPDATE blog_posts SET published_json=?2,published_slug=?3 WHERE id=?1",
                params![id, encode(&public)?, public.fields.slug],
            )?;
        }
        tx.commit()?;
        Ok(due.len() as u64)
    }
    pub fn create_blog_media(&self, upload: MediaUpload) -> Result<MediaRecord, BlogError> {
        if !bounded(&upload.filename, 1, 200)
            || upload.filename.contains(['/', '\\'])
            || upload.data_base64.len() > MAX_MEDIA_BODY_BYTES
        {
            return Err(BlogError::Invalid);
        }
        let bytes = STANDARD
            .decode(upload.data_base64)
            .map_err(|_| BlogError::Invalid)?;
        if bytes.is_empty()
            || bytes.len() > MAX_IMAGE_BYTES
            || sniff_image(&bytes) != Some(upload.content_type.as_str())
        {
            return Err(BlogError::Invalid);
        }
        // Décodage et réductions avant de prendre la base : seule l’écriture la bloque.
        let processed = crate::blog_media::process(&bytes, &upload.content_type).map_err(
            |refus| match refus {
                crate::blog_media::Rejected::TooLarge => BlogError::ImageTooLarge,
                crate::blog_media::Rejected::Unreadable => BlogError::Invalid,
            },
        )?;
        let mut connection = self.connection()?;
        let tx = connection.transaction()?;
        tx.execute(
            "INSERT INTO blog_media(filename,content_type,data) VALUES(?1,?2,?3)",
            params![upload.filename, upload.content_type, processed.original],
        )?;
        let id = tx.last_insert_rowid();
        store_processed(&tx, id, &processed)?;
        let record = media_record(&tx, id)?;
        tx.commit()?;
        Ok(record)
    }
    pub fn list_blog_media(&self, limit: u32, offset: u32) -> Result<Vec<MediaRecord>, BlogError> {
        if !(1..=100).contains(&limit) {
            return Err(BlogError::Invalid);
        }
        let connection = self.connection()?;
        let mut query = connection.prepare(&format!(
            "SELECT {MEDIA_COLUMNS} FROM blog_media ORDER BY id DESC LIMIT ?1 OFFSET ?2"
        ))?;
        let mut media = query
            .query_map(params![limit, offset], media_row)?
            .collect::<Result<Vec<_>, _>>()?;
        for record in &mut media {
            record.variants = media_variants(&connection, record.id)?;
        }
        Ok(media)
    }
    pub fn get_blog_media(&self, id: i64) -> Result<MediaData, BlogError> {
        self.connection()?
            .query_row(
                "SELECT content_type,data FROM blog_media WHERE id=?1",
                [id],
                |r| {
                    Ok(MediaData {
                        content_type: r.get(0)?,
                        bytes: r.get(1)?,
                    })
                },
            )
            .optional()?
            .ok_or(BlogError::NotFound)
    }
    /// Une image (ou l’une de ses variantes) n’est publique que si une version publiée la référence.
    fn check_public_media(&self, id: i64) -> Result<(), BlogError> {
        self.publish_due_blog_posts(unix_now())?;
        let path = format!("/api/blog/media/{id}");
        let public:bool=self.connection()?.query_row("SELECT EXISTS(SELECT 1 FROM blog_posts,json_tree(blog_posts.published_json) WHERE blog_posts.published_json IS NOT NULL AND json_tree.type='text' AND json_tree.key IN ('src','cover_image','og_image') AND json_tree.value=?1)",[path],|r|r.get(0))?;
        if public {
            Ok(())
        } else {
            Err(BlogError::NotFound)
        }
    }
    pub fn get_public_blog_media(&self, id: i64) -> Result<MediaData, BlogError> {
        self.check_public_media(id)?;
        self.get_blog_media(id)
    }
    pub fn get_blog_media_variant(&self, id: i64, width: u32) -> Result<MediaData, BlogError> {
        self.connection()?
            .query_row(
                "SELECT content_type,data FROM blog_media_variants WHERE media_id=?1 AND width=?2",
                params![id, width],
                |r| {
                    Ok(MediaData {
                        content_type: r.get(0)?,
                        bytes: r.get(1)?,
                    })
                },
            )
            .optional()?
            .ok_or(BlogError::NotFound)
    }
    pub fn get_public_blog_media_variant(
        &self,
        id: i64,
        width: u32,
    ) -> Result<MediaData, BlogError> {
        self.check_public_media(id)?;
        self.get_blog_media_variant(id, width)
    }
    /// Dimensions et variantes des images d’un article, par URL publique, pour
    /// que le rendu pose `width`, `height` et `srcset` sans relire les fichiers.
    pub fn blog_media_details(
        &self,
        paths: impl IntoIterator<Item = String>,
    ) -> Result<Value, BlogError> {
        let connection = self.connection()?;
        let mut details = serde_json::Map::new();
        for path in paths {
            let Some(id) = media_id(&path) else { continue };
            if details.contains_key(&path) {
                continue;
            }
            let dimensions: Option<(Option<u32>, Option<u32>)> = connection
                .query_row(
                    "SELECT width,height FROM blog_media WHERE id=?1",
                    [id],
                    |r| Ok((r.get(0)?, r.get(1)?)),
                )
                .optional()?;
            if let Some((Some(width @ 1..), Some(height @ 1..))) = dimensions {
                details.insert(
                    path,
                    json!({"width":width,"height":height,"variants":media_variants(&connection,id)?}),
                );
            }
        }
        Ok(Value::Object(details))
    }
    /// Seule une image qu’aucune version (travail, programmée, publiée) ne cite peut partir.
    pub fn delete_blog_media(&self, id: i64) -> Result<(), BlogError> {
        let mut connection = self.connection()?;
        let tx = connection.transaction()?;
        let exists: bool = tx.query_row(
            "SELECT EXISTS(SELECT 1 FROM blog_media WHERE id=?1)",
            [id],
            |r| r.get(0),
        )?;
        if !exists {
            return Err(BlogError::NotFound);
        }
        let path = format!("/api/blog/media/{id}");
        let used: bool = tx.query_row(
            "SELECT EXISTS(SELECT 1 FROM blog_posts,json_tree(blog_posts.editable_json) WHERE json_tree.type='text' AND json_tree.key IN ('src','cover_image','og_image') AND json_tree.value=?1)
             OR EXISTS(SELECT 1 FROM blog_posts,json_tree(blog_posts.scheduled_json) WHERE blog_posts.scheduled_json IS NOT NULL AND json_tree.type='text' AND json_tree.key IN ('src','cover_image','og_image') AND json_tree.value=?1)
             OR EXISTS(SELECT 1 FROM blog_posts,json_tree(blog_posts.published_json) WHERE blog_posts.published_json IS NOT NULL AND json_tree.type='text' AND json_tree.key IN ('src','cover_image','og_image') AND json_tree.value=?1)",
            [path],
            |r| r.get(0),
        )?;
        if used {
            return Err(BlogError::MediaInUse);
        }
        tx.execute("DELETE FROM blog_media WHERE id=?1", [id])?;
        tx.commit()?;
        Ok(())
    }
}
const MEDIA_COLUMNS: &str = "id,filename,content_type,length(data),created_at,width,height";
fn media_variants(connection: &Connection, id: i64) -> rusqlite::Result<Vec<u32>> {
    connection
        .prepare("SELECT width FROM blog_media_variants WHERE media_id=?1 ORDER BY width")?
        .query_map([id], |r| r.get(0))?
        .collect()
}
fn media_row(r: &rusqlite::Row<'_>) -> rusqlite::Result<MediaRecord> {
    let id = r.get(0)?;
    let measured = |value: Option<u32>| value.filter(|&n| n > 0);
    Ok(MediaRecord {
        id,
        filename: r.get(1)?,
        content_type: r.get(2)?,
        size: r.get(3)?,
        url: format!("/api/blog/media/{id}"),
        created_at: r.get(4)?,
        width: measured(r.get(5)?),
        height: measured(r.get(6)?),
        variants: Vec::new(),
    })
}
fn media_record(connection: &Connection, id: i64) -> Result<MediaRecord, BlogError> {
    let mut record = connection.query_row(
        &format!("SELECT {MEDIA_COLUMNS} FROM blog_media WHERE id=?1"),
        [id],
        media_row,
    )?;
    record.variants = media_variants(connection, id)?;
    Ok(record)
}
fn sniff_image(bytes: &[u8]) -> Option<&'static str> {
    if bytes.len() >= 24 && bytes.starts_with(b"\x89PNG\r\n\x1a\n") && &bytes[12..16] == b"IHDR" {
        Some("image/png")
    } else if bytes.len() >= 12
        && bytes.starts_with(b"\xff\xd8\xff")
        && bytes.ends_with(b"\xff\xd9")
    {
        Some("image/jpeg")
    } else if bytes.len() >= 14
        && (bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a"))
        && bytes.last() == Some(&b';')
    {
        Some("image/gif")
    } else if bytes.len() >= 20
        && bytes.starts_with(b"RIFF")
        && &bytes[8..12] == b"WEBP"
        && matches!(&bytes[12..16], b"VP8 " | b"VP8L" | b"VP8X")
    {
        Some("image/webp")
    } else {
        None
    }
}
pub fn unix_now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

pub fn seo_audit(post: &BlogPost) -> Value {
    let title = if post.fields.seo_title.is_empty() {
        &post.fields.title
    } else {
        &post.fields.seo_title
    };
    let description = if post.fields.seo_description.is_empty() {
        &post.fields.excerpt
    } else {
        &post.fields.seo_description
    };
    let mut images = 0usize;
    let mut missing_alt = 0usize;
    let mut headings = 0usize;
    fn walk(v: &Value, images: &mut usize, missing: &mut usize, headings: &mut usize) {
        match v.get("type").and_then(Value::as_str) {
            Some("image") => {
                *images += 1;
                if v.get("attrs")
                    .and_then(|a| a.get("alt"))
                    .and_then(Value::as_str)
                    .is_none_or(|s| s.trim().is_empty())
                {
                    *missing += 1;
                }
            }
            Some("heading") => *headings += 1,
            _ => {}
        }
        if let Some(children) = v.get("content").and_then(Value::as_array) {
            for child in children {
                walk(child, images, missing, headings);
            }
        }
    }
    walk(
        &post.fields.content,
        &mut images,
        &mut missing_alt,
        &mut headings,
    );
    let checks = vec![
        json!({"id":"title","label":"Titre de 30 à 65 caractères","ok":(30..=65).contains(&title.chars().count())}),
        json!({"id":"description","label":"Description de 110 à 165 caractères","ok":(110..=165).contains(&description.chars().count())}),
        json!({"id":"headings","label":"Contenu structuré par des titres","ok":headings>0}),
        json!({"id":"images","label":"Images avec une alternative textuelle","ok":missing_alt==0&&(post.fields.cover_image.is_none()||!post.fields.cover_alt.trim().is_empty())}),
        json!({"id":"sharing","label":"Image de partage définie","ok":post.fields.og_image.is_some()||post.fields.cover_image.is_some()}),
        json!({"id":"indexing","label":"Indexation autorisée","ok":!post.fields.noindex}),
    ];
    let passed = checks.iter().filter(|c| c["ok"] == true).count();
    json!({"score":passed*100/checks.len(),"checks":checks,"title":title,"description":description,"url":format!("/blog/{}",post.fields.slug),"images":images,"missing_alt":missing_alt,"headings":headings})
}

/// Tokio conserve un réveil immédiat au démarrage, puis vérifie chaque minute.
pub fn spawn_scheduler(store: Arc<Store>) -> tokio::task::JoinHandle<()> {
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(60));
        loop {
            interval.tick().await;
            let store = store.clone();
            if !matches!(
                tokio::task::spawn_blocking(move || store.publish_due_blog_posts(unix_now())).await,
                Ok(Ok(_))
            ) {
                eprintln!("La publication programmée n’a pas pu être vérifiée.");
            }
        }
    })
}

#[derive(Deserialize)]
struct PageQuery {
    #[serde(default = "all_status")]
    status: String,
    #[serde(default = "default_limit")]
    limit: u32,
    #[serde(default)]
    offset: u32,
}
fn all_status() -> String {
    "all".into()
}
fn default_limit() -> u32 {
    20
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Revision {
    revision: u64,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Schedule {
    scheduled_at: i64,
    revision: u64,
}

pub fn routes(state: AppState) -> Router<AppState> {
    let protected = Router::new()
        .route(
            "/api/backoffice/blog/posts",
            get(admin_list).post(create_post),
        )
        .route(
            "/api/backoffice/blog/posts/{id}",
            get(admin_get).put(update_post).delete(delete_post),
        )
        .route("/api/backoffice/blog/posts/{id}/publish", post(publish))
        .route("/api/backoffice/blog/posts/{id}/schedule", post(schedule))
        .route("/api/backoffice/blog/posts/{id}/unpublish", post(unpublish))
        .route(
            "/api/backoffice/blog/posts/{id}/preview",
            get(admin_preview),
        )
        .route("/api/backoffice/blog/posts/{id}/seo", get(audit))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            crate::admin::require_session,
        ))
        .layer(DefaultBodyLimit::max(MAX_BLOG_BODY_BYTES));
    let media = Router::new()
        .route(
            "/api/backoffice/blog/media",
            get(admin_media_list).post(upload_media),
        )
        .route(
            "/api/backoffice/blog/media/{id}",
            get(admin_media).delete(delete_media),
        )
        .route(
            "/api/backoffice/blog/media/{id}/{width}",
            get(admin_media_variant),
        )
        .route_layer(middleware::from_fn_with_state(
            state,
            crate::admin::require_session,
        ))
        .layer(DefaultBodyLimit::max(MAX_MEDIA_BODY_BYTES));
    Router::new()
        .merge(protected)
        .merge(media)
        .route("/api/blog/posts", get(public_list))
        .route("/api/blog/posts/{slug}", get(public_get))
        .route("/api/blog/media/{id}", get(public_media))
        .route("/api/blog/media/{id}/{width}", get(public_media_variant))
}
/// L’article et, sous `media`, les dimensions et variantes de ses images (rendu Node).
fn with_media(store: &Store, post: BlogPost) -> Result<Value, BlogError> {
    let media = store.blog_media_details(media_refs(&post.fields))?;
    let mut value = serde_json::to_value(post).map_err(|_| BlogError::Storage)?;
    value["media"] = media;
    Ok(value)
}
async fn admin_preview(
    State(s): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Value>, ApiError> {
    Ok(Json(with_media(&s.store, s.store.get_blog_post(id)?)?))
}
async fn admin_list(
    State(s): State<AppState>,
    Query(q): Query<PageQuery>,
) -> Result<Json<Value>, ApiError> {
    summaries(s.store.list_blog_posts(&q.status, q.limit, q.offset)?)
}
async fn admin_get(
    State(s): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<BlogPost>, ApiError> {
    Ok(Json(s.store.get_blog_post(id)?))
}
async fn create_post(
    State(s): State<AppState>,
    Json(p): Json<BlogInput>,
) -> Result<(StatusCode, Json<BlogPost>), ApiError> {
    Ok((StatusCode::CREATED, Json(s.store.create_blog_post(p)?)))
}
async fn update_post(
    State(s): State<AppState>,
    Path(id): Path<i64>,
    Json(p): Json<BlogInput>,
) -> Result<Json<BlogPost>, ApiError> {
    Ok(Json(s.store.update_blog_post(id, p)?))
}
async fn delete_post(
    State(s): State<AppState>,
    Path(id): Path<i64>,
    Json(p): Json<Revision>,
) -> Result<Json<Value>, ApiError> {
    s.store.delete_blog_post(id, p.revision)?;
    Ok(Json(json!({"ok":true})))
}
async fn publish(
    State(s): State<AppState>,
    Path(id): Path<i64>,
    Json(p): Json<Revision>,
) -> Result<Json<BlogPost>, ApiError> {
    Ok(Json(s.store.publish_blog_post(id, p.revision)?))
}
async fn schedule(
    State(s): State<AppState>,
    Path(id): Path<i64>,
    Json(p): Json<Schedule>,
) -> Result<Json<BlogPost>, ApiError> {
    Ok(Json(s.store.schedule_blog_post(
        id,
        p.scheduled_at,
        p.revision,
    )?))
}
async fn unpublish(
    State(s): State<AppState>,
    Path(id): Path<i64>,
    Json(p): Json<Revision>,
) -> Result<Json<BlogPost>, ApiError> {
    Ok(Json(s.store.unpublish_blog_post(id, p.revision)?))
}
async fn audit(State(s): State<AppState>, Path(id): Path<i64>) -> Result<Json<Value>, ApiError> {
    Ok(Json(seo_audit(&s.store.get_blog_post(id)?)))
}
async fn public_list(
    State(s): State<AppState>,
    Query(q): Query<PageQuery>,
) -> Result<Json<Value>, ApiError> {
    let page = s.store.list_public_blog_posts(q.limit, q.offset)?;
    let media = page
        .posts
        .iter()
        .map(|post| {
            s.store
                .blog_media_details(post.fields.cover_image.iter().cloned())
        })
        .collect::<Result<Vec<_>, _>>()?;
    let Json(mut value) = summaries(page)?;
    if let Some(posts) = value.get_mut("posts").and_then(Value::as_array_mut) {
        for (post, media) in posts.iter_mut().zip(media) {
            post["media"] = media;
        }
    }
    Ok(Json(value))
}
fn summaries(page: BlogPage) -> Result<Json<Value>, ApiError> {
    let mut page = serde_json::to_value(page).map_err(|_| BlogError::Storage)?;
    if let Some(posts) = page.get_mut("posts").and_then(Value::as_array_mut) {
        for post in posts {
            if let Some(post) = post.as_object_mut() {
                post.remove("content");
            }
        }
    }
    Ok(Json(page))
}

async fn public_get(
    State(s): State<AppState>,
    Path(slug): Path<String>,
) -> Result<Json<Value>, ApiError> {
    Ok(Json(with_media(
        &s.store,
        s.store.get_public_blog_post(&slug)?,
    )?))
}
async fn admin_media_list(
    State(s): State<AppState>,
    Query(q): Query<PageQuery>,
) -> Result<Json<Value>, ApiError> {
    Ok(Json(
        json!({"media":s.store.list_blog_media(q.limit,q.offset)?,"limit":q.limit,"offset":q.offset}),
    ))
}
async fn upload_media(
    State(s): State<AppState>,
    Json(p): Json<MediaUpload>,
) -> Result<(StatusCode, Json<MediaRecord>), ApiError> {
    // Le décodage et les réductions prennent du calcul : hors des fils d’Axum.
    let store = s.store.clone();
    let media = tokio::task::spawn_blocking(move || store.create_blog_media(p))
        .await
        .map_err(|_| BlogError::Storage)??;
    Ok((StatusCode::CREATED, Json(media)))
}
async fn delete_media(
    State(s): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Value>, ApiError> {
    s.store.delete_blog_media(id)?;
    Ok(Json(json!({"deleted":true,"id":id})))
}
fn media_response(data: MediaData) -> Response {
    (
        [
            (header::CONTENT_TYPE, data.content_type),
            (header::CONTENT_DISPOSITION, "inline".into()),
            (
                header::CONTENT_SECURITY_POLICY,
                "default-src 'none'; sandbox".into(),
            ),
        ],
        data.bytes,
    )
        .into_response()
}
async fn admin_media(State(s): State<AppState>, Path(id): Path<i64>) -> Result<Response, ApiError> {
    Ok(media_response(s.store.get_blog_media(id)?))
}
async fn public_media(
    State(s): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Response, ApiError> {
    Ok(media_response(s.store.get_public_blog_media(id)?))
}
async fn admin_media_variant(
    State(s): State<AppState>,
    Path((id, width)): Path<(i64, u32)>,
) -> Result<Response, ApiError> {
    Ok(media_response(s.store.get_blog_media_variant(id, width)?))
}
async fn public_media_variant(
    State(s): State<AppState>,
    Path((id, width)): Path<(i64, u32)>,
) -> Result<Response, ApiError> {
    Ok(media_response(
        s.store.get_public_blog_media_variant(id, width)?,
    ))
}
