import { afterEach, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { isNew, read, write } from '../js/highscore.js';
import { HIGH_SCORE_KEY } from '../js/constants.js';

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

describe('isNew', () => {
  test('returns true when score beats previous and is positive', () => {
    assert.equal(isNew(100, 50), true);
  });

  test('returns false when score equals previous', () => {
    assert.equal(isNew(100, 100), false);
  });

  test('returns false when score is below previous', () => {
    assert.equal(isNew(50, 100), false);
  });

  test('returns false when score is zero, even if previous is zero', () => {
    assert.equal(isNew(0, 0), false);
  });
});

describe('read', () => {
  afterEach(clearStorage);

  test('returns 0 when localStorage is unavailable', () => {
    clearStorage();
    assert.equal(read(), 0);
  });

  test('returns 0 when the key is absent', () => {
    installStorage();
    assert.equal(read(), 0);
  });

  test('returns the parsed number when the key is present', () => {
    installStorage({ [HIGH_SCORE_KEY]: '4200' });
    assert.equal(read(), 4200);
  });

  test('returns 0 when stored value is not a positive number', () => {
    installStorage({ [HIGH_SCORE_KEY]: 'not-a-number' });
    assert.equal(read(), 0);
  });

  test('does not throw when localStorage.getItem throws', () => {
    installStorage({}, { throws: true });
    assert.equal(read(), 0);
  });
});

describe('write', () => {
  afterEach(clearStorage);

  test('persists a finite positive number', () => {
    const store = installStorage();
    write(1234);
    assert.equal(store[HIGH_SCORE_KEY], '1234');
  });

  test('is a no-op when score is NaN', () => {
    const store = installStorage();
    write(Number.NaN);
    assert.equal(HIGH_SCORE_KEY in store, false);
  });

  test('is a no-op when score is Infinity', () => {
    const store = installStorage();
    write(Number.POSITIVE_INFINITY);
    assert.equal(HIGH_SCORE_KEY in store, false);
  });

  test('does not throw when localStorage.setItem throws', () => {
    installStorage({}, { throws: true });
    assert.doesNotThrow(() => write(999));
  });
});
