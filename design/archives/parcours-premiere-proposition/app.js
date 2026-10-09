const experienceEntries = [...document.querySelectorAll('.timeline-entry')];
const experienceDetails = [...document.querySelectorAll('.experience-details')];
const filters = [...document.querySelectorAll('[data-filter]')];
const detailsToggle = document.querySelector('.details-toggle');
const filterStatus = document.querySelector('.filter-status');
const experienceCount = document.querySelector('#experiences .section-count');

function markLastVisibleEntry() {
  for (const entry of experienceEntries) delete entry.dataset.lastVisible;
  const last = experienceEntries.filter((entry) => !entry.hidden).at(-1);
  if (last) last.dataset.lastVisible = 'true';
}

function syncDetailsToggle() {
  const visible = experienceEntries.filter((entry) => !entry.hidden);
  const expanded = visible.length > 0 && visible.every((entry) => entry.querySelector('details').open);
  detailsToggle.textContent = expanded ? 'Tout replier' : 'Tout déplier';
  detailsToggle.setAttribute('aria-expanded', String(expanded));
}

for (const button of filters) {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    for (const entry of experienceEntries) {
      entry.hidden = filter !== 'all' && entry.dataset.kind !== filter;
    }
    for (const other of filters) {
      other.setAttribute('aria-pressed', String(other === button));
    }
    const count = experienceEntries.filter((entry) => !entry.hidden).length;
    experienceCount.textContent = `${count} expériences`;
    filterStatus.textContent = `${count} expériences affichées : ${button.textContent.trim().toLowerCase()}.`;
    markLastVisibleEntry();
    syncDetailsToggle();
    scheduleNavigationUpdate();
  });
}

detailsToggle.addEventListener('click', () => {
  const expand = detailsToggle.getAttribute('aria-expanded') !== 'true';
  for (const entry of experienceEntries.filter((entry) => !entry.hidden)) {
    entry.querySelector('details').open = expand;
  }
  syncDetailsToggle();
});

for (const details of experienceDetails) {
  details.addEventListener('toggle', () => {
    syncDetailsToggle();
    scheduleNavigationUpdate();
  });
}

const certificationRows = [...document.querySelectorAll('.certification-row')];
const certificationCategory = document.querySelector('#cert-category');
const certificationStatus = document.querySelector('.cert-filter-count');
const certificationCount = document.querySelector('#certifications .section-count');
certificationCategory.value = 'all';

certificationCategory.addEventListener('change', () => {
  for (const row of certificationRows) {
    row.hidden = certificationCategory.value !== 'all' && row.dataset.category !== certificationCategory.value;
  }
  const count = certificationRows.filter((row) => !row.hidden).length;
  const label = `${count} certification${count === 1 ? '' : 's'}`;
  certificationStatus.textContent = `${label} affichée${count === 1 ? '' : 's'}`;
  certificationCount.textContent = label;
  scheduleNavigationUpdate();
});

const sectionLinks = [...document.querySelectorAll('.section-link')];
const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href')));
let navigationFrame;

function updateNavigation() {
  navigationFrame = undefined;
  let active = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= window.innerHeight * 0.25) active = section;
  }
  for (const link of sectionLinks) {
    if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

function scheduleNavigationUpdate() {
  if (navigationFrame === undefined) navigationFrame = requestAnimationFrame(updateNavigation);
}

window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
window.addEventListener('hashchange', scheduleNavigationUpdate);

// L'impression inclut tout le parcours, même lorsqu'un filtre est actif.
let printState;
window.addEventListener('beforeprint', () => {
  if (printState) return;
  printState = {
    hidden: [...experienceEntries, ...certificationRows].map((element) => [element, element.hidden]),
    open: experienceDetails.map((element) => [element, element.open]),
  };
  for (const [element] of printState.hidden) element.hidden = false;
  for (const [element] of printState.open) element.open = true;
  markLastVisibleEntry();
});

window.addEventListener('afterprint', () => {
  if (!printState) return;
  for (const [element, hidden] of printState.hidden) element.hidden = hidden;
  for (const [element, open] of printState.open) element.open = open;
  printState = undefined;
  markLastVisibleEntry();
  syncDetailsToggle();
  scheduleNavigationUpdate();
});

document.querySelector('.print-button').addEventListener('click', () => window.print());
for (const control of document.querySelectorAll('.experience-controls, .cert-controls, .print-button')) control.hidden = false;
markLastVisibleEntry();
updateNavigation();
