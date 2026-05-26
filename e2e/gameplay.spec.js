import { test, expect } from '@playwright/test';

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
});
