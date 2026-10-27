/**
 * Techniques et déploiement purement visuels de la connexion JJK.
 * Le son est synthétisé localement, uniquement après son activation explicite.
 * Aucun identifiant, appel réseau, stockage ni délai d’authentification ici.
 */
export function brancherTerritoire(scene: HTMLElement, reduction: MediaQueryList, tourner: () => void) {
  const techniques = [...scene.querySelectorAll<HTMLButtonElement>('button[data-technique]')];
  const deploiement = scene.querySelector<HTMLButtonElement>('#bo-domain-trigger');
  const son = scene.querySelector<HTMLButtonElement>('#bo-sound-toggle');
  const noms: Record<string, string> = { ombres: 'Dix Ombres', infini: 'Infini', sanctuaire: 'Sanctuaire' };
  let minuterie: number | undefined;
  let audio: AudioContext | undefined;
  let sonActif = false;
  let generationSon = 0;
  const notes = new Set<OscillatorNode>();
  const autorise = () => !reduction.matches && !document.hidden && scene.dataset.motion === 'active';

  function afficherSon(): void {
    scene.dataset.sound = sonActif ? 'on' : 'off';
    son?.setAttribute('aria-pressed', String(sonActif));
    son?.setAttribute('aria-label', sonActif ? 'Couper le son' : 'Activer le son');
    const texte = son?.querySelector('[data-sound-label]');
    if (texte) texte.textContent = sonActif ? 'Son activé' : 'Son désactivé';
  }
  function couperNotes(): void {
    generationSon += 1;
    for (const note of notes) { note.stop(); note.disconnect(); }
    notes.clear();
  }
  function jouer(profond = false): void {
    if (!sonActif || !audio || reduction.matches || document.hidden) return;
    couperNotes();
    const generation = generationSon;
    const contexte = audio;
    void contexte.resume().then(() => {
      if (!sonActif || generation !== generationSon || audio !== contexte || document.hidden || reduction.matches) return;
      const debut = contexte.currentTime;
      const duree = profond ? 1.4 : .35;
      for (const [rang, frequence] of (profond ? [82.4, 123.6, 208] : [164.8, 329.6]).entries()) {
        const note = contexte.createOscillator();
        const enveloppe = contexte.createGain();
        note.type = 'sine';
        note.frequency.setValueAtTime(frequence, debut);
        note.frequency.exponentialRampToValueAtTime(frequence * .76, debut + duree);
        enveloppe.gain.setValueAtTime(0, debut);
        enveloppe.gain.linearRampToValueAtTime(.045 / (rang + 1), debut + .018);
        enveloppe.gain.exponentialRampToValueAtTime(.0001, debut + duree);
        note.connect(enveloppe).connect(contexte.destination);
        notes.add(note);
        note.onended = () => {
          notes.delete(note);
          note.disconnect();
          enveloppe.disconnect();
          if (generation === generationSon && notes.size === 0 && audio === contexte) void contexte.suspend().catch(() => {});
        };
        note.start(debut);
        note.stop(debut + duree);
      }
    }).catch(() => { sonActif = false; afficherSon(); });
  }
  function fermer(): void {
    window.clearTimeout(minuterie);
    minuterie = undefined;
    delete scene.dataset.domain;
    if (deploiement) deploiement.disabled = !autorise();
  }
  function synchroniser(interrompreSon = !autorise()): void {
    if (!autorise()) fermer();
    if (interrompreSon) {
      couperNotes();
      void audio?.suspend().catch(() => {});
    }
    if (deploiement) deploiement.disabled = !autorise() || scene.dataset.domain === 'active';
  }
  function deployer(): void {
    if (!autorise() || scene.dataset.domain === 'active') return;
    scene.dataset.domain = 'active';
    if (deploiement) deploiement.disabled = true;
    tourner();
    jouer(true);
    // Le garde-fou reprend les jetons CSS, y compris si animationend est perdu.
    const styles = getComputedStyle(scene);
    const valeur = styles.getPropertyValue('--jjk-d-territoire').trim();
    const duree = Number.parseFloat(valeur) * (valeur.endsWith('ms') ? 1 : 1000);
    const repli = Number.parseFloat(styles.getPropertyValue('--d-scene')) * 6;
    minuterie = window.setTimeout(fermer, (Number.isFinite(duree) ? duree : repli) + 100);
  }

  for (const bouton of techniques) {
    bouton.addEventListener('click', () => {
      const technique = bouton.dataset.technique!;
      if (!(technique in noms) || scene.dataset.technique === technique) return;
      scene.dataset.technique = technique;
      for (const choix of techniques) choix.setAttribute('aria-pressed', String(choix === bouton));
      for (const titre of scene.querySelectorAll('[data-technique-name]')) titre.textContent = noms[technique];
      if (autorise()) { tourner(); jouer(); }
    });
  }
  deploiement?.addEventListener('click', deployer);
  scene.addEventListener('animationend', (event) => { if (event.animationName === 'jjk-territoire') fermer(); });
  if (son) {
    son.hidden = typeof AudioContext === 'undefined';
    son.addEventListener('click', () => {
      sonActif = !sonActif;
      if (sonActif) {
        // Ce constructeur ne s’exécute que dans le geste explicite d’activation.
        try { audio ??= new AudioContext(); }
        catch { sonActif = false; }
        if (autorise()) jouer();
      } else { couperNotes(); void audio?.suspend().catch(() => {}); }
      afficherSon();
    });
  }
  afficherSon();
  synchroniser();
  return {
    synchroniser,
    reussir(passage: HTMLElement): void {
      passage.dataset.technique = scene.dataset.technique ?? 'ombres';
      jouer(true);
    },
    arreter(): void {
      fermer();
      couperNotes();
      sonActif = false;
      afficherSon();
      void audio?.close().catch(() => {});
      audio = undefined;
    },
  };
}
