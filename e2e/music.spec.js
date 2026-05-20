import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

test.describe('Música', () => {
  test.beforeEach(async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');
  });

  test('botão inicia em estado paused', async ({ page }) => {
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'paused');
    await expect(page.locator('#musicBtn')).toHaveText(/Tocar/);
  });

  test('clique no botão alterna para playing', async ({ page }) => {
    await page.locator('#musicBtn').click();
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');
    await expect(page.locator('#musicBtn')).toHaveText(/Pausar/);
  });

  test('clique alterna de volta para paused', async ({ page }) => {
    await page.locator('#musicBtn').click();
    await page.locator('#musicBtn').click();
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'paused');
  });

  test('tecla M alterna música', async ({ page }) => {
    await page.locator('#board').focus();
    await page.keyboard.press('m');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');
    await page.keyboard.press('m');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'paused');
  });

  test('primeira tecla não-M arma o áudio automaticamente', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');
  });
});
