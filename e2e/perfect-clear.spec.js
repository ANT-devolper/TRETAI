import { test, expect } from './fixtures.js';
import { mockAudio } from './audio-mock.js';

// A Perfect Clear (board empty after a clearing lock) rewards a bonus, a golden
// "PERFECT CLEAR" banner and a triumphant arpeggio. Driving a real Perfect Clear
// from the keyboard is impractical (it needs an exact, hole-free fill of whole
// rows), so — as in combo-sfx.spec.js — we exercise the deterministic branches
// directly: the SFX creates oscillators, and the banner paints golden pixels.
// The detection/bonus logic itself is covered by the board/scoring unit tests.
test.describe('Perfect Clear', () => {
  test('plays a triumphant arpeggio', async ({ page }) => {
    await mockAudio(page);
    await page.addInitScript(() => {
      window.__oscillators = 0;
      class FakeOscillator {
        constructor() { this.frequency = { value: 0 }; }
        connect() {}
        start() {}
        stop() {}
      }
      class FakeGain {
        constructor() {
          this.gain = {
            setValueAtTime() {},
            linearRampToValueAtTime() {},
            exponentialRampToValueAtTime() {},
          };
        }
        connect() {}
      }
      class FakeAudioContext {
        constructor() {
          this.state = 'running';
          this.currentTime = 0;
          this.destination = {};
        }
        createOscillator() { window.__oscillators++; return new FakeOscillator(); }
        createGain() { return new FakeGain(); }
        resume() { return Promise.resolve(); }
      }
      window.AudioContext = FakeAudioContext;
      window.webkitAudioContext = FakeAudioContext;
    });
    await page.goto('/');

    const oscillators = await page.evaluate(async () => {
      const audio = await import('/js/audio.js');
      audio.playPerfectClearSfx();
      return window.__oscillators;
    });
    expect(oscillators).toBeGreaterThan(0);
  });

  test('paints a golden PERFECT CLEAR banner', async ({ page }) => {
    await page.goto('/');

    const goldenPixels = await page.evaluate(async () => {
      const render = await import('/js/render.js');
      const canvas = document.getElementById('board');
      const ctx = canvas.getContext('2d');
      render.drawPerfectClearBanner(ctx, canvas, { life: 1, maxLife: 1 });
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let golden = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 200 && data[i + 1] > 150 && data[i + 2] < 100) golden++;
      }
      return golden;
    });
    expect(goldenPixels).toBeGreaterThan(0);
  });
});
