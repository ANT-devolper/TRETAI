import { SHAPES } from './constants.js';

export function makePiece(type) {
  return {
    type,
    shape: SHAPES[type].map(row => row.slice()),
    x: 0,
    y: 0,
  };
}

export function rotate(shape) {
  const n = shape.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out[c][n - 1 - r] = shape[r][c];
    }
  }
  return out;
}
