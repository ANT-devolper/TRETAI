import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { newBoard, collides, merge, clearLines, computeGhostY } from '../js/board.js';
import { COLS, ROWS } from '../js/constants.js';

describe('newBoard', () => {
  test('creates ROWS×COLS matrix filled with null', () => {
    const board = newBoard();
    assert.equal(board.length, ROWS);
    assert.equal(board[0].length, COLS);
    assert.ok(board.flat().every(c => c === null));
  });

  test('rows are independent arrays', () => {
    const board = newBoard();
    board[0][0] = 'T';
    assert.equal(board[1][0], null);
  });
});

describe('collides', () => {
  const piece2x2 = { x: 0, y: 0, shape: [[1, 1], [1, 1]] };

  test('detects collision with left wall', () => {
    assert.equal(collides(newBoard(), piece2x2, -1, 0), true);
  });

  test('detects collision with right wall', () => {
    const p = { x: COLS - 2, y: 0, shape: [[1, 1], [1, 1]] };
    assert.equal(collides(newBoard(), p, 1, 0), true);
  });

  test('detects collision with floor', () => {
    const p = { x: 0, y: ROWS - 2, shape: [[1, 1], [1, 1]] };
    assert.equal(collides(newBoard(), p, 0, 1), true);
  });

  test('detects collision with locked block', () => {
    const board = newBoard();
    board[1][0] = 'T';
    assert.equal(collides(board, piece2x2, 0, 0), true);
  });

  test('piece above the top (y < 0) does not collide with an existing block below', () => {
    const board = newBoard();
    board[0][0] = 'T';
    const p = { x: 0, y: -2, shape: [[1, 1], [1, 1]] };
    assert.equal(collides(board, p, 0, 0), false);
  });

  test('no collision in empty area', () => {
    const p = { x: 3, y: 5, shape: [[1, 1], [1, 1]] };
    assert.equal(collides(newBoard(), p), false);
  });

  test('custom shape argument is used instead of piece.shape', () => {
    const p = { x: 0, y: 0, shape: [[1]] };
    const altShape = [[1, 1], [1, 1]];
    assert.equal(collides(newBoard(), p, -1, 0, altShape), true);
  });
});

describe('merge', () => {
  test('writes piece type into occupied cells', () => {
    const board = newBoard();
    const piece = { type: 'T', x: 0, y: 0, shape: [[1, 1], [1, 1]] };
    merge(board, piece);
    assert.equal(board[0][0], 'T');
    assert.equal(board[0][1], 'T');
    assert.equal(board[1][0], 'T');
    assert.equal(board[1][1], 'T');
  });

  test('ignores cells with y < 0 (above the top)', () => {
    const board = newBoard();
    const piece = { type: 'T', x: 0, y: -1, shape: [[1, 1], [1, 1]] };
    merge(board, piece);
    assert.equal(board[0][0], 'T');
    assert.equal(board[0][1], 'T');
  });

  test('does not write to cells where shape=0', () => {
    const board = newBoard();
    const piece = { type: 'S', x: 0, y: 0, shape: [[0, 1], [1, 0]] };
    merge(board, piece);
    assert.equal(board[0][0], null);
    assert.equal(board[0][1], 'S');
    assert.equal(board[1][0], 'S');
    assert.equal(board[1][1], null);
  });
});

describe('clearLines', () => {
  test('clears 1 full line and returns 1', () => {
    const board = newBoard();
    for (let c = 0; c < COLS; c++) board[ROWS - 1][c] = 'T';
    assert.equal(clearLines(board), 1);
    assert.ok(board[ROWS - 1].every(c => c === null));
  });

  test('clears 4 lines (tetris) and returns 4', () => {
    const board = newBoard();
    for (let r = ROWS - 4; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) board[r][c] = 'I';
    }
    assert.equal(clearLines(board), 4);
    assert.ok(board.flat().every(c => c === null));
  });

  test('keeps incomplete lines and pushes them down', () => {
    const board = newBoard();
    board[ROWS - 2][0] = 'T';
    for (let c = 0; c < COLS; c++) board[ROWS - 1][c] = 'I';
    assert.equal(clearLines(board), 1);
    assert.equal(board[ROWS - 1][0], 'T');
    assert.equal(board[ROWS - 2][0], null);
  });

  test('returns 0 when no line is complete', () => {
    assert.equal(clearLines(newBoard()), 0);
  });
});

describe('computeGhostY', () => {
  test('returns distance to the floor on an empty board', () => {
    const piece = { x: 0, y: 0, shape: [[1]] };
    assert.equal(computeGhostY(newBoard(), piece), ROWS - 1);
  });

  test('stops on top of an existing block', () => {
    const board = newBoard();
    board[ROWS - 1][0] = 'T';
    const piece = { x: 0, y: 0, shape: [[1]] };
    assert.equal(computeGhostY(board, piece), ROWS - 2);
  });

  test('returns 0 when the piece is already resting', () => {
    const board = newBoard();
    const piece = { x: 0, y: ROWS - 1, shape: [[1]] };
    assert.equal(computeGhostY(board, piece), 0);
  });
});
