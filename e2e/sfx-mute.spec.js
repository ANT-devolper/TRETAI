import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

// Muting the lofi music with M must never silence the line-clear sound effects:
// the stream (HTMLAudioElement) and the SFX (Web Audio oscillators) are
// independent subsystems. We observe "an SFX played" as "an oscillator was
// created on the AudioContext".
test.describe('SFX vs music mute', () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test('line-clear SFX still plays after muting the music', async ({ page }) => {
    await page.locator('#board').focus();
    // ArrowDown arms + starts the music via armOnFirstGesture...
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'playing');
    // ...then M toggles playing -> paused, muting the music (userPaused = true).
    await page.keyboard.press('m');
    await expect(page.locator('#musicBtn')).toHaveAttribute('data-state', 'paused');

    const oscillators = await page.evaluate(async () => {
      const audio = await import('/js/audio.js');
      audio.playLineClearSfx(4);
      return window.__oscillators;
    });

    expect(oscillators).toBeGreaterThan(0);
  });
});
