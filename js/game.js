import {
  COLS, ROWS, WALL_KICKS, LOCK_DELAY,
  PARTICLES_PER_CELL, PARTICLE_MIN_SIZE, PARTICLE_MAX_SIZE,
  COMBO_MIN_TO_SHOW, COMBO_TEXT_DURATION,
  COMBO_SHAKE_BASE, COMBO_SHAKE_PER_LEVEL, COMBO_SHAKE_MAX, COMBO_SHAKE_DURATION,
} from './constants.js';
import { makePiece, rotate } from './piece.js';
import { nextType } from './bag.js';
import { newBoard, collides, merge, clearLines, computeGhostY } from './board.js';
import { lineScore, levelFromScore, dropIntervalForLevel } from './scoring.js';
import { advanceCombo, comboBonus, comboParticleCount } from './combo.js';
import {
  drawGrid, drawLockedCells, drawGhost, drawPiece, drawPiecePreview, drawParticles, drawTrails,
  drawComboBanner,
} from './render.js';
import { createBurst, stepParticles } from './particles.js';
import { createDropTrail, stepTrails } from './trails.js';
import {
  dom, ctx, nextCtx, holdCtx, renderStats, renderBest, showOverlay, hideOverlay, renderMusicState,
  renderVolume, measurePanelNaturalHeight, applyPanelScale,
  applyTheme, renderThemeOptions, showSettings, hideSettings, showTutorial, hideTutorial,
} from './ui.js';
import { computeLayout, scaleToFit } from './resize.js';
import { bindKeyboard } from './input.js';
import * as audio from './audio.js';
import * as highscore from './highscore.js';
import * as volume from './volume.js';
import * as theme from './theme.js';
import * as visited from './visited.js';
import { getTheme, THEMES, themeIds } from './themes.js';

const state = {
  board: null,
  current: null,
  next: null,
  bag: [],
  hold: null,
  canHold: true,
  score: 0,
  lines: 0,
  level: 1,
  best: 0,
  dropInterval: dropIntervalForLevel(1),
  lastDrop: 0,
  lockTimer: 0,
  paused: false,
  settingsOpen: false,
  tutorialOpen: false,
  gameOver: false,
  cell: 30,
  previewCell: 24,
  particles: [],
  trails: [],
  combo: 0,
  comboFx: null,
  shake: null,
  lastFrame: 0,
  theme: getTheme(),
};

function renderBoard() {
  // Pinta o fundo cheio antes do shake para o translate não expor borda vazia.
  ctx.fillStyle = state.theme.board.bg;
  ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
  ctx.save();
  if (state.shake) {
    const amp = state.shake.mag * Math.max(0, state.shake.life / state.shake.maxLife);
    ctx.translate((Math.random() * 2 - 1) * amp, (Math.random() * 2 - 1) * amp);
  }
  drawGrid(ctx, dom.canvas, state.cell, state.theme.board.bg, state.theme.board.grid);
  drawLockedCells(ctx, state.board, state.cell, state.theme.colors);
  drawTrails(ctx, state.trails);
  if (state.current && !state.gameOver) {
    const ghostY = computeGhostY(state.board, state.current);
    drawGhost(ctx, state.current, ghostY, state.cell, state.theme.ghost);
    drawPiece(ctx, state.current, state.cell, state.theme.colors);
  }
  drawParticles(ctx, state.particles);
  ctx.restore();
  // Banner fica fora do shake para o texto permanecer legível.
  if (state.comboFx) drawComboBanner(ctx, dom.canvas, state.comboFx);
}

function emitLineClearParticles(rows) {
  const base = PARTICLES_PER_CELL[rows.length] || 0;
  const perCell = comboParticleCount(base, state.combo);
  if (!perCell) return;
  const minSize = state.cell * PARTICLE_MIN_SIZE;
  const maxSize = state.cell * PARTICLE_MAX_SIZE;
  for (const { y, cells } of rows) {
    for (let c = 0; c < cells.length; c++) {
      const type = cells[c];
      if (!type) continue;
      const px = (c + 0.5) * state.cell;
      const py = (y + 0.5) * state.cell;
      const burst = createBurst(px, py, state.theme.colors[type], perCell, { minSize, maxSize });
      for (const p of burst) state.particles.push(p);
    }
  }
}

// Dispara o banner pulsante e o screen shake, com amplitude crescente no combo.
function triggerComboFx(combo) {
  state.comboFx = { combo, life: COMBO_TEXT_DURATION, maxLife: COMBO_TEXT_DURATION };
  const mag = Math.min(
    COMBO_SHAKE_BASE + (combo - COMBO_MIN_TO_SHOW) * COMBO_SHAKE_PER_LEVEL,
    COMBO_SHAKE_MAX,
  );
  state.shake = { mag, life: COMBO_SHAKE_DURATION, maxLife: COMBO_SHAKE_DURATION };
}

