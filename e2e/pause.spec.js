import { test, expect } from './fixtures.js';

test.describe('Pause', () => {
  test('P shows the PAUSADO overlay and blocks inputs', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('p');
    await expect(page.locator('#overlay')).toHaveClass(/show/);
    await expect(page.locator('#overlayText')).toHaveText('PAUSADO');

    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('P toggles pause back off', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('p');
    await expect(page.locator('#overlay')).toHaveClass(/show/);
    await page.keyboard.press('p');
    await expect(page.locator('#overlay')).not.toHaveClass(/show/);
  });

  test('soft drop works again after resuming', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('p');
    await page.keyboard.press('p');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('1');
  });

  test('Esc also pauses and resumes the game', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Escape');
    await expect(page.locator('#overlay')).toHaveClass(/show/);
    await expect(page.locator('#overlayText')).toHaveText('PAUSADO');

    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('0');

    await page.keyboard.press('Escape');
    await expect(page.locator('#overlay')).not.toHaveClass(/show/);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#score')).toHaveText('1');
  });

  test('P and Esc are interchangeable for toggling pause', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('p');
    await expect(page.locator('#overlay')).toHaveClass(/show/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#overlay')).not.toHaveClass(/show/);
  });
});
