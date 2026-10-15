//! Le serveur d’envoi des notifications, réglable dans le backoffice.
//!
//! Priorité : un réglage enregistré en SQLite (rubrique « E-mails ») prime,
//! qu’il active ou coupe l’envoi ; sans réglage, les variables `SMTP_*` du
//! `.env` servent de repli. Une notification lit le réglage courant : pas de
//! redémarrage. Le mot de passe est chiffré au repos avec une sous-clé tirée de
//! `BACKOFFICE_TOTP_ENCRYPTION_KEY`, jamais renvoyé par l’API ni journalisé.
use std::{
    collections::{BTreeMap, VecDeque},
    net::IpAddr,
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use axum::{
    Json,
    extract::{FromRequest, Request, State},
    http::StatusCode,
};
use lettre::Address;
use rusqlite::{Connection, OptionalExtension, params};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};

use crate::{
    AppState,
    admin::storage_error,
    config::{AppEnvironment, BackofficeConfig, SmtpConfig, SmtpTls},
    error::ApiError,
    mail::{MailDelivery, MailTestError, SmtpDelivery},
    storage::{Store, StoreError},
};

/// Les ports d’envoi admis : TLS implicite (465), STARTTLS (587), le port
/// historique (25) et le port de repli des hébergeurs (2525).
pub const ALLOWED_PORTS: [u16; 4] = [465, 587, 25, 2525];
const MAX_PASSWORD_BYTES: usize = 256;
/// Le chiffré d’un mot de passe SMTP ne s’ouvre que pour cet usage.
const PASSWORD_AAD: &[u8] = b"portfolio-backoffice-smtp-password-v1";
const KEY_CONTEXT: &[u8] = b"portfolio-backoffice-smtp-password-key-v1";
/// L’e-mail d’essai : un toutes les 15 s, dix par heure.
const TEST_GAP: Duration = Duration::from_secs(15);
const TEST_WINDOW: Duration = Duration::from_secs(60 * 60);
const TESTS_PER_WINDOW: usize = 10;

pub(crate) fn initialize(connection: &Connection) -> Result<(), StoreError> {
    connection.execute_batch(
        "CREATE TABLE IF NOT EXISTS mail_settings (
           id INTEGER PRIMARY KEY CHECK(id=1), enabled INTEGER NOT NULL,
           host TEXT NOT NULL, port INTEGER NOT NULL,
           security TEXT NOT NULL CHECK(security IN ('tls','starttls','none')),
           username TEXT NOT NULL, encrypted_password BLOB, from_address TEXT NOT NULL,
           updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));",
    )?;
    Ok(())
}

/// Le réglage tel qu’il est enregistré : le mot de passe reste chiffré.
#[derive(Clone)]
pub(crate) struct StoredMailSettings {
    pub enabled: bool,
    pub host: String,
    pub port: u16,
    pub security: SmtpTls,
    pub username: String,
    pub encrypted_password: Option<Vec<u8>>,
    pub from: String,
    pub updated_at: String,
}

impl Store {
    pub(crate) fn mail_settings(&self) -> Result<Option<StoredMailSettings>, StoreError> {
        Ok(self
            .connection()?
            .query_row(
                "SELECT enabled,host,port,security,username,encrypted_password,from_address,updated_at
                 FROM mail_settings WHERE id=1",
                [],
                |row| {
                    Ok(StoredMailSettings {
                        enabled: row.get(0)?,
                        host: row.get(1)?,
                        port: row.get(2)?,
                        security: SmtpTls::parse(&row.get::<_, String>(3)?)
                            .ok_or(rusqlite::Error::InvalidQuery)?,
                        username: row.get(4)?,
                        encrypted_password: row.get(5)?,
                        from: row.get(6)?,
                        updated_at: row.get(7)?,
                    })
                },
            )
            .optional()?)
    }

