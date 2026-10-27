import { expect, test, type Page } from '@playwright/test';
import { choisirEntreeJjk } from './support/entree-jjk';

/**
 * La mise en scène de connexion reste indépendante du contrôle d’accès.
 * Ces tests utilisent le mouvement normal ; backoffice.spec.ts couvre déjà
 * les parcours complets et l’accessibilité avec mouvement réduit.
 */
test.use({ reducedMotion: 'no-preference' });
test.beforeEach(({ page }) => choisirEntreeJjk(page));

const EMAIL = 'admin@example.test';
const PASSWORD = 'mot-de-passe-test';

/** Une API locale minimale : aucune donnée réelle, aucun envoi. */
async function doublerConnexion(page: Page, deuxFacteurs = false) {
  const etat = { authenticated: false, challenge: false, mutations: [] as string[] };
  await page.route('**/api/backoffice/**', async (route) => {
    const requete = route.request();
    const chemin = new URL(requete.url()).pathname.replace('/api/backoffice', '');
    const repondre = (corps: unknown, status = 200) => route.fulfill({
      status, contentType: 'application/json', body: JSON.stringify(corps),
    });
    if (requete.method() !== 'GET') etat.mutations.push(chemin);
    if (chemin === '/login') {
      const corps = requete.postDataJSON() as { email: string; password: string };
      if (corps.email !== EMAIL || corps.password !== PASSWORD) {
        await repondre({ code: 'UNAUTHORIZED', message: 'Une connexion au backoffice est nécessaire.' }, 401);
      } else if (deuxFacteurs) {
        etat.challenge = true;
        await repondre({ authenticated: false, two_factor_required: true, enrollment_required: false });
      } else {
        etat.authenticated = true;
        await repondre({ authenticated: true });
      }
      return;
    }
    if (chemin === '/2fa/verify' && etat.challenge) {
      const corps = requete.postDataJSON() as { code: string };
      if (corps.code !== '123456') {
        await repondre({ code: 'INVALID_TWO_FACTOR', message: 'Le code est incorrect ou a déjà été utilisé.' }, 401);
      } else {
        etat.challenge = false;
        etat.authenticated = true;
        await repondre({ authenticated: true, smtp_configured: true });
      }
      return;
    }
    if (!etat.authenticated) {
      await repondre({ code: 'UNAUTHORIZED', message: 'Connectez-vous pour ouvrir le backoffice.' }, 401);
      return;
    }
    if (chemin === '/logout') {
      etat.authenticated = false;
      await repondre({});
      return;
    }
    const reponses: Record<string, unknown> = {
      '/session': { authenticated: true, smtp_configured: true },
      '/settings': { email: 'contact@example.test' },
      '/contacts': { contacts: [], total: 0, new_count: 0 },
      '/links': { links: [] },
      '/tokens': { tokens: [] },
    };
    await repondre(reponses[chemin] ?? { message: 'Route de test inconnue.' }, chemin in reponses ? 200 : 404);
  });
  return etat;
}

async function ouvrirConnexion(page: Page, deuxFacteurs = false) {
  const etat = await doublerConnexion(page, deuxFacteurs);
  await page.goto('/backoffice');
  await expect(page.getByRole('button', { name: 'Se connecter', exact: true })).toBeEnabled();
  return etat;
}

async function renseignerConnexion(page: Page, motDePasse = PASSWORD) {
  await page.getByLabel('Adresse e-mail de connexion', { exact: true }).fill(EMAIL);
  await page.getByLabel('Mot de passe', { exact: true }).fill(motDePasse);
}

test('le mot de passe peut être révélé au clavier sans changer la saisie ni envoyer le formulaire', async ({ page }) => {
  const etat = await ouvrirConnexion(page);
  const motDePasse = page.getByLabel('Mot de passe', { exact: true });
  // Le même bouton que l’entrée lanterne (backoffice-saisie.ts) : son libellé dit l’action.
  const bascule = page.locator('#bo-password-voir');
  await motDePasse.fill(PASSWORD);
  await expect(motDePasse).toHaveAttribute('type', 'password');
  await expect(bascule).toHaveAccessibleName('Afficher le mot de passe');
  await bascule.focus();
  await page.keyboard.press('Enter');
  await expect(motDePasse).toHaveAttribute('type', 'text');
  await expect(motDePasse).toHaveValue(PASSWORD);
  await expect(bascule).toHaveAccessibleName('Masquer le mot de passe');
  await bascule.focus();
  await page.keyboard.press('Space');
  await expect(motDePasse).toHaveAttribute('type', 'password');
  await expect(motDePasse).toHaveValue(PASSWORD);
  await expect(bascule).toHaveAccessibleName('Afficher le mot de passe');
  expect(etat.mutations).toEqual([]);
});

