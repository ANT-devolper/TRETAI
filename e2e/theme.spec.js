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

  // Each extra theme repaints the board background to its own board.bg.
  const EXTRA_THEME_BG = {
    neon: [21, 10, 40], // #150a28
    sunset: [36, 16, 48], // #241030
    pastel: [205, 210, 218], // #cdd2da
  };
  for (const [id, bg] of Object.entries(EXTRA_THEME_BG)) {
    test(`selecting the ${id} theme repaints the board background`, async ({ page }) => {
      await page.goto('/');
      await page.locator('#settingsBtn').click();
      await page.locator(`.theme-option[data-theme="${id}"]`).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', id);
      const px = await page.evaluate(() => {
        const c = document.getElementById('board');
        const d = c.getContext('2d').getImageData(2, 2, 1, 1).data;
        return [d[0], d[1], d[2]];
      });
      expect(px).toEqual(bg);
    });
  }

  test('the ghost stays dark and visible on the light Pastel theme', async ({ page }) => {
    // Fixed bag order so the first piece (and thus the ghost columns) is deterministic.
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto('/');
    await page.locator('#settingsBtn').click();
    await page.locator('.theme-option[data-theme="pastel"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'pastel');

    const { ghost, bg } = await page.evaluate(() => {
      const c = document.getElementById('board');
      const cell = c.width / 10;
      const ctx = c.getContext('2d');
      const at = (cx, cy) => {
        const d = ctx.getImageData(Math.floor(cx), Math.floor(cy), 1, 1).data;
        return [d[0], d[1], d[2]];
      };
      // First piece is O (cols 4-5); its ghost lands on the bottom rows.
      const ghost = at(4.5 * cell, 18.5 * cell);
      // An untouched cell shows the plain light board background.
      const bg = at(0.5 * cell, 0.5 * cell);
      return { ghost, bg };
    });
    // A dark ghost darkens the light board; a white ghost (the bug) would not.
    expect(ghost[0]).toBeLessThan(bg[0] - 5);
  });

  test('closing the menu resumes the game', async ({ page }) => {
    await page.goto('/');
    await page.locator('#settingsBtn').click();
    await page.locator('#settingsClose').click();
    await expect(page.locator('#settingsMenu')).not.toHaveClass(/show/);

    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('1');
  });

  test('Esc closes the menu and resumes the game', async ({ page }) => {
    await page.goto('/');
    await page.locator('#settingsBtn').click();
    await expect(page.locator('#settingsMenu')).toHaveClass(/show/);

    await page.keyboard.press('Escape');
    await expect(page.locator('#settingsMenu')).not.toHaveClass(/show/);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('1');
  });

  test('P is ignored while the menu is open', async ({ page }) => {
    await page.goto('/');
    await page.locator('#settingsBtn').click();
    await expect(page.locator('#settingsMenu')).toHaveClass(/show/);

    // P must neither close the menu nor resume the game.
    await page.keyboard.press('p');
    await expect(page.locator('#settingsMenu')).toHaveClass(/show/);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('selecting a theme closes the menu and resumes the game', async ({ page }) => {
    await page.goto('/');
    await page.locator('#settingsBtn').click();
    await page.locator('.theme-option[data-theme="neon"]').click();

    await expect(page.locator('#settingsMenu')).not.toHaveClass(/show/);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('1');
  });
});