    pub(crate) fn save_mail_settings(
        &self,
        settings: &StoredMailSettings,
    ) -> Result<(), StoreError> {
        self.connection()?.execute(
            "INSERT INTO mail_settings(id,enabled,host,port,security,username,encrypted_password,from_address,updated_at)
             VALUES(1,?1,?2,?3,?4,?5,?6,?7,strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(id) DO UPDATE SET enabled=excluded.enabled, host=excluded.host,
               port=excluded.port, security=excluded.security, username=excluded.username,
               encrypted_password=excluded.encrypted_password, from_address=excluded.from_address,
               updated_at=excluded.updated_at",
            params![
                settings.enabled,
                settings.host,
                settings.port,
                settings.security.as_str(),
                settings.username,
                settings.encrypted_password,
                settings.from,
            ],
        )?;
        Ok(())
    }

    pub(crate) fn delete_mail_settings(&self) -> Result<(), StoreError> {
        self.connection()?
            .execute("DELETE FROM mail_settings WHERE id=1", [])?;
        Ok(())
    }
}

/// Ce qui empêche un réglage enregistré de servir.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Problem {
    /// La clé a changé ou manque : le mot de passe ne se déchiffre plus.
    PasswordUnreadable,
    /// Une connexion sans TLS, enregistrée en développement, hors développement.
    InsecureConnection,
    /// Un réglage que le transport refuse (expéditeur ou hôte devenus illisibles).
    Invalid,
}