test('la roue et sa pause sont utilisables au clavier sans soumettre la connexion', async ({ page }) => {
  const etat = await ouvrirConnexion(page);
  const sanctuaire = page.locator('[data-sanctuaire]');
  const pause = page.locator('#bo-motion-toggle');
  const roue = page.locator('#bo-wheel-replay');
  await expect(sanctuaire).toHaveAttribute('data-motion', 'active');
  await expect(pause).toHaveAccessibleName('Mettre les animations en pause');
  await pause.focus();
  await page.keyboard.press('Enter');
  await expect(sanctuaire).toHaveAttribute('data-motion', 'paused');
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  await expect(pause).toHaveAccessibleName('Reprendre les animations');
  await pause.focus();
  await page.keyboard.press('Space');
  await expect(sanctuaire).toHaveAttribute('data-motion', 'active');
  await expect(pause).toHaveAttribute('aria-pressed', 'false');
  await expect(roue).toHaveAccessibleName('Faire tourner la roue');
  await expect(roue).toBeEnabled();
  await roue.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#bo-login')).toBeVisible();
  await expect(page.locator('#bo-workspace')).toBeHidden();
  expect(etat.mutations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('le mouvement réduit suspend la scène et laisse les champs immédiatement utilisables', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ouvrirConnexion(page);
  const sanctuaire = page.locator('[data-sanctuaire]');
  await expect(sanctuaire).toHaveAttribute('data-motion', 'paused');
  await expect(page.locator('#bo-wheel-replay')).toBeDisabled();
  await renseignerConnexion(page);
  await expect(page.locator('#bo-password')).toHaveValue(PASSWORD);
  await expect(sanctuaire).toHaveAttribute('data-motion', 'paused');
  const mouvementsActifs = await sanctuaire.evaluate((element) => element.getAnimations({ subtree: true })
    .filter((animation) => animation.playState === 'running' && Number(animation.effect?.getComputedTiming().duration) > 0.01)
    .length);
  expect(mouvementsActifs).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('une erreur se lit près du formulaire et une nouvelle connexion ouvre la vérification', async ({ page }) => {
  await ouvrirConnexion(page, true);
  const sanctuaire = page.locator('[data-sanctuaire]');
  await renseignerConnexion(page, 'mot-de-passe-incorrect');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#bo-login-retour')).toHaveText('L’adresse e-mail ou le mot de passe est incorrect.');
  await expect(sanctuaire).toHaveAttribute('data-phase', 'error');
  await expect(page.getByRole('button', { name: 'Se connecter', exact: true })).toBeEnabled();
  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#bo-two-factor')).toBeVisible();
  await expect(sanctuaire).toHaveAttribute('data-phase', 'challenge');
  await expect(page.getByLabel('Code de vérification')).toBeFocused();
  await expect(page.locator('#bo-password')).toHaveValue('');
  await expect(page.locator('#bo-workspace')).toBeHidden();
  // Six chiffres : le code part seul (backoffice.ts), sans clic.
  await page.getByLabel('Code de vérification').fill('123456');
  await expect(page.locator('#bo-workspace')).toBeVisible();
  await expect(sanctuaire).toBeHidden();
  await expect(page.locator('#bo-two-factor-code')).toHaveValue('');
});

test('la mise en scène disparaît lorsque la session est ouverte sans deuxième facteur', async ({ page }) => {
  await ouvrirConnexion(page);
  await renseignerConnexion(page);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#bo-workspace')).toBeVisible();
  await expect(page.locator('[data-sanctuaire]')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Demandes de contact', level: 2 })).toBeFocused();
  await expect(page.locator('#bo-password')).toHaveValue('');
});

test('la déconnexion dévoile le formulaire avant de rendre le focus à l’adresse e-mail', async ({ page }) => {
  const etat = await ouvrirConnexion(page);
  await renseignerConnexion(page);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#bo-workspace')).toBeVisible();
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.locator('[data-sanctuaire]')).toBeVisible();
  await expect(page.locator('#bo-workspace')).toBeHidden();
  await expect(page.getByLabel('Adresse e-mail de connexion', { exact: true })).toBeFocused();
  await expect(page.locator('#bo-password')).toHaveValue('');
  expect(etat.authenticated).toBe(false);
  expect(etat.mutations).toEqual(['/login', '/logout']);
});

test('reprendre les animations garde le titre et le formulaire déjà révélés', async ({ page }) => {
  await ouvrirConnexion(page);
  await expect(page.locator('[data-sanctuaire]')).toHaveAttribute('data-motion', 'active');
  await expect(page.locator('#bo-login-title')).toHaveCSS('opacity', '1');
  await expect(page.locator('#bo-login-form')).toHaveCSS('opacity', '1');
  // Lire chaque état dans la même tâche, sans attendre que l’éventuelle
  // régression d’opacité finisse et passe inaperçue entre deux assertions.
  const etats = await page.locator('#bo-motion-toggle').evaluate((bouton) => {
    const titre = document.getElementById('bo-login-title')!;
    const formulaire = document.getElementById('bo-login-form')!;
    const scene = document.querySelector<HTMLElement>('[data-sanctuaire]')!;
    const lire = () => ({
      mouvement: scene.dataset.motion,
      titre: getComputedStyle(titre).opacity,
      formulaire: getComputedStyle(formulaire).opacity,
    });
    (bouton as HTMLButtonElement).click();
    const pause = lire();
    (bouton as HTMLButtonElement).click();
    return [pause, lire()];
  });
  expect(etats).toEqual([
    { mouvement: 'paused', titre: '1', formulaire: '1' },
    { mouvement: 'active', titre: '1', formulaire: '1' },
  ]);
});

test('le champ ne décrit Verr. maj. que lorsque la touche est réellement signalée active', async ({ page }) => {
  await ouvrirConnexion(page);
  const motDePasse = page.getByLabel('Mot de passe', { exact: true });
  const aide = page.locator('#bo-password-maj');
  await expect(aide).toBeHidden();
  await expect(motDePasse).not.toHaveAttribute('aria-describedby');
  await expect(motDePasse).toHaveAccessibleDescription('');
  await motDePasse.focus();
  await motDePasse.evaluate((champ) => {
    champ.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', modifierCapsLock: true, bubbles: true }));
  });
  await expect(aide).toBeVisible();
  await expect(motDePasse).toHaveAttribute('aria-describedby', 'bo-password-maj');
  await expect(motDePasse).toHaveAccessibleDescription('Majuscules activées');
  await motDePasse.evaluate((champ) => {
    champ.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', modifierCapsLock: false, bubbles: true }));
  });
  await expect(aide).toBeHidden();
  await expect(motDePasse).not.toHaveAttribute('aria-describedby');
  await expect(motDePasse).toHaveAccessibleDescription('');
});
