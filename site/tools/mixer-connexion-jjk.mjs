#!/usr/bin/env node
/**
 * Monte la bande du cinéma JJK à partir des SFX référencés dans sources.json.
 * Les sources et intermédiaires restent dans .impeccable/review/ (ignoré).
 * Usage : node tools/mixer-connexion-jjk.mjs --ffmpeg /chemin/ffmpeg
 * Ajouter --telecharger pour reprendre les originaux officiels manquants.
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('../../', import.meta.url));
const DOC = join(RACINE, 'design/assets/audio/connexion-jjk');
const SOURCES = join(RACINE, '.impeccable/review/audio-sources');
const TRAVAIL = join(RACINE, '.impeccable/review/audio-mix');
const SORTIE = join(RACINE, 'site/public/audio/connexion-jjk.mp3');
const argumentsCli = process.argv.slice(2);
const option = (nom, defaut) => {
  const position = argumentsCli.indexOf(nom);
  return position < 0 ? defaut : argumentsCli[position + 1];
};
const FFMPEG = option('--ffmpeg', process.env.FFMPEG_BIN || 'ffmpeg');
const FREQUENCE = 48000;
const CANAUX = 2;
const BUDGET = 450000;
const sha = (corps) => createHash('sha256').update(corps).digest('hex');
const arrondir = (nombre) => Math.round(nombre * 1e6) / 1e6;

function ffmpeg(argumentsFfmpeg, binaire = false) {
  const resultat = spawnSync(FFMPEG, ['-hide_banner', '-nostdin', '-y', '-filter_threads', '1', '-filter_complex_threads', '1', ...argumentsFfmpeg], {
    encoding: binaire ? undefined : 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  if (resultat.error) throw resultat.error;
  if (resultat.status !== 0) throw new Error(String(resultat.stderr));
  return resultat;
}

const manifeste = JSON.parse(readFileSync(join(DOC, 'sources.json'), 'utf8'));
const jetons = readFileSync(join(RACINE, 'site/src/styles/jetons.css'), 'utf8');
const noms = ['invocation', 'signes', 'regard', 'revelation', 'duel', 'adaptation', 'expansion', 'silence', 'final'];
let horloge = 0;
const plans = Object.fromEntries(noms.map((nom) => {
  const correspondance = new RegExp(`--jjk-cine-${nom}:\\s*([\\d.]+)(ms|s)\\s*;`).exec(jetons);
  const duree = nom === 'final' ? 3.5 : correspondance && Number(correspondance[1]) / (correspondance[2] === 'ms' ? 1000 : 1);
  if (!(duree > 0)) throw new Error(`Durée absente : ${nom}`);
  const plan = { debut: arrondir(horloge), duree };
  horloge += duree;
  return [nom, plan];
}));
const DUREE = arrondir(horloge);
mkdirSync(TRAVAIL, { recursive: true });
mkdirSync(SOURCES, { recursive: true });

// Le grave reste centré ; les lames et leurs réflexions se déplacent peu.
// Les niveaux sont relatifs aux sources préparées à une même crête de -6 dBFS.
/** @type {Array<{plan: string, role: string, duree: number, niveau: number, retard?: number, prise?: number, hauteur?: number, entree?: number, sortie?: number, grave?: number, aigu?: number, echo?: boolean, ancre?: string, pan?: number}>} */
const gestes = [
  { plan: 'invocation', role: 'drone', duree: plans.silence.debut - .08, prise: 12, hauteur: .7, niveau: .16, entree: .55, sortie: .5, grave: 35, aigu: 650 },
  { plan: 'invocation', role: 'horn', retard: .08, duree: 1.65, hauteur: .63, niveau: .26, entree: .25, sortie: .4, aigu: 1100, echo: true },
  ...[0, .7, 1.4].map((retard, i) => ({ plan: 'signes', role: 'deep', retard: retard + .04, duree: .7, ancre: 'impact', hauteur: .72 + i * .08, niveau: .5, aigu: 900, sortie: .28 })),
  { plan: 'regard', role: 'reverse', duree: 1.53, ancre: 'avant', niveau: .38, grave: 220, aigu: 6000, entree: .12, sortie: .035, pan: -.12 },
  { plan: 'revelation', role: 'impact', duree: 2.9, ancre: 'impact', hauteur: .72, niveau: .8, grave: 30, aigu: 3200, sortie: .8 },
  { plan: 'revelation', role: 'horn', retard: .08, duree: 2.8, hauteur: .68, niveau: .36, aigu: 1600, entree: .07, sortie: .7, echo: true },
  { plan: 'revelation', role: 'bell', retard: .1, duree: 2.5, ancre: 'impact', hauteur: .54, niveau: .12, aigu: 2800, sortie: .9, pan: .15 },
  { plan: 'duel', role: 'whoosh', retard: .02, duree: .72, ancre: 'avant', hauteur: 1.1, niveau: .6, grave: 170, aigu: 7800, pan: -.35 },
  { plan: 'duel', role: 'slash', retard: .75, duree: .85, ancre: 'avant', hauteur: .9, niveau: .62, grave: 170, aigu: 7800, pan: .35 },
  { plan: 'duel', role: 'whoosh', retard: 1.58, duree: .9, ancre: 'avant', hauteur: .72, niveau: .68, grave: 100, aigu: 6500, pan: -.1 },
  { plan: 'duel', role: 'deep', retard: 1.91, duree: .62, ancre: 'impact', hauteur: .7, niveau: .55, aigu: 800, sortie: .2 },
  { plan: 'adaptation', role: 'bell', retard: .02, duree: 2.5, ancre: 'impact', hauteur: .72, niveau: .52, grave: 130, aigu: 5400, sortie: .7, echo: true },
  ...[.72, 1.46].map((retard, i) => ({ plan: 'adaptation', role: 'slash', retard, duree: .55, ancre: 'impact', hauteur: .62 + i * .18, niveau: .17, grave: 450, aigu: 4300, sortie: .3, pan: i ? .2 : -.2 })),
  { plan: 'expansion', role: 'reverse', duree: 1.43, ancre: 'avant', hauteur: .8, niveau: .54, grave: 120, aigu: 6500, entree: .1, sortie: .025 },
  { plan: 'expansion', role: 'impact', retard: 1.44, duree: 1.27, ancre: 'impact', hauteur: .58, niveau: 1, grave: 28, aigu: 4500, sortie: .32 },
  { plan: 'expansion', role: 'horn', retard: 1.46, duree: 1.23, hauteur: .5, niveau: .4, aigu: 1300, sortie: .3 },
  { plan: 'expansion', role: 'slash', retard: 1.47, duree: 1.1, ancre: 'impact', hauteur: .7, niveau: .27, grave: 900, aigu: 6000, sortie: .5, pan: .16 },
  // 80 ms de garde aux deux bords évitent le pré-écho MP3 dans la seconde muette.
  { plan: 'final', role: 'bell', retard: .08, duree: 3.4, ancre: 'impact', hauteur: .72, niveau: .32, grave: 180, aigu: 4000, entree: .1, sortie: 1.1, pan: -.18, echo: true },
  { plan: 'final', role: 'bell', retard: .2, duree: 3.1, ancre: 'impact', hauteur: 1.08, niveau: .13, grave: 350, aigu: 4000, entree: .2, sortie: 1.2, pan: .18, echo: true },
  { plan: 'final', role: 'horn', retard: .08, duree: 3.3, hauteur: .55, niveau: .12, aigu: 550, entree: .45, sortie: 1.1 },
];

