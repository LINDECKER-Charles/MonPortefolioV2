use std::{
    collections::HashMap,
    net::IpAddr,
    sync::Mutex,
    time::{Duration, Instant},
};

const ATTEMPTS: u32 = 2;
const WINDOW: Duration = Duration::from_secs(60 * 60);
const MAX_CLIENTS: usize = 10_000;

struct Bucket {
    count: u32,
    started: Instant,
}

/// Limite les tentatives, y compris les requêtes invalides et les échecs SMTP.
/// Les entrées expirent au bout d’une heure ; la mémoire reste bornée.
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
                let seconds = remaining
                    .as_secs()
                    .saturating_add(u64::from(remaining.subsec_nanos() > 0));
                return Err(seconds);
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
        assert_eq!(limiter.check_at(address, now), Err(3600));
        assert_eq!(
            limiter.check_at(address, now + Duration::from_secs(3599)),
            Err(1)
        );
        assert_eq!(limiter.check_at(address, now + WINDOW), Ok(()));
    }

    #[test]
    fn retry_after_rounds_up_only_a_remaining_fractional_second() {
        let limiter = RateLimiter::default();
        let address = "192.0.2.1".parse().unwrap();
        let now = Instant::now();
        for _ in 0..ATTEMPTS {
            assert_eq!(limiter.check_at(address, now), Ok(()));
        }
        assert_eq!(
            limiter.check_at(address, now + WINDOW - Duration::from_millis(1001)),
            Err(2)
        );
        assert_eq!(
            limiter.check_at(address, now + WINDOW - Duration::from_millis(1)),
            Err(1)
        );
        assert_eq!(limiter.check_at(address, now + WINDOW), Ok(()));
    }

    #[test]
    fn concurrent_attempts_cannot_exceed_the_per_client_limit() {
        let limiter = RateLimiter::default();
        let barrier = std::sync::Barrier::new(20);
        let address = "192.0.2.1".parse().unwrap();
        let accepted = std::thread::scope(|scope| {
            let attempts: Vec<_> = (0..20)
                .map(|_| {
                    scope.spawn(|| {
                        barrier.wait();
                        limiter.check(address).is_ok()
                    })
                })
                .collect();
            attempts
                .into_iter()
                .map(|attempt| attempt.join().unwrap())
                .filter(|accepted| *accepted)
                .count()
        });
        assert_eq!(accepted, ATTEMPTS as usize);
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
