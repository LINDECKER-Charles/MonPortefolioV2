use std::{future::Future, pin::Pin, time::Duration};

use lettre::{
    Address, AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
    message::{Mailbox, header::ContentType},
    transport::smtp::authentication::Credentials,
};

use crate::{
    config::{SmtpConfig, SmtpTls},
    contact::ContactMessage,
};

pub struct DeliveryError;

pub type DeliveryFuture<'a> = Pin<Box<dyn Future<Output = Result<(), DeliveryError>> + Send + 'a>>;

pub trait MailDelivery: Send + Sync {
    fn deliver(&self, contact: ContactMessage) -> DeliveryFuture<'_>;
}

pub struct SmtpDelivery {
    transport: AsyncSmtpTransport<Tokio1Executor>,
    recipient: Address,
    from: Mailbox,
}

impl SmtpDelivery {
    pub fn new(config: SmtpConfig, recipient: Address) -> Result<Self, String> {
        let builder = match config.tls {
            SmtpTls::StartTls => AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&config.host),
            SmtpTls::Tls => AsyncSmtpTransport::<Tokio1Executor>::relay(&config.host),
            SmtpTls::None => Ok(AsyncSmtpTransport::<Tokio1Executor>::builder_dangerous(
                &config.host,
            )),
        }
        .map_err(|_| "La configuration TLS du relais SMTP est invalide".to_owned())?
        .port(config.port)
        .timeout(Some(Duration::from_secs(10)));
        let builder = match (config.username, config.password) {
            (Some(username), Some(password)) => {
                builder.credentials(Credentials::new(username, password))
            }
            _ => builder,
        };
        Ok(Self {
            transport: builder.build(),
            recipient,
            from: config.from,
        })
    }

    fn message(&self, contact: ContactMessage) -> Result<Message, DeliveryError> {
        let body = format!(
            "Message envoyé depuis le formulaire du portfolio.\n\nNom : {}\nE-mail : {}\nSujet : {}\n\n{}\n",
            contact.name, contact.email, contact.subject, contact.message
        );
        Message::builder()
            .from(self.from.clone())
            .to(Mailbox::new(None, self.recipient.clone()))
            .reply_to(Mailbox::new(Some(contact.name), contact.email))
            .subject(format!("[Portfolio] {}", contact.subject))
            .header(ContentType::TEXT_PLAIN)
            .body(body)
            .map_err(|_| DeliveryError)
    }
}

impl MailDelivery for SmtpDelivery {
    fn deliver(&self, contact: ContactMessage) -> DeliveryFuture<'_> {
        Box::pin(async move {
            let message = self.message(contact)?;
            // La réponse publique ne reprend jamais une erreur SMTP ni le contenu envoyé.
            tokio::time::timeout(Duration::from_secs(15), self.transport.send(message))
                .await
                .map_err(|_| DeliveryError)?
                .map_err(|_| DeliveryError)?;
            Ok(())
        })
    }
}
