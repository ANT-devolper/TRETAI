import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

// These specs exercise the mode-select menu itself, so they use the base test
// (no auto-select) and seed the visited flag to skip the first-visit tutorial.
test.describe('Mode selection', () => {
  test.beforeEach(async ({ page }) => {
    await mockAudio(page);
    await page.addInitScript(() => {
      try { localStorage.setItem('tretai.visited', '1'); } catch {}
    });
  });

  test('opens on load and lists the available modes', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('#modeMenu');
    await expect(menu).toBeVisible();
    await expect(menu).toContainText('Modo de jogo');
    await expect(page.locator('#modeOptions button[data-mode="zen"]')).toContainText('Zen');
    await expect(page.locator('#modeOptions button[data-mode="sprint"]')).toContainText('40 Linhas');
  });

  test('hides the Fechar button on the initial menu (forces a choice)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#modeMenu')).toBeVisible();
    await expect(page.locator('#modeClose')).toBeHidden();
  });

  test('Esc does not dismiss the initial menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#modeMenu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#modeMenu')).toBeVisible();
  });

  test('selecting Zen closes the menu and lands on a playable board', async ({ page }) => {
    await page.goto('/');
    await page.locator('#modeOptions button[data-mode="zen"]').click();
    await expect(page.locator('#modeMenu')).toBeHidden();
    await expect(page.locator('#board')).toBeVisible();
    await page.keyboard.press('ArrowLeft');
  });

  test('selecting 40 Linhas closes the menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('#modeOptions button[data-mode="sprint"]').click();
    await expect(page.locator('#modeMenu')).toBeHidden();
  });
});