function renderNext() {
  drawPiecePreview(nextCtx, dom.nextCanvas, state.next, state.previewCell, state.theme.colors);
}

function renderHold() {
  drawPiecePreview(
    holdCtx, dom.holdCanvas, state.hold, state.previewCell, state.theme.colors, !state.canHold,
  );
}

function applyScore(points, clearedLines = 0) {
  state.score += points;
  if (clearedLines) state.lines += clearedLines;
  state.level = levelFromScore(state.score);
  state.dropInterval = dropIntervalForLevel(state.level);
  renderStats(state.score, state.lines, state.level);
}

function pullPiece() {
  const { type, bag } = nextType(state.bag);
  state.bag = bag;
  return makePiece(type);
}

function spawn(piece) {
  state.current = piece || state.next || pullPiece();
  state.current.x = Math.floor((COLS - state.current.shape[0].length) / 2);
  state.current.y = 0;
  if (!piece) {
    state.next = pullPiece();
    renderNext();
  }
  state.canHold = true;
  if (collides(state.board, state.current)) {
    state.gameOver = true;
    const previousBest = state.best;
    let detail = null;
    if (highscore.isNew(state.score, previousBest)) {
      highscore.write(state.score);
      state.best = state.score;
      renderBest(state.best);
      detail = `NOVO RECORDE!\n${state.score}\n(antes: ${previousBest})`;
    }
    showOverlay('FIM DE JOGO', true, detail);
    audio.duck(true);
  }
}

function move(dx) {
  if (!collides(state.board, state.current, dx, 0)) {
    state.current.x += dx;
    state.lockTimer = 0;
  }
}

function tryRotate() {
  const rotated = rotate(state.current.shape);
  for (const k of WALL_KICKS) {
    if (!collides(state.board, state.current, k, 0, rotated)) {
      state.current.shape = rotated;
      state.current.x += k;
      state.lockTimer = 0;
      return;
    }
  }
}

function lockPiece() {
  state.lockTimer = 0;
  merge(state.board, state.current);
  const fullRows = [];
  for (let r = 0; r < ROWS; r++) {
    if (state.board[r].every(cell => cell)) {
      fullRows.push({ y: r, cells: state.board[r].slice() });
    }
  }
  const cleared = clearLines(state.board);
  state.combo = advanceCombo(state.combo, cleared);
  if (cleared > 0) {
    applyScore(lineScore(cleared, state.level) + comboBonus(state.combo, state.level), cleared);
    audio.playLineClearSfx(cleared);
    emitLineClearParticles(fullRows);
    if (state.combo >= COMBO_MIN_TO_SHOW) {
      triggerComboFx(state.combo);
      audio.playComboSfx(state.combo);
    }
  }
  if (!state.gameOver) spawn();
}

function softDrop() {
  if (collides(state.board, state.current, 0, 1)) return;
  state.current.y++;
  applyScore(1);
}

function hardDrop() {
  const startY = state.current.y;
  let drop = 0;
  while (!collides(state.board, state.current, 0, 1)) {
    state.current.y++;
    drop++;
  }
  const trail = createDropTrail(
    state.current, startY, state.current.y, state.cell, state.theme.colors[state.current.type],
  );
  for (const t of trail) state.trails.push(t);
  applyScore(drop * 2);
  lockPiece();
}

function holdAction() {
  if (!state.canHold) return;
  const stored = makePiece(state.current.type);
  if (state.hold) {
    const swap = makePiece(state.hold.type);
    state.hold = stored;
    spawn(swap);
  } else {
    state.hold = stored;
    spawn();
  }
  state.canHold = false;
  renderHold();
}

function togglePause() {
  if (state.gameOver) return;
  state.paused = !state.paused;
  if (state.paused) {
    showOverlay('PAUSADO');
    audio.pauseForGame();
  } else {
    hideOverlay();
    audio.resumeForGame();
    state.lastDrop = 0;
  }
}

function refreshThemeOptions() {
  renderThemeOptions(
    themeIds().map(id => ({ id, name: THEMES[id].name })),
    state.theme.id,
    setTheme,
  );
}

function setTheme(id) {
  state.theme = getTheme(id);
  theme.write(state.theme.id);
  applyTheme(state.theme);
  refreshThemeOptions();
  if (state.board) {
    renderBoard();
    renderNext();
    renderHold();
  }
  closeSettings();
}

// The settings menu opens paused: it mirrors togglePause's pause branch so the
// piece stops dropping and the stream is paused while the player picks a theme.
function openSettings() {
  if (state.gameOver) return;
  if (!state.paused) {
    state.paused = true;
    audio.pauseForGame();
  }
  state.settingsOpen = true;
  showSettings();
}

function closeSettings() {
  state.settingsOpen = false;
  hideSettings();
  if (state.paused) {
    state.paused = false;
    audio.resumeForGame();
    state.lastDrop = 0;
  }
}

// First-visit welcome screen: opens paused (like the settings menu) so new
// players can read the controls before the game starts dropping.
function openTutorial() {
  state.paused = true;
  audio.pauseForGame();
  state.tutorialOpen = true;
  showTutorial();
}

