use std::{
    path::Path,
    sync::{Mutex, MutexGuard},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use rand::{RngCore, rngs::OsRng};
use rusqlite::{Connection, OptionalExtension, params};
use serde::Serialize;
use sha2::{Digest, Sha256};

use crate::{config::BackofficeConfig, contact::ContactMessage};
use argon2::{Argon2, PasswordHash, PasswordVerifier};

/// Toutes les erreurs publiques restent indépendantes du contenu de la base.
#[derive(Debug)]
pub struct StoreError;

impl std::fmt::Display for StoreError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("La base de données est indisponible")
    }
}

impl std::error::Error for StoreError {}

impl From<rusqlite::Error> for StoreError {
    fn from(_: rusqlite::Error) -> Self {
        Self
    }
}

#[derive(Serialize)]
pub struct ContactRecord {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub subject: String,
    pub message: String,
    pub status: String,
    pub delivery_status: String,
    pub created_at: String,
}

#[derive(Serialize)]
pub struct ContactPage {
    pub contacts: Vec<ContactRecord>,
    pub total: u64,
    pub new_count: u64,
}

#[derive(Serialize)]
pub struct ContactSummary {
    pub new: u64,
    pub read: u64,
    pub archived: u64,
    pub total: u64,
}

#[derive(Serialize)]
pub struct ToolLink {
    pub id: i64,
    pub label: String,
    pub url: String,
    pub description: String,
}

#[derive(Serialize)]
pub struct TokenRecord {
    pub id: i64,
    pub name: String,
    pub created_at: String,
    pub last_used_at: Option<String>,
    pub scopes: Vec<String>,
}

/// Permissions d’un accès créé sans permissions explicites : la lecture du blog
/// seule. Lire les demandes de contact se demande exprès.
pub const DEFAULT_TOKEN_SCOPES: [&str; 1] = ["blog:read"];

/// Nombre maximal d’accès MCP actifs : au-delà, il faut en révoquer un.
pub const MAX_TOKENS: u64 = 64;

/// Échec de la création d’un accès MCP : le plafond est une règle, pas une panne.
#[derive(Debug)]
pub enum TokenCreationError {
    LimitReached,
    Store(StoreError),
}

impl From<StoreError> for TokenCreationError {
    fn from(error: StoreError) -> Self {
        Self::Store(error)
    }
}

impl From<rusqlite::Error> for TokenCreationError {
    fn from(error: rusqlite::Error) -> Self {
        Self::Store(error.into())
    }
}

pub(crate) enum TwoFactorResult {
    Verified {
        session: String,
        recovery_codes: Option<Vec<String>>,
    },
    Invalid,
    Expired,
}

pub struct Store {
    connection: Mutex<Connection>,
}

impl Store {
    pub fn open(path: impl AsRef<Path>, bootstrap_email: Option<&str>) -> Result<Self, StoreError> {
        let path = path.as_ref();
        if let Some(parent) = path
            .parent()
            .filter(|parent| !parent.as_os_str().is_empty())
        {
            std::fs::create_dir_all(parent).map_err(|_| StoreError)?;
        }
        #[cfg(unix)]
        {
            use std::os::unix::fs::{OpenOptionsExt, PermissionsExt};
            let file = std::fs::OpenOptions::new()
                .write(true)
                .create(true)
                .truncate(false)
                .mode(0o600)
                .open(path)
                .map_err(|_| StoreError)?;
            file.set_permissions(std::fs::Permissions::from_mode(0o600))
                .map_err(|_| StoreError)?;
        }
        Self::initialize(Connection::open(path)?, bootstrap_email)
    }

    pub fn in_memory(email: &str) -> Result<Self, StoreError> {
        Self::initialize(Connection::open_in_memory()?, Some(email))
    }

