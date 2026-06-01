import { test, expect } from './fixtures.js';
import { mockAudio } from './audio-mock.js';

const DEFAULT_VOLUME = 0.6;
const DUCK_VOLUME = 0.2;
const SFX_VOLUME = 0.18;

// Drives the native range input to a 0..100 value and dispatches 'input',
// mirroring how a mouse drag updates the slider.
async function setSlider(page, value) {
  await page.locator('#volume').evaluate((el, v) => {
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test.describe('Volume control', () => {
  test('scales the music stream volume', async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');
    // Arm + start the stream so audioEl exists and is playing.
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');

    await setSlider(page, 50);
    const half = await page.evaluate(async () => {
      return window.__audioEl?.volume ?? null;
    });

    await setSlider(page, 0);
    const muted = await page.evaluate(async () => {
      return window.__audioEl?.volume ?? null;
    });

    expect(half).toBeCloseTo(0.5 * DEFAULT_VOLUME, 5);
    expect(muted).toBeCloseTo(0, 5);
  });

  test('duck stays relative to the chosen master volume', async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');

    await setSlider(page, 50);
    const ducked = await page.evaluate(async () => {
      const audio = await import('/js/audio.js');
      audio.duck(true); // game over ducks the music
      return window.__audioEl?.volume ?? null;
    });
    expect(ducked).toBeCloseTo(0.5 * DUCK_VOLUME, 5);
  });

  test('scales the line-clear SFX gain', async ({ page }) => {
    await mockAudio(page);
    await page.addInitScript(() => {
      window.__sfxPeak = 0;
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
            linearRampToValueAtTime(value) { window.__sfxPeak = Math.max(window.__sfxPeak, value); },
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
        createOscillator() { return new FakeOscillator(); }
        createGain() { return new FakeGain(); }
        resume() { return Promise.resolve(); }
      }
      window.AudioContext = FakeAudioContext;
      window.webkitAudioContext = FakeAudioContext;
    });
    await page.goto('/');

    await setSlider(page, 50);
    const peak = await page.evaluate(async () => {
      window.__sfxPeak = 0;
      const audio = await import('/js/audio.js');
      audio.playLineClearSfx(1);
      return window.__sfxPeak;
    });
    expect(peak).toBeCloseTo(SFX_VOLUME * 0.5, 5);
  });

  test('persists the slider position across reloads', async ({ page }) => {
    await mockAudio(page);
    await page.goto('/');

    await setSlider(page, 30);
    await page.reload();

    await expect(page.locator('#volume')).toHaveValue('30');
  });
});
