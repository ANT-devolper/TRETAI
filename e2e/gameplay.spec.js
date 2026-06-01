import { test, expect } from './fixtures.js';

test.describe('Basic gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('soft drop increments score by 1', async ({ page }) => {
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('1');
  });

  test('hard drop raises score significantly', async ({ page }) => {
    await page.keyboard.press(' ');
    const score = Number(await page.locator('#score').textContent());
    expect(score).toBeGreaterThan(0);
  });

  test('horizontal movement does not change score', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('rotation does not change score', async ({ page }) => {
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('x');
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('soft drop is a no-op on a grounded piece (lock delay active)', async ({ page }) => {
    // Sync bursts of ArrowDown so the 500ms lock timer can't fire mid-loop.
    // After ~18 drops the piece touches the floor; further presses must not
    // lock it nor add score. Without the lock delay, the next press would
    // lock the piece and a fresh one would start counting, pushing the
    // total above 20.
    await page.evaluate(() => {
      for (let i = 0; i < 30; i++) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      }
    });
    const score = Number(await page.locator('#score').textContent());
    expect(score).toBeLessThan(20);
  });

  test('grounded piece auto-locks after the lock delay window', async ({ page }) => {
    await page.evaluate(() => {
      for (let i = 0; i < 30; i++) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      }
    });
    const scoreBefore = Number(await page.locator('#score').textContent());
    await page.waitForTimeout(700);
    await page.keyboard.press('ArrowDown');
    const scoreAfter = Number(await page.locator('#score').textContent());
    expect(scoreAfter).toBeGreaterThan(scoreBefore);
  });
});
