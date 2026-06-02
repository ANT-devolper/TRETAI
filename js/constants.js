export const COLS = 10;
export const ROWS = 20;

export const PREVIEW_MIN = 60;
export const PREVIEW_MAX = 120;
export const PREVIEW_VH_FACTOR = 0.12; // previews shrink with viewport height

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
// Perfect Clear (tabuleiro vazio após o lock): bônus por linhas × level, indexado
// como SCORE_TABLE. Valores clássicos do Tetris guideline.
export const PERFECT_CLEAR_BONUS = [0, 800, 1200, 1800, 2000];
export const WALL_KICKS = [0, -1, 1, -2, 2];

export const LOCK_DELAY = 500;

export const MAX_LEVEL = 8;
export const LEVEL_SCORE_THRESHOLDS = [0, 1500, 4000, 8000, 14000, 22000, 34000, 50000];
export const LEVEL_DROP_INTERVALS  = [1000, 850, 720, 600, 480, 370, 260, 150];

export const SCROLL_KEYS = [
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  ' ', 'PageUp', 'PageDown', 'Home', 'End',
];

export const HIGH_SCORE_KEY = 'tretai.highScore';

export const THEME_KEY = 'tretai.theme';

export const VISITED_KEY = 'tretai.visited';

export const STREAM_URL = 'https://ice1.somafm.com/groovesalad-128-mp3';
export const DEFAULT_VOLUME = 0.6;
export const DUCK_VOLUME = 0.2;

export const VOLUME_KEY = 'tretai.volume';
// Master volume in [0, 1] scaling both music and SFX; 1 preserves the tuned mix.
export const DEFAULT_MASTER_VOLUME = 1;

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

export const TRAIL_DURATION = 0.2;
export const TRAIL_ALPHA_START = 0.3;
export const TRAIL_WHITE_ALPHA = 0.2;

// Combo: locks consecutivos que limpam linhas. Conta a partir de ×2.
export const COMBO_MIN_TO_SHOW = 2;
export const COMBO_BONUS_PER_LEVEL = 50; // bônus = 50 × (combo-1) × level
// Partículas turbinadas: multiplica a contagem por célula conforme o combo.
export const COMBO_PARTICLE_BOOST = 0.5; // +50% por elo acima de ×1
export const COMBO_PARTICLE_MAX = 40;    // teto de segurança por célula
// Banner "COMBO ×N": vida, pulso e escala máxima do texto.
export const COMBO_TEXT_DURATION = 0.9;  // segundos
export const COMBO_TEXT_PULSE_HZ = 6;    // oscilações de escala por segundo
export const COMBO_TEXT_MAX_SCALE = 0.18; // amplitude do pulso (fração)
// Screen shake: amplitude (px) cresce com o combo, com teto e duração própria.
export const COMBO_SHAKE_BASE = 4;
export const COMBO_SHAKE_PER_LEVEL = 2;
export const COMBO_SHAKE_MAX = 14;
export const COMBO_SHAKE_DURATION = 0.35; // segundos
// Flash de cor cobrindo o tabuleiro no disparo do combo.
export const COMBO_FLASH_ALPHA = 0.25;
// Tom ascendente extra (Web Audio square-wave), sobe por elo até o teto.
export const COMBO_TONE_BASE = 392;      // G4 em Hz
export const COMBO_TONE_SEMITONES = 2;   // tom inteiro por elo
export const COMBO_TONE_MAX_STEPS = 6;   // satura após 6 elos
export const COMBO_TONE_DURATION = 0.18; // segundos

// Perfect Clear: banner dourado "PERFECT CLEAR" + flash, mais demorado que o
// combo por ser a recompensa de maior prestígio.
export const PC_TEXT_DURATION = 1.2;  // segundos
export const PC_FLASH_ALPHA = 0.3;
export const PC_COLOR = '#ffd700';     // dourado
// Arpejo triunfante ascendente C maior (C5-E5-G5-C6), com C6 sustentado no fim.
export const PERFECT_CLEAR_NOTES = [
  [523.25, 0.00, 0.10],
  [659.25, 0.08, 0.10],
  [783.99, 0.16, 0.10],
  [1046.50, 0.24, 0.40],
];

export const SFX_VOLUME = 0.18;
// [frequência Hz, offset segundos, duração segundos] — escala C maior, ascendente.
// 4 linhas (tetris) acrescenta um C6 sustentado para soar triunfante.
export const LINE_CLEAR_NOTES = {
  1: [[523.25, 0.00, 0.12]],
  2: [[523.25, 0.00, 0.10], [659.25, 0.08, 0.14]],
  3: [[523.25, 0.00, 0.09], [659.25, 0.08, 0.09], [783.99, 0.16, 0.16]],
  4: [[523.25, 0.00, 0.08], [659.25, 0.06, 0.08], [783.99, 0.12, 0.08], [1046.50, 0.18, 0.30]],
};
