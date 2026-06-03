import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

// The sprint specs drive the mode menu, so they use the base test (no
// auto-select) and seed the visited flag to skip the first-visit tutorial.
test.describe('40 Linhas (sprint)', () => {
  test.beforeEach(async ({ page }) => {
    await mockAudio(page);
    await page.addInitScript(() => {
      try { localStorage.setItem('tretai.visited', '1'); } catch {}
    });
  });

  async function startSprint(page) {
    await page.goto('/');
    await page.locator('#modeOptions button[data-mode="sprint"]').click();
    await expect(page.locator('#modeMenu')).toBeHidden();
  }

  test('shows the timer and a line goal, hides the level box', async ({ page }) => {
    await startSprint(page);
    await expect(page.locator('#timerBox')).toBeVisible();
    await expect(page.locator('#lines')).toHaveText('0 / 40');
    await expect(page.locator('#levelBox')).toBeHidden();
  });

  test('the stopwatch advances while playing', async ({ page }) => {
    await startSprint(page);
    await page.waitForTimeout(600);
    const shown = await page.locator('#timer').textContent();
    expect(shown).not.toBe('0:00.00');
  });

  test('renders a stored best time in the record box', async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.setItem('tretai.bestTime.sprint', '73210'); } catch {}
    });
    await startSprint(page);
    await expect(page.locator('#best')).toHaveText('1:13.21');
  });

  test('Zen hides the timer and shows the level box', async ({ page }) => {
    await page.goto('/');
    await page.locator('#modeOptions button[data-mode="zen"]').click();
    await expect(page.locator('#modeMenu')).toBeHidden();
    await expect(page.locator('#timerBox')).toBeHidden();
    await expect(page.locator('#levelBox')).toBeVisible();
  });
});
