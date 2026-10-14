use std::{net::IpAddr, net::SocketAddr};

use axum::{
    Json, Router,
    extract::{ConnectInfo, DefaultBodyLimit, FromRequest, Request, State},
    http::{HeaderMap, StatusCode, header},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use serde_json::{Value, json};
use subtle::ConstantTimeEq;

use crate::{AppState, contact::ContactRequest, error::ApiError};

pub const MAX_BODY_BYTES: usize = 24 * 1024;

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/api/health", get(health))
        .route("/api/contact", post(contact))
        .route("/api/config/contact", get(contact_config))
        .merge(crate::admin::routes(state.clone()))
        .merge(crate::mcp::routes(state.clone()))
        .merge(crate::blog::routes(state.clone()))
        .fallback(|| async {
            ApiError::new(
                StatusCode::NOT_FOUND,
                "NOT_FOUND",
                "Cette route n’existe pas.",
            )
        })
        .method_not_allowed_fallback(|| async {
            ApiError::new(
                StatusCode::METHOD_NOT_ALLOWED,
                "METHOD_NOT_ALLOWED",
                "Cette méthode n’est pas disponible.",
            )
        })
        .layer(DefaultBodyLimit::max(MAX_BODY_BYTES))
        .layer(middleware::from_fn(response_headers))
        .with_state(state)
}

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok", "service": "portfolio-backend" }))
}

async fn contact_config(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    Ok(Json(
        json!({"email":state.store.contact_email().map_err(crate::admin::storage_error)?}),
    ))
}

async fn contact(
    State(state): State<AppState>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    request: Request,
) -> Result<Json<Value>, ApiError> {
    let client = client_ip(peer, request.headers(), state.proxy_token.as_deref());
    state
        .limiter
        .check(client)
        .map_err(ApiError::rate_limited)?;
    let Json(payload) = Json::<ContactRequest>::from_request(request, &state)
        .await
        .map_err(|rejection| {
            let status = rejection.status();
            match status {
                StatusCode::PAYLOAD_TOO_LARGE => ApiError::new(
                    status,
                    "PAYLOAD_TOO_LARGE",
                    "Le message dépasse la taille autorisée.",
                ),
                StatusCode::UNSUPPORTED_MEDIA_TYPE => ApiError::new(
                    status,
                    "UNSUPPORTED_MEDIA_TYPE",
                    "Le formulaire doit être envoyé au format JSON.",
                ),
                _ => ApiError::new(
                    status,
                    "INVALID_REQUEST",
                    "Le formulaire reçu est invalide.",
                ),
            }
        })?;
    let message = payload.validate()?;
    let recipient: Option<lettre::Address> = if state.delivery.is_some() {
        Some(
            state
                .store
                .contact_email()
                .map_err(crate::admin::storage_error)?
                .parse()
                .map_err(|_| crate::admin::storage_error(crate::storage::StoreError))?,
        )
    } else {
        None
    };
    let initial_status = if state.delivery.is_some() {
        "pending"
    } else {
        "unconfigured"
    };
    let id = state
        .store
        .save_contact(&message, initial_status)
        .map_err(crate::admin::storage_error)?;
    if let (Some(delivery), Some(recipient)) = (state.delivery.as_ref(), recipient) {
        // La persistance précède toujours la notification, y compris si SMTP est indisponible.
        let store = state.store.clone();
        let delivery = delivery.clone();
        let permit = state.mail_slots.clone().try_acquire_owned();
        // L’envoi et sa mise à jour continuent même si le client ferme sa connexion.
        let notification = tokio::spawn(async move {
            let sent = match permit {
                Ok(_permit) => delivery.deliver(message, recipient).await.is_ok(),
                Err(_) => false,
            };
            store.set_delivery_status(id, if sent { "sent" } else { "failed" })
        });
        if !matches!(notification.await, Ok(Ok(()))) {
            eprintln!("Le statut de notification d’une demande n’a pas pu être enregistré.");
        }
    }
    Ok(Json(json!({
        "message": "Votre message a bien été enregistré. Merci pour votre prise de contact."
    })))
}

pub(crate) fn client_ip(
    peer: SocketAddr,
    headers: &HeaderMap,
    expected_token: Option<&str>,
) -> IpAddr {
    let peer_ip = normalize_ip(peer.ip());
    let trusted_peer = match peer_ip {
        IpAddr::V4(address) => address.is_loopback() || address.is_private(),
        IpAddr::V6(address) => address.is_loopback() || address.is_unique_local(),
    };
    if trusted_peer
        && let Some(expected) = expected_token
        && let Some(supplied) = headers.get("x-contact-proxy-token")
        && bool::from(supplied.as_bytes().ct_eq(expected.as_bytes()))
        && let Some(client) = headers
            .get("x-contact-client-ip")
            .and_then(|header| header.to_str().ok())
            .and_then(|value| value.parse::<IpAddr>().ok())
    {
        return normalize_ip(client);
    }
    peer_ip
}

fn normalize_ip(address: IpAddr) -> IpAddr {
    match address {
        IpAddr::V6(address) => address
            .to_ipv4_mapped()
            .map_or(IpAddr::V6(address), IpAddr::V4),
        other => other,
    }
}

async fn response_headers(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await.into_response();
    let headers = response.headers_mut();
    headers.insert(header::CACHE_CONTROL, "no-store".parse().unwrap());
    headers.insert("x-content-type-options", "nosniff".parse().unwrap());
    response
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_accepts_forwarded_ip_from_authenticated_local_proxy() {
        let mut headers = HeaderMap::new();
        headers.insert("x-contact-client-ip", "203.0.113.4".parse().unwrap());
        headers.insert("x-contact-proxy-token", "correct-token".parse().unwrap());
        let local: SocketAddr = "127.0.0.1:4321".parse().unwrap();
        let remote: SocketAddr = "192.0.2.1:4321".parse().unwrap();
        assert_eq!(
            client_ip(local, &headers, Some("correct-token")),
            "203.0.113.4".parse::<IpAddr>().unwrap()
        );
        assert_eq!(client_ip(local, &headers, None), local.ip());
        assert_eq!(client_ip(local, &headers, Some("wrong-token")), local.ip());
        assert_eq!(
            client_ip(remote, &headers, Some("correct-token")),
            remote.ip()
        );
        headers.insert(
            "x-contact-client-ip",
            "203.0.113.4, 203.0.113.5".parse().unwrap(),
        );
        assert_eq!(
            client_ip(local, &headers, Some("correct-token")),
            local.ip()
        );
    }

    #[test]
    fn normalizes_ipv4_mapped_addresses_for_rate_limiting() {
        let peer = "[::ffff:127.0.0.1]:4321".parse().unwrap();
        assert_eq!(
            client_ip(peer, &HeaderMap::new(), None),
            "127.0.0.1".parse::<IpAddr>().unwrap()
        );
    }
}
