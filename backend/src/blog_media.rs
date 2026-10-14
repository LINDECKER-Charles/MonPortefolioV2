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
//! variante. Une image dont le décodage tiendrait plus de `MAX_DECODING` est
//! refusée à l’import (`Rejected::TooHeavy`) : sans variante, son original
//! partirait tel quel sur mobile, sans que son auteur le sache. Déjà en base et
//! mesurée au démarrage (`process_stored`), elle reste gardée sans variante.
//!
//! Le coût est borné : 25 millions de pixels au plus, lus dans l’en-tête avant
//! tout décodage ; 150 Mo au plus tenus par le décodage (`MAX_DECODING`),
//! tampon de sortie et tampons propres au décodeur compris (`decoding_cost`) ;
//! une seule image traitée à la fois, quelle que soit la voie (backoffice, MCP,
//! démarrage). 25 Mpx laissent passer les photos de 24 Mpx des iPhone récents
//! (5712 × 4284, 24,5 Mpx) et des reflex (6000 × 4000), et une capture d’écran
//! 6K (6016 × 3384, 20,4 Mpx) ; le VPS est partagé par une quarantaine de
//! conteneurs, chaque mégaoctet de plafond compte, et la plus grande variante
//! servie ne fait que 1 600 px.
//!
//! La plus grande variante est réduite de l’image décodée telle quelle, sans
//! la tourner ; l’image entière est lâchée avant que sa réduction soit tournée
//! puis encodée, et chaque variante suivante est réduite de la précédente. Le
//! pic tient donc dans l’image décodée et sa plus grande réduction. Seule une
//! image affichée sur 1 600 px de large au plus est tournée entière, pour être
//! réencodée à sa taille.
//!
//! Pics mesurés sous Linux (`memory.peak` du cgroup d’un conteneur neuf limité
//! à 320 Mio sans swap, comme en production, un import par conteneur ; 32 Mio
//! de service au repos et de connexion au backoffice compris) :
//! - photo JPEG de 12 Mpx : 73 Mio ; JPEG de 24 Mpx tourné de 90° : 111 Mio ;
//! - PNG RGBA de 25 Mpx tourné : 124 Mio ; PNG RGBA de 1 600 × 10 000 px,
//!   réencodé entier : 151 Mio ;
//! - PNG RGBA de 2 500 × 10 000 px, dont la réduction à 1 600 px de large
//!   côtoie l’image entière : 163 Mio ;
//! - JPEG progressif en 4:2:0 de 24 Mpx : 165 à 178 Mio ;
//! - au seuil de `MAX_DECODING` : GIF à cadre décalé de 18,7 Mpx, 172 Mio ;
//!   PNG RGBA de 16 bits de 12,5 Mpx, 174 ; WebP avec transparence de 13,6
//!   Mpx, 168 ; WebP sans perte de 21 Mpx, 168 ; JPEG progressif CMJN de 13,5
//!   Mpx, 182 ; et le pire cas, un JPEG progressif en 4:4:4 de 16,6 Mpx :
//!   184 Mio ;
//! - au-delà, l’image est refusée à l’import, sans être décodée : 44 Mio au
//!   plus (WebP de 24 Mpx avec transparence, JPEG progressif de 24 Mpx en
//!   4:4:4 ou en CMJN, PNG de 16 bits de 16 Mpx, GIF de 25 Mpx).
//!
//! Les imports simultanés attendent leur place avant d’être lus
//! (`upload_queue`, deux à la fois) : une image lourde et 8 ou 16 imports de
//! 4 Mio envoyés ensemble montent à 243 Mio de mémoire anonyme, quel que soit
//! leur nombre. L’écart avec un import seul vient de l’allocateur de la glibc,
//! qui garde par fil de traitement ce que ce fil a libéré.
//!
//! La limite mémoire du service (`compose.deploy.yaml`, 320 Mio, 1,75 fois le
//! pire pic mesuré) en dépend : baisser `MAX_DECODING` avant de la baisser.
//! `decoding_cost` repose sur les tampons d’`image`, `image-webp` et
//! `zune-jpeg` : les remesurer à chaque nouvelle version de ces bibliothèques.
use std::{
    io::Cursor,
    sync::{Mutex, PoisonError},
};

