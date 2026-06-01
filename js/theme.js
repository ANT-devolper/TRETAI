import { THEME_KEY } from './constants.js';
import { THEMES, DEFAULT_THEME_ID } from './themes.js';

export function clampThemeId(id) {
  return typeof id === 'string' && THEMES[id] ? id : DEFAULT_THEME_ID;
}

export function read() {
  try {
    const raw = globalThis.localStorage?.getItem(THEME_KEY);
    if (raw == null) return DEFAULT_THEME_ID;
    return clampThemeId(raw);
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function write(id) {
  try {
    globalThis.localStorage?.setItem(THEME_KEY, clampThemeId(id));
  } catch {
    // localStorage may be blocked (private mode); ignore.
  }
}
