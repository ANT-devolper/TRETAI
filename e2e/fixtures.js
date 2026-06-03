import { test as base, expect } from '@playwright/test';

// Shared fixture for gameplay specs. It marks the game as already visited (so
// the first-visit tutorial stays closed) and, because the mode-select menu now
// opens on every load, auto-picks Zen after navigation so these specs land on a
// playable, endless board exactly like before modes existed. Specs that target
// the tutorial or the mode menu itself import from '@playwright/test' directly.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('tretai.visited', '1');
      } catch {
        // localStorage may be blocked; ignore.
      }
    });

    const selectZen = async () => {
      try {
        await page.locator('#modeOptions button[data-mode="zen"]').click({ timeout: 3000 });
      } catch {
        // Menu absent (e.g. a spec cleared the visited flag); leave as-is.
      }
    };
    for (const method of ['goto', 'reload']) {
      const original = page[method].bind(page);
      page[method] = async (...args) => {
        const result = await original(...args);
        await selectZen();
        return result;
      };
    }

    await use(page);
  },
});

export { expect };
