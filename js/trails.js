import { TRAIL_DURATION } from './constants.js';

export function createDropTrail(piece, startY, endY, cell, color, life = TRAIL_DURATION) {
  if (endY <= startY) return [];
  const height = (endY - startY) * cell;
  const trails = [];
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      trails.push({
        x: (piece.x + c) * cell,
        y: (startY + r) * cell,
        width: cell,
        height,
        color,
        life,
        maxLife: life,
      });
    }
  }
  return trails;
}

export function stepTrails(trails, dt) {
  const alive = [];
  for (const t of trails) {
    const life = t.life - dt;
    if (life <= 0) continue;
    alive.push({ ...t, life });
  }
  return alive;
}
