pub mod admin;
pub mod blog;
mod blog_media;
pub mod config;
pub mod contact;
pub mod error;
pub mod mail;
pub mod mcp;
mod rate_limit;
pub mod routes;
pub mod storage;
mod two_factor;
pub mod usage;

use std::sync::Arc;

use tokio::sync::Semaphore;

use crate::{mail::MailDelivery, rate_limit::RateLimiter, storage::Store};

#[derive(Clone)]
pub struct AppState {
    pub(crate) delivery: Option<Arc<dyn MailDelivery>>,
    pub(crate) proxy_token: Option<Arc<str>>,
    limiter: Arc<RateLimiter>,
    mail_slots: Arc<Semaphore>,
    pub(crate) store: Arc<Store>,
    pub(crate) admin_auth: Arc<admin::AdminAuth>,
}

impl AppState {
    pub fn new(delivery: Option<Arc<dyn MailDelivery>>, proxy_token: Option<String>) -> Self {
        Self::with_store(
            delivery,
            proxy_token,
            Arc::new(Store::in_memory("owner@example.org").expect("in-memory database")),
            None,
            true,
        )
        .expect("in-memory authentication")
    }

    pub fn with_store(
        delivery: Option<Arc<dyn MailDelivery>>,
        proxy_token: Option<String>,
        store: Arc<Store>,
        backoffice: Option<config::BackofficeConfig>,
        secure_cookie: bool,
    ) -> Result<Self, String> {
        let password_hash = store.bind_admin_credentials(backoffice.as_ref(), secure_cookie)
            .map_err(|_| "Impossible d’initialiser l’authentification du backoffice ; vérifier la base et la clé 2FA".to_owned())?;
        Ok(Self {
            delivery,
            proxy_token: proxy_token.map(Arc::from),
            limiter: Arc::new(RateLimiter::default()),
            mail_slots: Arc::new(Semaphore::new(16)),
            store,
            admin_auth: Arc::new(admin::AdminAuth::new(
                backoffice,
                password_hash,
                secure_cookie,
            )),
        })
    }
}
