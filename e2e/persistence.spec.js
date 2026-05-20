import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

test.describe('Persistência', () => {
  test('preferência de mute persiste após reload', async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');

    await page.locator('#musicBtn').click();
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');
    await page.locator('#musicBtn').click();
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'paused');

    const stored = await page.evaluate(() => localStorage.getItem('tetris.music.muted'));
    expect(stored).toBe('1');

    await page.reload();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'paused');
  });
});
