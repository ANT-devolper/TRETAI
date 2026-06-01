import { COLS, ROWS, TRAIL_ALPHA_START, TRAIL_WHITE_ALPHA } from './constants.js';

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

export function drawGhost(ctx, piece, ghostY, cell) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const x = (piece.x + c) * cell;
        const y = (piece.y + r + ghostY) * cell;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x, y, cell, cell);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.strokeRect(x, y, cell, cell);
      }
    }
  }
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
