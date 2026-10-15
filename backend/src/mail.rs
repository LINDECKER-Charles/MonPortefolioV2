use std::{future::Future, pin::Pin, time::Duration};

use lettre::{
    Address, AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
    message::{Mailbox, header::ContentType},
    transport::smtp::{Error as SmtpError, authentication::Credentials},
};
use serde::Serialize;

use crate::{
    config::{SmtpConfig, SmtpTls},
    contact::ContactMessage,
};

pub struct DeliveryError;

pub type DeliveryFuture<'a> = Pin<Box<dyn Future<Output = Result<(), DeliveryError>> + Send + 'a>>;

/// Pourquoi l’e-mail d’essai n’est pas parti, sans rien du serveur ni du secret.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MailTestError {
    /// Hôte injoignable, port fermé, TLS refusé ou serveur muet.
    Connection,
    /// Identifiant ou mot de passe refusé.
    Authentication,
    /// Le serveur a refusé l’expéditeur, le destinataire ou le message.
    Rejected,
}

pub type MailTestFuture<'a> = Pin<Box<dyn Future<Output = Result<(), MailTestError>> + Send + 'a>>;

/// Ce qu’on peut montrer d’un serveur d’envoi : jamais l’identifiant ni le mot de passe.
#[derive(Clone, Debug, Serialize, PartialEq, Eq)]
pub struct SmtpSummary {
    pub host: String,
    pub port: u16,
    pub security: &'static str,
    pub from: String,
}

pub trait MailDelivery: Send + Sync {
    fn deliver(&self, contact: ContactMessage, recipient: Address) -> DeliveryFuture<'_>;

    /// Envoie l’e-mail d’essai du backoffice. Un envoi qui ne passe pas par SMTP
    /// ne sait pas s’éprouver : il répond « connexion impossible ».
    fn test(&self, _recipient: Address) -> MailTestFuture<'_> {
        Box::pin(async { Err(MailTestError::Connection) })
    }

    /// Le serveur utilisé, pour le backoffice.
    fn summary(&self) -> Option<SmtpSummary> {
        None
    }
}

pub struct SmtpDelivery {
    transport: AsyncSmtpTransport<Tokio1Executor>,
    from: Mailbox,
    summary: SmtpSummary,
}

/// Le délai de chaque échange SMTP, et celui d’un envoi complet.
const COMMAND_TIMEOUT: Duration = Duration::from_secs(10);
const SEND_TIMEOUT: Duration = Duration::from_secs(15);

impl SmtpDelivery {
    /// Construit le transport ; à appeler dans le runtime Tokio (le pool de
    /// connexions y lance sa tâche).
    pub fn new(config: SmtpConfig) -> Result<Self, String> {
        let builder = match config.tls {
            SmtpTls::StartTls => AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&config.host),
            SmtpTls::Tls => AsyncSmtpTransport::<Tokio1Executor>::relay(&config.host),
            SmtpTls::None => Ok(AsyncSmtpTransport::<Tokio1Executor>::builder_dangerous(
                &config.host,
            )),
        }
        .map_err(|_| "La configuration TLS du relais SMTP est invalide".to_owned())?
        .port(config.port)
        .timeout(Some(COMMAND_TIMEOUT));
        let builder = match (config.username, config.password) {
            (Some(username), Some(password)) => {
                builder.credentials(Credentials::new(username, password))
            }
            _ => builder,
        };
        Ok(Self {
            transport: builder.build(),
            summary: SmtpSummary {
                host: config.host,
                port: config.port,
                security: config.tls.as_str(),
                from: config.from.email.to_string(),
            },
            from: config.from,
        })
    }

    fn message(
        &self,
        contact: ContactMessage,
        recipient: Address,
    ) -> Result<Message, DeliveryError> {
        let body = format!(
            "Message envoyé depuis le formulaire du portfolio.\n\nNom : {}\nE-mail : {}\nSujet : {}\n\n{}\n",
            contact.name, contact.email, contact.subject, contact.message
        );
        Message::builder()
            .from(self.from.clone())
            .to(Mailbox::new(None, recipient))
            .reply_to(Mailbox::new(Some(contact.name), contact.email))
            .subject(format!("[Portfolio] {}", contact.subject))
            .header(ContentType::TEXT_PLAIN)
            .body(body)
            .map_err(|_| DeliveryError)
    }

    fn test_message(&self, recipient: Address) -> Result<Message, MailTestError> {
        Message::builder()
            .from(self.from.clone())
            .to(Mailbox::new(None, recipient))
            .subject("[Portfolio] E-mail d’essai")
            .header(ContentType::TEXT_PLAIN)
            .body(
                "Cet e-mail d’essai vient du backoffice du portfolio.\n\n\
                 Le serveur d’envoi fonctionne : les nouvelles demandes de contact \
                 seront notifiées à cette adresse.\n"
                    .to_owned(),
            )
            .map_err(|_| MailTestError::Rejected)
    }

    async fn run_test(&self, recipient: Address) -> Result<(), MailTestError> {
        // La connexion d’abord (TLS et authentification comprises), puis l’envoi :
        // chaque étape a sa raison d’échouer.
        match self.transport.test_connection().await {
            Ok(true) => {}
            Ok(false) => return Err(MailTestError::Connection),
            Err(error) => return Err(classify(&error, MailTestError::Connection)),
        }
        let message = self.test_message(recipient)?;
        self.transport
            .send(message)
            .await
            .map(|_| ())
            .map_err(|error| classify(&error, MailTestError::Rejected))
    }
}

/// Une réponse SMTP d’authentification (530, 534, 535, 538) dit l’identifiant ;
/// une autre réponse du serveur, `refusal` ; tout le reste (réseau, TLS,
/// délai), la connexion.
fn classify(error: &SmtpError, refusal: MailTestError) -> MailTestError {
    match error.status().map(u16::from) {
        Some(530 | 534 | 535 | 538) => MailTestError::Authentication,
        Some(_) => refusal,
        None => MailTestError::Connection,
    }
}

impl MailDelivery for SmtpDelivery {
    fn deliver(&self, contact: ContactMessage, recipient: Address) -> DeliveryFuture<'_> {
        Box::pin(async move {
            let message = self.message(contact, recipient)?;
            // La réponse publique ne reprend jamais une erreur SMTP ni le contenu envoyé.
            tokio::time::timeout(SEND_TIMEOUT, self.transport.send(message))
                .await
                .map_err(|_| DeliveryError)?
                .map_err(|_| DeliveryError)?;
            Ok(())
        })
    }

    fn test(&self, recipient: Address) -> MailTestFuture<'_> {
        Box::pin(async move {
            tokio::time::timeout(SEND_TIMEOUT, self.run_test(recipient))
                .await
                .map_err(|_| MailTestError::Connection)?
        })
    }

    fn summary(&self) -> Option<SmtpSummary> {
        Some(self.summary.clone())
    }
}
