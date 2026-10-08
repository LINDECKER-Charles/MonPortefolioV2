import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';
import { fileDeMesure } from './support/navigateur';
import { CONTACT_EMAIL } from './support/serveurs.mjs';

/**
 * Le navigateur exerce les états du formulaire sans envoyer de vrai courriel.
 * Les tests du serveur vérifient séparément son échange avec le backend Rust.
 */
test.use({ reducedMotion: 'reduce' });

const MESSAGE = {
  name: 'Camille Martin',
  email: 'camille@example.test',
  subject: 'Échanger sur un projet',
  message: 'Bonjour Charles, je voudrais discuter avec vous de mon projet web.',
  website: '',
};
const SUCCES = 'Votre message a bien été envoyé. Je vous répondrai par e-mail.';
const REGLES_AXE = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function remplir(page: Page) {
  await page.locator('#contact-name').fill(MESSAGE.name);
  await page.locator('#contact-email').fill(MESSAGE.email);
  await page.locator('#contact-subject').fill(MESSAGE.subject);
  await page.locator('#contact-message').fill(MESSAGE.message);
}

async function repondre(route: Route, status: number, body: Record<string, unknown>) {
  await route.fulfill({ status, contentType: 'application/json; charset=utf-8', body: JSON.stringify(body) });
}

async function verifierAccessibilite(page: Page) {
  const resultats = await new AxeBuilder({ page }).withTags(REGLES_AXE).analyze();
  expect(resultats.violations.map((violation) => ({
    regle: violation.id,
    cibles: violation.nodes.map((noeud) => noeud.target),
  }))).toEqual([]);
}

test('le formulaire envoie les champs attendus sans les transmettre à la mesure', async ({ page }) => {
  const demandes: { methode: string; type: string | undefined; charge: unknown }[] = [];
  await page.route('**/api/contact', async (route) => {
    const demande = route.request();
    demandes.push({ methode: demande.method(), type: demande.headers()['content-type'], charge: demande.postDataJSON() });
    await repondre(route, 200, { message: SUCCES });
  });
  await page.goto('/contact');
  const mesureAvant = await fileDeMesure(page);
  await remplir(page);
  await page.getByRole('button', { name: 'Envoyer le message', exact: true }).click();

  const statut = page.locator('[data-contact-status]');
  await expect(statut).toHaveText(SUCCES);
  await expect(statut).toHaveAttribute('role', 'status');
  expect(demandes).toEqual([{ methode: 'POST', type: 'application/json', charge: MESSAGE }]);
  expect(await fileDeMesure(page)).toEqual(mesureAvant);
  const mesure = JSON.stringify(await fileDeMesure(page));
  for (const valeur of [MESSAGE.name, MESSAGE.email, MESSAGE.subject, MESSAGE.message]) expect(mesure).not.toContain(valeur);
  await verifierAccessibilite(page);
});

test('un envoi en cours annonce son état et empêche un second envoi', async ({ page }) => {
  let terminer!: () => void;
  const attente = new Promise<void>((resolve) => { terminer = resolve; });
  let nombreEnvois = 0;
  await page.route('**/api/contact', async (route) => {
    nombreEnvois += 1;
    await attente;
    await repondre(route, 200, { message: SUCCES });
  });
  await page.goto('/contact');
  await remplir(page);
  await page.getByRole('button', { name: 'Envoyer le message', exact: true }).click();
  try {
    await expect(page.locator('[data-contact-status]')).toHaveText('Envoi en cours…');
    await expect(page.locator('[data-contact-form] button[type="submit"]')).toBeDisabled();
    await expect.poll(() => nombreEnvois).toBe(1);
    // Même une soumission au clavier ou par le formulaire ne doit pas doubler la requête.
    await page.locator('#contact-message').press('Control+Enter');
    await page.locator('[data-contact-form]').evaluate((element) => (element as HTMLFormElement).requestSubmit());
    expect(nombreEnvois).toBe(1);
  } finally {
    terminer();
  }
  await expect(page.locator('[data-contact-status]')).toHaveText(SUCCES);
  expect(nombreEnvois).toBe(1);
});

test('les erreurs de validation sont associées aux champs et amènent le focus au premier', async ({ page }) => {
  const erreurs = { name: 'Indiquez votre nom.', message: 'Votre message doit être plus précis.' };
  await page.route('**/api/contact', (route) => repondre(route, 422, {
    code: 'validation_error', message: 'Vérifiez les champs du formulaire.', fields: erreurs,
  }));
  await page.goto('/contact');
  await remplir(page);
  await page.getByRole('button', { name: 'Envoyer le message', exact: true }).click();

  await expect(page.locator('[data-contact-status]')).toHaveText('Vérifiez les champs du formulaire.');
  await expect(page.locator('#contact-name')).toBeFocused();
  for (const [champ, erreur] of Object.entries(erreurs)) {
    await expect(page.locator(`#contact-${champ}`)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(`#contact-${champ}`)).toHaveAttribute('aria-describedby', new RegExp(`\\bcontact-${champ}-error\\b`));
    await expect(page.locator(`#contact-${champ}-error`)).toHaveText(erreur);
  }
  await expect(page.locator('#contact-email')).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#contact-message')).toHaveValue(MESSAGE.message);
  await expect(page.getByRole('button', { name: 'Envoyer le message', exact: true })).toBeEnabled();
  await verifierAccessibilite(page);
});

