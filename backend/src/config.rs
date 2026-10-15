use std::{env, net::SocketAddr, path::PathBuf};

use lettre::{Address, message::Mailbox};

pub struct Config {
    pub address: SocketAddr,
    pub recipient: Option<Address>,
    pub smtp: Option<SmtpConfig>,
    pub proxy_token: Option<String>,
    pub database_path: PathBuf,
    pub backoffice: Option<BackofficeConfig>,
    pub secure_cookie: bool,
}

#[derive(Clone)]
pub struct BackofficeConfig {
    pub email: String,
    pub password: String,
    pub environment: AppEnvironment,
    pub totp_encryption_key: Option<[u8; 32]>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AppEnvironment {
    Development,
    Test,
    Production,
}

impl AppEnvironment {
    pub fn requires_two_factor(self) -> bool {
        self != Self::Development
    }
}

pub struct SmtpConfig {
    pub host: String,
    pub port: u16,
    pub username: Option<String>,
    pub password: Option<String>,
    pub from: Mailbox,
    pub tls: SmtpTls,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SmtpTls {
    StartTls,
    Tls,
    None,
}

impl SmtpTls {
    /// Le nom employé par `SMTP_TLS` et par l’API du backoffice.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::StartTls => "starttls",
            Self::Tls => "tls",
            Self::None => "none",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "starttls" => Some(Self::StartTls),
            "tls" => Some(Self::Tls),
            "none" => Some(Self::None),
            _ => None,
        }
    }
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        load_dotenv()?;
        Self::from_lookup(|key| env::var(key).ok())
    }

    fn from_lookup(lookup: impl Fn(&str) -> Option<String>) -> Result<Self, String> {
        let value = |key: &str| lookup(key).filter(|value| !value.trim().is_empty());
        let address = value("BACKEND_ADDR")
            .unwrap_or_else(|| "127.0.0.1:8080".into())
            .parse()
            .map_err(|_| "BACKEND_ADDR doit être une adresse IP avec un port".to_owned())?;
        let recipient = value("CONTACT_EMAIL")
            .map(|email| {
                if !valid_contact_email(email.trim()) {
                    return Err(
                        "CONTACT_EMAIL doit être une adresse e-mail simple et valide".to_owned(),
                    );
                }
                email
                    .trim()
                    .parse::<Address>()
                    .map_err(|_| "CONTACT_EMAIL doit être une adresse e-mail valide".to_owned())
            })
            .transpose()?;
        let database_path = PathBuf::from(
            value("DATABASE_PATH").unwrap_or_else(|| "data/portfolio.sqlite3".into()),
        );
        let environment = match value("APP_ENV").as_deref().unwrap_or("production") {
            "development" => AppEnvironment::Development,
            "test" => AppEnvironment::Test,
            "production" => AppEnvironment::Production,
            _ => return Err("APP_ENV doit valoir development, test ou production".into()),
        };
        let email = value("BACKOFFICE_EMAIL");
        // Conserver le mot de passe exactement tel qu’il est injecté, sans le normaliser.
        let password = lookup("BACKOFFICE_PASSWORD").filter(|password| !password.is_empty());
        let backoffice = match (email, password) {
            (None, None) => None,
            (Some(email), Some(password)) => {
                if !valid_contact_email(email.trim()) {
                    return Err("BACKOFFICE_EMAIL doit être une adresse e-mail valide".into());
                }
                if !(12..=1_024).contains(&password.len()) {
                    return Err("BACKOFFICE_PASSWORD doit contenir 12 à 1 024 octets".into());
                }
                let key = value("BACKOFFICE_TOTP_ENCRYPTION_KEY")
                    .map(|value| parse_encryption_key(&value))
                    .transpose()?;
                if environment.requires_two_factor() && key.is_none() {
                    return Err(
                        "BACKOFFICE_TOTP_ENCRYPTION_KEY est obligatoire hors développement".into(),
                    );
                }
                Some(BackofficeConfig {
                    email: email.trim().to_ascii_lowercase(),
                    password,
                    environment,
                    totp_encryption_key: key,
                })
            }
            _ => {
                return Err(
                    "BACKOFFICE_EMAIL et BACKOFFICE_PASSWORD doivent être renseignés ensemble"
                        .into(),
                );
            }
        };
        let secure_cookie = match value("BACKOFFICE_COOKIE_SECURE")
            .as_deref()
            .unwrap_or("true")
        {
            "true" => true,
            "false" => false,
            _ => return Err("BACKOFFICE_COOKIE_SECURE doit valoir true ou false".into()),
        };
        let proxy_token = lookup("BACKEND_PROXY_TOKEN").filter(|token| !token.is_empty());
        if proxy_token.as_ref().is_some_and(|token| {
            !(32..=256).contains(&token.len()) || !token.bytes().all(|byte| byte.is_ascii_graphic())
        }) {
            return Err(
                "BACKEND_PROXY_TOKEN doit contenir 32 à 256 caractères ASCII imprimables sans espace"
                    .into(),
            );
        }

        let smtp = if let Some(host) = value("SMTP_HOST") {
            if host.chars().any(char::is_control) || host != host.trim() {
                return Err("SMTP_HOST est invalide".into());
            }
            let tls = match value("SMTP_TLS").as_deref().unwrap_or("starttls") {
                "starttls" => SmtpTls::StartTls,
                "tls" => SmtpTls::Tls,
                "none" if is_loopback_host(&host) => SmtpTls::None,
                "none" => return Err("SMTP_TLS=none est réservé à un relais local".into()),
                _ => return Err("SMTP_TLS doit valoir starttls, tls ou none".into()),
            };
            let port = value("SMTP_PORT")
                .map(|port| port.parse::<u16>())
                .transpose()
                .map_err(|_| "SMTP_PORT doit être un port valide".to_owned())?
                .unwrap_or(match tls {
                    SmtpTls::StartTls => 587,
                    SmtpTls::Tls => 465,
                    SmtpTls::None => 25,
                });
            if port == 0 {
                return Err("SMTP_PORT doit être supérieur à zéro".into());
            }
            let from_value =
                value("SMTP_FROM").ok_or("SMTP_FROM est obligatoire avec SMTP_HOST")?;
            if from_value.chars().any(char::is_control) {
                return Err("SMTP_FROM doit être une adresse e-mail valide".into());
            }
            let from = from_value
                .parse()
                .map_err(|_| "SMTP_FROM doit être une adresse e-mail valide".to_owned())?;
            let username = value("SMTP_USERNAME");
            let password = value("SMTP_PASSWORD");
            if username.is_some() != password.is_some() {
                return Err(
                    "SMTP_USERNAME et SMTP_PASSWORD doivent être renseignés ensemble".into(),
                );
            }
            Some(SmtpConfig {
                host,
                port,
                username,
                password,
                from,
                tls,
            })
        } else {
            None
        };
        Ok(Self {
            address,
            recipient,
            smtp,
            proxy_token,
            database_path,
            backoffice,
            secure_cookie,
        })
    }
}

