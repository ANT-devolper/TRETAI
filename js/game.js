import { COLS, ROWS, WALL_KICKS, INITIAL_DROP_INTERVAL } from './constants.js';
import { makePiece, randomPiece, rotate } from './piece.js';
import { newBoard, collides, merge, clearLines, computeGhostY } from './board.js';
import { lineScore, levelFromLines, dropIntervalForLevel } from './scoring.js';
import {
  drawGrid, drawLockedCells, drawGhost, drawPiece, drawPiecePreview,
} from './render.js';
import {
  dom, ctx, nextCtx, holdCtx, renderStats, showOverlay, hideOverlay,
} from './ui.js';
import { computeLayout } from './resize.js';
import { bindKeyboard } from './input.js';

const state = {
  board: null,
  current: null,
  next: null,
  hold: null,
  canHold: true,
  score: 0,
  lines: 0,
  level: 1,
  dropInterval: INITIAL_DROP_INTERVAL,
  lastDrop: 0,
  paused: false,
  gameOver: false,
  cell: 30,
  previewCell: 24,
};

function renderBoard() {
  drawGrid(ctx, dom.canvas, state.cell);
  drawLockedCells(ctx, state.board, state.cell);
  if (state.current && !state.gameOver) {
    const ghostY = computeGhostY(state.board, state.current);
    drawGhost(ctx, state.current, ghostY, state.cell);
    drawPiece(ctx, state.current, state.cell);
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
    showOverlay('FIM DE JOGO', true);
  }
}

function move(dx) {
  if (!collides(state.board, state.current, dx, 0)) state.current.x += dx;
}

function tryRotate() {
  const rotated = rotate(state.current.shape);
  for (const k of WALL_KICKS) {
    if (!collides(state.board, state.current, k, 0, rotated)) {
      state.current.shape = rotated;
      state.current.x += k;
      return;
    }
  }
}

function lockPiece() {
  merge(state.board, state.current);
  const cleared = clearLines(state.board);
  if (cleared > 0) {
    state.score += lineScore(cleared, state.level);
    state.lines += cleared;
    state.level = levelFromLines(state.lines);
    state.dropInterval = dropIntervalForLevel(state.level);
    renderStats(state.score, state.lines, state.level);
  }
  if (!state.gameOver) spawn();
}

function softDrop() {
  if (!collides(state.board, state.current, 0, 1)) {
    state.current.y++;
    state.score += 1;
    renderStats(state.score, state.lines, state.level);
  } else {
    lockPiece();
  }
}

function hardDrop() {
  let drop = 0;
  while (!collides(state.board, state.current, 0, 1)) {
    state.current.y++;
    drop++;
  }
  state.score += drop * 2;
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
  } else {
    hideOverlay();
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
  if (!state.gameOver && !state.paused) {
    if (!state.lastDrop) state.lastDrop = time;
    if (time - state.lastDrop > state.dropInterval) {
      if (!collides(state.board, state.current, 0, 1)) {
        state.current.y++;
      } else {
        lockPiece();
      }
      state.lastDrop = time;
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
  state.dropInterval = INITIAL_DROP_INTERVAL;
  state.lastDrop = 0;
  state.paused = false;
  state.gameOver = false;
  state.hold = null;
  state.canHold = true;
  state.next = randomPiece();
  spawn();
  renderHold();
  renderStats(state.score, state.lines, state.level);
  hideOverlay();
}

export function start() {
  applyLayout();
  reset();
  bindKeyboard({
    left: withTurn(() => move(-1)),
    right: withTurn(() => move(1)),
    down: withTurn(softDrop),
    rotate: withTurn(tryRotate),
    hardDrop: withTurn(hardDrop),
    hold: withTurn(holdAction),
    pause: togglePause,
  });
  window.addEventListener('resize', applyLayout);
  dom.restartBtn.addEventListener('click', reset);
  requestAnimationFrame(loop);
}
