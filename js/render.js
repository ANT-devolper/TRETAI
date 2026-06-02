import {
  COLS, ROWS, TRAIL_ALPHA_START, TRAIL_WHITE_ALPHA,
  COMBO_FLASH_ALPHA, COMBO_TEXT_MAX_SCALE, COMBO_TEXT_PULSE_HZ,
  PC_FLASH_ALPHA, PC_COLOR,
} from './constants.js';

function paintBevelCell(ctx, color, px, py, size, bevel) {
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(px, py, size, bevel);
  ctx.fillRect(px, py, bevel, size);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(px, py + size - bevel, size, bevel);
  ctx.fillRect(px + size - bevel, py, bevel, size);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, size, size);
}

export function drawCell(ctx, type, x, y, size, colors) {
  paintBevelCell(ctx, colors[type], x * size, y * size, size, 4);
}

export function drawGrid(ctx, canvas, cell, bg, grid) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = grid;
  ctx.lineWidth = 1;
  for (let i = 1; i < COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, canvas.height);
    ctx.stroke();
  }
  for (let i = 1; i < ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(canvas.width, i * cell);
    ctx.stroke();
  }
}

export function drawLockedCells(ctx, board, cell, colors) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawCell(ctx, board[r][c], c, r, cell, colors);
    }
  }
}

export function drawGhost(ctx, piece, ghostY, cell, ghostColor = '#fff') {
  ctx.save();
  ctx.fillStyle = ghostColor;
  ctx.strokeStyle = ghostColor;
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const x = (piece.x + c) * cell;
        const y = (piece.y + r + ghostY) * cell;
        ctx.globalAlpha = 0.1;
        ctx.fillRect(x, y, cell, cell);
        ctx.globalAlpha = 0.3;
        ctx.strokeRect(x, y, cell, cell);
      }
    }
  }
  ctx.restore();
}

export function drawPiece(ctx, piece, cell, colors) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        drawCell(ctx, piece.type, piece.x + c, piece.y + r, cell, colors);
      }
    }
  }
}

export function drawTrails(ctx, trails) {
  if (!trails.length) return;
  ctx.save();
  for (const t of trails) {
    const fade = Math.max(0, Math.min(1, t.life / t.maxLife));
    ctx.globalAlpha = fade * TRAIL_ALPHA_START;
    ctx.fillStyle = t.color;
    ctx.fillRect(t.x, t.y, t.width, t.height);
    ctx.globalAlpha = fade * TRAIL_WHITE_ALPHA;
    ctx.fillStyle = '#fff';
    ctx.fillRect(t.x, t.y, t.width, t.height);
  }
  ctx.restore();
}

export function drawParticles(ctx, particles) {
  if (!particles.length) return;
  ctx.save();
  for (const p of particles) {
    const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    const half = p.size / 2;
    ctx.fillRect(p.x - half, p.y - half, p.size, p.size);
  }
  ctx.restore();
}

// Cor do combo: o matiz avança a cada elo, do verde-limão ao quente.
function comboColor(combo) {
  return `hsl(${(combo * 40) % 360}, 100%, 60%)`;
}

// Banner "COMBO ×N" + flash, desenhado sobre o tabuleiro. fx = { combo, life, maxLife }.
export function drawComboBanner(ctx, canvas, fx) {
  const { combo, life, maxLife } = fx;
  const t = Math.max(0, Math.min(1, life / maxLife)); // 1 → 0 ao longo da vida
  const color = comboColor(combo);

  ctx.save();
  ctx.globalAlpha = COMBO_FLASH_ALPHA * t;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  const age = maxLife - life;
  const pulse = 1 + COMBO_TEXT_MAX_SCALE * Math.sin(age * COMBO_TEXT_PULSE_HZ * Math.PI * 2);
  const size = canvas.width * 0.16 * pulse;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.font = `bold ${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.strokeStyle = '#000';
  ctx.fillStyle = color;
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.32;
  const label = `COMBO ×${combo}`;
  ctx.strokeText(label, cx, cy);
  ctx.fillText(label, cx, cy);
  ctx.restore();
}

// Banner "PERFECT CLEAR" + flash dourado, desenhado sobre o tabuleiro.
// fx = { life, maxLife }. Espelha drawComboBanner, com label e cor fixos.
export function drawPerfectClearBanner(ctx, canvas, fx) {
  const { life, maxLife } = fx;
  const t = Math.max(0, Math.min(1, life / maxLife)); // 1 → 0 ao longo da vida

  ctx.save();
  ctx.globalAlpha = PC_FLASH_ALPHA * t;
  ctx.fillStyle = PC_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  const age = maxLife - life;
  const pulse = 1 + COMBO_TEXT_MAX_SCALE * Math.sin(age * COMBO_TEXT_PULSE_HZ * Math.PI * 2);
  const size = canvas.width * 0.11 * pulse;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.font = `bold ${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.strokeStyle = '#000';
  ctx.fillStyle = PC_COLOR;
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.32;
  const label = 'PERFECT CLEAR';
  ctx.strokeText(label, cx, cy);
  ctx.fillText(label, cx, cy);
  ctx.restore();
}

export function drawPiecePreview(ctx, canvasEl, piece, cellSize, colors, dim = false) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  if (!piece) return;
  const shape = piece.shape;
  const offX = (canvasEl.width - shape[0].length * cellSize) / 2;
  const offY = (canvasEl.height - shape.length * cellSize) / 2;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const px = offX + c * cellSize;
      const py = offY + r * cellSize;
      paintBevelCell(ctx, colors[piece.type], px, py, cellSize, 3);
    }
  }
  if (dim) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  }
}
