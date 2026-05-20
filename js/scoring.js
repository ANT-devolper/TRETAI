import {
  SCORE_TABLE,
  INITIAL_DROP_INTERVAL,
  MIN_DROP_INTERVAL,
  DROP_INTERVAL_DECREMENT,
  LINES_PER_LEVEL,
} from './constants.js';

export function lineScore(cleared, level) {
  return SCORE_TABLE[cleared] * level;
}

export function levelFromLines(lines) {
  return Math.floor(lines / LINES_PER_LEVEL) + 1;
}

export function dropIntervalForLevel(level) {
  return Math.max(
    MIN_DROP_INTERVAL,
    INITIAL_DROP_INTERVAL - (level - 1) * DROP_INTERVAL_DECREMENT,
  );
}
