//! Images du blog à l’import : décodage borné, dimensions réelles (orientation
//! EXIF comprise), métadonnées retirées et variantes réduites pour `srcset`.
//!
//! L’original est gardé à l’octet près, moins ses métadonnées : EXIF (position
//! GPS, appareil, date), XMP, IPTC, commentaires et textes. Seule son
//! orientation survit, réécrite dans un EXIF minimal, pour qu’il s’affiche comme
//! avant. Les variantes ne servent qu’à alléger la page : une variante qui ne
//! pèse pas moins que l’original n’est pas gardée. Une image animée (GIF, PNG
//! ou WebP animés) n’a pas de variante réduite, pour ne pas perdre son
//! mouvement, mais une image fixe (sa première image), que le rendu sert sous
//! `prefers-reduced-motion: reduce`. Une image que le décodeur refuse entière
//! (somme de contrôle fausse, fichier tronqué) mais que les navigateurs
//! affichent reste admise : ses dimensions viennent alors de son en-tête, sans
//! variante.
//!
//! Le coût est borné : 40 millions de pixels au plus, lus dans l’en-tête avant
//! tout décodage, 160 Mio d’allocation pour le décodeur, et une seule image
//! traitée à la fois, quelle que soit la voie (backoffice, MCP, démarrage).
use std::{
    io::Cursor,
    sync::{Mutex, PoisonError},
};

use image::{
    DynamicImage, ExtendedColorType, GenericImageView, ImageDecoder, ImageEncoder, ImageFormat,
    ImageReader, Limits,
    codecs::{jpeg::JpegEncoder, webp::WebPEncoder},
    imageops::FilterType,
    metadata::Orientation,
};

/// Largeurs servies en `srcset` : la plus grande couvre la colonne de lecture
/// (42rem) en densité 2,4 et la couverture (1 000 px) en densité 1,6.
pub const VARIANT_WIDTHS: [u32; 3] = [480, 960, 1600];
/// Même plafond que les attributs `width`/`height` du document.
const MAX_DIMENSION: u32 = 10_000;
/// 40 Mpx : 160 Mo une fois décodés en RGBA, sous la limite d’allocation du décodeur.
const MAX_PIXELS: u64 = 40_000_000;
const MAX_ALLOC: u64 = 160 * 1024 * 1024;
const JPEG_QUALITY: u8 = 80;

/// Un seul traitement à la fois : quelques imports simultanés suffiraient sinon
/// à épuiser la mémoire du service, et le formulaire de contact avec lui.
static TURN: Mutex<()> = Mutex::new(());

pub struct Variant {
    pub width: u32,
    pub content_type: &'static str,
    pub bytes: Vec<u8>,
}

