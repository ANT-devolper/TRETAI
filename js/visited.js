import { VISITED_KEY } from './constants.js';

export function read() {
  try {
    // No storage (private mode) returns true so we never nag the user repeatedly.
    return globalThis.localStorage?.getItem(VISITED_KEY) != null;
  } catch {
    return true;
  }
}

export function markVisited() {
  try {
    globalThis.localStorage?.setItem(VISITED_KEY, '1');
  } catch {
    // localStorage may be blocked (private mode); ignore.
  }
}