async function trouverSource(source) {
  const fichier = join(SOURCES, source.file);
  if (existsSync(fichier)) {
    if (sha(readFileSync(fichier)) !== source.sha256) throw new Error(`Empreinte locale incorrecte : ${source.role}`);
    return fichier;
  }
  const original = join(SOURCES, `${source.role}.original`);
  if (existsSync(original)) {
    if (sha(readFileSync(original)) !== source.originalSha256) throw new Error(`Empreinte originale incorrecte : ${source.role}`);
    return original;
  }
  if (!argumentsCli.includes('--telecharger')) throw new Error(`Source manquante : ${source.file}. Voir le README ou ajouter --telecharger.`);
  const reponse = await fetch(source.downloadUrl);
  if (!reponse.ok) throw new Error(`Téléchargement ${source.role} : HTTP ${reponse.status}`);
  const corps = Buffer.from(await reponse.arrayBuffer());
  if (sha(corps) !== source.originalSha256) throw new Error(`L’original de ${source.role} a changé ; revoir la provenance avant de le mixer.`);
  writeFileSync(original, corps);
  return original;
}

const prepares = new Map();
for (const source of manifeste.sources) {
  const fichier = await trouverSource(source);
  const pcm = ffmpeg(['-v', 'error', '-i', fichier, '-t', '20', '-ac', '1', '-ar', String(FREQUENCE), '-f', 'f32le', 'pipe:1'], true).stdout;
  let crete = 0;
  let maximum = 0;
  for (let i = 0; i < pcm.length; i += 4) {
    const valeur = Math.abs(pcm.readFloatLE(i));
    if (valeur > crete) { crete = valeur; maximum = i / 4; }
  }
  if (crete < .00001) throw new Error(`Source muette : ${source.role}`);
  for (let i = 0; i < pcm.length; i += 4) pcm.writeFloatLE(pcm.readFloatLE(i) * .5 / crete, i);
  const cible = join(TRAVAIL, `${source.role}.f32`);
  writeFileSync(cible, pcm);
  prepares.set(source.role, { fichier: cible, impact: maximum / FREQUENCE, duree: pcm.length / 4 / FREQUENCE });
}

