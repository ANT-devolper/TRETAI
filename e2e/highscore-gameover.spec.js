import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

async function setup(page, { record = 0 } = {}) {
  await mockAudio(page);
  await page.addInitScript((rec) => {
    try {
      if (rec > 0) localStorage.setItem('tretai.highScore', String(rec));
      else localStorage.removeItem('tretai.highScore');
    } catch {}
    // Force a deterministic piece stream so we can reliably reach game over.
    // With the 7-bag generator, Math.random=0 yields the fixed bag order
    // [O,T,S,Z,J,L,I], repeating — varied but fully deterministic.
    Math.random = () => 0;
  }, record);
  await page.goto('/');
}

async function stackUntilGameOver(page) {
  // Hard-dropping every piece straight from spawn (no lateral moves) piles them
  // up the central columns. Those columns never complete a 10-wide line, so the
  // stack grows monotonically until a spawn collides → game over. The bag order
  // is fixed (see setup), so a generous press count reliably tops out; presses
  // after game over are no-ops (withTurn).
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Space');
  }
  await expect(page.locator('#overlayText')).toHaveText('FIM DE JOGO');
}

test.describe('High score game over flow', () => {
  test('celebrates a new record with the previous value', async ({ page }) => {
    await setup(page, { record: 10 });
    await expect(page.locator('#best')).toHaveText('10');

    await stackUntilGameOver(page);

    const detail = page.locator('#overlayDetail');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText('NOVO RECORDE');
    await expect(detail).toContainText('antes: 10');

    const newBest = Number(await page.locator('#best').textContent());
    expect(newBest).toBeGreaterThan(10);
  });

  test('persists the new record to localStorage', async ({ page }) => {
    await setup(page, { record: 10 });
    await stackUntilGameOver(page);

    const stored = await page.evaluate(() => localStorage.getItem('tretai.highScore'));
    expect(Number(stored)).toBeGreaterThan(10);
  });

  test('does not celebrate when the score does not beat the stored record', async ({ page }) => {
    await setup(page, { record: 999999 });
    await expect(page.locator('#best')).toHaveText('999999');

    await stackUntilGameOver(page);

    await expect(page.locator('#overlayDetail')).toBeHidden();
    await expect(page.locator('#best')).toHaveText('999999');
  });

  test('record survives a restart via the overlay button', async ({ page }) => {
    await setup(page, { record: 10 });
    await stackUntilGameOver(page);

    const newBest = await page.locator('#best').textContent();
    expect(Number(newBest)).toBeGreaterThan(10);

    await page.locator('#restartBtn').click();
    await expect(page.locator('#overlay')).not.toHaveClass(/show/);
    await expect(page.locator('#best')).toHaveText(newBest);
    await expect(page.locator('#score')).toHaveText('0');
  });
});