fn parse_encryption_key(value: &str) -> Result<[u8; 32], String> {
    let invalid =
        || "BACKOFFICE_TOTP_ENCRYPTION_KEY doit contenir 64 caractères hexadécimaux".to_owned();
    if value.len() != 64 || !value.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return Err(invalid());
    }
    let mut key = [0; 32];
    for (index, byte) in key.iter_mut().enumerate() {
        *byte = u8::from_str_radix(&value[index * 2..index * 2 + 2], 16).map_err(|_| invalid())?;
    }
    Ok(key)
}

/// Le destinataire est aussi interpolé dans les pages publiques du serveur statique.
pub fn valid_contact_email(email: &str) -> bool {
    if email.len() > 254 || email.contains("..") || email != email.trim() {
        return false;
    }
    let Some((local, domain)) = email.split_once('@') else {
        return false;
    };
    if local.is_empty()
        || !local
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || b"._%+-".contains(&byte))
    {
        return false;
    }
    if !domain
        .bytes()
        .all(|byte| byte.is_ascii_alphanumeric() || b".-".contains(&byte))
    {
        return false;
    }
    let Some((before, tld)) = domain.rsplit_once('.') else {
        return false;
    };
    !before.is_empty()
        && tld.len() >= 2
        && tld.bytes().all(|byte| byte.is_ascii_alphabetic())
        && email.parse::<Address>().is_ok()
}

fn is_loopback_host(host: &str) -> bool {
    host.eq_ignore_ascii_case("localhost")
        || host
            .trim_matches(['[', ']'])
            .parse::<std::net::IpAddr>()
            .is_ok_and(|address| address.is_loopback())
}

