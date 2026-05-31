import { afterEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { clampVolume, read, write } from '../js/volume.js';
import { VOLUME_KEY, DEFAULT_MASTER_VOLUME } from '../js/constants.js';

function installStorage(store = {}, { throws = false } = {}) {
  globalThis.localStorage = {
    getItem(key) {
      if (throws) throw new Error('blocked');
      return key in store ? store[key] : null;
    },
    setItem(key, value) {
      if (throws) throw new Error('blocked');
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    _store: store,
  };
  return store;
}

function clearStorage() {
  delete globalThis.localStorage;
}

describe('clampVolume', () => {
  test('returns the value unchanged when inside [0, 1]', () => {
    assert.equal(clampVolume(0.42), 0.42);
    assert.equal(clampVolume(0), 0);
    assert.equal(clampVolume(1), 1);
  });

  test('clamps values above 1 down to 1', () => {
    assert.equal(clampVolume(1.5), 1);
  });

  test('clamps negative values up to 0', () => {
    assert.equal(clampVolume(-0.3), 0);
  });

  test('falls back to the default for non-finite values', () => {
    assert.equal(clampVolume(Number.NaN), DEFAULT_MASTER_VOLUME);
    assert.equal(clampVolume(Number.POSITIVE_INFINITY), DEFAULT_MASTER_VOLUME);
    assert.equal(clampVolume(undefined), DEFAULT_MASTER_VOLUME);
    assert.equal(clampVolume('loud'), DEFAULT_MASTER_VOLUME);
  });
});

describe('read', () => {
  afterEach(clearStorage);

  test('returns the default when localStorage is unavailable', () => {
    clearStorage();
    assert.equal(read(), DEFAULT_MASTER_VOLUME);
  });

  test('returns the default when the key is absent', () => {
    installStorage();
    assert.equal(read(), DEFAULT_MASTER_VOLUME);
  });

  test('returns the parsed, clamped number when the key is present', () => {
    installStorage({ [VOLUME_KEY]: '0.25' });
    assert.equal(read(), 0.25);
  });

  test('clamps an out-of-range stored value', () => {
    installStorage({ [VOLUME_KEY]: '2' });
    assert.equal(read(), 1);
  });

  test('returns the default when the stored value is not a number', () => {
    installStorage({ [VOLUME_KEY]: 'not-a-number' });
    assert.equal(read(), DEFAULT_MASTER_VOLUME);
  });

  test('does not throw when localStorage.getItem throws', () => {
    installStorage({}, { throws: true });
    assert.equal(read(), DEFAULT_MASTER_VOLUME);
  });
});

describe('write', () => {
  afterEach(clearStorage);

  test('persists the clamped value as a string', () => {
    const store = installStorage();
    write(0.5);
    assert.equal(store[VOLUME_KEY], '0.5');
  });

  test('persists the clamped bound for out-of-range input', () => {
    const store = installStorage();
    write(3);
    assert.equal(store[VOLUME_KEY], '1');
  });

  test('does not throw when localStorage.setItem throws', () => {
    installStorage({}, { throws: true });
    assert.doesNotThrow(() => write(0.5));
  });
});