impl Problem {
    fn as_str(self) -> &'static str {
        match self {
            Self::PasswordUnreadable => "password_unreadable",
            Self::InsecureConnection => "insecure_connection",
            Self::Invalid => "invalid_settings",
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Source {
    Settings,
    Environment,
    None,
}

#[derive(Clone)]
struct Resolved {
    delivery: Option<Arc<dyn MailDelivery>>,
    source: Source,
    problem: Option<Problem>,
}

/// Ce que doit faire la prochaine notification.
pub(crate) enum Delivery {
    Active(Arc<dyn MailDelivery>),
    /// Aucun envoi configuré, ou l’envoi est coupé : la demande est seulement conservée.
    Off,
    /// Un réglage existe mais ne peut pas servir : la notification échoue.
    Broken,
}

pub(crate) struct Mailer {
    /// Le repli : les variables `SMTP_*`, ou l’envoi d’un test.
    fallback: Option<Arc<dyn MailDelivery>>,
    key: Option<[u8; 32]>,
    environment: AppEnvironment,
    /// Le transport courant, construit à la première notification et oublié à
    /// chaque enregistrement : il garde ses connexions ouvertes entre deux envois.
    cache: Mutex<Option<Resolved>>,
    tests: Mutex<VecDeque<Instant>>,
}

impl Mailer {
    pub(crate) fn new(
        fallback: Option<Arc<dyn MailDelivery>>,
        backoffice: Option<&BackofficeConfig>,
    ) -> Self {
        Self {
            fallback,
            key: backoffice
                .and_then(|config| config.totp_encryption_key.as_ref())
                .map(password_key),
            environment: backoffice.map_or(AppEnvironment::Production, |config| config.environment),
            cache: Mutex::new(None),
            tests: Mutex::new(VecDeque::new()),
        }
    }

    fn allow_insecure(&self) -> bool {
        self.environment == AppEnvironment::Development
    }

    /// À appeler dans le runtime Tokio : la construction du transport y lance une tâche.
    fn resolve(&self, store: &Store) -> Result<Resolved, StoreError> {
        let mut cache = self.cache.lock().map_err(|_| StoreError)?;
        if let Some(resolved) = cache.as_ref() {
            return Ok(resolved.clone());
        }
        let resolved = match store.mail_settings()? {
            None => Resolved {
                delivery: self.fallback.clone(),
                source: if self.fallback.is_some() {
                    Source::Environment
                } else {
                    Source::None
                },
                problem: None,
            },
            Some(settings) => {
                let (delivery, problem) = if settings.enabled {
                    match self.build(&settings) {
                        Ok(delivery) => (Some(delivery), None),
                        Err(problem) => {
                            eprintln!(
                                "Les réglages d’envoi des e-mails ne peuvent pas servir ; les demandes restent conservées."
                            );
                            (None, Some(problem))
                        }
                    }
                } else {
                    (None, None)
                };
                Resolved {
                    delivery,
                    source: Source::Settings,
                    problem,
                }
            }
        };
        *cache = Some(resolved.clone());
        Ok(resolved)
    }

    fn build(&self, settings: &StoredMailSettings) -> Result<Arc<dyn MailDelivery>, Problem> {
        if settings.security == SmtpTls::None && !self.allow_insecure() {
            return Err(Problem::InsecureConnection);
        }
        let password = match settings.encrypted_password.as_deref() {
            None => None,
            Some(encrypted) => {
                let key = self.key.as_ref().ok_or(Problem::PasswordUnreadable)?;
                let clear = crate::two_factor::open(encrypted, key, PASSWORD_AAD)
                    .map_err(|_| Problem::PasswordUnreadable)?;
                Some(String::from_utf8(clear).map_err(|_| Problem::PasswordUnreadable)?)
            }
        };
        let config = SmtpConfig {
            host: settings.host.clone(),
            port: settings.port,
            username: password.as_ref().map(|_| settings.username.clone()),
            password,
            from: settings.from.parse().map_err(|_| Problem::Invalid)?,
            tls: settings.security,
        };
        SmtpDelivery::new(config)
            .map(|delivery| Arc::new(delivery) as Arc<dyn MailDelivery>)
            .map_err(|_| Problem::Invalid)
    }

    pub(crate) fn delivery(&self, store: &Store) -> Delivery {
        match self.resolve(store) {
            Ok(Resolved {
                delivery: Some(delivery),
                ..
            }) => Delivery::Active(delivery),
            Ok(Resolved {
                problem: Some(_), ..
            })
            | Err(_) => Delivery::Broken,
            Ok(_) => Delivery::Off,
        }
    }

    /// Vrai quand la prochaine demande partira aussi par e-mail.
    pub(crate) fn is_active(&self, store: &Store) -> bool {
        matches!(self.delivery(store), Delivery::Active(_))
    }

    fn invalidate(&self) -> Result<(), StoreError> {
        self.cache.lock().map_err(|_| StoreError)?.take();
        Ok(())
    }

    /// Un essai à la fois, pas plus de dix par heure ; `Err` donne l’attente en secondes.
    fn reserve_test(&self) -> Result<(), u64> {
        let now = Instant::now();
        let mut tests = self.tests.lock().unwrap_or_else(|error| error.into_inner());
        while tests
            .front()
            .is_some_and(|started| now.duration_since(*started) >= TEST_WINDOW)
        {
            tests.pop_front();
        }
        if let Some(last) = tests.back() {
            let elapsed = now.duration_since(*last);
            if elapsed < TEST_GAP {
                return Err((TEST_GAP - elapsed).as_secs() + 1);
            }
        }
        if tests.len() >= TESTS_PER_WINDOW {
            let oldest = tests.front().copied().unwrap_or(now);
            return Err((TEST_WINDOW.saturating_sub(now.duration_since(oldest))).as_secs() + 1);
        }
        tests.push_back(now);
        Ok(())
    }
}

/// Une sous-clé propre au mot de passe SMTP : la clé du `.env` ne sert jamais
/// telle quelle à deux usages.
fn password_key(key: &[u8; 32]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(KEY_CONTEXT);
    hasher.update(key);
    hasher.finalize().into()
}

/// Un nom d’hôte (lettres, chiffres, tirets, points) ou une adresse IP, sans
/// schéma, chemin ni port.
pub(crate) fn valid_host(host: &str) -> bool {
    if host.is_empty() || host.len() > 253 {
        return false;
    }
    if host.parse::<IpAddr>().is_ok() {
        return true;
    }
    host.split('.').all(|label| {
        (1..=63).contains(&label.len())
            && label
                .bytes()
                .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-')
            && !label.starts_with('-')
            && !label.ends_with('-')
    }) && !host
        .bytes()
        .all(|byte| byte.is_ascii_digit() || byte == b'.')
}

fn valid_text(value: &str, max_chars: usize) -> bool {
    value.chars().count() <= max_chars && !value.chars().any(char::is_control)
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct MailSettingsInput {
    enabled: bool,
    #[serde(default)]
    host: String,
    port: u32,
    security: String,
    #[serde(default)]
    username: String,
    /// Vide ou absent : le mot de passe enregistré est gardé.
    #[serde(default)]
    password: Option<String>,
    #[serde(default)]
    from: String,
}

#[derive(Serialize)]
struct SettingsView<'a> {
    enabled: bool,
    host: &'a str,
    port: u16,
    security: &'static str,
    username: &'a str,
    password_set: bool,
    from: &'a str,
    updated_at: &'a str,
}

fn view(state: &AppState) -> Result<Value, ApiError> {
    let mailer = &state.mailer;
    let resolved = mailer.resolve(&state.store).map_err(storage_error)?;
    let stored = state.store.mail_settings().map_err(storage_error)?;
    let settings = stored.as_ref().map(|settings| SettingsView {
        enabled: settings.enabled,
        host: &settings.host,
        port: settings.port,
        security: settings.security.as_str(),
        username: &settings.username,
        password_set: settings.encrypted_password.is_some(),
        from: &settings.from,
        updated_at: &settings.updated_at,
    });
    Ok(json!({
        "active": resolved.delivery.is_some(),
        "source": match resolved.source {
            Source::Settings => "settings",
            Source::Environment => "environment",
            Source::None => "none",
        },
        "recipient": state.store.contact_email().map_err(storage_error)?,
        "settings": settings,
        "environment": mailer.fallback.as_ref().and_then(|delivery| delivery.summary()),
        "problem": resolved.problem.map(Problem::as_str),
        "password_storage": mailer.key.is_some(),
        "allow_insecure": mailer.allow_insecure(),
        "allowed_ports": ALLOWED_PORTS,
    }))
}

pub(crate) async fn get_settings(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    Ok(Json(view(&state)?))
}

pub(crate) async fn put_settings(
    State(state): State<AppState>,
    request: Request,
) -> Result<Json<Value>, ApiError> {
    let Json(input) = Json::<MailSettingsInput>::from_request(request, &state)
        .await
        .map_err(|rejection| {
            ApiError::new(
                rejection.status(),
                "INVALID_REQUEST",
                "La requête reçue est invalide.",
            )
        })?;
    let previous = state.store.mail_settings().map_err(storage_error)?;
    let settings = validate(&state.mailer, input, previous.as_ref())?;
    state
        .store
        .save_mail_settings(&settings)
        .map_err(storage_error)?;
    state.mailer.invalidate().map_err(storage_error)?;
    Ok(Json(view(&state)?))
}

/// Oublie le réglage : les variables `SMTP_*` reprennent la main.
pub(crate) async fn delete_settings(
    State(state): State<AppState>,
) -> Result<Json<Value>, ApiError> {
    state.store.delete_mail_settings().map_err(storage_error)?;
    state.mailer.invalidate().map_err(storage_error)?;
    Ok(Json(view(&state)?))
}

fn validate(
    mailer: &Mailer,
    input: MailSettingsInput,
    previous: Option<&StoredMailSettings>,
) -> Result<StoredMailSettings, ApiError> {
    let mut fields: BTreeMap<&'static str, &'static str> = BTreeMap::new();
    let host = input
        .host
        .trim()
        .trim_start_matches('[')
        .trim_end_matches(']')
        .to_ascii_lowercase();
    let username = input.username.trim().to_owned();
    let from = input.from.trim().to_owned();
    let security = SmtpTls::parse(&input.security);
    match security {
        None => {
            fields.insert("security", "Choisissez TLS ou STARTTLS.");
        }
        Some(SmtpTls::None) if !mailer.allow_insecure() => {
            fields.insert(
                "security",
                "Une connexion sans TLS n’est permise qu’en développement.",
            );
        }
        _ => {}
    }
    let local_port = security == Some(SmtpTls::None) && mailer.allow_insecure();
    let port = u16::try_from(input.port)
        .ok()
        .filter(|port| ALLOWED_PORTS.contains(port) || (local_port && *port > 0));
    if port.is_none() {
        fields.insert("port", "Choisissez le port 465, 587, 25 ou 2525.");
    }
    if (input.enabled || !host.is_empty()) && !valid_host(&host) {
        fields.insert(
            "host",
            "Indiquez un nom d’hôte, par exemple smtp.hostinger.com, sans https:// ni port.",
        );
    }
    if !valid_text(&username, 254) {
        fields.insert(
            "username",
            "Indiquez un identifiant de 254 caractères au plus, sur une ligne.",
        );
    }
    let address = from
        .parse::<Address>()
        .ok()
        .filter(|_| from.len() <= 254 && valid_text(&from, 254));
    if (input.enabled || !from.is_empty()) && address.is_none() {
        fields.insert(
            "from",
            "Indiquez l’adresse d’expédition, en général celle de la boîte.",
        );
    }
    let new_password = input.password.filter(|password| !password.is_empty());
    if new_password.as_ref().is_some_and(|password| {
        password.len() > MAX_PASSWORD_BYTES || password.chars().any(char::is_control)
    }) {
        fields.insert(
            "password",
            "Le mot de passe tient en 256 octets au plus, sur une ligne.",
        );
    } else if new_password.is_some() && !username.is_empty() && mailer.key.is_none() {
        fields.insert(
            "password",
            "Le mot de passe ne peut pas être chiffré : BACKOFFICE_TOTP_ENCRYPTION_KEY manque dans le .env du serveur.",
        );
    }
    // Sans identifiant, pas d’authentification : un mot de passe ne sert à rien.
    let encrypted_password = if username.is_empty() {
        None
    } else if let (Some(password), Some(key)) = (new_password.as_ref(), mailer.key.as_ref()) {
        Some(
            crate::two_factor::seal(password.as_bytes(), key, PASSWORD_AAD)
                .map_err(storage_error)?,
        )
    } else {
        previous.and_then(|settings| settings.encrypted_password.clone())
    };
    if input.enabled
        && !username.is_empty()
        && encrypted_password.is_none()
        && !fields.contains_key("password")
    {
        fields.insert("password", "Indiquez le mot de passe de la boîte.");
    }
    if !fields.contains_key("host")
        && !host.is_empty()
        && security.is_some_and(|tls| tls != SmtpTls::None)
    {
        // Le nom doit pouvoir servir à vérifier le certificat du serveur.
        let probe = SmtpConfig {
            host: host.clone(),
            port: port.unwrap_or(465),
            username: None,
            password: None,
            from: "portfolio@example.org".parse().expect("static address"),
            tls: security.unwrap_or(SmtpTls::Tls),
        };
        if SmtpDelivery::new(probe).is_err() {
            fields.insert(
                "host",
                "Ce nom d’hôte ne permet pas de vérifier un certificat TLS.",
            );
        }
    }
    if !fields.is_empty() {
        return Err(ApiError::validation(fields));
    }
    Ok(StoredMailSettings {
        enabled: input.enabled,
        host,
        port: port.expect("validated port"),
        security: security.expect("validated security"),
        username,
        encrypted_password,
        from: address.map_or(from, |address| address.to_string()),
        updated_at: String::new(),
    })
}

fn test_failure(status: StatusCode, code: &'static str, message: &'static str) -> ApiError {
    ApiError::new(status, code, message)
}

/// L’e-mail d’essai part vers l’adresse de contact, avec le réglage enregistré
/// (ou le repli du `.env`). Le résultat ne dit rien du serveur ni du secret.
pub(crate) async fn send_test(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    let resolved = state.mailer.resolve(&state.store).map_err(storage_error)?;
    if resolved.problem == Some(Problem::PasswordUnreadable) {
        return Err(test_failure(
            StatusCode::CONFLICT,
            "SMTP_SETTINGS_UNREADABLE",
            "Le mot de passe enregistré ne se déchiffre plus. Saisissez-le à nouveau, enregistrez, puis réessayez.",
        ));
    }
    if resolved.problem == Some(Problem::Invalid) {
        return Err(test_failure(
            StatusCode::CONFLICT,
            "SMTP_SETTINGS_INVALID",
            "Ces réglages ne permettent pas de préparer l’envoi. Vérifiez l’hôte et l’adresse d’expédition, puis enregistrez.",
        ));
    }
    if resolved.problem == Some(Problem::InsecureConnection) {
        return Err(test_failure(
            StatusCode::CONFLICT,
            "SMTP_INSECURE",
            "Une connexion sans TLS n’est permise qu’en développement. Choisissez TLS ou STARTTLS, puis enregistrez.",
        ));
    }
    let Some(delivery) = resolved.delivery else {
        return Err(test_failure(
            StatusCode::CONFLICT,
            "SMTP_NOT_CONFIGURED",
            "Aucun serveur d’envoi n’est actif. Activez l’envoi, enregistrez, puis réessayez.",
        ));
    };
    let recipient: Address = state
        .store
        .contact_email()
        .map_err(storage_error)?
        .parse()
        .map_err(|_| storage_error(StoreError))?;
    if let Err(seconds) = state.mailer.reserve_test() {
        return Err(ApiError::new(
            StatusCode::TOO_MANY_REQUESTS,
            "RATE_LIMITED",
            "Un essai vient de partir. Patientez un instant avant le suivant.",
        )
        .with_retry_after(seconds));
    }
    match delivery.test(recipient.clone()).await {
        Ok(()) => Ok(Json(json!({
            "result": "sent",
            "recipient": recipient.to_string(),
            "message": "Le serveur a accepté l’e-mail d’essai. Vérifiez la boîte de réception, et les indésirables.",
        }))),
        Err(MailTestError::Connection) => Err(test_failure(
            StatusCode::BAD_GATEWAY,
            "SMTP_CONNECTION_FAILED",
            "Connexion impossible au serveur d’envoi. Vérifiez l’hôte, le port et la sécurité (TLS sur 465, STARTTLS sur 587).",
        )),
        Err(MailTestError::Authentication) => Err(test_failure(
            StatusCode::BAD_GATEWAY,
            "SMTP_AUTH_FAILED",
            "Le serveur a refusé l’identifiant ou le mot de passe.",
        )),
        Err(MailTestError::Rejected) => Err(test_failure(
            StatusCode::BAD_GATEWAY,
            "SMTP_SENDER_REJECTED",
            "Le serveur a refusé l’envoi. Vérifiez l’adresse d’expédition : avec Hostinger, celle de la boîte.",
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn host_is_a_name_or_an_address_never_an_url() {
        for host in [
            "smtp.hostinger.com",
            "localhost",
            "127.0.0.1",
            "::1",
            "mail-1.example.org",
        ] {
            assert!(valid_host(host), "{host}");
        }
        for host in [
            "",
            "smtp://smtp.hostinger.com",
            "smtp.hostinger.com:465",
            "smtp.hostinger.com/",
            "user@smtp.hostinger.com",
            "smtp hostinger.com",
            "-smtp.example.org",
            "smtp..example.org",
            "999.1.1.1",
            &"a".repeat(64),
        ] {
            assert!(!valid_host(host), "{host}");
        }
    }

    #[test]
    fn password_subkey_differs_from_the_totp_key() {
        let key = [42; 32];
        assert_ne!(password_key(&key), key);
        let sealed =
            crate::two_factor::seal(b"mot de passe", &password_key(&key), PASSWORD_AAD).unwrap();
        // Ni la clé du .env, ni le domaine TOTP n’ouvrent ce chiffré.
        assert!(crate::two_factor::decrypt(&sealed, &key).is_err());
        assert!(crate::two_factor::decrypt(&sealed, &password_key(&key)).is_err());
        assert_eq!(
            crate::two_factor::open(&sealed, &password_key(&key), PASSWORD_AAD).unwrap(),
            b"mot de passe"
        );
    }

    #[test]
    fn test_emails_are_spaced_and_bounded() {
        let mailer = Mailer::new(None, None);
        assert!(mailer.reserve_test().is_ok());
        assert!(mailer.reserve_test().unwrap_err() >= 1);
        let mut tests = mailer.tests.lock().unwrap();
        tests.clear();
        let past = Instant::now() - TEST_GAP;
        for _ in 0..TESTS_PER_WINDOW {
            tests.push_back(past);
        }
        drop(tests);
        assert!(mailer.reserve_test().unwrap_err() > TEST_GAP.as_secs());
    }

    fn input(security: &str, port: u32, password: Option<&str>) -> MailSettingsInput {
        MailSettingsInput {
            enabled: true,
            host: "smtp.hostinger.com".into(),
            port,
            security: security.into(),
            username: "contact@example.org".into(),
            password: password.map(str::to_owned),
            from: "contact@example.org".into(),
        }
    }

    fn mailer(environment: AppEnvironment) -> Mailer {
        Mailer::new(
            None,
            Some(&BackofficeConfig {
                email: "admin@example.org".into(),
                password: "correct horse battery staple".into(),
                environment,
                totp_encryption_key: Some([42; 32]),
            }),
        )
    }

    async fn refused_fields(result: Result<StoredMailSettings, ApiError>) -> Value {
        use axum::response::IntoResponse;
        let Err(error) = result else {
            panic!("refused")
        };
        let bytes = axum::body::to_bytes(error.into_response().into_body(), usize::MAX)
            .await
            .unwrap();
        serde_json::from_slice::<Value>(&bytes).unwrap()["fields"].clone()
    }

    #[tokio::test]
    async fn outside_development_every_connection_uses_tls_on_a_mail_port() {
        let production = mailer(AppEnvironment::Production);
        let fields =
            refused_fields(validate(&production, input("none", 25, Some("x")), None)).await;
        assert!(fields["security"].is_string());
        let fields =
            refused_fields(validate(&production, input("tls", 1025, Some("x")), None)).await;
        assert!(fields["port"].is_string());
        for (security, port) in [
            ("tls", 465),
            ("starttls", 587),
            ("starttls", 25),
            ("starttls", 2525),
        ] {
            assert!(validate(&production, input(security, port, Some("x")), None).is_ok());
        }
        // En développement, un relais local sans TLS (mailpit, port 1025) est admis.
        let development = mailer(AppEnvironment::Development);
        let mut local = input("none", 1025, Some("x"));
        local.host = "127.0.0.1".into();
        assert!(validate(&development, local, None).is_ok());
        let fields =
            refused_fields(validate(&development, input("tls", 1025, Some("x")), None)).await;
        assert!(fields["port"].is_string());
    }

    #[tokio::test]
    async fn the_password_is_encrypted_at_rest_and_unreadable_with_another_key() {
        let store = Store::in_memory("owner@example.org").unwrap();
        let mailer = mailer(AppEnvironment::Production);
        let settings = validate(&mailer, input("tls", 465, Some("mot-de-passe-clair")), None)
            .ok()
            .unwrap();
        store.save_mail_settings(&settings).unwrap();
        let raw: Vec<u8> = store
            .connection()
            .unwrap()
            .query_row("SELECT encrypted_password FROM mail_settings", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert!(
            !raw.windows(18)
                .any(|window| window == b"mot-de-passe-clair")
        );
        assert!(matches!(mailer.delivery(&store), Delivery::Active(_)));
        // Une autre clé : le réglage ne sert plus, et le backoffice le dit.
        let other = Mailer::new(
            None,
            Some(&BackofficeConfig {
                email: "admin@example.org".into(),
                password: "correct horse battery staple".into(),
                environment: AppEnvironment::Production,
                totp_encryption_key: Some([43; 32]),
            }),
        );
        assert!(matches!(other.delivery(&store), Delivery::Broken));
        assert!(other.resolve(&store).unwrap().problem == Some(Problem::PasswordUnreadable));
    }
}
