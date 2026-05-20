import { COLS, ROWS } from './constants.js';

export function newBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function collides(board, piece, dx = 0, dy = 0, shape = piece.shape) {
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

export function merge(board, piece) {
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

export function clearLines(board) {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(null));
      cleared++;
      r++;
    }
  }
  return cleared;
}

export function computeGhostY(board, piece) {
  let ghostY = 0;
  while (!collides(board, piece, 0, ghostY + 1)) ghostY++;
  return ghostY;
}
