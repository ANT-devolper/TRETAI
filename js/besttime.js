import { BEST_TIME_KEY_PREFIX } from './constants.js';

function keyFor(modeId) {
  return BEST_TIME_KEY_PREFIX + modeId;
}

export function read(modeId) {
  try {
    const raw = globalThis.localStorage?.getItem(keyFor(modeId));
    if (raw == null) return 0;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function write(modeId, ms) {
  if (!Number.isFinite(ms)) return;
  try {
    globalThis.localStorage?.setItem(keyFor(modeId), String(ms));
  } catch {
    // localStorage may be blocked (private mode); ignore.
  }
}

// A run beats the record when it is a real (positive) time and either there is
// no record yet (previous <= 0) or it is strictly faster — smaller is better.
export function isBetter(ms, previous) {
  return ms > 0 && (previous <= 0 || ms < previous);
}
