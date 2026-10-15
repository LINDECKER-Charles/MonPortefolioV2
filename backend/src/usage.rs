//! Ce que la base occupe, pour l’onglet Stockage du backoffice : le disque qui
//! la porte, le fichier SQLite et son journal, la place prise par catégorie,
//! puis les images et les articles du plus lourd au plus léger.
//!
//! La répartition vient de la table virtuelle `dbstat`, compilée dans le SQLite
//! embarqué (`SQLITE_ENABLE_DBSTAT_VTAB`) : ce sont des octets de pages sur le
//! disque, index compris. Elle parcourt toute la base : sur un fichier, le
//! calcul se fait sur une connexion à part, en lecture seule et dans une seule
//! transaction, pour ne bloquer ni le formulaire de contact ni l’atelier.
use std::{collections::HashMap, path::Path};

use rusqlite::{Connection, OpenFlags};
use serde::Serialize;

use crate::storage::{Store, StoreError};

#[derive(Debug, Serialize)]
pub struct StorageReport {
    /// Le volume qui contient la base ; `null` pour une base en mémoire.
    pub disk: Option<Disk>,
    pub database: Database,
    pub categories: Categories,
    pub media: Vec<MediaUsage>,
    pub posts: Vec<PostUsage>,
    pub contacts: ContactUsage,
}

#[derive(Debug, Serialize)]
pub struct Disk {
    pub total: u64,
    pub available: u64,
}

#[derive(Debug, Serialize)]
pub struct Database {
    /// Taille du fichier principal ; `null` en mémoire.
    pub file: Option<u64>,
    /// Taille du journal `-wal`, pas encore reporté dans le fichier ; `null` en mémoire.
    pub wal: Option<u64>,
    /// Pages de la base (`page_count × page_size`), qu’elles soient dans le fichier ou le journal.
    pub size: u64,
    /// Pages libres (`freelist_count × page_size`), que SQLite réutilise aux prochaines écritures.
    pub free: u64,
    pub page_size: u64,
}

/// Octets de pages par catégorie : leur somme plus `free` vaut `database.size`.
#[derive(Debug, Default, Serialize)]
pub struct Categories {
    pub media_originals: u64,
    pub media_variants: u64,
    pub posts: u64,
    pub contacts: u64,
    /// Sessions, accès MCP, réglages, liens, 2FA et schéma.
    pub system: u64,
}

#[derive(Debug, Serialize)]
pub struct MediaUsage {
    pub id: i64,
    pub filename: String,
    pub content_type: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
    /// Poids de l’original gardé.
    pub size: u64,
    pub variants: VariantUsage,
    /// Original et variantes.
    pub total: u64,
    pub created_at: String,
    /// L’adresse que citent les articles (publique une fois publiée).
    pub url: String,
    /// L’adresse privée, servie à la session du backoffice ; une variante sous `{admin_url}/{largeur}`.
    pub admin_url: String,
    /// Les articles qui la citent, dans une version ou une autre : la supprimer est alors refusé.
    pub posts: Vec<PostRef>,
}

#[derive(Debug, Serialize)]
pub struct VariantUsage {
    pub count: u64,
    pub size: u64,
    /// Largeurs, image fixe d’une image animée comprise, de la plus petite à la plus grande.
    pub widths: Vec<u32>,
}

#[derive(Clone, Debug, Serialize)]
pub struct PostRef {
    pub id: i64,
    pub slug: String,
    pub title: String,
    /// `draft`, `scheduled` ou `published`.
    pub status: String,
}

#[derive(Debug, Serialize)]
pub struct PostUsage {
    #[serde(flatten)]
    pub post: PostRef,
    /// Somme des versions gardées : travail, programmée et publiée.
    pub size: u64,
}

#[derive(Debug, Serialize)]
pub struct ContactUsage {
    pub count: u64,
    /// Octets de pages de la table et de ses index (`categories.contacts`).
    pub size: u64,
}

impl Store {
    pub fn storage_report(&self) -> Result<StorageReport, StoreError> {
        let Some(path) = self.path() else {
            let connection = self.connection()?;
            return Ok(measure(&connection, None)?);
        };
        let connection = Connection::open_with_flags(
            path,
            OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX,
        )?;
        connection.busy_timeout(std::time::Duration::from_secs(5))?;
        Ok(measure(&connection, Some(path))?)
    }
}

fn measure(connection: &Connection, path: Option<&Path>) -> rusqlite::Result<StorageReport> {
    // Une seule transaction de lecture : tous les chiffres viennent du même état.
    connection.execute_batch("BEGIN")?;
    let report = read(connection, path);
    connection.execute_batch("COMMIT")?;
    report
}