    fn initialize(
        connection: Connection,
        bootstrap_email: Option<&str>,
    ) -> Result<Self, StoreError> {
        connection.busy_timeout(Duration::from_secs(5))?;
        connection.execute_batch(
            "PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;
             CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
             CREATE TABLE IF NOT EXISTS contacts (
               id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
               subject TEXT NOT NULL, message TEXT NOT NULL,
               status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','read','archived')),
               delivery_status TEXT NOT NULL CHECK(delivery_status IN ('pending','sent','failed','unconfigured')),
               created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
             CREATE INDEX IF NOT EXISTS contacts_status_id ON contacts(status,id DESC);
             CREATE TABLE IF NOT EXISTS links (
               id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, url TEXT NOT NULL, description TEXT NOT NULL);
             CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
             CREATE TABLE IF NOT EXISTS auth_challenges (
               hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
               enrollment INTEGER NOT NULL, pending_secret BLOB);
             CREATE TABLE IF NOT EXISTS backoffice_totp (
               id INTEGER PRIMARY KEY CHECK(id=1), encrypted_secret BLOB NOT NULL, last_used_step INTEGER NOT NULL);
             CREATE TABLE IF NOT EXISTS recovery_codes (hash TEXT PRIMARY KEY);
             CREATE TABLE IF NOT EXISTS tokens (
               id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, hash TEXT NOT NULL UNIQUE,
               created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
               last_used_at TEXT);"
        )?;
        crate::blog::initialize(&connection)?;
        let has_scopes = connection
            .prepare("PRAGMA table_info(tokens)")?
            .query_map([], |row| row.get::<_, String>(1))?
            .collect::<Result<Vec<_>, _>>()?
            .iter()
            .any(|name| name == "scopes");
        if !has_scopes {
            connection.execute("ALTER TABLE tokens ADD COLUMN scopes TEXT NOT NULL DEFAULT '[\"contacts:read\",\"blog:read\"]'", [])?;
        }
        let configured: bool = connection.query_row(
            "SELECT EXISTS(SELECT 1 FROM settings WHERE key='contact_email')",
            [],
            |row| row.get(0),
        )?;
        if !configured {
            let email = bootstrap_email.ok_or(StoreError)?;
            if !crate::config::valid_contact_email(email) {
                return Err(StoreError);
            }
            let address = email.parse::<lettre::Address>().map_err(|_| StoreError)?;
            connection.execute(
                "INSERT INTO settings(key,value) VALUES('contact_email',?1)",
                [address.to_string()],
            )?;
        }
        // Une livraison interrompue ne doit pas apparaître comme encore active après redémarrage.
        connection.execute(
            "UPDATE contacts SET delivery_status='failed' WHERE delivery_status='pending'",
            [],
        )?;
        Ok(Self {
            connection: Mutex::new(connection),
        })
    }

    pub(crate) fn connection(&self) -> Result<MutexGuard<'_, Connection>, StoreError> {
        self.connection.lock().map_err(|_| StoreError)
    }

    pub fn contact_email(&self) -> Result<String, StoreError> {
        Ok(self.connection()?.query_row(
            "SELECT value FROM settings WHERE key='contact_email'",
            [],
            |row| row.get(0),
        )?)
    }

    pub fn set_contact_email(&self, email: &str) -> Result<(), StoreError> {
        if !crate::config::valid_contact_email(email) {
            return Err(StoreError);
        }
        self.connection()?.execute(
            "UPDATE settings SET value=?1 WHERE key='contact_email'",
            [email],
        )?;
        Ok(())
    }

    /// La seule empreinte dérivée du mot de passe est Argon2id salée. Elle est
    /// réutilisée au redémarrage ; une rotation invalide toutes les authentifications.
    pub(crate) fn bind_admin_credentials(
        &self,
        config: Option<&BackofficeConfig>,
        secure_cookie: bool,
    ) -> Result<Option<String>, StoreError> {
        let mut connection = self.connection()?;
        let transaction = connection.transaction()?;
        // Migration : l’ancienne empreinte des paramètres PHC n’est plus utilisée.
        transaction.execute(
            "DELETE FROM settings WHERE key='admin_auth_fingerprint'",
            [],
        )?;
        let previous_hash: Option<String> = transaction
            .query_row(
                "SELECT value FROM settings WHERE key='admin_password_hash'",
                [],
                |row| row.get(0),
            )
            .optional()?;
        let previous_policy: Option<String> = transaction
            .query_row(
                "SELECT value FROM settings WHERE key='admin_auth_policy'",
                [],
                |row| row.get(0),
            )
            .optional()?;
        let (hash, policy, password_changed) = if let Some(config) = config {
            let same_password = previous_hash.as_deref().is_some_and(|value| {
                crate::admin::validate_password_hash(value).is_ok()
                    && PasswordHash::new(value).is_ok_and(|hash| {
                        Argon2::default()
                            .verify_password(config.password.as_bytes(), &hash)
                            .is_ok()
                    })
            });
            let hash = if same_password {
                previous_hash.clone().ok_or(StoreError)?
            } else {
                crate::admin::hash_password(&config.password).map_err(|_| StoreError)?
            };
            let key_fingerprint = config
                .totp_encryption_key
                .as_ref()
                .map(|key| format!("{:x}", Sha256::digest(key)));
            let policy = serde_json::json!({"email":config.email,"two_factor":config.environment.requires_two_factor(),"secure_cookie":secure_cookie,"key":key_fingerprint}).to_string();
            // Une clé absente ou différente ne doit jamais supprimer l’enrôlement.
            if config.environment.requires_two_factor() {
                let encrypted: Option<Vec<u8>> = transaction
                    .query_row(
                        "SELECT encrypted_secret FROM backoffice_totp WHERE id=1",
                        [],
                        |row| row.get(0),
                    )
                    .optional()?;
                if let Some(encrypted) = encrypted {
                    crate::two_factor::decrypt(
                        &encrypted,
                        config.totp_encryption_key.as_ref().ok_or(StoreError)?,
                    )?;
                }
            }
            (Some(hash), policy, !same_password)
        } else {
            (None, String::new(), previous_hash.is_some())
        };
        if password_changed || previous_policy.as_deref() != Some(&policy) {
            transaction.execute("DELETE FROM sessions", [])?;
            transaction.execute("DELETE FROM auth_challenges", [])?;
        }
        transaction.execute("INSERT INTO settings(key,value) VALUES('admin_auth_policy',?1) ON CONFLICT(key) DO UPDATE SET value=excluded.value", [&policy])?;
        if let Some(hash) = hash.as_ref() {
            transaction.execute("INSERT INTO settings(key,value) VALUES('admin_password_hash',?1) ON CONFLICT(key) DO UPDATE SET value=excluded.value", [hash])?;
        } else {
            transaction.execute("DELETE FROM settings WHERE key='admin_password_hash'", [])?;
        }
        transaction.commit()?;
        Ok(hash)
    }

