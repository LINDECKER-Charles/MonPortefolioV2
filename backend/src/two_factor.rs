use base64::{Engine, engine::general_purpose::STANDARD};
use chacha20poly1305::{
    XChaCha20Poly1305, XNonce,
    aead::{Aead, KeyInit, Payload},
};
use qrcode::{Color, QrCode};
use rand::{RngCore, rngs::OsRng};
use subtle::ConstantTimeEq;
use totp_rs::{Algorithm, TOTP};

use crate::storage::StoreError;

const ASSOCIATED_DATA: &[u8] = b"portfolio-backoffice-totp-v1";

/// Chiffre le secret TOTP avec `BACKOFFICE_TOTP_ENCRYPTION_KEY`.
pub(crate) fn encrypt(secret: &[u8], key: &[u8; 32]) -> Result<Vec<u8>, StoreError> {
    seal(secret, key, ASSOCIATED_DATA)
}

pub(crate) fn decrypt(value: &[u8], key: &[u8; 32]) -> Result<Vec<u8>, StoreError> {
    open(value, key, ASSOCIATED_DATA)
}

/// XChaCha20-Poly1305 : nonce aléatoire de 24 octets, puis le chiffré
/// authentifié. `aad` sépare les usages d’une même clé : un chiffré produit
/// pour l’un ne s’ouvre jamais pour l’autre.
pub(crate) fn seal(secret: &[u8], key: &[u8; 32], aad: &[u8]) -> Result<Vec<u8>, StoreError> {
    let cipher = XChaCha20Poly1305::new(key.into());
    let mut nonce = [0; 24];
    OsRng.fill_bytes(&mut nonce);
    let encrypted = cipher
        .encrypt(XNonce::from_slice(&nonce), Payload { msg: secret, aad })
        .map_err(|_| StoreError)?;
    Ok([nonce.to_vec(), encrypted].concat())
}

pub(crate) fn open(value: &[u8], key: &[u8; 32], aad: &[u8]) -> Result<Vec<u8>, StoreError> {
    if value.len() < 40 {
        return Err(StoreError);
    }
    XChaCha20Poly1305::new(key.into())
        .decrypt(
            XNonce::from_slice(&value[..24]),
            Payload {
                msg: &value[24..],
                aad,
            },
        )
        .map_err(|_| StoreError)
}

pub(crate) fn new_secret() -> Vec<u8> {
    let mut secret = vec![0; 20];
    OsRng.fill_bytes(&mut secret);
    secret
}

pub(crate) fn totp(secret: Vec<u8>, email: &str) -> Result<TOTP, StoreError> {
    TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        secret,
        Some("Portfolio".into()),
        email.into(),
    )
    .map_err(|_| StoreError)
}

/// Retourne le compteur réellement accepté, pour le consommer atomiquement en SQLite.
pub(crate) fn matching_step(
    secret: &[u8],
    code: &str,
    now: u64,
) -> Result<Option<u64>, StoreError> {
    if code.len() != 6 || !code.bytes().all(|byte| byte.is_ascii_digit()) {
        return Ok(None);
    }
    let totp = totp(secret.to_vec(), "backoffice@example.org")?;
    let current = now / 30;
    for step in [current, current.saturating_sub(1), current + 1] {
        if bool::from(totp.generate(step * 30).as_bytes().ct_eq(code.as_bytes())) {
            return Ok(Some(step));
        }
    }
    Ok(None)
}

pub(crate) fn qr_code(url: &str) -> Result<String, StoreError> {
    let qr = QrCode::new(url.as_bytes()).map_err(|_| StoreError)?;
    let scale = 5;
    let width = (qr.width() + 8) * scale;
    let mut pixels = vec![255; width * width];
    for y in 0..qr.width() {
        for x in 0..qr.width() {
            if qr[(x, y)] == Color::Dark {
                for dy in 0..scale {
                    for dx in 0..scale {
                        pixels[((y + 4) * scale + dy) * width + (x + 4) * scale + dx] = 0;
                    }
                }
            }
        }
    }
    let mut data = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut data, width as u32, width as u32);
        encoder.set_color(png::ColorType::Grayscale);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder.write_header().map_err(|_| StoreError)?;
        writer.write_image_data(&pixels).map_err(|_| StoreError)?;
    }
    Ok(format!("data:image/png;base64,{}", STANDARD.encode(data)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ciphertext_is_authenticated_and_randomized() {
        let secret = new_secret();
        let key = [42; 32];
        let encrypted = encrypt(&secret, &key).unwrap();
        assert_ne!(encrypt(&secret, &key).unwrap(), encrypted);
        assert_eq!(decrypt(&encrypted, &key).unwrap(), secret);
        assert!(decrypt(&encrypted, &[43; 32]).is_err());
        let mut tampered = encrypted;
        tampered[28] ^= 1;
        assert!(decrypt(&tampered, &key).is_err());
    }

    #[test]
    fn rfc_6238_sha1_vector_and_time_window() {
        let secret = b"12345678901234567890";
        assert_eq!(matching_step(secret, "287082", 59).unwrap(), Some(1));
        assert_eq!(matching_step(secret, "287082", 89).unwrap(), Some(1));
        assert_eq!(matching_step(secret, "287082", 90).unwrap(), None);
        assert_eq!(matching_step(secret, "287082", 0).unwrap(), Some(1));
        assert_eq!(matching_step(secret, " 287082", 59).unwrap(), None);
    }
}
