import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

async function setup(page, { record = 0 } = {}) {
  await mockAudio(page);
  await page.addInitScript((rec) => {
    try {
      if (rec > 0) localStorage.setItem('tretai.highScore', String(rec));
      else localStorage.removeItem('tretai.highScore');
    } catch {}
    // Force a deterministic piece stream (always I-piece) so we can reach
    // game over via a known number of hard drops.
    Math.random = () => 0;
  }, record);
  await page.goto('/');
}

async function stackUntilGameOver(page) {
  // I-piece is the first key in SHAPES. With Math.random=0, every spawn is I.
  // Hard-dropping straight from spawn fills board columns 3..6 from row 19 up.
  // After 19 locks, row 1 is filled; piece 20's spawn collides → game over.
  // 25 presses leaves margin; presses after game over are no-ops (withTurn).
  for (let i = 0; i < 25; i++) {
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
