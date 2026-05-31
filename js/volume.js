import { VOLUME_KEY, DEFAULT_MASTER_VOLUME } from './constants.js';

export function clampVolume(v) {
  if (!Number.isFinite(v)) return DEFAULT_MASTER_VOLUME;
  return Math.min(1, Math.max(0, v));
}

export function read() {
  try {
    const raw = globalThis.localStorage?.getItem(VOLUME_KEY);
    if (raw == null) return DEFAULT_MASTER_VOLUME;
    const value = Number(raw);
    return clampVolume(value);
  } catch {
    return DEFAULT_MASTER_VOLUME;
  }
}

export function write(v) {
  try {
    globalThis.localStorage?.setItem(VOLUME_KEY, String(clampVolume(v)));
  } catch {
    // localStorage may be blocked (private mode); ignore.
  }
}
