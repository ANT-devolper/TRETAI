import { test as base, expect } from '@playwright/test';

// Shared fixture that marks the game as already visited, so the first-visit
// tutorial stays closed and these specs land on a playable board. Specs that
// exercise the tutorial itself import from '@playwright/test' directly.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('tretai.visited', '1');
      } catch {
        // localStorage may be blocked; ignore.
      }
    });
    await use(page);
  },
});

export { expect };
