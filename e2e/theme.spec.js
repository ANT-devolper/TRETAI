import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

test.describe('Theme switcher', () => {
  test.beforeEach(async ({ page }) => {
    await mockAudio(page);
  });

  test('settings gear floats in the viewport top-right corner, outside the game', async ({ page }) => {
    await page.goto('/');
    const gear = page.locator('#settingsBtn');
    await expect(gear).toBeVisible();
    // Pinned to the viewport, not the board.
    await expect(gear).toHaveCSS('position', 'fixed');

    const vp = page.viewportSize();
    const btn = await gear.boundingBox();
    // Near the top-right corner of the screen.
    expect(btn.x + btn.width).toBeGreaterThan(vp.width * 0.8);
    expect(btn.y).toBeLessThan(vp.height * 0.2);
    // Fully inside the viewport even when space is tight.
    expect(btn.x + btn.width).toBeLessThanOrEqual(vp.width);
    expect(btn.y).toBeGreaterThanOrEqual(0);
  });

  test('gear stays inside a horizontally reduced viewport', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 720 });
    await page.goto('/');
    const gear = page.locator('#settingsBtn');
    await expect(gear).toBeVisible();
    const btn = await gear.boundingBox();
    expect(btn.x + btn.width).toBeLessThanOrEqual(480);
    expect(btn.x).toBeGreaterThanOrEqual(0);
  });

  test('clicking the gear opens the menu and pauses the game', async ({ page }) => {
    await page.goto('/');
    await page.locator('#settingsBtn').click();
    await expect(page.locator('#settingsMenu')).toHaveClass(/show/);

    // Paused: a soft drop must not score while the menu is open.
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('selecting Game Boy themes the DOM and canvas, and persists', async ({ page }) => {
    await page.goto('/');
    // Default theme is classic with the cyan accent.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'classic');
    await expect(page.locator('#score')).toHaveCSS('color', 'rgb(0, 255, 255)');

    await page.locator('#settingsBtn').click();
    await page.locator('.theme-option[data-theme="gameboy"]').click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'gameboy');
    // Accent switched to the DMG green (#9bbc0f).
    await expect(page.locator('#score')).toHaveCSS('color', 'rgb(155, 188, 15)');
    // Board background repainted to the dark DMG green (#0f2f0f) — sample a pixel.
    const bg = await page.evaluate(() => {
      const c = document.getElementById('board');
      const px = c.getContext('2d').getImageData(2, 2, 1, 1).data;
      return [px[0], px[1], px[2]];
    });
    expect(bg).toEqual([15, 47, 15]);

    // Survives a reload.
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'gameboy');
    await expect(page.locator('#score')).toHaveCSS('color', 'rgb(155, 188, 15)');
  });

  test('closing the menu resumes the game', async ({ page }) => {
    await page.goto('/');
    await page.locator('#settingsBtn').click();
    await page.locator('#settingsClose').click();
    await expect(page.locator('#settingsMenu')).not.toHaveClass(/show/);

    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('1');
  });
});
