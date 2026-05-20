import { test, expect } from '@playwright/test';

test.describe('Gameplay básico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('soft drop incrementa pontuação em 1', async ({ page }) => {
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('1');
  });

  test('hard drop aumenta pontuação significativamente', async ({ page }) => {
    await page.keyboard.press(' ');
    const score = Number(await page.locator('#score').textContent());
    expect(score).toBeGreaterThan(0);
  });

  test('movimento horizontal não altera score', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('rotação não altera score', async ({ page }) => {
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('x');
    await expect(page.locator('#score')).toHaveText('0');
  });
});