for (const [status, code] of [[502, 'delivery_failed'], [503, 'service_unavailable']] as const) {
  test(`une erreur ${status} conserve la saisie et permet de réessayer`, async ({ page }) => {
    const indisponible = 'Le formulaire est temporairement indisponible. Vous pouvez me contacter par e-mail.';
    const demandes: unknown[] = [];
    await page.route('**/api/contact', async (route) => {
      demandes.push(route.request().postDataJSON());
      await repondre(route, demandes.length === 1 ? status : 200, demandes.length === 1
        ? { code, message: indisponible }
        : { message: SUCCES });
    });
    await page.goto('/contact');
    await remplir(page);
    await page.getByRole('button', { name: 'Envoyer le message', exact: true }).click();
    await expect(page.locator('[data-contact-status]')).toHaveText(indisponible);
    for (const champ of ['name', 'email', 'subject', 'message'] as const) {
      await expect(page.locator(`#contact-${champ}`)).toHaveValue(MESSAGE[champ]);
    }
    await expect(page.getByRole('button', { name: 'Envoyer le message', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Envoyer le message', exact: true }).click();
    await expect(page.locator('[data-contact-status]')).toHaveText(SUCCES);
    expect(demandes).toEqual([MESSAGE, MESSAGE]);
  });
}

test('la limite d’envoi est expliquée sans perdre le message', async ({ page }) => {
  const limite = 'Vous avez envoyé plusieurs messages. Veuillez patienter avant de réessayer.';
  await page.route('**/api/contact', (route) => repondre(route, 429, { code: 'rate_limited', message: limite }));
  await page.goto('/contact');
  await remplir(page);
  await page.getByRole('button', { name: 'Envoyer le message', exact: true }).click();
  await expect(page.locator('[data-contact-status]')).toHaveText(limite);
  await expect(page.locator('#contact-message')).toHaveValue(MESSAGE.message);
  await expect(page.getByRole('button', { name: 'Envoyer le message', exact: true })).toBeEnabled();
});

test('les champs requis et le courriel invalide arrêtent l’envoi dans le navigateur', async ({ page }) => {
  let nombreEnvois = 0;
  await page.route('**/api/contact', async (route) => {
    nombreEnvois += 1;
    await repondre(route, 200, { message: SUCCES });
  });
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Envoyer le message', exact: true }).click();
  await expect(page.locator('#contact-name')).toBeFocused();
  expect(nombreEnvois).toBe(0);
  await remplir(page);
  await page.locator('#contact-email').fill('adresse-sans-arobase');
  await page.getByRole('button', { name: 'Envoyer le message', exact: true }).click();
  await expect(page.locator('#contact-email')).toBeFocused();
  expect(nombreEnvois).toBe(0);
});

test('le champ antispam reste hors du parcours clavier', async ({ page }) => {
  await page.goto('/contact');
  const piege = page.locator('[data-contact-form] input[name="website"]');
  await expect(piege).toHaveAttribute('tabindex', '-1');
  await expect(piege).toHaveAttribute('aria-hidden', 'true');
  await page.locator('#contact-message').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Envoyer le message', exact: true })).toBeFocused();
});

for (const chemin of ['/contact', '/', '/mentions-legales']) {
  test(`l’adresse configurée est utilisée sur ${chemin}`, async ({ page }) => {
    await page.goto(chemin);
    const adresses = page.locator('a[href^="mailto:"]');
    expect(await adresses.count()).toBeGreaterThan(0);
    for (const lien of await adresses.all()) {
      const adresse = decodeURIComponent((await lien.getAttribute('href')) ?? '').split('?')[0];
      expect(adresse).toBe(`mailto:${CONTACT_EMAIL}`);
    }
    await expect(page.locator('body')).not.toContainText('charles.lindecker@outlook.fr');
  });
}

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('le courriel direct reste visible et le formulaire ne peut pas soumettre', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('main a[href^="mailto:"]').first()).toBeVisible();
    const href = await page.locator('main a[href^="mailto:"]').first().getAttribute('href');
    expect(decodeURIComponent(href ?? '').split('?')[0]).toBe(`mailto:${CONTACT_EMAIL}`);
    await expect(page.locator('.contact-sans-js')).toBeVisible();
    await expect(page.locator('.contact-sans-js')).toContainText(/JavaScript/);
    await expect(page.getByRole('button', { name: 'Envoyer le message', exact: true })).toBeDisabled();
  });
});
