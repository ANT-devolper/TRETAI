import { COLORS } from './constants.js';

// Theme data is pure: each theme is { id, name, colors (7 pieces), board }.
// The DOM side (panel/background) is themed in style.css keyed by the same id
// via [data-theme]; here we only carry what the canvas needs to repaint.
export const THEMES = {
  classic: {
    id: 'classic',
    name: 'Clássico',
    colors: COLORS,
    board: { bg: '#000', grid: '#111' },
  },
  gameboy: {
    id: 'gameboy',
    name: 'Game Boy',
    // Seven distinct olive-greens, all lighter than the board so they read on
    // the dark DMG background (no piece equals board.bg).
    colors: {
      I: '#9bbc0f', O: '#8bac0f', T: '#aacf0f', S: '#6b9b0f',
      Z: '#88a838', J: '#4f7a1e', L: '#c4d860',
    },
    board: { bg: '#0f2f0f', grid: '#1e4d1e' },
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    colors: {
      I: '#21e6ff', O: '#ffe600', T: '#b14bff', S: '#2bff88',
      Z: '#ff3b6b', J: '#4b6bff', L: '#ff9e2b',
    },
    board: { bg: '#150a28', grid: '#2a1550' },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      I: '#54d1ff', O: '#ffd166', T: '#c77dff', S: '#06d6a0',
      Z: '#ff5d8f', J: '#7b8cff', L: '#ff924c',
    },
    board: { bg: '#241030', grid: '#43204d' },
  },
  pastel: {
    id: 'pastel',
    name: 'Pastel',
    colors: {
      I: '#4fb3c4', O: '#d4a72c', T: '#9b6fd4', S: '#4fb36a',
      Z: '#d45f5f', J: '#5f7fd4', L: '#d4894f',
    },
    board: { bg: '#f4f1ea', grid: '#ddd6c8' },
    // Light board — the ghost must be dark to stay visible (others default to white).
    ghost: '#3a3450',
  },
};

export const DEFAULT_THEME_ID = 'classic';

export function getTheme(id) {
  return THEMES[id] || THEMES[DEFAULT_THEME_ID];
}

export function themeIds() {
  return Object.keys(THEMES);
}
