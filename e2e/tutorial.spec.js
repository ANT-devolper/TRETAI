import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

test.describe('First-visit tutorial', () => {
  test('shows on first visit and lists the essential controls', async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');

    const tutorial = page.locator('#tutorial');
    await expect(tutorial).toBeVisible();
    await expect(tutorial).toContainText('Como jogar');
    await expect(tutorial).toContainText('Mover');
    await expect(tutorial).toContainText('Girar');
  });

  test('start button hands off to the mode menu and the tutorial stays gone', async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');

    await page.locator('#tutorialStart').click();
    await expect(page.locator('#tutorial')).toBeHidden();
    // Dismissing the tutorial opens the mode-select menu instead of starting play.
    await expect(page.locator('#modeMenu')).toBeVisible();

    await page.reload();
    await expect(page.locator('#tutorial')).toBeHidden();
  });

  test('Esc dismisses the tutorial and opens the mode menu', async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');

    await expect(page.locator('#tutorial')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#tutorial')).toBeHidden();
    await expect(page.locator('#modeMenu')).toBeVisible();
  });

  test('does not show when the visited flag is already set', async ({ page }) => {
    await mockAudio(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('tretai.visited', '1');
    });
    await page.goto('/');

    await expect(page.locator('#tutorial')).toBeHidden();
    await expect(page.locator('#modeMenu')).toBeVisible();
  });
});
