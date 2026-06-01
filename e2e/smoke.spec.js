import { test, expect } from './fixtures.js';

test.describe('Smoke', () => {
  test('page loads with canvas and zeroed counters', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#lines')).toHaveText('0');
    await expect(page.locator('#level')).toHaveText('1');
  });

  test('panel renders the main boxes', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Pontuação' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Linhas' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nível' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Música' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Controles' })).toBeVisible();
  });
});