use image::{
    ColorType, DynamicImage, ExtendedColorType, GenericImageView, ImageDecoder, ImageEncoder,
    ImageError, ImageFormat, ImageReader, Limits,
    codecs::{jpeg::JpegEncoder, webp::WebPEncoder},
    metadata::Orientation,
};

/// Largeurs servies en `srcset` : la plus grande couvre la colonne de lecture
/// (42rem) en densité 2,4 et la couverture (1 000 px) en densité 1,6.
pub const VARIANT_WIDTHS: [u32; 3] = [480, 960, 1600];
/// Même plafond que les attributs `width`/`height` du document.
const MAX_DIMENSION: u32 = 10_000;
/// 25 Mpx : une photo de 24 Mpx (5712 × 4284, 6000 × 4000) ou une capture 6K passe.
const MAX_PIXELS: u64 = 25_000_000;
/// Le tampon de la plus grande image admise en RGBA 8 bits (100 Mo) : la
/// limite d’allocation passée aux décodeurs.
const MAX_ALLOC: u64 = MAX_PIXELS * 4;
/// Ce qu’un décodage peut tenir en mémoire (`decoding_cost`), 150 Mo : ce que
/// demande un JPEG progressif de 24 Mpx en 4:2:0, le plus courant. Un PNG, un
/// JPEG séquentiel et un JPEG progressif en 4:2:0 de 24 Mpx se décodent ; une
/// image qui demande plus (JPEG progressif de plus de 16 Mpx en 4:4:4 ou de
/// 13 Mpx en CMJN, WebP de plus de 13 Mpx avec transparence, de 21 Mpx sans ou
/// de 9 Mpx animé, GIF de plus de 18 Mpx, PNG de 16 bits par canal de plus de
/// 12,5 Mpx) est refusée à l’import ; déjà en base, elle reste gardée sans
/// variante. Exportée en JPEG (séquentiel) ou en PNG 8 bits, la même image de
/// 25 Mpx au plus passe toujours.
const MAX_DECODING: u64 = MAX_PIXELS * 6;
const JPEG_QUALITY: u8 = 80;

/// Un seul traitement à la fois : quelques imports simultanés suffiraient sinon
/// à épuiser la mémoire du service, et le formulaire de contact avec lui. Les
/// corps des imports, eux, attendent leur tour avant d’être lus (`upload_queue`).
pub(crate) static TURN: Mutex<()> = Mutex::new(());

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
    /// Plus de 25 millions de pixels : la réduire avant de l’importer.
    TooLarge,
    /// Son décodage tiendrait plus de `MAX_DECODING` : sans variante, l’original
    /// partirait tel quel sur mobile. L’exporter en JPEG ou en PNG 8 bits, ou la réduire.
    TooHeavy,
}

/// Pourquoi une image n’a pas été décodée.
#[derive(Debug, PartialEq, Eq)]
enum Undecoded {
    /// Le décodage tiendrait plus de `MAX_DECODING`.
    TooHeavy,
    /// Le décodeur la refuse entière (somme de contrôle fausse, fichier tronqué).
    Failed,
}

/// Une image importée : refusée si son décodage dépasse `MAX_DECODING`.
pub fn process(bytes: &[u8], content_type: &str) -> Result<Processed, Rejected> {
    prepare(bytes, content_type, true)
}

/// Une image déjà en base, mesurée au démarrage : gardée sans variante si son
/// décodage dépasse `MAX_DECODING`, comme avant le refus à l’import.
pub fn process_stored(bytes: &[u8], content_type: &str) -> Result<Processed, Rejected> {
    prepare(bytes, content_type, false)
}

