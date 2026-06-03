import { afterEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { isBetter, read, write } from '../js/besttime.js';
import { BEST_TIME_KEY_PREFIX } from '../js/constants.js';

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

const SPRINT_KEY = BEST_TIME_KEY_PREFIX + 'sprint';

describe('read', () => {
  afterEach(clearStorage);

  test('returns 0 when localStorage is unavailable', () => {
    clearStorage();
    assert.equal(read('sprint'), 0);
  });

  test('returns 0 when there is no record for the mode', () => {
    installStorage();
    assert.equal(read('sprint'), 0);
  });

  test('returns the parsed milliseconds for the mode', () => {
    installStorage({ [SPRINT_KEY]: '42350' });
    assert.equal(read('sprint'), 42350);
  });

  test('keeps records per mode under distinct keys', () => {
    installStorage({ [SPRINT_KEY]: '42350' });
    assert.equal(read('sprint'), 42350);
    assert.equal(read('marathon'), 0);
  });

  test('returns 0 for a non-positive or non-finite stored value', () => {
    installStorage({ [SPRINT_KEY]: '0' });
    assert.equal(read('sprint'), 0);
    installStorage({ [SPRINT_KEY]: 'abc' });
    assert.equal(read('sprint'), 0);
  });

  test('does not throw when localStorage.getItem throws', () => {
    installStorage({}, { throws: true });
    assert.equal(read('sprint'), 0);
  });
});

describe('write', () => {
  afterEach(clearStorage);

  test('persists the milliseconds for the mode as a string', () => {
    const store = installStorage();
    write('sprint', 42350);
    assert.equal(store[SPRINT_KEY], '42350');
  });

  test('ignores a non-finite value', () => {
    const store = installStorage();
    write('sprint', NaN);
    assert.equal(SPRINT_KEY in store, false);
  });

  test('does not throw when localStorage.setItem throws', () => {
    installStorage({}, { throws: true });
    assert.doesNotThrow(() => write('sprint', 42350));
  });
});

describe('isBetter', () => {
  test('any positive time beats no previous record (0)', () => {
    assert.equal(isBetter(42350, 0), true);
  });

  test('a smaller time beats a larger previous record', () => {
    assert.equal(isBetter(40000, 42350), true);
  });

  test('an equal or larger time does not beat the record', () => {
    assert.equal(isBetter(42350, 42350), false);
    assert.equal(isBetter(50000, 42350), false);
  });

  test('a non-positive new time is never better', () => {
    assert.equal(isBetter(0, 42350), false);
    assert.equal(isBetter(0, 0), false);
  });
});