const entrees = [];
const filtres = gestes.map((geste, index) => {
  const source = prepares.get(geste.role);
  if (!source) throw new Error(`Rôle sonore absent : ${geste.role}`);
  entrees.push('-f', 'f32le', '-ar', String(FREQUENCE), '-ac', '1', '-i', source.fichier);
  const hauteur = geste.hauteur ?? 1;
  const prise = geste.prise ?? geste.duree * hauteur;
  const debut = geste.ancre === 'impact' ? Math.max(0, source.impact - .025) : geste.ancre === 'avant' ? Math.max(0, source.impact - prise) : 0;
  const pan = geste.pan ?? 0;
  const gauche = Math.cos((pan + 1) * Math.PI / 4);
  const droite = Math.sin((pan + 1) * Math.PI / 4);
  const chaine = [
    `atrim=start=${debut}:duration=${prise}`, 'asetpts=PTS-STARTPTS',
    `asetrate=${FREQUENCE * hauteur}`, `aresample=${FREQUENCE}`,
    `highpass=f=${geste.grave ?? 45}`, `lowpass=f=${geste.aigu ?? 6000}`,
    ...(geste.echo ? ['aecho=0.8:0.85:91|173:0.18|0.1'] : []),
    `apad=whole_dur=${geste.duree}`, `atrim=duration=${geste.duree}`,
    `afade=t=in:d=${geste.entree ?? .008}`,
    `afade=t=out:st=${Math.max(0, geste.duree - (geste.sortie ?? .09))}:d=${geste.sortie ?? .09}`,
    `volume=${geste.niveau}`, `pan=stereo|c0=${gauche}*c0|c1=${droite}*c0`,
    `adelay=${Math.round((plans[geste.plan].debut + (geste.retard ?? 0)) * 1000)}:all=1`,
  ];
  return `[${index}:a]${chaine.join(',')}[g${index}]`;
});
filtres.push(`${gestes.map((_, i) => `[g${i}]`).join('')}amix=inputs=${gestes.length}:normalize=0,highpass=f=28,acompressor=threshold=0.45:ratio=2:attack=10:release=160:makeup=1,apad=whole_dur=${DUREE},atrim=duration=${DUREE},afade=t=in:d=0.04,afade=t=out:st=${DUREE - .65}:d=0.65[mix]`);
const mix = join(TRAVAIL, 'montage.wav');
ffmpeg(['-v', 'error', ...entrees, '-filter_complex', filtres.join(';'), '-map', '[mix]', '-ar', String(FREQUENCE), '-c:a', 'pcm_f32le', mix]);

