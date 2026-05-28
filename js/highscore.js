import { HIGH_SCORE_KEY } from './constants.js';

export function read() {
  try {
    const raw = globalThis.localStorage?.getItem(HIGH_SCORE_KEY);
    if (raw == null) return 0;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function write(score) {
  if (!Number.isFinite(score)) return;
  try {
    globalThis.localStorage?.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // localStorage may be blocked (private mode); ignore.
  }
}

export function isNew(score, previous) {
  return score > 0 && score > previous;
}