fn read(connection: &Connection, path: Option<&Path>) -> rusqlite::Result<StorageReport> {
    let pragma = |name: &str| -> rusqlite::Result<u64> {
        connection.query_row(&format!("PRAGMA {name}"), [], |r| r.get(0))
    };
    let page_size = pragma("page_size")?;
    let database = Database {
        file: path.map(file_size),
        wal: path.map(|path| {
            let mut wal = path.as_os_str().to_owned();
            wal.push("-wal");
            file_size(Path::new(&wal))
        }),
        size: pragma("page_count")? * page_size,
        free: pragma("freelist_count")? * page_size,
        page_size,
    };
    let disk = path.and_then(|path| {
        let folder = path
            .parent()
            .filter(|parent| !parent.as_os_str().is_empty())
            .unwrap_or(Path::new("."));
        Some(Disk {
            total: fs2::total_space(folder).ok()?,
            available: fs2::available_space(folder).ok()?,
        })
    });

    let mut categories = Categories::default();
    let mut tables = connection.prepare(
        "SELECT coalesce(sqlite_schema.tbl_name,dbstat.name),sum(dbstat.pgsize)
         FROM dbstat LEFT JOIN sqlite_schema ON sqlite_schema.name=dbstat.name
         GROUP BY 1",
    )?;
    for row in tables.query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, u64>(1)?)))? {
        let (table, size) = row?;
        let category = match table.as_str() {
            "blog_media" => &mut categories.media_originals,
            "blog_media_variants" => &mut categories.media_variants,
            "blog_posts" => &mut categories.posts,
            "contacts" => &mut categories.contacts,
            _ => &mut categories.system,
        };
        *category += size;
    }

    let mut posts: Vec<PostUsage> = connection
        .prepare(
            "SELECT id,slug,coalesce(json_extract(editable_json,'$.title'),''),status,
                    length(CAST(editable_json AS BLOB))
                    +coalesce(length(CAST(scheduled_json AS BLOB)),0)
                    +coalesce(length(CAST(published_json AS BLOB)),0)
             FROM blog_posts",
        )?
        .query_map([], |r| {
            Ok(PostUsage {
                post: PostRef {
                    id: r.get(0)?,
                    slug: r.get(1)?,
                    title: r.get(2)?,
                    status: r.get(3)?,
                },
                size: r.get(4)?,
            })
        })?
        .collect::<rusqlite::Result<_>>()?;
    let refs: HashMap<i64, PostRef> = posts
        .iter()
        .map(|usage| (usage.post.id, usage.post.clone()))
        .collect();
    let mut citing: HashMap<i64, Vec<PostRef>> = HashMap::new();
    for (post, media) in crate::blog::media_citations(connection, None)? {
        if let Some(post) = refs.get(&post) {
            citing.entry(media).or_default().push(post.clone());
        }
    }
    posts.sort_by(|a, b| b.size.cmp(&a.size).then(a.post.id.cmp(&b.post.id)));

    let mut variants: HashMap<i64, VariantUsage> = HashMap::new();
    let mut rows = connection.prepare(
        "SELECT media_id,width,length(data) FROM blog_media_variants ORDER BY media_id,width",
    )?;
    for row in rows.query_map([], |r| {
        Ok((
            r.get::<_, i64>(0)?,
            r.get::<_, u32>(1)?,
            r.get::<_, u64>(2)?,
        ))
    })? {
        let (media, width, size) = row?;
        let usage = variants.entry(media).or_insert(VariantUsage {
            count: 0,
            size: 0,
            widths: Vec::new(),
        });
        usage.count += 1;
        usage.size += size;
        usage.widths.push(width);
    }
    let measured = |value: Option<u32>| value.filter(|&n| n > 0);
    let mut media: Vec<MediaUsage> = connection
        .prepare(
            "SELECT id,filename,content_type,width,height,length(data),created_at FROM blog_media",
        )?
        .query_map([], |r| {
            let id: i64 = r.get(0)?;
            let size: u64 = r.get(5)?;
            let variants = variants.remove(&id).unwrap_or(VariantUsage {
                count: 0,
                size: 0,
                widths: Vec::new(),
            });
            Ok(MediaUsage {
                id,
                filename: r.get(1)?,
                content_type: r.get(2)?,
                width: measured(r.get(3)?),
                height: measured(r.get(4)?),
                size,
                total: size + variants.size,
                variants,
                created_at: r.get(6)?,
                url: format!("/api/blog/media/{id}"),
                admin_url: format!("/api/backoffice/blog/media/{id}"),
                posts: citing.remove(&id).unwrap_or_default(),
            })
        })?
        .collect::<rusqlite::Result<_>>()?;
    media.sort_by(|a, b| b.total.cmp(&a.total).then(a.id.cmp(&b.id)));

    let contacts = ContactUsage {
        count: connection.query_row("SELECT count(*) FROM contacts", [], |r| r.get(0))?,
        size: categories.contacts,
    };
    Ok(StorageReport {
        disk,
        database,
        categories,
        media,
        posts,
        contacts,
    })
}

/// Un fichier absent (journal déjà reporté) compte pour zéro.
fn file_size(path: &Path) -> u64 {
    std::fs::metadata(path).map_or(0, |metadata| metadata.len())
}
