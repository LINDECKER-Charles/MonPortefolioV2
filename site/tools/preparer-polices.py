"""Prépare les sous-ensembles Instrument Sans / Instrument Serif du site.

Usage : python preparer-polices.py <dossier des sources google/fonts> <dossier de sortie>

1. Instrument Sans : instance wdth=100 (l'axe de chasse n'est pas utilisé),
   wght 400-700 conservé.
2. Les glyphes absents des sources, mais utilisés par le site :
   - U+202F (espace fine insécable) et U+2009 (espace fine) pointent vers
     l'espace insécable de la police (0,2 em en Sans, 0,17 em en Serif) ;
   - ≈ (U+2248) est composé de deux tildes de la police, centrés sur l'axe
     du signe égal ;
   - les flèches ← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙ de la Serif reprennent le dessin de la
     Sans en graisse 400 (même famille, même unité de 1 000).
3. Sous-ensemble latin français + flèches, en woff2.
"""
import copy
import sys
from pathlib import Path

from fontTools import subset
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import GlyphComponent, Glyph
from fontTools.ttLib.tables.ttProgram import Program
from fontTools.varLib.instancer import instantiateVariableFont

SOURCES = Path(sys.argv[1])
SORTIE = Path(sys.argv[2])
UNICODES = (
    'U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+0178,U+02C6,U+02DA,U+02DC,'
    'U+2009,U+2010-2015,U+2018-201E,U+2022,U+2026,U+202F,U+2039-203A,U+20AC,'
    'U+2122,U+2190-2199,U+2212,U+2248'
)
FLECHES = list(range(0x2190, 0x219A))


def cmaps(police):
    return [t for t in police['cmap'].tables if t.isUnicode()]


def associer(police, code, nom):
    for table in cmaps(police):
        table.cmap[code] = nom


def boite(police, nom):
    pen = BoundsPen(police.getGlyphSet())
    police.getGlyphSet()[nom].draw(pen)
    return pen.bounds


def ajouter_espaces(police):
    cible = police.getBestCmap()[0x00A0]
    for code in (0x202F, 0x2009):
        associer(police, code, cible)


def ajouter_presque_egal(police):
    cm = police.getBestCmap()
    if 0x2248 in cm:
        return
    tilde = cm[0x7E]
    egal = cm[0x3D]
    _, ty0, _, ty1 = boite(police, tilde)
    _, ey0, _, ey1 = boite(police, egal)
    centre_tilde = (ty0 + ty1) / 2
    centre_egal = (ey0 + ey1) / 2
    ecart = round((ey1 - ey0) * 0.36)
    glyphe = Glyph()
    glyphe.numberOfContours = -1
    glyphe.components = []
    for sens in (1, -1):
        composant = GlyphComponent()
        composant.glyphName = tilde
        composant.x = 0
        composant.y = round(centre_egal - centre_tilde + sens * ecart)
        composant.flags = 0x4 if sens == 1 else 0  # ROUND_XY_TO_GRID
        glyphe.components.append(composant)
    glyphe.components[0].flags |= 0x200  # USE_MY_METRICS
    nom = 'approxequal'
    police['glyf'].glyphs[nom] = glyphe
    ordre = police.getGlyphOrder() + [nom]
    police.setGlyphOrder(ordre)
    police['glyf'].glyphOrder = ordre
    police['hmtx'][nom] = police['hmtx'][tilde]
    if 'gvar' in police:
        police['gvar'].variations[nom] = []
    if 'HVAR' in police and police['HVAR'].table.AdvWidthMap is not None:
        carte = police['HVAR'].table.AdvWidthMap.mapping
        carte[nom] = carte[tilde]
    associer(police, 0x2248, nom)


def ajouter_fleches(serif, sans_regulier):
    cm_sans = sans_regulier.getBestCmap()
    cm = serif.getBestCmap()
    ordre = serif.getGlyphOrder()
    for code in FLECHES:
        if code in cm or code not in cm_sans:
            continue
        nom = cm_sans[code]
        glyphe = copy.deepcopy(sans_regulier['glyf'][nom])
        glyphe.expand(sans_regulier['glyf'])
        if glyphe.isComposite():
            raise SystemExit(f'flèche composite non gérée : {nom}')
        glyphe.program = Program()
        glyphe.program.fromBytecode(b'')
        serif['glyf'].glyphs[nom] = glyphe
        ordre.append(nom)
        serif['hmtx'][nom] = sans_regulier['hmtx'][nom]
        associer(serif, code, nom)
    serif.setGlyphOrder(ordre)
    serif['glyf'].glyphOrder = ordre


def sous_ensemble(police, sortie):
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.notdef_outline = True
    options.glyph_names = False
    sous = subset.Subsetter(options)
    sous.populate(unicodes=subset.parse_unicodes(UNICODES))
    sous.subset(police)
    police.flavor = 'woff2'
    police.save(sortie)


def main():
    SORTIE.mkdir(parents=True, exist_ok=True)
    sans = TTFont(SOURCES / 'InstrumentSans[wdth,wght].ttf')
    sans = instantiateVariableFont(sans, {'wdth': 100})
    ajouter_espaces(sans)
    ajouter_presque_egal(sans)

    sans_400 = instantiateVariableFont(TTFont(SOURCES / 'InstrumentSans[wdth,wght].ttf'), {'wdth': 100, 'wght': 400})

    for source, nom in (('InstrumentSerif-Regular.ttf', 'instrument-serif-latin.woff2'), ('InstrumentSerif-Italic.ttf', 'instrument-serif-italic-latin.woff2')):
        serif = TTFont(SOURCES / source)
        ajouter_espaces(serif)
        ajouter_presque_egal(serif)
        ajouter_fleches(serif, sans_400)
        sous_ensemble(serif, SORTIE / nom)

    sous_ensemble(sans, SORTIE / 'instrument-sans-latin-wght.woff2')


main()
