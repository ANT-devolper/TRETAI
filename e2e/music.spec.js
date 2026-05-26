import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

test.describe('Music', () => {
  test.beforeEach(async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');
  });

  test('button starts in the paused state', async ({ page }) => {
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'paused');
    await expect(page.locator('#musicBtn')).toHaveText(/Tocar/);
  });

  test('clicking the button toggles to playing', async ({ page }) => {
    await page.locator('#musicBtn').click();
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');
    await expect(page.locator('#musicBtn')).toHaveText(/Pausar/);
  });

  test('clicking toggles back to paused', async ({ page }) => {
    await page.locator('#musicBtn').click();
    await page.locator('#musicBtn').click();
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'paused');
  });

  test('M key toggles music', async ({ page }) => {
    await page.locator('#board').focus();
    await page.keyboard.press('m');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');
    await page.keyboard.press('m');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'paused');
  });

  test('first non-M key arms audio automatically', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');
  });
});
