import { test, expect } from '@playwright/test';

test.describe('Layout', () => {
  test('page has no vertical scroll', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => ({
      scrollH: document.documentElement.scrollHeight,
      clientH: document.documentElement.clientHeight,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollH).toBeLessThanOrEqual(overflow.clientH);
    expect(overflow.scrollW).toBeLessThanOrEqual(overflow.clientW);
  });

  test('canvas resizes when the viewport changes', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 800, height: 600 });
    const w1 = Number(await page.locator('#board').getAttribute('width'));

    await page.setViewportSize({ width: 1600, height: 1200 });
    await expect.poll(async () =>
      Number(await page.locator('#board').getAttribute('width'))
    ).toBeGreaterThan(w1);
  });

  test('arrow keys do not cause page scroll', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });
});