    pub fn reset_two_factor(&self) -> Result<(), StoreError> {
        let mut connection = self.connection()?;
        let transaction = connection.transaction()?;
        transaction.execute("DELETE FROM backoffice_totp", [])?;
        transaction.execute("DELETE FROM recovery_codes", [])?;
        transaction.execute("DELETE FROM auth_challenges", [])?;
        transaction.execute("DELETE FROM sessions", [])?;
        transaction.commit()?;
        Ok(())
    }

    pub(crate) fn create_challenge(&self, ttl: Duration) -> Result<(String, bool), StoreError> {
        let connection = self.connection()?;
        let now = unix_time();
        connection.execute(
            "DELETE FROM auth_challenges WHERE expires_at<=?1 OR attempts>=5",
            [now],
        )?;
        let count: u64 =
            connection.query_row("SELECT count(*) FROM auth_challenges", [], |row| row.get(0))?;
        if count >= 1_024 {
            return Err(StoreError);
        }
        let enrolled: bool =
            connection.query_row("SELECT EXISTS(SELECT 1 FROM backoffice_totp)", [], |row| {
                row.get(0)
            })?;
        let token = random_secret();
        connection.execute(
            "INSERT INTO auth_challenges(hash,expires_at,enrollment) VALUES(?1,?2,?3)",
            params![hash_secret(&token), now + ttl.as_secs(), !enrolled],
        )?;
        Ok((token, !enrolled))
    }

    pub(crate) fn delete_challenge(&self, token: &str) -> Result<(), StoreError> {
        self.connection()?.execute(
            "DELETE FROM auth_challenges WHERE hash=?1",
            [hash_secret(token)],
        )?;
        Ok(())
    }

    /// Ne crée le secret qu’une fois pour ce défi. Un enrôlement terminé invalide
    /// tous les autres défis avant qu’ils puissent modifier la configuration.
    pub(crate) fn enrollment_secret(
        &self,
        token: &str,
        key: &[u8; 32],
    ) -> Result<Option<Vec<u8>>, StoreError> {
        if token.len() != 64 {
            return Ok(None);
        }
        let mut connection = self.connection()?;
        let transaction = connection.transaction()?;
        let pending: Option<Option<Vec<u8>>> = transaction.query_row(
            "SELECT pending_secret FROM auth_challenges WHERE hash=?1 AND expires_at>?2 AND attempts<5 AND enrollment=1 AND NOT EXISTS(SELECT 1 FROM backoffice_totp)",
            params![hash_secret(token), unix_time()], |row| row.get(0),
        ).optional()?;
        let Some(pending) = pending else {
            return Ok(None);
        };
        let secret = if let Some(pending) = pending {
            crate::two_factor::decrypt(&pending, key)?
        } else {
            let secret = crate::two_factor::new_secret();
            let encrypted = crate::two_factor::encrypt(&secret, key)?;
            transaction.execute(
                "UPDATE auth_challenges SET pending_secret=?2 WHERE hash=?1",
                params![hash_secret(token), encrypted],
            )?;
            secret
        };
        transaction.commit()?;
        Ok(Some(secret))
    }

