use std::collections::BTreeMap;

use lettre::Address;
use serde::Deserialize;

use crate::error::ApiError;

#[derive(Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct ContactRequest {
    pub name: String,
    pub email: String,
    pub subject: String,
    pub message: String,
    pub website: String,
}

pub struct ContactMessage {
    pub name: String,
    pub email: Address,
    pub subject: String,
    pub message: String,
}

impl ContactRequest {
    pub fn validate(self) -> Result<ContactMessage, ApiError> {
        let mut fields = BTreeMap::new();
        let name = self.name.trim().to_owned();
        let email = self.email.trim();
        let subject = self.subject.trim().to_owned();
        let message = self.message.trim().to_owned();

        if !(2..=100).contains(&name.chars().count()) || name.chars().any(char::is_control) {
            fields.insert("name", "Indiquez un nom de 2 à 100 caractères.");
        }
        let address = email.parse::<Address>().ok();
        if email.len() > 254 || email.chars().any(char::is_control) || address.is_none() {
            fields.insert("email", "Indiquez une adresse e-mail valide.");
        }
        if !(3..=160).contains(&subject.chars().count()) || subject.chars().any(char::is_control) {
            fields.insert("subject", "Indiquez un sujet de 3 à 160 caractères.");
        }
        if !(10..=5_000).contains(&message.chars().count())
            || message
                .chars()
                .any(|character| character.is_control() && !['\n', '\r', '\t'].contains(&character))
        {
            fields.insert("message", "Écrivez un message de 10 à 5 000 caractères.");
        }
        if !fields.is_empty() {
            return Err(ApiError::validation(fields));
        }
        if !self.website.trim().is_empty() {
            return Err(ApiError::new(
                axum::http::StatusCode::UNPROCESSABLE_ENTITY,
                "INVALID_FORM",
                "Le formulaire n’a pas pu être envoyé. Vous pouvez me contacter par e-mail.",
            ));
        }
        Ok(ContactMessage {
            name,
            email: address.expect("validated address"),
            subject,
            message,
        })
    }
}

/// La conservation des demandes : au démarrage puis chaque heure, les demandes
/// reçues il y a plus de trois ans (`storage::CONTACT_RETENTION_YEARS`) sont
/// supprimées. Le journal ne dit que leur nombre.
pub fn spawn_retention(
    store: std::sync::Arc<crate::storage::Store>,
) -> tokio::task::JoinHandle<()> {
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(60 * 60));
        loop {
            interval.tick().await;
            let store = store.clone();
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map_or(0, |elapsed| elapsed.as_secs() as i64);
            match tokio::task::spawn_blocking(move || store.purge_expired_contacts(now)).await {
                Ok(Ok(0)) => {}
                Ok(Ok(count)) => {
                    eprintln!("{count} demande(s) de contact de plus de trois ans supprimée(s).")
                }
                _ => eprintln!("La conservation des demandes de contact n’a pas pu être vérifiée."),
            }
        }
    })
}
