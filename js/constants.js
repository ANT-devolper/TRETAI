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

export const STREAM_URL = 'https://ice1.somafm.com/groovesalad-128-mp3';
export const DEFAULT_VOLUME = 0.6;
export const DUCK_VOLUME = 0.2;
export const STORAGE_KEY_MUTED = 'tetris.music.muted';

// Partículas: quantidade por célula em função das linhas limpas no lock.
// Single (1) não emite; double/triple/tetris escalam para premiar combos maiores.
export const PARTICLES_PER_CELL = { 2: 5, 3: 9, 4: 16 };
export const PARTICLE_GRAVITY = 520;
export const PARTICLE_MIN_SPEED = 90;
export const PARTICLE_MAX_SPEED = 320;
export const PARTICLE_UPWARD_BIAS = 80;
export const PARTICLE_MIN_LIFE = 0.55;
export const PARTICLE_MAX_LIFE = 1.05;
export const PARTICLE_MIN_SIZE = 0.08;
export const PARTICLE_MAX_SIZE = 0.22;

export const SFX_VOLUME = 0.18;
// [frequência Hz, offset segundos, duração segundos] — escala C maior, ascendente.
// 4 linhas (tetris) acrescenta um C6 sustentado para soar triunfante.
export const LINE_CLEAR_NOTES = {
  1: [[523.25, 0.00, 0.12]],
  2: [[523.25, 0.00, 0.10], [659.25, 0.08, 0.14]],
  3: [[523.25, 0.00, 0.09], [659.25, 0.08, 0.09], [783.99, 0.16, 0.16]],
  4: [[523.25, 0.00, 0.08], [659.25, 0.06, 0.08], [783.99, 0.12, 0.08], [1046.50, 0.18, 0.30]],
};
