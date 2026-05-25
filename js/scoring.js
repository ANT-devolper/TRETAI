import {
  SCORE_TABLE,
  MAX_LEVEL,
  LEVEL_SCORE_THRESHOLDS,
  LEVEL_DROP_INTERVALS,
} from './constants.js';

export function lineScore(cleared, level) {
  return SCORE_TABLE[cleared] * level;
}

export function levelFromScore(score) {
  for (let level = MAX_LEVEL; level >= 1; level--) {
    if (score >= LEVEL_SCORE_THRESHOLDS[level - 1]) return level;
  }
  return 1;
}

export function dropIntervalForLevel(level) {
  const capped = Math.min(Math.max(level, 1), MAX_LEVEL);
  return LEVEL_DROP_INTERVALS[capped - 1];
}
