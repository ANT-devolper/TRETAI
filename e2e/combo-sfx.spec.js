import { test, expect } from '@playwright/test';
import { mockAudio } from './audio-mock.js';

// O som extra de combo (playComboSfx) é um oscilador square-wave somado ao SFX
// de linha. Observamos "tocou" como "um oscilador foi criado no AudioContext",
// no mesmo molde de sfx-mute.spec.js. Forçar combos via teclado é inviável, então
// chamamos a função diretamente para validar o ramo determinístico.
test.describe('Combo SFX', () => {
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

  test('plays an extra tone from combo ×2 up', async ({ page }) => {
    const oscillators = await page.evaluate(async () => {
      const audio = await import('/js/audio.js');
      audio.playComboSfx(3);
      return window.__oscillators;
    });
    expect(oscillators).toBeGreaterThan(0);
  });

  test('stays silent below the combo threshold', async ({ page }) => {
    const oscillators = await page.evaluate(async () => {
      const audio = await import('/js/audio.js');
      audio.playComboSfx(1);
      return window.__oscillators;
    });
    expect(oscillators).toBe(0);
  });
});
