import {
  COLS, ROWS, WALL_KICKS, LOCK_DELAY,
  COLORS, PARTICLES_PER_CELL, PARTICLE_MIN_SIZE, PARTICLE_MAX_SIZE,
} from './constants.js';
import { makePiece, randomPiece, rotate } from './piece.js';
import { newBoard, collides, merge, clearLines, computeGhostY } from './board.js';
import { lineScore, levelFromScore, dropIntervalForLevel } from './scoring.js';
import {
  drawGrid, drawLockedCells, drawGhost, drawPiece, drawPiecePreview, drawParticles, drawTrails,
} from './render.js';
import { createBurst, stepParticles } from './particles.js';
import { createDropTrail, stepTrails } from './trails.js';
import {
  dom, ctx, nextCtx, holdCtx, renderStats, renderBest, showOverlay, hideOverlay, renderMusicState,
} from './ui.js';
import { computeLayout } from './resize.js';
import { bindKeyboard } from './input.js';
import * as audio from './audio.js';
import * as highscore from './highscore.js';

const state = {
  board: null,
  current: null,
  next: null,
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
  gameOver: false,
  cell: 30,
  previewCell: 24,
  particles: [],
  trails: [],
  lastFrame: 0,
};

function renderBoard() {
  drawGrid(ctx, dom.canvas, state.cell);
  drawLockedCells(ctx, state.board, state.cell);
  drawTrails(ctx, state.trails);
  if (state.current && !state.gameOver) {
    const ghostY = computeGhostY(state.board, state.current);
    drawGhost(ctx, state.current, ghostY, state.cell);
    drawPiece(ctx, state.current, state.cell);
  }
  drawParticles(ctx, state.particles);
}

function emitLineClearParticles(rows) {
  const perCell = PARTICLES_PER_CELL[rows.length] || 0;
  if (!perCell) return;
  const minSize = state.cell * PARTICLE_MIN_SIZE;
  const maxSize = state.cell * PARTICLE_MAX_SIZE;
  for (const { y, cells } of rows) {
    for (let c = 0; c < cells.length; c++) {
      const type = cells[c];
      if (!type) continue;
      const px = (c + 0.5) * state.cell;
      const py = (y + 0.5) * state.cell;
      const burst = createBurst(px, py, COLORS[type], perCell, { minSize, maxSize });
      for (const p of burst) state.particles.push(p);
    }
  }
}

function renderNext() {
  drawPiecePreview(nextCtx, dom.nextCanvas, state.next, state.previewCell);
}

function renderHold() {
  drawPiecePreview(holdCtx, dom.holdCanvas, state.hold, state.previewCell, !state.canHold);
}

function spawn(piece) {
  state.current = piece || state.next || randomPiece();
  state.current.x = Math.floor((COLS - state.current.shape[0].length) / 2);
  state.current.y = 0;
  if (!piece) {
    state.next = randomPiece();
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
  if (cleared > 0) {
    state.score += lineScore(cleared, state.level);
    state.lines += cleared;
    state.level = levelFromScore(state.score);
    state.dropInterval = dropIntervalForLevel(state.level);
    renderStats(state.score, state.lines, state.level);
    audio.playLineClearSfx(cleared);
    emitLineClearParticles(fullRows);
  }
  if (!state.gameOver) spawn();
}

function softDrop() {
  if (collides(state.board, state.current, 0, 1)) return;
  state.current.y++;
  state.score += 1;
  state.level = levelFromScore(state.score);
  state.dropInterval = dropIntervalForLevel(state.level);
  renderStats(state.score, state.lines, state.level);
}

function hardDrop() {
  const startY = state.current.y;
  let drop = 0;
  while (!collides(state.board, state.current, 0, 1)) {
    state.current.y++;
    drop++;
  }
  const trail = createDropTrail(
    state.current, startY, state.current.y, state.cell, COLORS[state.current.type],
  );
  for (const t of trail) state.trails.push(t);
  state.score += drop * 2;
  state.level = levelFromScore(state.score);
  state.dropInterval = dropIntervalForLevel(state.level);
  renderStats(state.score, state.lines, state.level);
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
  state.paused = false;
  state.gameOver = false;
  state.hold = null;
  state.canHold = true;
  state.next = randomPiece();
  spawn();
  renderHold();
  renderStats(state.score, state.lines, state.level);
  renderBest(state.best);
  hideOverlay();
  audio.duck(false);
}

export function start() {
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
    pause: togglePause,
    toggleMusic: () => audio.toggle(),
  });
  window.addEventListener('resize', applyLayout);
  dom.restartBtn.addEventListener('click', reset);
  dom.musicBtn.addEventListener('click', () => audio.toggle());
  audio.onStateChange(renderMusicState);
  renderMusicState({ playing: audio.isPlaying() });
  requestAnimationFrame(loop);
}
