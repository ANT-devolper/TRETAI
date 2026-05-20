export const COLS = 10;
export const ROWS = 20;

export const COLORS = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0',
  S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000',
};

export const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
};

export const SCORE_TABLE = [0, 100, 300, 500, 800];
export const WALL_KICKS = [0, -1, 1, -2, 2];

export const INITIAL_DROP_INTERVAL = 1000;
export const MIN_DROP_INTERVAL = 80;
export const DROP_INTERVAL_DECREMENT = 80;
export const LINES_PER_LEVEL = 10;

export const SCROLL_KEYS = [
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  ' ', 'PageUp', 'PageDown', 'Home', 'End',
];
