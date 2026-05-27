import { test, expect } from '@playwright/test';

const sampleMidBoardBrightness = () => {
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const y = Math.floor(canvas.height * 0.4);
  const row = ctx.getImageData(0, y, canvas.width, 1).data;
  let bright = 0;
  for (let i = 0; i < row.length; i += 4) {
    if (row[i] + row[i + 1] + row[i + 2] > 60) bright++;
  }
  return bright;
};

test.describe('Hard drop trail', () => {
  test('renders a colored trail that fades after the lifetime', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press(' ');

    const brightImmediately = await page.evaluate(sampleMidBoardBrightness);
    expect(brightImmediately).toBeGreaterThan(0);

    await page.waitForTimeout(700);

    const brightAfterFade = await page.evaluate(sampleMidBoardBrightness);
    expect(brightAfterFade).toBe(0);
  });
});