pub struct Processed {
    pub width: u32,
    pub height: u32,
    /// L’original sans ses métadonnées : ce que la base garde et sert.
    pub original: Vec<u8>,
    pub variants: Vec<Variant>,
    /// Image fixe d’une image animée, à sa largeur (1 600 px au plus).
    pub still: Option<Variant>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum Rejected {
    /// Même l’en-tête (ou la structure) ne se lit pas : aucun navigateur ne l’afficherait.
    Unreadable,
    /// Plus de 40 millions de pixels : la réduire avant de l’importer.
    TooLarge,
}

pub fn process(bytes: &[u8], content_type: &str) -> Result<Processed, Rejected> {
    let _turn = TURN.lock().unwrap_or_else(PoisonError::into_inner);
    let format = match content_type {
        "image/png" => ImageFormat::Png,
        "image/jpeg" => ImageFormat::Jpeg,
        "image/gif" => ImageFormat::Gif,
        "image/webp" => ImageFormat::WebP,
        _ => return Err(Rejected::Unreadable),
    };
    let (width, height) = reader(bytes, format, None)
        .into_dimensions()
        .map_err(|_| Rejected::Unreadable)?;
    if u64::from(width) * u64::from(height) > MAX_PIXELS {
        return Err(Rejected::TooLarge);
    }
    let original =
        strip_metadata(bytes, format, orientation(bytes, format)).ok_or(Rejected::Unreadable)?;
    let Some(image) = decode(bytes, format) else {
        return Ok(Processed {
            width,
            height,
            original,
            variants: Vec::new(),
            still: None,
        });
    };
    let (width, height) = image.dimensions();
    let (variants, still) = if animated(bytes, format) {
        (Vec::new(), still(&image))
    } else {
        (variants(&image, original.len()), None)
    };
    Ok(Processed {
        width,
        height,
        original,
        variants,
        still,
    })
}

/// `max_alloc` : aucune limite pour lire l’en-tête seul, `MAX_ALLOC` pour décoder.
fn reader(bytes: &[u8], format: ImageFormat, max_alloc: Option<u64>) -> ImageReader<Cursor<&[u8]>> {
    let mut reader = ImageReader::with_format(Cursor::new(bytes), format);
    let mut limits = Limits::default();
    limits.max_image_width = Some(MAX_DIMENSION);
    limits.max_image_height = Some(MAX_DIMENSION);
    limits.max_alloc = max_alloc;
    reader.limits(limits);
    reader
}

/// L’orientation EXIF, lue sans décoder les pixels.
fn orientation(bytes: &[u8], format: ImageFormat) -> Orientation {
    reader(bytes, format, None)
        .into_decoder()
        .ok()
        .and_then(|mut decoder| decoder.orientation().ok())
        .unwrap_or(Orientation::NoTransforms)
}

/// L’image entière, tournée selon son orientation EXIF, dans les limites de taille.
fn decode(bytes: &[u8], format: ImageFormat) -> Option<DynamicImage> {
    let mut decoder = reader(bytes, format, Some(MAX_ALLOC)).into_decoder().ok()?;
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

fn resized(image: &DynamicImage, target: u32) -> DynamicImage {
    let (width, height) = image.dimensions();
    let target_height =
        ((u64::from(height) * u64::from(target) + u64::from(width) / 2) / u64::from(width)).max(1);
    image.resize_exact(target, target_height as u32, FilterType::Triangle)
}

fn variants(image: &DynamicImage, original: usize) -> Vec<Variant> {
    let width = image.width();
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
            let reduced;
            let source = if target == width {
                image
            } else {
                reduced = resized(image, target);
                &reduced
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

/// La première image d’une image animée, à 1 600 px au plus, sans condition de poids.
fn still(image: &DynamicImage) -> Option<Variant> {
    let largest = VARIANT_WIDTHS[VARIANT_WIDTHS.len() - 1];
    let width = image.width().min(largest);
    let reduced;
    let source = if width == image.width() {
        image
    } else {
        reduced = resized(image, width);
        &reduced
    };
    let (content_type, bytes) = encode(source, has_transparency(image))?;
    Some(Variant {
        width,
        content_type,
        bytes,
    })
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

/*
 * Métadonnées : chaque format est parcouru bloc par bloc, sans décoder les
 * pixels. Ce qui décrit l’image (profil de couleur, palette, animation) reste ;
 * ce qui décrit la prise de vue ou son auteur part. Une structure illisible
 * rend `None` : l’import refuse alors l’image plutôt que de la garder entière.
 */

/// L’original sans métadonnées, avec son orientation seule si elle n’est pas neutre.
fn strip_metadata(bytes: &[u8], format: ImageFormat, orientation: Orientation) -> Option<Vec<u8>> {
    let exif = (orientation != Orientation::NoTransforms).then(|| exif_orientation(orientation));
    match format {
        ImageFormat::Jpeg => strip_jpeg(bytes, exif.as_ref()),
        ImageFormat::Png => strip_png(bytes, exif.as_ref()),
        ImageFormat::WebP => strip_webp(bytes, exif.as_ref()),
        ImageFormat::Gif => strip_gif(bytes),
        _ => None,
    }
}

/// Un EXIF (TIFF gros-boutiste) qui ne porte que l’orientation.
fn exif_orientation(orientation: Orientation) -> [u8; 26] {
    let mut tiff = [0; 26];
    tiff[..8].copy_from_slice(b"MM\0\x2a\0\0\0\x08");
    tiff[8..10].copy_from_slice(&1u16.to_be_bytes());
    // Étiquette 0x0112, type SHORT, une valeur ; l’IFD suivant (0) termine.
    tiff[10..18].copy_from_slice(&[0x01, 0x12, 0, 3, 0, 0, 0, 1]);
    tiff[19] = orientation.to_exif();
    tiff
}

/// JPEG : retire APP1 (EXIF, XMP), APP3 à APP15 sauf Adobe, APP2 hors profil
/// ICC (MPF), APP0 hors JFIF (vignettes JFXX), les commentaires et tout ce qui
/// suit la fin de l’image principale (images secondaires MPF).
fn strip_jpeg(bytes: &[u8], exif: Option<&[u8; 26]>) -> Option<Vec<u8>> {
    if !bytes.starts_with(&[0xff, 0xd8]) {
        return None;
    }
    let mut out = Vec::with_capacity(bytes.len());
    out.extend_from_slice(&[0xff, 0xd8]);
    let mut pending = exif.map(|tiff| [&[0xff, 0xe1, 0, 34][..], b"Exif\0\0", tiff].concat());
    let mut pos = 2;
    loop {
        if *bytes.get(pos)? != 0xff {
            return None;
        }
        while bytes.get(pos) == Some(&0xff) {
            pos += 1;
        }
        let marker = *bytes.get(pos)?;
        pos += 1;
        match marker {
            0xd9 => {
                out.extend_from_slice(&[0xff, 0xd9]);
                return Some(out);
            }
            0x01 | 0xd0..=0xd7 => {
                out.extend_from_slice(&[0xff, marker]);
                continue;
            }
            0x00 | 0xd8 => return None,
            _ => {}
        }
        let length = usize::from(u16::from_be_bytes([*bytes.get(pos)?, *bytes.get(pos + 1)?]));
        let end = pos.checked_add(length).filter(|_| length >= 2)?;
        let payload = bytes.get(pos + 2..end)?;
        let keep = match marker {
            0xe0 => payload.starts_with(b"JFIF\0"),
            0xe2 => payload.starts_with(b"ICC_PROFILE\0"),
            0xee => payload.starts_with(b"Adobe"),
            0xe1 | 0xe3..=0xed | 0xef | 0xfe => false,
            _ => true,
        };
        // L’orientation suit l’en-tête JFIF, s’il y en a un, avant tout le reste.
        if !(marker == 0xe0 && keep)
            && let Some(segment) = pending.take()
        {
            out.extend_from_slice(&segment);
        }
        if keep {
            out.extend_from_slice(&[0xff, marker]);
            out.extend_from_slice(&bytes[pos..end]);
        }
        pos = end;
        if marker == 0xda {
            // Données compressées : jusqu’au prochain vrai marqueur (ni octet
            // de bourrage, ni redémarrage).
            let start = pos;
            loop {
                if *bytes.get(pos)? == 0xff {
                    match *bytes.get(pos + 1)? {
                        0x00 | 0xd0..=0xd7 => pos += 2,
                        0xff => pos += 1,
                        _ => break,
                    }
                } else {
                    pos += 1;
                }
            }
            out.extend_from_slice(&bytes[start..pos]);
        }
    }
}

/// CRC-32 des blocs PNG (polynôme 0xEDB88320).
fn crc32(parts: &[&[u8]]) -> u32 {
    let mut crc = !0u32;
    for byte in parts.iter().flat_map(|part| part.iter()) {
        crc ^= u32::from(*byte);
        for _ in 0..8 {
            crc = (crc >> 1) ^ (0xedb8_8320 & (crc & 1).wrapping_neg());
        }
    }
    !crc
}

/// PNG : retire les textes (`tEXt`, `zTXt`, `iTXt`), l’EXIF (`eXIf`), la date
/// (`tIME`) et ce qui suit `IEND`.
fn strip_png(bytes: &[u8], exif: Option<&[u8; 26]>) -> Option<Vec<u8>> {
    const SIGNATURE: &[u8] = b"\x89PNG\r\n\x1a\n";
    if !bytes.starts_with(SIGNATURE) {
        return None;
    }
    let mut out = Vec::with_capacity(bytes.len());
    out.extend_from_slice(SIGNATURE);
    let mut pending = exif;
    let mut pos = SIGNATURE.len();
    loop {
        let length = u32::from_be_bytes(bytes.get(pos..pos + 4)?.try_into().ok()?) as usize;
        let end = pos.checked_add(12)?.checked_add(length)?;
        let chunk = bytes.get(pos..end)?;
        let kind = &chunk[4..8];
        // L’EXIF d’un PNG se lit avant les données de l’image.
        if matches!(kind, b"IDAT" | b"IEND")
            && let Some(tiff) = pending.take()
        {
            out.extend_from_slice(&(tiff.len() as u32).to_be_bytes());
            out.extend_from_slice(b"eXIf");
            out.extend_from_slice(tiff);
            out.extend_from_slice(&crc32(&[b"eXIf", tiff]).to_be_bytes());
        }
        if !matches!(kind, b"tEXt" | b"zTXt" | b"iTXt" | b"eXIf" | b"tIME") {
            out.extend_from_slice(chunk);
        }
        if kind == b"IEND" {
            return Some(out);
        }
        pos = end;
    }
}

/// WebP étendu : retire les blocs `EXIF` et `XMP ` et met à jour les drapeaux
/// de `VP8X`. Un WebP simple (sans `VP8X`) ne porte aucune métadonnée.
fn strip_webp(bytes: &[u8], exif: Option<&[u8; 26]>) -> Option<Vec<u8>> {
    if bytes.len() < 20 || !bytes.starts_with(b"RIFF") || &bytes[8..12] != b"WEBP" {
        return None;
    }
    let size = u32::from_le_bytes(bytes[4..8].try_into().ok()?) as usize;
    let body = bytes.get(12..8usize.checked_add(size)?)?;
    let mut chunks = Vec::with_capacity(body.len() + 34);
    let mut flags_at = None;
    let mut pos = 0;
    while pos < body.len() {
        let kind = body.get(pos..pos + 4)?;
        let length = u32::from_le_bytes(body.get(pos + 4..pos + 8)?.try_into().ok()?) as usize;
        let end = pos
            .checked_add(8)?
            .checked_add(length)?
            .checked_add(length % 2)?;
        let chunk = body.get(pos..end.min(body.len()))?;
        if kind == b"VP8X" && length >= 10 {
            flags_at = Some(chunks.len() + 8);
        }
        if !matches!(kind, b"EXIF" | b"XMP ") {
            chunks.extend_from_slice(chunk);
        }
        pos = end;
    }
    if let Some(at) = flags_at {
        // Drapeaux de VP8X : 0x08 EXIF, 0x04 XMP.
        chunks[at] &= !0x0c;
        if let Some(tiff) = exif {
            chunks[at] |= 0x08;
            chunks.extend_from_slice(b"EXIF");
            chunks.extend_from_slice(&(tiff.len() as u32).to_le_bytes());
            chunks.extend_from_slice(tiff);
        }
    }
    let mut out = Vec::with_capacity(chunks.len() + 12);
    out.extend_from_slice(b"RIFF");
    out.extend_from_slice(&(chunks.len() as u32 + 4).to_le_bytes());
    out.extend_from_slice(b"WEBP");
    out.extend_from_slice(&chunks);
    Some(out)
}

/// GIF : retire les commentaires et l’extension XMP ; garde la boucle
/// d’animation (NETSCAPE2.0) et tout le reste.
fn strip_gif(bytes: &[u8]) -> Option<Vec<u8>> {
    let palette = |flags: u8| {
        if flags & 0x80 != 0 {
            3usize << ((flags & 0x07) + 1)
        } else {
            0
        }
    };
    // Une suite de sous-blocs, jusqu’au bloc de longueur nulle compris.
    let sub_blocks = |mut at: usize| -> Option<usize> {
        loop {
            let length = usize::from(*bytes.get(at)?);
            at += 1 + length;
            if length == 0 {
                return Some(at);
            }
        }
    };
    let mut pos = 13 + palette(*bytes.get(10)?);
    let mut out = Vec::with_capacity(bytes.len());
    out.extend_from_slice(bytes.get(..pos)?);
    loop {
        match *bytes.get(pos)? {
            0x3b => {
                out.push(0x3b);
                return Some(out);
            }
            0x2c => {
                // Descripteur, palette locale, taille minimale du code LZW, données.
                let end = sub_blocks(pos + 10 + palette(*bytes.get(pos + 9)?) + 1)?;
                out.extend_from_slice(bytes.get(pos..end)?);
                pos = end;
            }
            0x21 => {
                let label = *bytes.get(pos + 1)?;
                let end = sub_blocks(pos + 2)?;
                let xmp = label == 0xff && bytes.get(pos + 3..pos + 11) == Some(&b"XMP Data"[..]);
                if label != 0xfe && !xmp {
                    out.extend_from_slice(bytes.get(pos..end)?);
                }
                pos = end;
            }
            _ => return None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// IFD0 : orientation 6 et pointeur GPS ; IFD GPS : latitude « N » ; puis un marqueur lisible.
    fn tiff_gps() -> Vec<u8> {
        let mut tiff = b"MM\0\x2a\0\0\0\x08".to_vec();
        tiff.extend_from_slice(&[0, 2]);
        tiff.extend_from_slice(&[0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, 6, 0, 0]);
        tiff.extend_from_slice(&[0x88, 0x25, 0, 4, 0, 0, 0, 1, 0, 0, 0, 38]);
        tiff.extend_from_slice(&[0, 0, 0, 0]);
        tiff.extend_from_slice(&[0, 1, 0, 1, 0, 2, 0, 0, 0, 2, b'N', 0, 0, 0]);
        tiff.extend_from_slice(&[0, 0, 0, 0]);
        tiff.extend_from_slice(b"GPS-SECRET");
        tiff
    }

    fn encoded(width: u32, height: u32, format: ImageFormat) -> Vec<u8> {
        let image = DynamicImage::ImageRgba8(image::RgbaImage::from_pixel(
            width,
            height,
            image::Rgba([200, 40, 40, 255]),
        ));
        let image = if format == ImageFormat::Jpeg {
            DynamicImage::ImageRgb8(image.to_rgb8())
        } else {
            image
        };
        let mut bytes = Cursor::new(Vec::new());
        image.write_to(&mut bytes, format).unwrap();
        bytes.into_inner()
    }

    fn contains(haystack: &[u8], needle: &[u8]) -> bool {
        haystack
            .windows(needle.len())
            .any(|window| window == needle)
    }

    #[test]
    fn a_jpeg_loses_its_gps_and_comments_but_keeps_its_orientation() {
        let plain = encoded(40, 20, ImageFormat::Jpeg);
        let tiff = tiff_gps();
        let exif = [
            &[0xff, 0xe1][..],
            &((tiff.len() + 8) as u16).to_be_bytes(),
            b"Exif\0\0",
            &tiff,
        ]
        .concat();
        let comment = [&[0xff, 0xfe, 0, 9][..], b"Charles"].concat();
        // Une image secondaire (MPF) suit la fin de l’image principale.
        let bytes = [&plain[..2], &exif, &comment, &plain[2..], &plain].concat();
        let processed = process(&bytes, "image/jpeg").unwrap();
        assert!(!contains(&processed.original, b"GPS-SECRET"));
        assert!(!contains(&processed.original, b"Charles"));
        assert!(contains(
            &processed.original,
            &exif_orientation(Orientation::Rotate90)
        ));
        assert_eq!(processed.original.len(), plain.len() + 36);
        assert_eq!(
            orientation(&processed.original, ImageFormat::Jpeg),
            Orientation::Rotate90
        );
        assert_eq!((processed.width, processed.height), (20, 40));
        let decoded = image::load_from_memory(&processed.original).unwrap();
        assert_eq!((decoded.width(), decoded.height()), (40, 20));
        // Sans orientation ni métadonnée, l’image ne change pas d’un octet.
        let neutral = strip_metadata(&plain, ImageFormat::Jpeg, Orientation::NoTransforms);
        assert_eq!(neutral.as_deref(), Some(&plain[..]));
    }

    #[test]
    fn a_png_loses_its_texts_and_exif_but_keeps_its_orientation() {
        let plain = encoded(30, 10, ImageFormat::Png);
        let chunk = |kind: &[u8], data: &[u8]| {
            [
                &(data.len() as u32).to_be_bytes()[..],
                kind,
                data,
                &crc32(&[kind, data]).to_be_bytes(),
            ]
            .concat()
        };
        let ihdr_end = 8 + 12 + 13;
        let bytes = [
            &plain[..ihdr_end],
            &chunk(b"tEXt", b"Author\0Charles"),
            &chunk(b"eXIf", &tiff_gps()),
            &plain[ihdr_end..],
            b"suite",
        ]
        .concat();
        assert!(image::load_from_memory(&bytes).is_ok());
        let processed = process(&bytes, "image/png").unwrap();
        assert!(!contains(&processed.original, b"Charles"));
        assert!(!contains(&processed.original, b"GPS-SECRET"));
        assert!(processed.original.ends_with(b"IEND\xae\x42\x60\x82"));
        assert_eq!(
            orientation(&processed.original, ImageFormat::Png),
            Orientation::Rotate90
        );
        assert_eq!((processed.width, processed.height), (10, 30));
        assert!(image::load_from_memory(&processed.original).is_ok());
        assert_eq!(
            strip_metadata(&plain, ImageFormat::Png, Orientation::NoTransforms).unwrap(),
            plain
        );
    }

    #[test]
    fn a_webp_loses_its_exif_and_xmp_chunks() {
        let plain = encoded(16, 8, ImageFormat::WebP);
        let mut body = b"VP8X".to_vec();
        body.extend_from_slice(&10u32.to_le_bytes());
        body.extend_from_slice(&[0x1c, 0, 0, 0, 15, 0, 0, 7, 0, 0]);
        body.extend_from_slice(&plain[12..]);
        let tiff = tiff_gps();
        let xmp = b"<x:xmpmeta>GPS-SECRET</x:xmpmeta>";
        for (kind, data) in [(b"EXIF", &tiff[..]), (b"XMP ", &xmp[..])] {
            body.extend_from_slice(kind);
            body.extend_from_slice(&(data.len() as u32).to_le_bytes());
            body.extend_from_slice(data);
            if data.len() % 2 == 1 {
                body.push(0);
            }
        }
        let bytes = [
            &b"RIFF"[..],
            &(body.len() as u32 + 4).to_le_bytes(),
            b"WEBP",
            &body,
        ]
        .concat();
        assert!(image::load_from_memory(&bytes).is_ok());
        let stripped =
            strip_metadata(&bytes, ImageFormat::WebP, Orientation::NoTransforms).unwrap();
        assert!(!contains(&stripped, b"GPS-SECRET"));
        assert_eq!(stripped[20] & 0x0c, 0);
        let decoded = image::load_from_memory(&stripped).unwrap();
        assert_eq!((decoded.width(), decoded.height()), (16, 8));
        let rotated = strip_metadata(&bytes, ImageFormat::WebP, Orientation::Rotate90).unwrap();
        assert_eq!(rotated[20] & 0x0c, 0x08);
        assert!(!contains(&rotated, b"GPS-SECRET"));
        assert!(image::load_from_memory(&rotated).is_ok());
        // Un WebP simple ne porte rien : il reste tel quel.
        assert_eq!(
            strip_metadata(&plain, ImageFormat::WebP, Orientation::NoTransforms).unwrap(),
            plain
        );
    }

    #[test]
    fn a_gif_loses_its_comments_and_gets_a_still_image() {
        let plain = encoded(12, 6, ImageFormat::Gif);
        let comment = [&[0x21, 0xfe, 7][..], b"Charles", &[0]].concat();
        let at = plain.len() - 1;
        let bytes = [&plain[..at], &comment, &plain[at..]].concat();
        assert!(image::load_from_memory(&bytes).is_ok());
        let processed = process(&bytes, "image/gif").unwrap();
        assert_eq!(processed.original, plain);
        assert!(processed.variants.is_empty());
        let still = processed.still.expect("une image animée a une image fixe");
        assert_eq!(still.width, 12);
        assert!(image::load_from_memory(&still.bytes).is_ok());
    }

    #[test]
    fn an_image_over_forty_megapixels_is_refused_before_decoding() {
        // En-tête PNG de 8 000 × 6 000 px (48 Mpx), avec des données vides.
        let mut bytes = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut bytes, 8000, 6000);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Eight);
            let mut writer = encoder.write_header().unwrap();
            writer.write_chunk(png::chunk::IDAT, &[]).unwrap();
        }
        assert_eq!(process(&bytes, "image/png").err(), Some(Rejected::TooLarge));
    }
}