function closeTutorial() {
  state.tutorialOpen = false;
  visited.markVisited();
  hideTutorial();
  state.paused = false;
  audio.resumeForGame();
  state.lastDrop = 0;
}

function withTurn(action) {
  return () => {
    if (state.paused || state.gameOver) return;
    action();
    renderBoard();
  };
}

function applyLayout() {
  const { cell, previewSize, previewCell, panelWidth } = computeLayout();
  state.cell = cell;
  state.previewCell = previewCell;
  dom.canvas.width = cell * COLS;
  dom.canvas.height = cell * ROWS;
  dom.nextCanvas.width = previewSize;
  dom.nextCanvas.height = previewSize;
  dom.holdCanvas.width = previewSize;
  dom.holdCanvas.height = previewSize;
  dom.panel.style.width = panelWidth + 'px';
  if (state.board) {
    renderBoard();
    renderNext();
    renderHold();
  }
  // Scale the whole HUD down until it fits the board height, mirroring how the
  // board scales its cell — so the panel is never clipped on short viewports.
  const available = dom.canvas.height;
  const natural = measurePanelNaturalHeight();
  applyPanelScale(scaleToFit(natural, available), available);
}

function loop(time) {
  if (state.paused || state.gameOver) {
    state.lastFrame = 0;
  } else {
    if (!state.lastDrop) state.lastDrop = time;
    if (!state.lastFrame) state.lastFrame = time;
    const frameMs = time - state.lastFrame;
    const dt = Math.min(0.1, frameMs / 1000);
    state.lastFrame = time;
    const grounded = collides(state.board, state.current, 0, 1);
    if (grounded) {
      state.lockTimer += frameMs;
      if (state.lockTimer >= LOCK_DELAY) {
        lockPiece();
        state.lastDrop = time;
      }
    } else {
      state.lockTimer = 0;
      if (time - state.lastDrop > state.dropInterval) {
        state.current.y++;
        state.lastDrop = time;
      }
    }
    if (state.particles.length) state.particles = stepParticles(state.particles, dt);
    if (state.trails.length) state.trails = stepTrails(state.trails, dt);
    if (state.comboFx) {
      state.comboFx.life -= dt;
      if (state.comboFx.life <= 0) state.comboFx = null;
    }
    if (state.shake) {
      state.shake.life -= dt;
      if (state.shake.life <= 0) state.shake = null;
    }
    renderBoard();
  }
  requestAnimationFrame(loop);
}

function reset() {
  state.board = newBoard();
  state.score = 0;
  state.lines = 0;
  state.level = 1;
  state.dropInterval = dropIntervalForLevel(1);
  state.lastDrop = 0;
  state.lockTimer = 0;
  state.lastFrame = 0;
  state.particles = [];
  state.trails = [];
  state.combo = 0;
  state.comboFx = null;
  state.shake = null;
  state.paused = false;
  state.gameOver = false;
  state.hold = null;
  state.canHold = true;
  state.bag = [];
  state.next = pullPiece();
  spawn();
  renderHold();
  renderStats(state.score, state.lines, state.level);
  renderBest(state.best);
  hideOverlay();
  audio.duck(false);
}

export function start() {
  state.theme = getTheme(theme.read());
  applyTheme(state.theme);
  refreshThemeOptions();
  applyLayout();
  state.best = highscore.read();
  reset();
  bindKeyboard({
    left: withTurn(() => move(-1)),
    right: withTurn(() => move(1)),
    down: withTurn(softDrop),
    rotate: withTurn(tryRotate),
    hardDrop: withTurn(hardDrop),
    hold: withTurn(holdAction),
    pause: () => { if (state.tutorialOpen || state.settingsOpen) return; togglePause(); },
    escape: () => {
      if (state.tutorialOpen) { closeTutorial(); return; }
      if (state.settingsOpen) { closeSettings(); return; }
      togglePause();
    },
    restart: () => { if (state.gameOver) reset(); },
    toggleMusic: () => audio.toggle(),
  });
  window.addEventListener('resize', applyLayout);
  dom.restartBtn.addEventListener('click', reset);
  dom.settingsBtn.addEventListener('click', openSettings);
  dom.settingsClose.addEventListener('click', closeSettings);
  dom.tutorialStart.addEventListener('click', closeTutorial);
  dom.musicBtn.addEventListener('click', () => audio.toggle());
  const initialVolume = volume.read();
  audio.setVolume(initialVolume);
  renderVolume(initialVolume);
  dom.volumeEl.addEventListener('input', () => {
    const v = Number(dom.volumeEl.value) / 100;
    audio.setVolume(v);
    volume.write(v);
  });
  audio.onStateChange(renderMusicState);
  renderMusicState({ playing: audio.isPlaying() });
  if (!visited.read()) openTutorial();
  requestAnimationFrame(loop);
}
