const sources = new Map();

async function charger(fichier) {
  if (!sources.has(fichier)) {
    sources.set(fichier, fetch(fichier).then(async (reponse) => {
      if (!reponse.ok) throw new Error(`Chargement impossible : ${fichier}`);
      const documentSvg = new DOMParser().parseFromString(await reponse.text(), 'image/svg+xml');
      const svg = documentSvg.documentElement;
      if (svg.localName !== 'svg' || documentSvg.querySelector('parsererror')) {
        throw new Error(`SVG invalide : ${fichier}`);
      }
      return svg;
    }));
  }
  return sources.get(fichier);
}

Promise.all([...document.querySelectorAll('[data-logo]')].map(async (emplacement) => {
  const svg = (await charger(emplacement.dataset.logo)).cloneNode(true);
  svg.classList.add('logo');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  emplacement.replaceChildren(svg);
})).catch(() => {
  document.querySelector('[data-erreur]').hidden = false;
});
