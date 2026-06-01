import { afterEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, DEFAULT_THEME_ID, getTheme, themeIds } from '../js/themes.js';
import { clampThemeId, read, write } from '../js/theme.js';
import { THEME_KEY } from '../js/constants.js';

const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

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

describe('THEMES data', () => {
  test('includes the classic and gameboy themes', () => {
    assert.ok(themeIds().includes('classic'));
    assert.ok(themeIds().includes('gameboy'));
  });

  test('every theme has a name, all seven piece colors and board colors', () => {
    for (const id of themeIds()) {
      const theme = THEMES[id];
      assert.equal(theme.id, id);
      assert.equal(typeof theme.name, 'string');
      assert.ok(theme.name.length > 0);
      for (const type of PIECE_TYPES) {
        assert.match(theme.colors[type], /^#[0-9a-fA-F]{3,6}$/);
      }
      assert.match(theme.board.bg, /^#[0-9a-fA-F]{3,6}$/);
      assert.match(theme.board.grid, /^#[0-9a-fA-F]{3,6}$/);
    }
  });

  test('gameboy pieces are all distinct from the board background', () => {
    const { colors, board } = THEMES.gameboy;
    for (const type of PIECE_TYPES) {
      assert.notEqual(colors[type].toLowerCase(), board.bg.toLowerCase());
    }
  });

  test('the default theme id resolves to an existing theme', () => {
    assert.ok(THEMES[DEFAULT_THEME_ID]);
  });
});

describe('getTheme', () => {
  test('returns the requested theme', () => {
    assert.equal(getTheme('gameboy'), THEMES.gameboy);
  });

  test('falls back to the default theme for an unknown id', () => {
    assert.equal(getTheme('does-not-exist'), THEMES[DEFAULT_THEME_ID]);
    assert.equal(getTheme(undefined), THEMES[DEFAULT_THEME_ID]);
  });
});

describe('clampThemeId', () => {
  test('returns a known id unchanged', () => {
    assert.equal(clampThemeId('gameboy'), 'gameboy');
    assert.equal(clampThemeId('classic'), 'classic');
  });

  test('falls back to the default for an unknown or invalid id', () => {
    assert.equal(clampThemeId('nope'), DEFAULT_THEME_ID);
    assert.equal(clampThemeId(null), DEFAULT_THEME_ID);
    assert.equal(clampThemeId(42), DEFAULT_THEME_ID);
  });
});

describe('read', () => {
  afterEach(clearStorage);

  test('returns the default when localStorage is unavailable', () => {
    clearStorage();
    assert.equal(read(), DEFAULT_THEME_ID);
  });

  test('returns the default when the key is absent', () => {
    installStorage();
    assert.equal(read(), DEFAULT_THEME_ID);
  });

  test('returns the stored id when it is a known theme', () => {
    installStorage({ [THEME_KEY]: 'gameboy' });
    assert.equal(read(), 'gameboy');
  });

  test('falls back to the default when the stored id is unknown', () => {
    installStorage({ [THEME_KEY]: 'rainbow' });
    assert.equal(read(), DEFAULT_THEME_ID);
  });

  test('does not throw when localStorage.getItem throws', () => {
    installStorage({}, { throws: true });
    assert.equal(read(), DEFAULT_THEME_ID);
  });
});

describe('write', () => {
  afterEach(clearStorage);

  test('persists a known theme id', () => {
    const store = installStorage();
    write('gameboy');
    assert.equal(store[THEME_KEY], 'gameboy');
  });

  test('persists the clamped default for an unknown id', () => {
    const store = installStorage();
    write('bogus');
    assert.equal(store[THEME_KEY], DEFAULT_THEME_ID);
  });

  test('does not throw when localStorage.setItem throws', () => {
    installStorage({}, { throws: true });
    assert.doesNotThrow(() => write('gameboy'));
  });
});