fn prepare(bytes: &[u8], content_type: &str, refuse_heavy: bool) -> Result<Processed, Rejected> {
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
    let (image, orientation) = match decode(bytes, format) {
        Ok(decoded) => decoded,
        Err(Undecoded::TooHeavy) if refuse_heavy => return Err(Rejected::TooHeavy),
        Err(_) => {
            return Ok(Processed {
                width,
                height,
                original,
                variants: Vec::new(),
                still: None,
            });
        }
    };
    let (width, height) = displayed(&image, orientation);
    let (variants, still) = if animated(bytes, format) {
        (Vec::new(), still(image, orientation))
    } else {
        (variants(image, orientation, original.len()), None)
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

/// L’image entière telle que stockée, sans la tourner, en 8 bits par canal, et
/// son orientation EXIF. Une image dont le décodage coûterait plus de
/// `MAX_DECODING`, ou plus que la limite d’allocation des décodeurs, n’est pas
/// décodée (`Undecoded::TooHeavy`).
fn decode(bytes: &[u8], format: ImageFormat) -> Result<(DynamicImage, Orientation), Undecoded> {
    let undecoded = |error: ImageError| match error {
        ImageError::Limits(_) => Undecoded::TooHeavy,
        _ => Undecoded::Failed,
    };
    let mut decoder = reader(bytes, format, Some(MAX_ALLOC))
        .into_decoder()
        .map_err(undecoded)?;
    if decoding_cost(bytes, format, &decoder) > MAX_DECODING {
        return Err(Undecoded::TooHeavy);
    }
    let orientation = decoder.orientation().map_err(undecoded)?;
    let image = DynamicImage::from_decoder(decoder).map_err(undecoded)?;
    Ok((eight_bits(image), orientation))
}

/// Ce que le décodage tient en mémoire au plus, en octets. `max_alloc` ne
/// compte ni le tampon de sortie (`into_decoder` le laisse à
/// `ImageReader::decode`), ni ce que les décodeurs allouent à côté :
/// - WebP (image-webp 0.2), par pixel : les plans YUV d’une image avec perte
///   (1,5 octet), son canal alpha décodé en RGBA puis extrait (5 octets), le
///   tampon RGBA d’une image sans perte opaque (4 octets), le cadre et le
///   canevas d’une animation (8 octets), en plus de la sortie (3 ou 4 octets) ;
/// - JPEG progressif (zune-jpeg 0.5) : tous ses coefficients, deux octets par
///   échantillon de chaque composante (`progressive_coefficients`) ;
/// - GIF : le cadre est lu dans son propre tampon, puis recopié sur le canevas ;
/// - plus de 8 bits par canal : la copie en 8 bits (`eight_bits`) s’ajoute au
///   tampon décodé, pour moitié de sa taille.
fn decoding_cost(bytes: &[u8], format: ImageFormat, decoder: &impl ImageDecoder) -> u64 {
    let output = decoder.total_bytes();
    let (width, height) = decoder.dimensions();
    let pixels = u64::from(width) * u64::from(height);
    let color = decoder.color_type();
    match format {
        ImageFormat::WebP if animated(bytes, format) => pixels * 16,
        ImageFormat::WebP if color.has_alpha() => pixels * 11,
        ImageFormat::WebP => pixels * 7,
        ImageFormat::Jpeg => output + progressive_coefficients(bytes).unwrap_or(0) * 2,
        ImageFormat::Gif => output * 2,
        _ if color.bytes_per_pixel() > color.channel_count() => output + output / 2,
        _ => output,
    }
}

/// Les échantillons d’un JPEG progressif, toutes composantes comprises et
/// complétées aux MCU entières : le décodeur les garde tous jusqu’à la fin du
/// fichier. Un JPEG séquentiel n’en garde qu’une rangée de MCU : 0.
fn progressive_coefficients(bytes: &[u8]) -> Option<u64> {
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
            0x01 | 0xd0..=0xd7 => continue,
            0xd8..=0xda => return None,
            _ => {}
        }
        let length = usize::from(u16::from_be_bytes([*bytes.get(pos)?, *bytes.get(pos + 1)?]));
        match marker {
            0xc2 | 0xc6 | 0xca | 0xce => {
                // Précision, hauteur, largeur, puis par composante : identifiant,
                // facteurs d’échantillonnage (horizontal, vertical), table.
                let frame = bytes.get(pos + 2..pos + length)?;
                let height = u64::from(u16::from_be_bytes([*frame.get(1)?, *frame.get(2)?]));
                let width = u64::from(u16::from_be_bytes([*frame.get(3)?, *frame.get(4)?]));
                let count = usize::from(*frame.get(5)?);
                let factors = (0..count)
                    .map(|index| {
                        let factor = *frame.get(7 + 3 * index)?;
                        Some((
                            u64::from(factor >> 4).max(1),
                            u64::from(factor & 0x0f).max(1),
                        ))
                    })
                    .collect::<Option<Vec<_>>>()?;
                let (most_h, most_v) = factors
                    .iter()
                    .fold((1, 1), |(h, v), &(fh, fv)| (h.max(fh), v.max(fv)));
                let mcus = width.div_ceil(8 * most_h) * height.div_ceil(8 * most_v);
                return Some(factors.iter().map(|(h, v)| mcus * 64 * h * v).sum());
            }
            0xc0..=0xcf if !matches!(marker, 0xc4 | 0xc8 | 0xcc) => return Some(0),
            _ => pos += length,
        }
    }
}

