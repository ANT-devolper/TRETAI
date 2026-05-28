import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

test.describe('High score', () => {
  test('shows 0 when no value is stored', async ({ page }) => {
    await mockAudio(page);
    await page.addInitScript(() => {
      try { localStorage.removeItem('tretai.highScore'); } catch {}
    });
    await page.goto('/');
    await expect(page.locator('#best')).toHaveText('0');
  });

  test('renders the stored value on load', async ({ page }) => {
    await mockAudio(page);
    await page.addInitScript(() => {
      try { localStorage.setItem('tretai.highScore', '4200'); } catch {}
    });
    await page.goto('/');
    await expect(page.locator('#best')).toHaveText('4200');
  });

  test('falls back to 0 when stored value is invalid', async ({ page }) => {
    await mockAudio(page);
    await page.addInitScript(() => {
      try { localStorage.setItem('tretai.highScore', 'garbage'); } catch {}
    });
    await page.goto('/');
    await expect(page.locator('#best')).toHaveText('0');
  });
});
