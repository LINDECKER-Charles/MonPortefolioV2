//! Images du blog à l’import : décodage borné, dimensions réelles (orientation
//! EXIF comprise) et variantes réduites pour `srcset`.
//!
//! L’original reste intact. Les variantes ne servent qu’à alléger la page :
//! une variante qui ne pèse pas moins que l’original n’est pas gardée, et une
//! image animée (GIF, PNG ou WebP animés) n’en a aucune, pour ne pas perdre son
//! mouvement. Une image que le décodeur refuse entière (somme de contrôle
//! fausse, fichier tronqué) mais que les navigateurs affichent reste admise,
//! comme avant la mesure : ses dimensions viennent alors de son en-tête, sans
//! variante.
use std::io::Cursor;

use image::{
    DynamicImage, ExtendedColorType, GenericImageView, ImageDecoder, ImageEncoder, ImageFormat,
    ImageReader, Limits,
    codecs::{jpeg::JpegEncoder, webp::WebPEncoder},
    imageops::FilterType,
};

/// Largeurs servies en `srcset` : la plus grande couvre la colonne de lecture
/// (42rem) en densité 2,4 et la couverture (1 000 px) en densité 1,6.
pub const VARIANT_WIDTHS: [u32; 3] = [480, 960, 1600];
/// Même plafond que les attributs `width`/`height` du document.
const MAX_DIMENSION: u32 = 10_000;
const MAX_ALLOC: u64 = 512 * 1024 * 1024;
const JPEG_QUALITY: u8 = 80;

pub struct Variant {
    pub width: u32,
    pub content_type: &'static str,
    pub bytes: Vec<u8>,
}

pub struct Processed {
    pub width: u32,
    pub height: u32,
    pub variants: Vec<Variant>,
}

/// `None` si même l’en-tête ne se lit pas : aucun navigateur ne l’afficherait, l’import la refuse.
pub fn process(bytes: &[u8], content_type: &str) -> Option<Processed> {
    let format = match content_type {
        "image/png" => ImageFormat::Png,
        "image/jpeg" => ImageFormat::Jpeg,
        "image/gif" => ImageFormat::Gif,
        "image/webp" => ImageFormat::WebP,
        _ => return None,
    };
    let Some(image) = decode(bytes, format) else {
        let (width, height) = reader(bytes, format).into_dimensions().ok()?;
        return Some(Processed {
            width,
            height,
            variants: Vec::new(),
        });
    };
    let (width, height) = image.dimensions();
    let variants = if animated(bytes, format) {
        Vec::new()
    } else {
        variants(&image, bytes.len())
    };
    Some(Processed {
        width,
        height,
        variants,
    })
}

fn reader(bytes: &[u8], format: ImageFormat) -> ImageReader<Cursor<&[u8]>> {
    let mut reader = ImageReader::with_format(Cursor::new(bytes), format);
    let mut limits = Limits::default();
    limits.max_image_width = Some(MAX_DIMENSION);
    limits.max_image_height = Some(MAX_DIMENSION);
    limits.max_alloc = Some(MAX_ALLOC);
    reader.limits(limits);
    reader
}

/// L’image entière, tournée selon son orientation EXIF, dans les limites de taille.
fn decode(bytes: &[u8], format: ImageFormat) -> Option<DynamicImage> {
    let mut decoder = reader(bytes, format).into_decoder().ok()?;
    let orientation = decoder.orientation().ok()?;
    let mut image = DynamicImage::from_decoder(decoder).ok()?;
    image.apply_orientation(orientation);
    Some(image)
}

/// GIF, APNG (chunk `acTL` avant les données) ou WebP animé (drapeau du chunk `VP8X`).
fn animated(bytes: &[u8], format: ImageFormat) -> bool {
    match format {
        ImageFormat::Gif => true,
        ImageFormat::WebP => bytes.len() > 20 && &bytes[12..16] == b"VP8X" && bytes[20] & 0x02 != 0,
        ImageFormat::Png => {
            let mut offset = 8;
            while offset + 8 <= bytes.len() {
                let length = u32::from_be_bytes([
                    bytes[offset],
                    bytes[offset + 1],
                    bytes[offset + 2],
                    bytes[offset + 3],
                ]) as usize;
                match &bytes[offset + 4..offset + 8] {
                    b"acTL" => return true,
                    b"IDAT" | b"IEND" => return false,
                    _ => offset = offset.saturating_add(12).saturating_add(length),
                }
            }
            false
        }
        _ => false,
    }
}

fn variants(image: &DynamicImage, original: usize) -> Vec<Variant> {
    let (width, height) = image.dimensions();
    let transparent = has_transparency(image);
    let largest = VARIANT_WIDTHS[VARIANT_WIDTHS.len() - 1];
    let mut targets: Vec<u32> = VARIANT_WIDTHS
        .into_iter()
        .filter(|&target| target < width)
        .collect();
    // Réencodée à sa taille, une image lourde s’allège sans changer de largeur.
    if width <= largest {
        targets.push(width);
    }
    targets
        .into_iter()
        .filter_map(|target| {
            let resized;
            let source = if target == width {
                image
            } else {
                let target_height = ((u64::from(height) * u64::from(target) + u64::from(width) / 2)
                    / u64::from(width))
                .max(1) as u32;
                resized = image.resize_exact(target, target_height, FilterType::Triangle);
                &resized
            };
            let (content_type, bytes) = encode(source, transparent)?;
            // À sa taille, la variante doit gagner au moins 10 % ; réduite, peser moins.
            let useful = if target == width {
                bytes.len() * 10 < original * 9
            } else {
                bytes.len() < original
            };
            useful.then_some(Variant {
                width: target,
                content_type,
                bytes,
            })
        })
        .collect()
}

fn has_transparency(image: &DynamicImage) -> bool {
    if !image.color().has_alpha() {
        return false;
    }
    match image.as_rgba8() {
        Some(buffer) => buffer.pixels().any(|pixel| pixel.0[3] < 255),
        None => image.pixels().any(|(_, _, pixel)| pixel.0[3] < 255),
    }
}

/// JPEG pour une image opaque ; WebP sans perte quand la transparence compte.
fn encode(image: &DynamicImage, transparent: bool) -> Option<(&'static str, Vec<u8>)> {
    let mut bytes = Vec::new();
    if transparent {
        let rgba = image.to_rgba8();
        WebPEncoder::new_lossless(&mut bytes)
            .write_image(
                rgba.as_raw(),
                rgba.width(),
                rgba.height(),
                ExtendedColorType::Rgba8,
            )
            .ok()?;
        Some(("image/webp", bytes))
    } else {
        let rgb = image.to_rgb8();
        JpegEncoder::new_with_quality(&mut bytes, JPEG_QUALITY)
            .write_image(
                rgb.as_raw(),
                rgb.width(),
                rgb.height(),
                ExtendedColorType::Rgb8,
            )
            .ok()?;
        Some(("image/jpeg", bytes))
    }
}
