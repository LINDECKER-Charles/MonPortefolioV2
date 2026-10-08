use std::{
    collections::HashMap,
    net::IpAddr,
    sync::Mutex,
    time::{Duration, Instant},
};

const ATTEMPTS: u32 = 5;
const WINDOW: Duration = Duration::from_secs(10 * 60);
const MAX_CLIENTS: usize = 10_000;

struct Bucket {
    count: u32,
    started: Instant,
}

/// Limite les tentatives, y compris les requêtes invalides et les échecs SMTP.
/// Les entrées expirent au bout de dix minutes ; la mémoire reste bornée.
pub struct RateLimiter {
    clients: Mutex<HashMap<IpAddr, Bucket>>,
}

impl Default for RateLimiter {
    fn default() -> Self {
        Self {
            clients: Mutex::new(HashMap::new()),
        }
    }
}

impl RateLimiter {
    pub fn check(&self, address: IpAddr) -> Result<(), u64> {
        self.check_at(address, Instant::now())
    }

    fn check_at(&self, address: IpAddr, now: Instant) -> Result<(), u64> {
        let mut clients = self
            .clients
            .lock()
            .unwrap_or_else(|error| error.into_inner());
        clients.retain(|_, bucket| now.duration_since(bucket.started) < WINDOW);
        if let Some(bucket) = clients.get_mut(&address) {
            if bucket.count >= ATTEMPTS {
                let remaining = WINDOW.saturating_sub(now.duration_since(bucket.started));
                return Err(remaining.as_secs().saturating_add(1));
            }
            bucket.count += 1;
            return Ok(());
        }
        if clients.len() >= MAX_CLIENTS {
            return Err(60);
        }
        clients.insert(
            address,
            Bucket {
                count: 1,
                started: now,
            },
        );
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resets_after_the_window_without_refreshing_blocked_clients() {
        let limiter = RateLimiter::default();
        let address = "192.0.2.1".parse().unwrap();
        let now = Instant::now();
        for _ in 0..ATTEMPTS {
            assert_eq!(limiter.check_at(address, now), Ok(()));
        }
        assert!(limiter.check_at(address, now).is_err());
        assert!(
            limiter
                .check_at(address, now + Duration::from_secs(599))
                .is_err()
        );
        assert_eq!(limiter.check_at(address, now + WINDOW), Ok(()));
    }

    #[test]
    fn caps_memory_without_evicting_active_limits() {
        let limiter = RateLimiter::default();
        let now = Instant::now();
        for index in 0..MAX_CLIENTS {
            let address = IpAddr::V4(std::net::Ipv4Addr::from(index as u32));
            assert_eq!(limiter.check_at(address, now), Ok(()));
        }
        assert_eq!(limiter.check_at("192.0.2.1".parse().unwrap(), now), Err(60));
        assert_eq!(
            limiter.check_at("192.0.2.1".parse().unwrap(), now + WINDOW),
            Ok(())
        );
        assert_eq!(limiter.clients.lock().unwrap().len(), 1);
    }
}
