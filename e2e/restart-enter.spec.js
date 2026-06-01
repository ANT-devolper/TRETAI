import { test, expect } from './fixtures.js';
import { mockAudio } from './audio-mock.js';

async function setup(page) {
  await mockAudio(page);
  await page.addInitScript(() => {
    try { localStorage.removeItem('tretai.highScore'); } catch {}
    // Deterministic 7-bag order so the stack reliably tops out (see
    // highscore-gameover.spec.js).
    Math.random = () => 0;
  });
  await page.goto('/');
}

async function stackUntilGameOver(page) {
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Space');
  }
  await expect(page.locator('#overlayText')).toHaveText('FIM DE JOGO');
}

test.describe('Restart with Enter', () => {
  test('Enter restarts the game after game over', async ({ page }) => {
    await setup(page);
    await stackUntilGameOver(page);

    // The overlay hints that Enter (and the button) restart.
    await expect(page.locator('#overlayHint')).toBeVisible();

    await page.keyboard.press('Enter');

    await expect(page.locator('#overlay')).not.toHaveClass(/show/);
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('the restart hint is hidden while merely paused', async ({ page }) => {
    await setup(page);
    await page.keyboard.press('p');

    await expect(page.locator('#overlay')).toHaveClass(/show/);
    await expect(page.locator('#overlayHint')).toBeHidden();
  });

  test('Enter does not restart while the game is in progress', async ({ page }) => {
    await setup(page);

    // Score some points without topping out, then press Enter.
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Space');
    }
    const scored = await page.locator('#score').textContent();
    expect(Number(scored)).toBeGreaterThan(0);

    await page.keyboard.press('Enter');

    // The run was not reset: overlay stays hidden and the score did not drop to 0.
    await expect(page.locator('#overlay')).not.toHaveClass(/show/);
    await expect(page.locator('#score')).not.toHaveText('0');
  });
});
