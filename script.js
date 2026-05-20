const COLS = 10;
const ROWS = 20;
let CELL = 30;
let PREVIEW_CELL = 24;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold');
const holdCtx = holdCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const restartBtn = document.getElementById('restartBtn');
const panelEl = document.querySelector('.panel');

const COLORS = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0',
  S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000',
};

const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
};

let board, current, next, hold, canHold, score, lines, level, dropInterval, lastDrop, paused, gameOver;

function resize() {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const panelWidth = Math.max(140, Math.min(200, vw * 0.18));
  const gap = Math.max(8, Math.min(24, vw * 0.015));
  const pad = Math.max(8, Math.min(20, vh * 0.015)) * 2 + 4;
  const availW = vw - panelWidth - gap - pad - 8;
  const availH = vh - pad - 8;
  const cellByW = Math.floor(availW / COLS);
  const cellByH = Math.floor(availH / ROWS);
  CELL = Math.max(10, Math.min(cellByW, cellByH));
  canvas.width = CELL * COLS;
  canvas.height = CELL * ROWS;
  const previewSize = Math.max(60, Math.min(120, panelWidth - 24));
  nextCanvas.width = previewSize;
  nextCanvas.height = previewSize;
  holdCanvas.width = previewSize;
  holdCanvas.height = previewSize;
  PREVIEW_CELL = Math.floor(previewSize / 5);
  panelEl.style.width = panelWidth + 'px';
  if (board) {
    draw();
    drawNext();
    drawHold();
  }
}

function newBoard() {
  return Array.from({length: ROWS}, () => Array(COLS).fill(null));
}

function randomPiece() {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  const shape = SHAPES[type].map(row => row.slice());
  return {
    type,
    shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0,
  };
}

function rotate(shape) {
  const n = shape.length;
  const out = Array.from({length: n}, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out[c][n - 1 - r] = shape[r][c];
    }
  }
  return out;
}

function collides(piece, dx = 0, dy = 0, shape = piece.shape) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function merge(piece) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const y = piece.y + r;
        const x = piece.x + c;
        if (y >= 0) board[y][x] = piece.type;
      }
    }
  }
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(null));
      cleared++;
      r++;
    }
  }
  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800][cleared] * level;
    score += points;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(80, 1000 - (level - 1) * 80);
    updateUI();
  }
}

function spawn(piece) {
  current = piece || next || randomPiece();
  current.x = Math.floor((COLS - current.shape[0].length) / 2);
  current.y = 0;
  if (!piece) {
    next = randomPiece();
    drawNext();
  }
  canHold = true;
  if (collides(current)) {
    gameOver = true;
    overlayText.textContent = 'FIM DE JOGO';
    restartBtn.classList.add('show');
    overlay.classList.add('show');
  }
}

function holdPiece() {
  if (!canHold) return;
  const stored = { type: current.type, shape: SHAPES[current.type].map(r => r.slice()) };
  if (hold) {
    const swap = { type: hold.type, shape: SHAPES[hold.type].map(r => r.slice()), x: 0, y: 0 };
    hold = stored;
    spawn(swap);
  } else {
    hold = stored;
    spawn();
  }
  canHold = false;
  drawHold();
}

function move(dx) {
  if (!collides(current, dx, 0)) current.x += dx;
}

function softDrop() {
  if (!collides(current, 0, 1)) {
    current.y++;
    score += 1;
    updateUI();
  } else {
    lockPiece();
  }
}

function hardDrop() {
  let drop = 0;
  while (!collides(current, 0, 1)) {
    current.y++;
    drop++;
  }
  score += drop * 2;
  updateUI();
  lockPiece();
}

function lockPiece() {
  merge(current);
  clearLines();
  if (!gameOver) spawn();
}

function tryRotate() {
  const rotated = rotate(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const k of kicks) {
    if (!collides(current, k, 0, rotated)) {
      current.shape = rotated;
      current.x += k;
      return;
    }
  }
}

