import { COLORS, COLS, ROWS } from './constants.js';

export function drawCell(ctx, type, x, y, size) {
  ctx.fillStyle = COLORS[type];
  ctx.fillRect(x * size, y * size, size, size);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x * size, y * size, size, 4);
  ctx.fillRect(x * size, y * size, 4, size);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x * size, y * size + size - 4, size, 4);
  ctx.fillRect(x * size + size - 4, y * size, 4, size);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(x * size, y * size, size, size);
}

export function drawGrid(ctx, canvas, cell) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#111';
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

export function drawLockedCells(ctx, board, cell) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawCell(ctx, board[r][c], c, r, cell);
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

export function drawPiece(ctx, piece, cell) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        drawCell(ctx, piece.type, piece.x + c, piece.y + r, cell);
      }
    }
  }
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

export function drawPiecePreview(ctx, canvasEl, piece, cellSize, dim = false) {
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
      ctx.fillStyle = COLORS[piece.type];
      ctx.fillRect(px, py, cellSize, cellSize);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(px, py, cellSize, 3);
      ctx.fillRect(px, py, 3, cellSize);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(px, py + cellSize - 3, cellSize, 3);
      ctx.fillRect(px + cellSize - 3, py, 3, cellSize);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(px, py, cellSize, cellSize);
    }
  }
  if (dim) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  }
}