    pub(crate) fn verify_two_factor(
        &self,
        token: &str,
        code: &str,
        key: &[u8; 32],
        session_ttl: Duration,
    ) -> Result<TwoFactorResult, StoreError> {
        if token.len() != 64 {
            return Ok(TwoFactorResult::Expired);
        }
        let mut connection = self.connection()?;
        let transaction = connection.transaction()?;
        let now = unix_time();
        let challenge: Option<(bool, Option<Vec<u8>>)> = transaction.query_row(
            "SELECT enrollment,pending_secret FROM auth_challenges WHERE hash=?1 AND expires_at>?2 AND attempts<5",
            params![hash_secret(token), now], |row| Ok((row.get(0)?, row.get(1)?)),
        ).optional()?;
        let Some((enrollment, pending)) = challenge else {
            return Ok(TwoFactorResult::Expired);
        };
        transaction.execute(
            "UPDATE auth_challenges SET attempts=attempts+1 WHERE hash=?1",
            [hash_secret(token)],
        )?;
        let active: Option<(Vec<u8>, u64)> = transaction
            .query_row(
                "SELECT encrypted_secret,last_used_step FROM backoffice_totp WHERE id=1",
                [],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .optional()?;
        let mut recovery_codes = None;
        let valid = if enrollment && active.is_none() {
            if let Some(pending) = pending {
                let secret = crate::two_factor::decrypt(&pending, key)?;
                if let Some(step) = crate::two_factor::matching_step(&secret, code, now)? {
                    transaction.execute("INSERT INTO backoffice_totp(id,encrypted_secret,last_used_step) VALUES(1,?1,?2)", params![pending, step])?;
                    transaction.execute("DELETE FROM recovery_codes", [])?;
                    let codes: Vec<String> = (0..8).map(|_| recovery_code()).collect();
                    for code in &codes {
                        transaction.execute(
                            "INSERT INTO recovery_codes(hash) VALUES(?1)",
                            [hash_secret(&normalize_recovery(code))],
                        )?;
                    }
                    recovery_codes = Some(codes);
                    // Le premier enrôlement gagne, tous les anciens accès sont invalides.
                    transaction.execute("DELETE FROM auth_challenges", [])?;
                    transaction.execute("DELETE FROM sessions", [])?;
                    true
                } else {
                    false
                }
            } else {
                false
            }
        } else if !enrollment {
            if let Some((encrypted, last_used)) = active {
                let secret = crate::two_factor::decrypt(&encrypted, key)?;
                if let Some(step) = crate::two_factor::matching_step(&secret, code, now)?
                    .filter(|step| *step > last_used)
                {
                    transaction.execute(
                        "UPDATE backoffice_totp SET last_used_step=?1 WHERE id=1",
                        [step],
                    )?;
                    true
                } else if valid_recovery(code) {
                    transaction.execute(
                        "DELETE FROM recovery_codes WHERE hash=?1",
                        [hash_secret(&normalize_recovery(code))],
                    )? > 0
                } else {
                    false
                }
            } else {
                false
            }
        } else {
            false
        };
        if !valid {
            transaction.commit()?;
            return Ok(TwoFactorResult::Invalid);
        }
        transaction.execute(
            "DELETE FROM auth_challenges WHERE hash=?1",
            [hash_secret(token)],
        )?;
        let session = insert_session(&transaction, session_ttl)?;
        transaction.commit()?;
        Ok(TwoFactorResult::Verified {
            session,
            recovery_codes,
        })
    }

    pub fn save_contact(
        &self,
        contact: &ContactMessage,
        delivery_status: &str,
    ) -> Result<i64, StoreError> {
        let connection = self.connection()?;
        connection.execute("INSERT INTO contacts(name,email,subject,message,delivery_status) VALUES(?1,?2,?3,?4,?5)",
            params![contact.name, contact.email.to_string(), contact.subject, contact.message, delivery_status])?;
        Ok(connection.last_insert_rowid())
    }

    pub fn set_delivery_status(&self, id: i64, status: &str) -> Result<(), StoreError> {
        self.connection()?.execute(
            "UPDATE contacts SET delivery_status=?2 WHERE id=?1",
            params![id, status],
        )?;
        Ok(())
    }

    pub fn list_contacts(
        &self,
        status: &str,
        limit: u32,
        offset: u32,
    ) -> Result<ContactPage, StoreError> {
        if !matches!(status, "all" | "new" | "read" | "archived") {
            return Err(StoreError);
        }
        let connection = self.connection()?;
        let total = connection.query_row(
            "SELECT count(*) FROM contacts WHERE ?1='all' OR status=?1",
            [status],
            |row| row.get(0),
        )?;
        let new_count = connection.query_row(
            "SELECT count(*) FROM contacts WHERE status='new'",
            [],
            |row| row.get(0),
        )?;
        let mut query = connection.prepare("SELECT id,name,email,subject,message,status,delivery_status,created_at FROM contacts WHERE ?1='all' OR status=?1 ORDER BY id DESC LIMIT ?2 OFFSET ?3")?;
        let contacts = query
            .query_map(params![status, limit.min(100), offset], contact_row)?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(ContactPage {
            contacts,
            total,
            new_count,
        })
    }

    pub fn contact_summary(&self) -> Result<ContactSummary, StoreError> {
        let connection = self.connection()?;
        Ok(connection.query_row("SELECT count(*) FILTER (WHERE status='new'), count(*) FILTER (WHERE status='read'), count(*) FILTER (WHERE status='archived'), count(*) FROM contacts", [], |row| {
            Ok(ContactSummary { new: row.get(0)?, read: row.get(1)?, archived: row.get(2)?, total: row.get(3)? })
        })?)
    }

    pub fn get_contact(&self, id: i64) -> Result<Option<ContactRecord>, StoreError> {
        Ok(self.connection()?.query_row("SELECT id,name,email,subject,message,status,delivery_status,created_at FROM contacts WHERE id=?1", [id], contact_row).optional()?)
    }

    pub fn update_contact_status(&self, id: i64, status: &str) -> Result<bool, StoreError> {
        Ok(self.connection()?.execute(
            "UPDATE contacts SET status=?2 WHERE id=?1",
            params![id, status],
        )? > 0)
    }

    pub fn delete_contact(&self, id: i64) -> Result<bool, StoreError> {
        Ok(self
            .connection()?
            .execute("DELETE FROM contacts WHERE id=?1", [id])?
            > 0)
    }

    pub fn list_links(&self) -> Result<Vec<ToolLink>, StoreError> {
        let connection = self.connection()?;
        let mut query =
            connection.prepare("SELECT id,label,url,description FROM links ORDER BY id")?;
        Ok(query
            .query_map([], |row| {
                Ok(ToolLink {
                    id: row.get(0)?,
                    label: row.get(1)?,
                    url: row.get(2)?,
                    description: row.get(3)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?)
    }

    pub fn create_link(
        &self,
        label: &str,
        url: &str,
        description: &str,
    ) -> Result<i64, StoreError> {
        let connection = self.connection()?;
        let count: u64 =
            connection.query_row("SELECT count(*) FROM links", [], |row| row.get(0))?;
        if count >= 100 {
            return Err(StoreError);
        }
        connection.execute(
            "INSERT INTO links(label,url,description) VALUES(?1,?2,?3)",
            params![label, url, description],
        )?;
        Ok(connection.last_insert_rowid())
    }

    pub fn update_link(
        &self,
        id: i64,
        label: &str,
        url: &str,
        description: &str,
    ) -> Result<bool, StoreError> {
        Ok(self.connection()?.execute(
            "UPDATE links SET label=?2,url=?3,description=?4 WHERE id=?1",
            params![id, label, url, description],
        )? > 0)
    }

    pub fn delete_link(&self, id: i64) -> Result<bool, StoreError> {
        Ok(self
            .connection()?
            .execute("DELETE FROM links WHERE id=?1", [id])?
            > 0)
    }

    pub fn create_session(&self, ttl: Duration) -> Result<String, StoreError> {
        insert_session(&*self.connection()?, ttl)
    }

    pub fn authenticate_session(&self, token: &str) -> Result<bool, StoreError> {
        if token.len() != 64 {
            return Ok(false);
        }
        Ok(self.connection()?.query_row(
            "SELECT EXISTS(SELECT 1 FROM sessions WHERE hash=?1 AND expires_at>?2)",
            params![hash_secret(token), unix_time()],
            |row| row.get(0),
        )?)
    }

    pub fn delete_session(&self, token: &str) -> Result<(), StoreError> {
        self.connection()?
            .execute("DELETE FROM sessions WHERE hash=?1", [hash_secret(token)])?;
        Ok(())
    }

    pub fn list_tokens(&self) -> Result<Vec<TokenRecord>, StoreError> {
        let connection = self.connection()?;
        let mut query = connection.prepare(
            "SELECT id,name,created_at,last_used_at,scopes FROM tokens ORDER BY id DESC",
        )?;
        Ok(query
            .query_map([], |row| {
                Ok(TokenRecord {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    created_at: row.get(2)?,
                    last_used_at: row.get(3)?,
                    scopes: serde_json::from_str(&row.get::<_, String>(4)?)
                        .map_err(|_| rusqlite::Error::InvalidQuery)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?)
    }

    pub fn create_token(&self, name: &str) -> Result<(i64, String), TokenCreationError> {
        let scopes = DEFAULT_TOKEN_SCOPES.map(str::to_owned);
        self.create_token_with_scopes(name, &scopes)
    }

    pub fn create_token_with_scopes(
        &self,
        name: &str,
        scopes: &[String],
    ) -> Result<(i64, String), TokenCreationError> {
        if !crate::admin::valid_token_scopes(scopes) {
            return Err(StoreError.into());
        }
        let connection = self.connection()?;
        let count: u64 =
            connection.query_row("SELECT count(*) FROM tokens", [], |row| row.get(0))?;
        if count >= MAX_TOKENS {
            return Err(TokenCreationError::LimitReached);
        }
        let token = random_secret();
        connection.execute(
            "INSERT INTO tokens(name,hash,scopes) VALUES(?1,?2,?3)",
            params![
                name,
                hash_secret(&token),
                serde_json::to_string(scopes).map_err(|_| StoreError)?
            ],
        )?;
        Ok((connection.last_insert_rowid(), token))
    }

    pub fn authenticate_token(&self, token: &str) -> Result<bool, StoreError> {
        Ok(self.authenticate_token_scopes(token)?.is_some())
    }

    pub fn authenticate_token_scopes(
        &self,
        token: &str,
    ) -> Result<Option<Vec<String>>, StoreError> {
        if token.len() != 64 {
            return Ok(None);
        }
        let connection = self.connection()?;
        let encoded: Option<String> = connection
            .query_row(
                "SELECT scopes FROM tokens WHERE hash=?1",
                [hash_secret(token)],
                |row| row.get(0),
            )
            .optional()?;
        let Some(encoded) = encoded else {
            return Ok(None);
        };
        let scopes: Vec<String> = serde_json::from_str(&encoded).map_err(|_| StoreError)?;
        connection.execute(
            "UPDATE tokens SET last_used_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE hash=?1",
            [hash_secret(token)],
        )?;
        Ok(Some(scopes))
    }

    pub fn delete_token(&self, id: i64) -> Result<bool, StoreError> {
        Ok(self
            .connection()?
            .execute("DELETE FROM tokens WHERE id=?1", [id])?
            > 0)
    }
}

fn insert_session(connection: &Connection, ttl: Duration) -> Result<String, StoreError> {
    let now = unix_time();
    connection.execute("DELETE FROM sessions WHERE expires_at<=?1", [now])?;
    let count: u64 = connection.query_row("SELECT count(*) FROM sessions", [], |row| row.get(0))?;
    if count >= 1_024 {
        return Err(StoreError);
    }
    let token = random_secret();
    connection.execute(
        "INSERT INTO sessions(hash,expires_at) VALUES(?1,?2)",
        params![hash_secret(&token), now + ttl.as_secs()],
    )?;
    Ok(token)
}

fn recovery_code() -> String {
    let mut bytes = [0; 16];
    OsRng.fill_bytes(&mut bytes);
    bytes
        .chunks(4)
        .map(|chunk| {
            chunk
                .iter()
                .map(|byte| format!("{byte:02X}"))
                .collect::<String>()
        })
        .collect::<Vec<_>>()
        .join("-")
}
fn normalize_recovery(code: &str) -> String {
    code.replace('-', "").to_ascii_uppercase()
}
fn valid_recovery(code: &str) -> bool {
    let normalized = normalize_recovery(code);
    normalized.len() == 32 && normalized.bytes().all(|byte| byte.is_ascii_hexdigit())
}

fn contact_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<ContactRecord> {
    Ok(ContactRecord {
        id: row.get(0)?,
        name: row.get(1)?,
        email: row.get(2)?,
        subject: row.get(3)?,
        message: row.get(4)?,
        status: row.get(5)?,
        delivery_status: row.get(6)?,
        created_at: row.get(7)?,
    })
}

fn unix_time() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn random_secret() -> String {
    let mut bytes = [0; 32];
    OsRng.fill_bytes(&mut bytes);
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn hash_secret(secret: &str) -> String {
    format!("{:x}", Sha256::digest(secret.as_bytes()))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn auth_config() -> BackofficeConfig {
        BackofficeConfig {
            email: "admin@example.org".into(),
            password: "correct horse battery staple".into(),
            environment: crate::config::AppEnvironment::Production,
            totp_encryption_key: Some([42; 32]),
        }
    }

    #[test]
    fn enrollment_survives_restart_and_credentials_rotate_without_losing_two_factor() {
        let path = std::env::temp_dir().join(format!("portfolio-auth-{}.sqlite3", random_secret()));
        let config = auth_config();
        let (session, recovery, original_hash, old_challenge) = {
            let store = Store::open(&path, Some("owner@example.org")).unwrap();
            let original_hash = store
                .bind_admin_credentials(Some(&config), true)
                .unwrap()
                .unwrap();
            let (challenge, enrollment) = store.create_challenge(Duration::from_secs(600)).unwrap();
            assert!(enrollment);
            let secret = store
                .enrollment_secret(&challenge, &[42; 32])
                .unwrap()
                .unwrap();
            let code = crate::two_factor::totp(secret.clone(), &config.email)
                .unwrap()
                .generate_current()
                .unwrap();
            let TwoFactorResult::Verified {
                session,
                recovery_codes: Some(recovery),
            } = store
                .verify_two_factor(&challenge, &code, &[42; 32], Duration::from_secs(600))
                .unwrap()
            else {
                panic!("enrollment did not complete")
            };
            let connection = store.connection().unwrap();
            let encrypted: Vec<u8> = connection
                .query_row("SELECT encrypted_secret FROM backoffice_totp", [], |row| {
                    row.get(0)
                })
                .unwrap();
            assert_eq!(
                crate::two_factor::decrypt(&encrypted, &[42; 32]).unwrap(),
                secret
            );
            assert!(
                !encrypted
                    .windows(secret.len())
                    .any(|window| window == secret)
            );
            let hash: String = connection
                .query_row("SELECT hash FROM recovery_codes LIMIT 1", [], |row| {
                    row.get(0)
                })
                .unwrap();
            assert!(!recovery.contains(&hash));
            drop(connection);
            let (old_challenge, enrollment) =
                store.create_challenge(Duration::from_secs(600)).unwrap();
            assert!(!enrollment);
            (session, recovery, original_hash, old_challenge)
        };
        {
            let store = Store::open(&path, None).unwrap();
            assert_eq!(
                store
                    .bind_admin_credentials(Some(&config), true)
                    .unwrap()
                    .unwrap(),
                original_hash
            );
            assert!(store.authenticate_session(&session).unwrap());
            let mut changed_key = config.clone();
            changed_key.totp_encryption_key = Some([43; 32]);
            assert!(
                store
                    .bind_admin_credentials(Some(&changed_key), true)
                    .is_err()
            );
            assert!(store.authenticate_session(&session).unwrap());
            let mut rotated = config;
            rotated.password = "rotated safe password for admin".into();
            rotated.email = "new-admin@example.org".into();
            let new_hash = store
                .bind_admin_credentials(Some(&rotated), true)
                .unwrap()
                .unwrap();
            assert_ne!(new_hash, original_hash);
            assert!(!store.authenticate_session(&session).unwrap());
            assert!(matches!(
                store
                    .verify_two_factor(
                        &old_challenge,
                        &recovery[0],
                        &[42; 32],
                        Duration::from_secs(600)
                    )
                    .unwrap(),
                TwoFactorResult::Expired
            ));
            let (challenge, enrollment) = store.create_challenge(Duration::from_secs(600)).unwrap();
            assert!(!enrollment);
            assert!(matches!(
                store
                    .verify_two_factor(
                        &challenge,
                        &recovery[0],
                        &[42; 32],
                        Duration::from_secs(600)
                    )
                    .unwrap(),
                TwoFactorResult::Verified { .. }
            ));
            let (challenge, _) = store.create_challenge(Duration::from_secs(600)).unwrap();
            assert!(matches!(
                store
                    .verify_two_factor(
                        &challenge,
                        &recovery[0],
                        &[42; 32],
                        Duration::from_secs(600)
                    )
                    .unwrap(),
                TwoFactorResult::Invalid
            ));
            store.reset_two_factor().unwrap();
            assert!(store.create_challenge(Duration::from_secs(600)).unwrap().1);
            assert!(
                store
                    .bind_admin_credentials(Some(&changed_key), true)
                    .is_ok()
            );
        }
        std::fs::remove_file(path).unwrap();
    }

    #[test]
    fn expired_challenges_and_tampered_ciphertext_fail_closed() {
        let store = Store::in_memory("owner@example.org").unwrap();
        let (expired, _) = store.create_challenge(Duration::ZERO).unwrap();
        assert!(
            store
                .enrollment_secret(&expired, &[42; 32])
                .unwrap()
                .is_none()
        );
        assert!(matches!(
            store
                .verify_two_factor(&expired, "000000", &[42; 32], Duration::from_secs(600))
                .unwrap(),
            TwoFactorResult::Expired
        ));
        let (challenge, _) = store.create_challenge(Duration::from_secs(600)).unwrap();
        store
            .enrollment_secret(&challenge, &[42; 32])
            .unwrap()
            .unwrap();
        store
            .connection()
            .unwrap()
            .execute(
                "UPDATE auth_challenges SET pending_secret=zeroblob(60) WHERE hash=?1",
                [hash_secret(&challenge)],
            )
            .unwrap();
        assert!(store.enrollment_secret(&challenge, &[42; 32]).is_err());
        assert!(
            store
                .verify_two_factor(&challenge, "000000", &[42; 32], Duration::from_secs(600))
                .is_err()
        );
        assert_eq!(
            store
                .connection()
                .unwrap()
                .query_row::<u64, _, _>("SELECT count(*) FROM sessions", [], |row| row.get(0))
                .unwrap(),
            0
        );
    }

    #[test]
    fn deleted_contact_link_and_token_identifiers_are_never_reused() {
        let store = Store::in_memory("owner@example.org").unwrap();
        let contact = ContactMessage {
            name: "Une personne".into(),
            email: "person@example.org".parse().unwrap(),
            subject: "Projet".into(),
            message: "Bonjour à vous".into(),
        };
        let old_contact = store.save_contact(&contact, "unconfigured").unwrap();
        assert!(store.delete_contact(old_contact).unwrap());
        let new_contact = store.save_contact(&contact, "unconfigured").unwrap();
        assert!(new_contact > old_contact);
        assert!(
            !store
                .update_contact_status(old_contact, "archived")
                .unwrap()
        );
        assert_eq!(
            store.get_contact(new_contact).unwrap().unwrap().status,
            "new"
        );

        let old_link = store
            .create_link("Lien", "https://example.org", "")
            .unwrap();
        assert!(store.delete_link(old_link).unwrap());
        assert!(
            store
                .create_link("Lien", "https://example.org", "")
                .unwrap()
                > old_link
        );

        let (old_token, _) = store.create_token("Portable").unwrap();
        assert!(store.delete_token(old_token).unwrap());
        assert!(store.create_token("Portable").unwrap().0 > old_token);
    }

    #[test]
    fn legacy_tokens_migrate_to_read_only_scopes_without_exposing_or_rotating_secrets() {
        let path =
            std::env::temp_dir().join(format!("portfolio-scopes-{}.sqlite3", random_secret()));
        let token = random_secret();
        {
            let connection = Connection::open(&path).unwrap();
            connection.execute_batch("CREATE TABLE tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, hash TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), last_used_at TEXT);").unwrap();
            connection
                .execute(
                    "INSERT INTO tokens(name,hash) VALUES(?1,?2)",
                    params!["Ancien client", hash_secret(&token)],
                )
                .unwrap();
        }
        let store = Store::open(&path, Some("owner@example.org")).unwrap();
        assert_eq!(
            store.authenticate_token_scopes(&token).unwrap(),
            Some(vec!["contacts:read".into(), "blog:read".into()])
        );
        let tokens = store.list_tokens().unwrap();
        assert_eq!(tokens[0].id, 1);
        assert_eq!(tokens[0].name, "Ancien client");
        assert_eq!(tokens[0].scopes, vec!["contacts:read", "blog:read"]);
        assert!(!serde_json::to_string(&tokens).unwrap().contains(&token));
        drop(store);
        let reopened = Store::open(&path, None).unwrap();
        assert_eq!(
            reopened.authenticate_token_scopes(&token).unwrap(),
            Some(vec!["contacts:read".into(), "blog:read".into()])
        );
        assert!(reopened.delete_token(1).unwrap());
        assert!(
            reopened
                .authenticate_token_scopes(&token)
                .unwrap()
                .is_none()
        );
        drop(reopened);
        std::fs::remove_file(path).unwrap();
    }

    #[test]
    fn secrets_are_revocable_and_expired_sessions_are_rejected() {
        let store = Store::in_memory("owner@example.org").unwrap();
        let (id, token) = store.create_token("Portable").unwrap();
        assert!(store.authenticate_token(&token).unwrap());
        // Sans permissions explicites, un nouvel accès ne lit pas les demandes de contact.
        assert_eq!(
            store.authenticate_token_scopes(&token).unwrap(),
            Some(vec!["blog:read".into()])
        );
        assert!(store.list_tokens().unwrap()[0].last_used_at.is_some());
        store.delete_token(id).unwrap();
        assert!(!store.authenticate_token(&token).unwrap());
        let session = store.create_session(Duration::from_secs(10)).unwrap();
        assert!(store.authenticate_session(&session).unwrap());
        store.delete_session(&session).unwrap();
        assert!(!store.authenticate_session(&session).unwrap());
        let expired = store.create_session(Duration::ZERO).unwrap();
        assert!(!store.authenticate_session(&expired).unwrap());
        let connection = store.connection().unwrap();
        let hash: String = connection
            .query_row("SELECT hash FROM sessions", [], |row| row.get(0))
            .unwrap();
        assert_ne!(hash, expired);
    }

    #[test]
    fn bootstrap_only_initializes_and_contacts_survive_reopening() {
        let path = std::env::temp_dir().join(format!("portfolio-{}.sqlite3", random_secret()));
        {
            let store = Store::open(&path, Some("first@example.org")).unwrap();
            store.set_contact_email("changed@example.org").unwrap();
            store
                .save_contact(
                    &ContactMessage {
                        name: "Une personne".into(),
                        email: "person@example.org".parse().unwrap(),
                        subject: "Projet".into(),
                        message: "Bonjour à vous".into(),
                    },
                    "pending",
                )
                .unwrap();
        }
        {
            let store = Store::open(&path, None).unwrap();
            assert_eq!(store.contact_email().unwrap(), "changed@example.org");
            let page = store.list_contacts("new", 50, 0).unwrap();
            assert_eq!(page.new_count, 1);
            assert_eq!(page.contacts[0].delivery_status, "failed");
        }
        assert_eq!(
            Store::open(&path, Some("other@example.org"))
                .unwrap()
                .contact_email()
                .unwrap(),
            "changed@example.org"
        );
        std::fs::remove_file(path).unwrap();
    }
}
