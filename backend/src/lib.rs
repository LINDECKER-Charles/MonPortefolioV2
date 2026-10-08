pub mod config;
pub mod contact;
pub mod error;
pub mod mail;
mod rate_limit;
pub mod routes;

use std::sync::Arc;

use tokio::sync::Semaphore;

use crate::{mail::MailDelivery, rate_limit::RateLimiter};

#[derive(Clone)]
pub struct AppState {
    delivery: Option<Arc<dyn MailDelivery>>,
    proxy_token: Option<Arc<str>>,
    limiter: Arc<RateLimiter>,
    mail_slots: Arc<Semaphore>,
}

impl AppState {
    pub fn new(delivery: Option<Arc<dyn MailDelivery>>, proxy_token: Option<String>) -> Self {
        Self {
            delivery,
            proxy_token: proxy_token.map(Arc::from),
            limiter: Arc::new(RateLimiter::default()),
            mail_slots: Arc::new(Semaphore::new(16)),
        }
    }
}