function mesurerLoudness(fichier) {
  const { stderr } = ffmpeg(['-i', fichier, '-af', 'loudnorm=I=-18:TP=-2:LRA=11:print_format=json', '-f', 'null', '-']);
  const json = String(stderr).match(/\{\s*"input_i"[\s\S]*?\}/)?.[0];
  if (!json) throw new Error('Mesure loudnorm absente.');
  return JSON.parse(json);
}
const premiere = mesurerLoudness(mix);
const normalise = join(TRAVAIL, 'normalise.wav');
const normalisation = `loudnorm=I=-18:TP=-2:LRA=11:measured_I=${premiere.input_i}:measured_TP=${premiere.input_tp}:measured_LRA=${premiere.input_lra}:measured_thresh=${premiere.input_thresh}:offset=${premiere.target_offset}:linear=true`;
// Couper après le rééchantillonnage élimine aussi les queues infinitésimales
// des filtres ; les gardes absorbent le recouvrement des blocs du codec MP3.
const silence = `between(t,${plans.silence.debut - .08},${plans.final.debut + .08})`;
const porte = `aeval=exprs='if(${silence},0,val(0))|if(${silence},0,val(1))':channel_layout=stereo`;
ffmpeg(['-v', 'error', '-i', mix, '-af', `${normalisation},aresample=${FREQUENCE},${porte}`, '-ar', String(FREQUENCE), '-c:a', 'pcm_s24le', normalise]);
const candidat = join(TRAVAIL, 'connexion-jjk.mp3');
let attenuation = 0;
let mesure;
for (let essai = 0; essai < 3; essai += 1) {
  ffmpeg(['-v', 'error', '-i', normalise, '-af', `volume=${attenuation}dB`, '-ar', String(FREQUENCE), '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '160k', '-map_metadata', '-1', '-id3v2_version', '3', '-metadata', 'title=Connexion JJK — bande de la cinématique', candidat]);
  mesure = mesurerLoudness(candidat);
  if (Number(mesure.input_tp) <= -1.5) break;
  attenuation -= Number(mesure.input_tp) + 1.6;
}
const decode = ffmpeg(['-v', 'error', '-i', candidat, '-f', 'f32le', '-ar', String(FREQUENCE), '-ac', '2', 'pipe:1'], true).stdout;
const parPlan = noms.map((nom) => {
  const { debut, duree } = plans[nom];
  const premier = Math.round(debut * FREQUENCE) * CANAUX;
  const dernier = Math.min(decode.length / 4, Math.round((debut + duree) * FREQUENCE) * CANAUX);
  let somme = 0;
  let crete = 0;
  for (let i = premier; i < dernier; i += 1) {
    const valeur = decode.readFloatLE(i * 4);
    somme += valeur * valeur;
    crete = Math.max(crete, Math.abs(valeur));
  }
  const db = (valeur) => valeur ? Number((20 * Math.log10(valeur)).toFixed(2)) : null;
  return { plan: nom, debut, duree, creteDbfs: db(crete), rmsDbfs: db(Math.sqrt(somme / (dernier - premier))), creteLineaire: crete };
});
if (Number(mesure.input_tp) > -1.5 || Math.abs(Number(mesure.input_i) + 18) > 1.1) throw new Error(`Niveau final hors cible : ${JSON.stringify(mesure)}`);
if (statSync(candidat).size > BUDGET) throw new Error('MP3 au-dessus de 450 000 octets.');
if (parPlan.find(({ plan }) => plan === 'silence').creteLineaire !== 0) throw new Error('Le codec a laissé du son dans la seconde muette.');
if (Math.abs(decode.length / 4 / CANAUX / FREQUENCE - DUREE) > .001) throw new Error('La durée décodée diffère du montage.');
mkdirSync(dirname(SORTIE), { recursive: true });
copyFileSync(candidat, SORTIE);
const rapport = {
  fichier: 'site/public/audio/connexion-jjk.mp3', sha256: sha(readFileSync(SORTIE)), octets: statSync(SORTIE).size,
  duree: DUREE, frequence: FREQUENCE, canaux: CANAUX, bitrate: 160000,
  lufsIntegres: Number(mesure.input_i), truePeakDbtp: Number(mesure.input_tp), loudnessRangeLu: Number(mesure.input_lra),
  parPlan, gestes, ffmpeg: String(ffmpeg(['-version']).stdout).split('\n')[0].trim(),
  sources: manifeste.sources.map(({ role, sha256, originalSha256 }) => ({ role, sha256, originalSha256 })),
};
writeFileSync(join(DOC, 'mix.json'), `${JSON.stringify(rapport, null, 2)}\n`);
console.log(JSON.stringify({ ...rapport, gestes: `${gestes.length} couches éditées`, sources: `${rapport.sources.length} sources vérifiées` }, null, 2));