/// Les variantes s’encodent en 8 bits : une image de 16 bits par canal y est
/// ramenée dès son décodage, avant toute rotation ou réduction, qui sinon
/// copieraient son tampon de double taille.
fn eight_bits(image: DynamicImage) -> DynamicImage {
    match image.color() {
        ColorType::L16 => image.to_luma8().into(),
        ColorType::La16 => image.to_luma_alpha8().into(),
        ColorType::Rgb16 | ColorType::Rgb32F => image.to_rgb8().into(),
        ColorType::Rgba16 | ColorType::Rgba32F => image.to_rgba8().into(),
        _ => image,
    }
}

/// Une orientation de 90° ou 270° échange largeur et hauteur.
fn swaps_axes(orientation: Orientation) -> bool {
    matches!(
        orientation,
        Orientation::Rotate90
            | Orientation::Rotate270
            | Orientation::Rotate90FlipH
            | Orientation::Rotate270FlipH
    )
}

/// Les dimensions affichées, orientation comprise.
fn displayed(image: &DynamicImage, orientation: Orientation) -> (u32, u32) {
    let (width, height) = image.dimensions();
    if swaps_axes(orientation) {
        (height, width)
    } else {
        (width, height)
    }
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

/// Réduction par moyenne des surfaces (`thumbnail_exact`) : directe, sans
/// l’image intermédiaire en flottants de `resize_exact` (16 octets par pixel,
/// sur toute la largeur de l’original). Mesuré sous Linux au processus seul,
/// le pic d’une photo JPEG de 12 Mpx passait ainsi de 120 à 54 Mio, celui d’un
/// PNG de 16 Mpx de 215 à 154 Mio. On ne fait que réduire : ce filtre suffit.
///
/// `target` est une largeur affichée : l’image stockée est réduite aux
/// dimensions qui, une fois tournées, la donnent. La réduction reste dans le
/// sens stocké ; l’appelant la tourne (`turned`) une fois l’image source lâchée.
fn reduced(image: &DynamicImage, orientation: Orientation, target: u32) -> DynamicImage {
    let (width, height) = displayed(image, orientation);
    let target_height = ((u64::from(height) * u64::from(target) + u64::from(width) / 2)
        / u64::from(width))
    .max(1) as u32;
    if swaps_axes(orientation) {
        image.thumbnail_exact(target_height, target)
    } else {
        image.thumbnail_exact(target, target_height)
    }
}

/// Une image n’est tournée que quand plus rien ne lit sa version stockée : sa
/// copie tournée la remplace au lieu de s’y ajouter.
fn turned(mut image: DynamicImage, orientation: Orientation) -> DynamicImage {
    image.apply_orientation(orientation);
    image
}

fn variants(image: DynamicImage, orientation: Orientation, original: usize) -> Vec<Variant> {
    let (width, _) = displayed(&image, orientation);
    let transparent = has_transparency(&image);
    let largest = VARIANT_WIDTHS[VARIANT_WIDTHS.len() - 1];
    let mut variants = Vec::new();
    let mut keep = |target: u32, image: &DynamicImage| {
        // À sa taille, la variante doit gagner au moins 10 % ; réduite, peser moins.
        let useful = |bytes: &[u8]| {
            if target == width {
                bytes.len() * 10 < original * 9
            } else {
                bytes.len() < original
            }
        };
        if let Some((content_type, bytes)) = encode(image, transparent)
            && useful(&bytes)
        {
            variants.push(Variant {
                width: target,
                content_type,
                bytes,
            });
        }
    };
    // Réencodée à sa taille, une image lourde s’allège sans changer de largeur.
    let (mut source, mut orientation) = if width <= largest {
        let full = turned(image, orientation);
        keep(width, &full);
        (full, Orientation::NoTransforms)
    } else {
        (image, orientation)
    };
    // La plus grande d’abord, chacune réduite de la précédente : l’image
    // entière part dès sa première réduction, avant qu’on la tourne et qu’on
    // l’encode.
    for target in VARIANT_WIDTHS
        .into_iter()
        .rev()
        .filter(|&target| target < width)
    {
        let reduction = reduced(&source, orientation, target);
        drop(source);
        source = turned(reduction, orientation);
        orientation = Orientation::NoTransforms;
        keep(target, &source);
    }
    variants.sort_by_key(|variant| variant.width);
    variants
}

/// La première image d’une image animée, à 1 600 px au plus, sans condition de poids.
fn still(image: DynamicImage, orientation: Orientation) -> Option<Variant> {
    let largest = VARIANT_WIDTHS[VARIANT_WIDTHS.len() - 1];
    let (displayed_width, _) = displayed(&image, orientation);
    let width = displayed_width.min(largest);
    let transparent = has_transparency(&image);
    let source = if width == displayed_width {
        turned(image, orientation)
    } else {
        let reduction = reduced(&image, orientation, width);
        drop(image);
        turned(reduction, orientation)
    };
    let (content_type, bytes) = encode(&source, transparent)?;
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
/// Une image déjà en RGB ou RGBA 8 bits s’encode sans copie.
fn encode(image: &DynamicImage, transparent: bool) -> Option<(&'static str, Vec<u8>)> {
    let mut bytes = Vec::new();
    if transparent {
        let converted;
        let rgba = match image.as_rgba8() {
            Some(buffer) => buffer,
            None => {
                converted = image.to_rgba8();
                &converted
            }
        };
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
        let converted;
        let rgb = match image.as_rgb8() {
            Some(buffer) => buffer,
            None => {
                converted = image.to_rgb8();
                &converted
            }
        };
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
    fn an_image_over_twenty_five_megapixels_is_refused_before_decoding() {
        // En-tête PNG de 5 001 × 5 000 px (25,005 Mpx), avec des données vides.
        let mut bytes = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut bytes, 5001, 5000);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Eight);
            let mut writer = encoder.write_header().unwrap();
            writer.write_chunk(png::chunk::IDAT, &[]).unwrap();
        }
        assert_eq!(process(&bytes, "image/png").err(), Some(Rejected::TooLarge));
    }

    /// Une moitié gauche rouge et une moitié droite bleue, pour suivre la rotation.
    fn halves(width: u32, height: u32) -> DynamicImage {
        DynamicImage::ImageRgb8(image::RgbImage::from_fn(width, height, |x, _| {
            if x < width / 2 {
                image::Rgb([220, 20, 20])
            } else {
                image::Rgb([20, 20, 220])
            }
        }))
    }

    fn with_orientation(jpeg: &[u8], orientation: Orientation) -> Vec<u8> {
        let tiff = exif_orientation(orientation);
        let app1 = [
            &[0xff, 0xe1][..],
            &((tiff.len() + 8) as u16).to_be_bytes(),
            b"Exif\0\0",
            &tiff,
        ]
        .concat();
        [&jpeg[..2], &app1, &jpeg[2..]].concat()
    }

    fn red(pixel: image::Rgb<u8>) -> bool {
        pixel.0[0] > 150 && pixel.0[2] < 100
    }

    #[test]
    fn variants_of_an_oriented_jpeg_are_turned_and_sized_as_displayed() {
        let mut plain = Cursor::new(Vec::new());
        halves(3000, 2000)
            .write_to(&mut plain, ImageFormat::Jpeg)
            .unwrap();
        let plain = plain.into_inner();
        // EXIF 6 tourne de 90° vers la droite : la gauche passe en haut ;
        // EXIF 8 tourne de 90° vers la gauche : la gauche passe en bas.
        for (orientation, left_on_top) in [
            (Orientation::Rotate90, true),
            (Orientation::Rotate270, false),
        ] {
            let processed = process(&with_orientation(&plain, orientation), "image/jpeg").unwrap();
            assert_eq!((processed.width, processed.height), (2000, 3000));
            let widths: Vec<u32> = processed.variants.iter().map(|v| v.width).collect();
            assert_eq!(widths, vec![480, 960, 1600]);
            for variant in &processed.variants {
                assert_eq!(variant.content_type, "image/jpeg");
                let decoded = image::load_from_memory(&variant.bytes).unwrap().to_rgb8();
                assert_eq!(
                    (decoded.width(), decoded.height()),
                    (variant.width, variant.width * 3 / 2)
                );
                let middle = decoded.width() / 2;
                let top = *decoded.get_pixel(middle, decoded.height() / 10);
                let bottom = *decoded.get_pixel(middle, decoded.height() * 9 / 10);
                assert_eq!(red(top), left_on_top, "{orientation:?} {}", variant.width);
                assert_eq!(
                    red(bottom),
                    !left_on_top,
                    "{orientation:?} {}",
                    variant.width
                );
            }
        }
    }

    #[test]
    fn a_full_size_variant_of_an_oriented_image_is_turned_too() {
        let mut plain = Cursor::new(Vec::new());
        halves(1200, 800)
            .write_to(&mut plain, ImageFormat::Jpeg)
            .unwrap();
        let bytes = with_orientation(&plain.into_inner(), Orientation::Rotate90);
        let (image, orientation) = decode(&bytes, ImageFormat::Jpeg).unwrap();
        assert_eq!(orientation, Orientation::Rotate90);
        assert_eq!(displayed(&image, orientation), (800, 1200));
        // Sans seuil de poids, la variante à sa taille est toujours gardée.
        let variants = variants(image, orientation, usize::MAX / 10);
        let widths: Vec<u32> = variants.iter().map(|v| v.width).collect();
        assert_eq!(widths, vec![480, 800]);
        let full = image::load_from_memory(&variants[1].bytes)
            .unwrap()
            .to_rgb8();
        assert_eq!((full.width(), full.height()), (800, 1200));
        assert!(red(*full.get_pixel(400, 100)));
        assert!(!red(*full.get_pixel(400, 1100)));
    }

    #[test]
    fn the_largest_admitted_png_and_jpeg_decode_within_the_allocation_limit() {
        // 5 000 × 5 000 px : 25 Mpx tout juste, le plus grand import admis.
        let side = 5000;
        assert_eq!(u64::from(side) * u64::from(side), MAX_PIXELS);
        let mut png = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut png, side, side);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Eight);
            encoder.set_compression(png::Compression::Fast);
            let mut writer = encoder.write_header().unwrap();
            let row = [200u8, 40, 40, 128].repeat(side as usize);
            let mut stream = writer.stream_writer().unwrap();
            for _ in 0..side {
                std::io::Write::write_all(&mut stream, &row).unwrap();
            }
            stream.finish().unwrap();
        }
        let (image, _) = decode(&png, ImageFormat::Png).expect("PNG RGBA de 25 Mpx décodé");
        assert_eq!(image.color(), image::ColorType::Rgba8);
        assert_eq!(image.as_bytes().len() as u64, MAX_ALLOC);
        drop(image);
        let mut jpeg = Cursor::new(Vec::new());
        DynamicImage::ImageRgb8(image::RgbImage::from_pixel(
            side,
            side,
            image::Rgb([200, 40, 40]),
        ))
        .write_to(&mut jpeg, ImageFormat::Jpeg)
        .unwrap();
        let (image, _) =
            decode(&jpeg.into_inner(), ImageFormat::Jpeg).expect("JPEG de 25 Mpx décodé");
        assert_eq!(image.dimensions(), (side, side));
        // Un tampon plus grand que la limite (RGBA 16 bits) n’est pas décodé.
        let mut wide = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut wide, 4000, 4000);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Sixteen);
            let mut writer = encoder.write_header().unwrap();
            writer.write_chunk(png::chunk::IDAT, &[]).unwrap();
        }
        assert_eq!(
            decode(&wide, ImageFormat::Png).err(),
            Some(Undecoded::TooHeavy)
        );
    }

    /// Le coût de décodage d’une image, lu dans son seul en-tête.
    fn cost(bytes: &[u8], format: ImageFormat) -> u64 {
        let decoder = reader(bytes, format, None).into_decoder().unwrap();
        decoding_cost(bytes, format, &decoder)
    }

    /// Un PNG dont seul l’en-tête compte.
    fn png_header(width: u32, height: u32, depth: png::BitDepth) -> Vec<u8> {
        let mut bytes = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut bytes, width, height);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(depth);
            let mut writer = encoder.write_header().unwrap();
            writer.write_chunk(png::chunk::IDAT, &[]).unwrap();
        }
        bytes
    }

    #[test]
    fn the_decoding_cost_counts_what_each_decoder_allocates_beside_its_output() {
        // PNG 8 bits : le tampon de sortie seul ; 16 bits : plus sa copie en 8 bits.
        let eight = png_header(5000, 5000, png::BitDepth::Eight);
        assert_eq!(cost(&eight, ImageFormat::Png), MAX_ALLOC);
        let sixteen = png_header(3535, 3535, png::BitDepth::Sixteen);
        assert_eq!(cost(&sixteen, ImageFormat::Png), 3535 * 3535 * 12);
        assert!(cost(&sixteen, ImageFormat::Png) <= MAX_DECODING);
        let sixteen = png_header(3540, 3540, png::BitDepth::Sixteen);
        assert!(cost(&sixteen, ImageFormat::Png) > MAX_DECODING);
        assert_eq!(
            decode(&sixteen, ImageFormat::Png).err(),
            Some(Undecoded::TooHeavy)
        );
        // GIF : le cadre et le canevas, 4 octets par pixel chacun.
        let mut gif = encoded(12, 6, ImageFormat::Gif);
        gif[6..10].copy_from_slice(&[0x88, 0x13, 0x88, 0x13]);
        assert_eq!(cost(&gif, ImageFormat::Gif), 5000 * 5000 * 8);
        assert_eq!(
            decode(&gif, ImageFormat::Gif).err(),
            Some(Undecoded::TooHeavy)
        );
        // WebP sans perte avec transparence : 11 octets par pixel, 13,6 Mpx passent.
        let webp = |width: u32, height: u32| {
            let mut bytes = encoded(4, 4, ImageFormat::WebP);
            assert_eq!(&bytes[12..16], b"VP8L");
            let header = u32::from_le_bytes(bytes[21..25].try_into().unwrap());
            let header = (header & 0xe000_0000) | 1 << 28 | (width - 1) | (height - 1) << 14;
            bytes[21..25].copy_from_slice(&header.to_le_bytes());
            bytes
        };
        assert_eq!(cost(&webp(3690, 3690), ImageFormat::WebP), 3690 * 3690 * 11);
        assert!(cost(&webp(3690, 3690), ImageFormat::WebP) <= MAX_DECODING);
        assert_eq!(
            decode(&webp(3700, 3700), ImageFormat::WebP).err(),
            Some(Undecoded::TooHeavy)
        );
        // JPEG séquentiel : la sortie seule.
        let jpeg = encoded(40, 20, ImageFormat::Jpeg);
        assert_eq!(progressive_coefficients(&jpeg), Some(0));
        assert_eq!(cost(&jpeg, ImageFormat::Jpeg), 40 * 20 * 3);
    }

    #[test]
    fn an_image_too_heavy_to_reduce_is_refused_at_import_but_kept_when_stored() {
        // PNG RGBA de 16 bits de 12,5 Mpx et plus : son décodage dépasse MAX_DECODING.
        let heavy = png_header(3540, 3540, png::BitDepth::Sixteen);
        assert_eq!(process(&heavy, "image/png").err(), Some(Rejected::TooHeavy));
        // Déjà en base, elle reste gardée sans variante, mesurée par son en-tête.
        let stored = process_stored(&heavy, "image/png").unwrap();
        assert_eq!((stored.width, stored.height), (3540, 3540));
        assert!(stored.variants.is_empty() && stored.still.is_none());
        // Légère mais refusée entière par le décodeur (données vides) : admise
        // sans variante, comme avant.
        let empty = png_header(100, 100, png::BitDepth::Eight);
        let admitted = process(&empty, "image/png").unwrap();
        assert_eq!((admitted.width, admitted.height), (100, 100));
        assert!(admitted.variants.is_empty());
    }

    #[test]
    fn a_progressive_jpeg_counts_every_coefficient_it_keeps() {
        // SOF2 de 6 000 × 4 000 px en 4:2:0 : MCU de 16 × 16 px, Y en 2 × 2.
        let frame = |kind: u8, components: &[(u8, u8)]| {
            let mut sof = vec![8, 0x0f, 0xa0, 0x17, 0x70, components.len() as u8];
            for &(id, factor) in components {
                sof.extend_from_slice(&[id, factor, 0]);
            }
            let length = (sof.len() + 2) as u16;
            let app0 = [0xff, 0xe0, 0, 4, 0, 0];
            [
                &[0xff, 0xd8][..],
                &app0,
                &[0xff, kind],
                &length.to_be_bytes(),
                &sof,
                &[0xff, 0xd9],
            ]
            .concat()
        };
        let mcus = 375 * 250;
        let yuv420 = frame(0xc2, &[(1, 0x22), (2, 0x11), (3, 0x11)]);
        assert_eq!(progressive_coefficients(&yuv420), Some(mcus * 64 * 6));
        // 4:4:4 et CMJN : un échantillon par pixel et par composante.
        let full = 750 * 500 * 64;
        let yuv444 = frame(0xc2, &[(1, 0x11), (2, 0x11), (3, 0x11)]);
        assert_eq!(progressive_coefficients(&yuv444), Some(full * 3));
        let cmyk = frame(0xc2, &[(1, 0x11), (2, 0x11), (3, 0x11), (4, 0x11)]);
        assert_eq!(progressive_coefficients(&cmyk), Some(full * 4));
        // 24 Mpx en 4:2:0 passent : 72 Mo de sortie et 72 Mo de coefficients.
        assert!(6000 * 4000 * 3 + mcus * 64 * 6 * 2 <= MAX_DECODING);
        assert_eq!(
            progressive_coefficients(&frame(0xc0, &[(1, 0x22)])),
            Some(0)
        );
    }

    #[test]
    fn a_sixteen_bit_image_is_brought_to_eight_bits_once_decoded() {
        let mut bytes = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut bytes, 20, 10);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Sixteen);
            let mut writer = encoder.write_header().unwrap();
            writer
                .write_image_data(&[0x80, 0, 0x20, 0, 0x20, 0, 0x80, 0].repeat(200))
                .unwrap();
        }
        let (image, _) = decode(&bytes, ImageFormat::Png).unwrap();
        assert_eq!(image.color(), ColorType::Rgba8);
        assert_eq!(
            image.as_rgba8().unwrap().get_pixel(3, 3).0,
            [128, 32, 32, 128]
        );
        let processed = process(&bytes, "image/png").unwrap();
        assert_eq!((processed.width, processed.height), (20, 10));
    }
}
