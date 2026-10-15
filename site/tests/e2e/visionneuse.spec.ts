import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import ts from 'typescript';

/**
 * La visionneuse partagée (components/ui/Visionneuse.astro), avant qu’une page
 * refaite ne l’emploie : son script (scripts/visionneuse.ts), compilé ici,
 * dans une page minimale qui reprend les attributs du composant (leur
 * présence est vérifiée par tests/unit/composants.test.ts).
 *
 * Clic pour agrandir, Échap pour revenir, focus rendu au lien ; un clic avec
 * une touche de modification garde le comportement du navigateur.
 */
const script = ts
  .transpileModule(readFileSync(new URL('../../src/scripts/visionneuse.ts', import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  })
  .outputText.replace(/^export /m, '');

const IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><rect width="1600" height="1000" fill="#1f4fd1"/></svg>')}`;

async function preparer(page: Page) {
  await page.setContent(`<!doctype html><html lang="fr"><body style="min-height:3000px">
    <p style="margin-top:1200px"><a href="${IMAGE}" data-agrandir data-legende="Le parcours, en grand."><img src="${IMAGE}" width="160" height="100" alt="Le parcours de Bloodborne Legendary Run."></a></p>
    <dialog data-visionneuse aria-labelledby="visionneuse-legende">
      <p id="visionneuse-legende" data-visionneuse-legende></p>
      <button type="button" data-visionneuse-fermer>Fermer</button>
      <p role="status" data-visionneuse-etat></p>
      <img data-visionneuse-image alt="" hidden>
    </dialog>
  </body></html>`);
  await page.addScriptTag({ content: `${script}\nbrancherVisionneuse();` });
}

test('un clic agrandit la capture, Échap la referme et rend le focus au lien', async ({ page }) => {
  await preparer(page);
  const lien = page.locator('a[data-agrandir]');
  await lien.scrollIntoViewIfNeeded();
  const avant = await page.evaluate(() => window.scrollY);
  await lien.click();

  const dialogue = page.locator('dialog[data-visionneuse]');
  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator('[data-visionneuse-legende]')).toHaveText('Le parcours, en grand.');
  const image = dialogue.locator('[data-visionneuse-image]');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', IMAGE);
  await expect(image).toHaveAttribute('alt', 'Le parcours de Bloodborne Legendary Run.');
  await expect(dialogue.getByRole('button', { name: 'Fermer' })).toBeFocused();
  await expect(page.locator('[data-visionneuse-etat]')).toHaveText('');

  await page.keyboard.press('Escape');
  await expect(dialogue).toBeHidden();
  await expect(lien).toBeFocused();
  // L’événement « close » suit la fermeture : la page retrouve son défilement.
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  expect(await page.evaluate(() => window.scrollY)).toBe(avant);
});

test('un clic sur l’image ou sur « Fermer » referme aussi', async ({ page }) => {
  await preparer(page);
  const lien = page.locator('a[data-agrandir]');
  const dialogue = page.locator('dialog[data-visionneuse]');
  await lien.click();
  await expect(dialogue.locator('[data-visionneuse-image]')).toBeVisible();
  await dialogue.locator('[data-visionneuse-image]').click();
  await expect(dialogue).toBeHidden();
  await lien.click();
  await dialogue.getByRole('button', { name: 'Fermer' }).click();
  await expect(dialogue).toBeHidden();
  await expect(lien).toBeFocused();
});

test('avec une touche de modification, le navigateur garde la main', async ({ page }) => {
  await preparer(page);
  const prevenu = await page.evaluate(() => {
    const lien = document.querySelector('a[data-agrandir]')!;
    // Après la visionneuse (écoutée sur document), on retient seulement la navigation du test.
    window.addEventListener('click', (e) => e.preventDefault(), { once: true });
    lien.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
    return (document.querySelector('dialog') as HTMLDialogElement).open;
  });
  expect(prevenu).toBe(false);
});
