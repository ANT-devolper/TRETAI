export async function mockAudio(page) {
  await page.addInitScript(() => {
    class MockAudio extends EventTarget {
      constructor(src) {
        super();
        this.src = src;
        this.paused = true;
        this.volume = 1;
        this.muted = false;
        this.loop = false;
        this.preload = 'none';
        // Expose the latest instance so specs can observe volume/duck.
        window.__audioEl = this;
      }
      play() {
        this.paused = false;
        queueMicrotask(() => this.dispatchEvent(new Event('play')));
        return Promise.resolve();
      }
      pause() {
        this.paused = true;
        queueMicrotask(() => this.dispatchEvent(new Event('pause')));
      }
    }
    window.Audio = MockAudio;
  });
}
