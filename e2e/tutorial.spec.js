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

  test('dismisses with the start button and does not reappear after reload', async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');

    await page.locator('#tutorialStart').click();
    await expect(page.locator('#tutorial')).toBeHidden();

    await page.reload();
    await expect(page.locator('#tutorial')).toBeHidden();
  });

  test('Esc also dismisses the tutorial', async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');

    await expect(page.locator('#tutorial')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#tutorial')).toBeHidden();
  });

  test('does not show when the visited flag is already set', async ({ page }) => {
    await mockAudio(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('tretai.visited', '1');
    });
    await page.goto('/');

    await expect(page.locator('#tutorial')).toBeHidden();
  });
});
