import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('página carrega com canvas e contadores zerados', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#lines')).toHaveText('0');
    await expect(page.locator('#level')).toHaveText('1');
  });

  test('painel exibe boxes principais', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Pontuação')).toBeVisible();
    await expect(page.locator('text=Linhas')).toBeVisible();
    await expect(page.locator('text=Nível')).toBeVisible();
    await expect(page.locator('text=Música')).toBeVisible();
    await expect(page.locator('text=Controles')).toBeVisible();
  });
});
