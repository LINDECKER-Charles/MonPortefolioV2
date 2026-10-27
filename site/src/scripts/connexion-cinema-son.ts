/** Master monté localement : téléchargement volontaire et reprise à l’instant utile.
 * Le temps du film reste l’autorité après seek, pause et chargement lent. */
export function brancherSonCinema(dialog: HTMLDialogElement, reduction: MediaQueryList, attendre: (actif: boolean) => void) {
  const bouton = dialog.querySelector<HTMLButtonElement>('#bo-cinema-sound')!;
  const volume = dialog.querySelector<HTMLInputElement>('#bo-cinema-volume')!;
  const mesure = dialog.querySelector<HTMLOutputElement>('[data-cinema-volume]')!;
  const mix = dialog.querySelector<HTMLDetailsElement>('.jjk-cinema__mix')!;
  const retour = dialog.querySelector<HTMLElement>('[data-cinema-audio-status]')!;
  let contexte: AudioContext | undefined;
  let tampon: AudioBuffer | undefined;
  let requete: AbortController | undefined;
  let source: AudioBufferSourceNode | undefined;
  let gain: GainNode | undefined;
  let actif = false;
  let chargement = false;
  let temps = 0;
  let tempsFilm = 0;
  let fin = false;
  let depart = 0;
  let positionDepart = 0;
  let etat = 'closed';
  let generation = 0;
  let ouverture = 0;
  let erreur = false;

  function afficher(): void {
    bouton.hidden = typeof AudioContext === 'undefined' || reduction.matches;
    bouton.textContent = chargement ? 'Chargement…' : actif ? 'Couper le son' : erreur ? 'Réessayer le son' : 'Activer le son';
    bouton.setAttribute('aria-pressed', String(actif));
    bouton.setAttribute('aria-busy', String(chargement));
    mix.hidden = !actif || chargement;
    if (mix.hidden) mix.open = false;
  }
  function autorise(): boolean {
    return actif && dialog.open && !document.hidden && !reduction.matches && (etat === 'playing' || etat === 'final');
  }
  function couper(): void {
    generation += 1;
    const ancienne = source;
    source = undefined;
    if (ancienne && contexte && gain) {
      gain.gain.cancelScheduledValues(contexte.currentTime);
      gain.gain.setTargetAtTime(0, contexte.currentTime, .006);
      ancienne.stop(contexte.currentTime + .035);
    } else if (!chargement) void contexte?.suspend().catch(() => {});
    gain = undefined;
  }
  function jouer(): void {
    couper();
    if (!autorise() || !tampon || !contexte || temps >= tampon.duration) return;
    const audio = contexte;
    const version = generation;
    void audio.resume().then(() => {
      if (version !== generation || !autorise() || contexte !== audio || !tampon) return;
      const piste = audio.createBufferSource();
      const enveloppe = audio.createGain();
      piste.buffer = tampon;
      enveloppe.gain.setValueAtTime(0, audio.currentTime);
      enveloppe.gain.linearRampToValueAtTime(Number(volume.value) / 100, audio.currentTime + .015);
      piste.connect(enveloppe).connect(audio.destination);
      source = piste;
      gain = enveloppe;
      piste.onended = () => {
        piste.disconnect(); enveloppe.disconnect();
        if (source === piste) { source = undefined; gain = undefined; temps = piste.buffer?.duration ?? temps; }
        if (!source && !chargement) void audio.suspend().catch(() => {});
      };
      depart = audio.currentTime;
      positionDepart = temps;
      piste.start(0, Math.min(temps, tampon.duration));
    }).catch(() => {
      if (version !== generation) return;
      actif = false; erreur = true; afficher();
      retour.textContent = 'Le son est indisponible. Réessayez.';
    });
  }
  async function activer(): Promise<void> {
    const ticket = ++ouverture;
    actif = true; erreur = false; retour.textContent = '';
    try {
      contexte ??= new AudioContext();
      // Déverrouiller le contexte pendant le geste utilisateur, notamment sur iOS.
      void contexte.resume().catch(() => {});
      if (!tampon) {
        chargement = true; afficher(); attendre(true);
        requete = new AbortController();
        const reponse = await fetch('/audio/connexion-jjk.mp3', { signal: requete.signal });
        if (!reponse.ok) throw new Error('audio');
        const donnees = await reponse.arrayBuffer();
        if (ticket !== ouverture || !contexte) return;
        const decode = await contexte.decodeAudioData(donnees);
        if (ticket !== ouverture) return;
        tampon = decode;
      }
      chargement = false; afficher(); attendre(false); jouer();
    } catch {
      if (ticket !== ouverture) return;
      actif = false; chargement = false; erreur = true;
      afficher(); attendre(false); couper();
      retour.textContent = 'Le son n’a pas pu être chargé. Réessayez.';
    }
  }
  bouton.addEventListener('click', () => {
    if (!actif) { void activer(); return; }
    if (fin && source && contexte) temps = positionDepart + contexte.currentTime - depart;
    ouverture += 1; requete?.abort();
    actif = false; chargement = false;
    couper(); afficher(); attendre(false);
  });
  volume.addEventListener('input', () => {
    mesure.value = volume.value + ' %';
    if (gain && contexte) gain.gain.setTargetAtTime(Number(volume.value) / 100, contexte.currentTime, .015);
  });
  afficher();
  return {
    positionner(position: number, suivant: string, saut = false): void {
      if (saut || position !== tempsFilm || !fin) temps = position;
      else if (source && contexte) temps = positionDepart + contexte.currentTime - depart;
      tempsFilm = position;
      fin = suivant === 'final' || (suivant === 'paused' && fin);
      const queueContinue = etat === 'playing' && suivant === 'final' && source && !saut;
      const changement = etat !== suivant;
      etat = suivant;
      if (reduction.matches) { actif = false; afficher(); }
      if (queueContinue && autorise()) return;
      if (changement || saut || reduction.matches) {
        if (autorise()) jouer();
        else couper();
      }
    },
    arreter(): void {
      ouverture += 1; requete?.abort(); requete = undefined;
      actif = false; chargement = false; erreur = false; etat = 'closed';
      couper(); afficher(); attendre(false); retour.textContent = '';
      const ancien = contexte;
      contexte = undefined; tampon = undefined;
      window.setTimeout(() => { void ancien?.close().catch(() => {}); }, 40);
    },
  };
}