/// Cherche l’environnement commun dans le dossier courant puis ses parents.
/// Les variables déjà injectées par Compose ou le shell restent prioritaires.
fn load_dotenv() -> Result<(), String> {
    let mut directory: PathBuf = env::current_dir()
        .map_err(|_| "Impossible de trouver le dossier de démarrage".to_owned())?;
    loop {
        let path = directory.join(".env");
        if path.is_file() {
            return dotenvy::from_path(path)
                .map_err(|_| "Le fichier .env est illisible ou invalide".to_owned());
        }
        if !directory.pop() {
            return Ok(());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(pairs: &[(&str, &str)]) -> Result<Config, String> {
        Config::from_lookup(|key| {
            pairs
                .iter()
                .find(|(name, _)| *name == key)
                .map(|(_, value)| (*value).into())
        })
    }

    #[test]
    fn validates_email_password_environment_and_two_factor_key() {
        let credentials = [
            ("BACKOFFICE_EMAIL", "admin@example.org"),
            ("BACKOFFICE_PASSWORD", "long enough password"),
        ];
        assert!(parse(&credentials).is_err());
        assert!(parse(&[("BACKOFFICE_EMAIL", "admin@example.org")]).is_err());
        assert!(parse(&[("BACKOFFICE_PASSWORD", "long enough password")]).is_err());
        assert!(parse(&[("APP_ENV", "dev")]).is_err());
        for environment in ["production", "test"] {
            let config = parse(&[
                credentials[0],
                credentials[1],
                ("APP_ENV", environment),
                ("BACKOFFICE_TOTP_ENCRYPTION_KEY", &"42".repeat(32)),
            ])
            .unwrap();
            assert!(config.backoffice.unwrap().environment.requires_two_factor());
        }
        let development =
            parse(&[credentials[0], credentials[1], ("APP_ENV", "development")]).unwrap();
        assert!(
            !development
                .backoffice
                .unwrap()
                .environment
                .requires_two_factor()
        );
        for key in ["42".repeat(31), "x".repeat(64)] {
            assert!(
                parse(&[
                    credentials[0],
                    credentials[1],
                    ("BACKOFFICE_TOTP_ENCRYPTION_KEY", &key)
                ])
                .is_err()
            );
        }
        let default = parse(&[
            credentials[0],
            credentials[1],
            ("BACKOFFICE_TOTP_ENCRYPTION_KEY", &"42".repeat(32)),
        ])
        .unwrap();
        assert_eq!(
            default.backoffice.unwrap().environment,
            AppEnvironment::Production
        );
    }

    #[test]
    fn starts_without_smtp_and_can_reuse_an_existing_database_recipient() {
        assert!(parse(&[]).unwrap().recipient.is_none());
        let config = parse(&[("CONTACT_EMAIL", "owner@example.org")]).unwrap();
        assert!(config.smtp.is_none());
        assert_eq!(config.address.to_string(), "127.0.0.1:8080");
    }

    #[test]
    fn defaults_to_required_starttls() {
        let config = parse(&[
            ("CONTACT_EMAIL", "owner@example.org"),
            ("SMTP_HOST", "smtp.example.org"),
            ("SMTP_FROM", "Portfolio <sender@example.org>"),
        ])
        .unwrap();
        let smtp = config.smtp.unwrap();
        assert_eq!(smtp.port, 587);
        assert_eq!(smtp.tls, SmtpTls::StartTls);
    }

    #[test]
    fn rejects_insecure_remote_smtp_and_partial_credentials() {
        for extra in [
            ("SMTP_TLS", "none"),
            ("SMTP_USERNAME", "user"),
            ("SMTP_PORT", "0"),
        ] {
            assert!(
                parse(&[
                    ("CONTACT_EMAIL", "owner@example.org"),
                    ("SMTP_HOST", "smtp.example.org"),
                    ("SMTP_FROM", "sender@example.org"),
                    extra,
                ])
                .is_err()
            );
        }
    }

    #[test]
    fn allows_an_explicit_local_smtp_for_development() {
        let config = parse(&[
            ("CONTACT_EMAIL", "owner@example.org"),
            ("SMTP_HOST", "127.0.0.1"),
            ("SMTP_FROM", "sender@example.org"),
            ("SMTP_TLS", "none"),
            ("SMTP_PORT", "1025"),
        ])
        .unwrap();
        assert_eq!(config.smtp.unwrap().port, 1025);
    }

    #[test]
    fn validates_the_shared_proxy_token_for_http_headers() {
        for token in [
            "a".repeat(31),
            "a".repeat(257),
            "a ".repeat(20),
            " ".repeat(64),
            "é".repeat(40),
        ] {
            assert!(
                parse(&[
                    ("CONTACT_EMAIL", "owner@example.org"),
                    ("BACKEND_PROXY_TOKEN", &token),
                ])
                .is_err()
            );
        }
        assert!(
            parse(&[
                ("CONTACT_EMAIL", "owner@example.org"),
                ("BACKEND_PROXY_TOKEN", &"a".repeat(64)),
            ])
            .is_ok()
        );
    }
}
