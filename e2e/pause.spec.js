import { test, expect } from '@playwright/test';

test.describe('Pausa', () => {
  test('P exibe overlay PAUSADO e bloqueia inputs', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('p');
    await expect(page.locator('#overlay')).toHaveClass(/show/);
    await expect(page.locator('#overlayText')).toHaveText('PAUSADO');

    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('P alterna pausa de volta', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('p');
    await expect(page.locator('#overlay')).toHaveClass(/show/);
    await page.keyboard.press('p');
    await expect(page.locator('#overlay')).not.toHaveClass(/show/);
  });

  test('soft drop volta a funcionar após retomar', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('p');
    await page.keyboard.press('p');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('1');
  });
});