function drawCell(c, x, y, context = ctx, size = CELL) {
  context.fillStyle = COLORS[c];
  context.fillRect(x * size, y * size, size, size);
  context.fillStyle = 'rgba(255,255,255,0.2)';
  context.fillRect(x * size, y * size, size, 4);
  context.fillRect(x * size, y * size, 4, size);
  context.fillStyle = 'rgba(0,0,0,0.3)';
  context.fillRect(x * size, y * size + size - 4, size, 4);
  context.fillRect(x * size + size - 4, y * size, 4, size);
  context.strokeStyle = '#000';
  context.lineWidth = 1;
  context.strokeRect(x * size, y * size, size, size);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1;
  for (let i = 1; i < COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, canvas.height);
    ctx.stroke();
  }
  for (let i = 1; i < ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * CELL);
    ctx.lineTo(canvas.width, i * CELL);
    ctx.stroke();
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawCell(board[r][c], c, r);
    }
  }

  if (current && !gameOver) {
    let ghostY = 0;
    while (!collides(current, 0, ghostY + 1)) ghostY++;
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (current.shape[r][c]) {
          const x = (current.x + c) * CELL;
          const y = (current.y + r + ghostY) * CELL;
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.strokeRect(x, y, CELL, CELL);
        }
      }
    }

    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (current.shape[r][c]) {
          drawCell(current.type, current.x + c, current.y + r);
        }
      }
    }
  }
}

function drawPiecePreview(context, canvasEl, piece, dim = false) {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvasEl.width, canvasEl.height);
  if (!piece) return;
  const size = PREVIEW_CELL;
  const shape = piece.shape;
  const offX = (canvasEl.width - shape[0].length * size) / 2;
  const offY = (canvasEl.height - shape.length * size) / 2;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        context.fillStyle = COLORS[piece.type];
        context.fillRect(offX + c * size, offY + r * size, size, size);
        context.fillStyle = 'rgba(255,255,255,0.2)';
        context.fillRect(offX + c * size, offY + r * size, size, 3);
        context.fillRect(offX + c * size, offY + r * size, 3, size);
        context.fillStyle = 'rgba(0,0,0,0.3)';
        context.fillRect(offX + c * size, offY + r * size + size - 3, size, 3);
        context.fillRect(offX + c * size + size - 3, offY + r * size, 3, size);
        context.strokeStyle = '#000';
        context.strokeRect(offX + c * size, offY + r * size, size, size);
      }
    }
  }
  if (dim) {
    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.fillRect(0, 0, canvasEl.width, canvasEl.height);
  }
}

function drawNext() {
  drawPiecePreview(nextCtx, nextCanvas, next);
}

function drawHold() {
  drawPiecePreview(holdCtx, holdCanvas, hold, !canHold);
}

function updateUI() {
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function loop(time) {
  if (!gameOver && !paused) {
    if (!lastDrop) lastDrop = time;
    if (time - lastDrop > dropInterval) {
      if (!collides(current, 0, 1)) {
        current.y++;
      } else {
        lockPiece();
      }
      lastDrop = time;
    }
    draw();
  }
  requestAnimationFrame(loop);
}

function reset() {
  board = newBoard();
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 1000;
  lastDrop = 0;
  paused = false;
  gameOver = false;
  hold = null;
  canHold = true;
  next = randomPiece();
  spawn();
  drawHold();
  updateUI();
  overlay.classList.remove('show');
  restartBtn.classList.remove('show');
}

const SCROLL_KEYS = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','PageUp','PageDown','Home','End'];

document.addEventListener('keydown', (e) => {
  if (SCROLL_KEYS.includes(e.key)) e.preventDefault();
  if (gameOver) return;
  if (e.key === 'p' || e.key === 'P') {
    paused = !paused;
    if (paused) {
      overlayText.textContent = 'PAUSADO';
      overlay.classList.add('show');
    } else {
      overlay.classList.remove('show');
      lastDrop = 0;
    }
    return;
  }
  if (paused) return;
  switch (e.key) {
    case 'ArrowLeft': move(-1); break;
    case 'ArrowRight': move(1); break;
    case 'ArrowDown': softDrop(); break;
    case 'ArrowUp':
    case 'x':
    case 'X': tryRotate(); break;
    case ' ': hardDrop(); break;
    case 'c':
    case 'C': holdPiece(); break;
  }
  draw();
}, { passive: false });

window.addEventListener('resize', resize);
restartBtn.addEventListener('click', reset);

resize();
reset();
requestAnimationFrame(loop);
