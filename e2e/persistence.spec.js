import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

test.describe('Persistence', () => {
  test('mute via M does not persist across reload', async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');

    await page.locator('#musicBtn').click();
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');
    await page.locator('#musicBtn').click();
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'paused');

    await page.reload();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');
  });
});
