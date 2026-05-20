import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { newBoard, collides, merge, clearLines, computeGhostY } from '../js/board.js';
import { COLS, ROWS } from '../js/constants.js';

describe('newBoard', () => {
  test('cria matriz ROWS×COLS preenchida com null', () => {
    const board = newBoard();
    assert.equal(board.length, ROWS);
    assert.equal(board[0].length, COLS);
    assert.ok(board.flat().every(c => c === null));
  });

  test('linhas são arrays independentes', () => {
    const board = newBoard();
    board[0][0] = 'T';
    assert.equal(board[1][0], null);
  });
});

describe('collides', () => {
  const piece2x2 = { x: 0, y: 0, shape: [[1, 1], [1, 1]] };

  test('detecta colisão com parede esquerda', () => {
    assert.equal(collides(newBoard(), piece2x2, -1, 0), true);
  });

  test('detecta colisão com parede direita', () => {
    const p = { x: COLS - 2, y: 0, shape: [[1, 1], [1, 1]] };
    assert.equal(collides(newBoard(), p, 1, 0), true);
  });

  test('detecta colisão com chão', () => {
    const p = { x: 0, y: ROWS - 2, shape: [[1, 1], [1, 1]] };
    assert.equal(collides(newBoard(), p, 0, 1), true);
  });

  test('detecta colisão com bloco travado', () => {
    const board = newBoard();
    board[1][0] = 'T';
    assert.equal(collides(board, piece2x2, 0, 0), true);
  });

  test('peça acima do topo (y < 0) não colide com bloco existente abaixo', () => {
    const board = newBoard();
    board[0][0] = 'T';
    const p = { x: 0, y: -2, shape: [[1, 1], [1, 1]] };
    assert.equal(collides(board, p, 0, 0), false);
  });

  test('sem colisão em área vazia', () => {
    const p = { x: 3, y: 5, shape: [[1, 1], [1, 1]] };
    assert.equal(collides(newBoard(), p), false);
  });

  test('shape custom como argumento é considerado em vez de piece.shape', () => {
    const p = { x: 0, y: 0, shape: [[1]] };
    const altShape = [[1, 1], [1, 1]];
    assert.equal(collides(newBoard(), p, -1, 0, altShape), true);
  });
});

describe('merge', () => {
  test('escreve tipo da peça nas células ocupadas', () => {
    const board = newBoard();
    const piece = { type: 'T', x: 0, y: 0, shape: [[1, 1], [1, 1]] };
    merge(board, piece);
    assert.equal(board[0][0], 'T');
    assert.equal(board[0][1], 'T');
    assert.equal(board[1][0], 'T');
    assert.equal(board[1][1], 'T');
  });

  test('ignora células com y < 0 (acima do topo)', () => {
    const board = newBoard();
    const piece = { type: 'T', x: 0, y: -1, shape: [[1, 1], [1, 1]] };
    merge(board, piece);
    assert.equal(board[0][0], 'T');
    assert.equal(board[0][1], 'T');
  });

  test('não escreve em células com shape=0', () => {
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
  test('limpa 1 linha completa e retorna 1', () => {
    const board = newBoard();
    for (let c = 0; c < COLS; c++) board[ROWS - 1][c] = 'T';
    assert.equal(clearLines(board), 1);
    assert.ok(board[ROWS - 1].every(c => c === null));
  });

  test('limpa 4 linhas (tetris) e retorna 4', () => {
    const board = newBoard();
    for (let r = ROWS - 4; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) board[r][c] = 'I';
    }
    assert.equal(clearLines(board), 4);
    assert.ok(board.flat().every(c => c === null));
  });

  test('mantém linhas incompletas e empurra para baixo', () => {
    const board = newBoard();
    board[ROWS - 2][0] = 'T';
    for (let c = 0; c < COLS; c++) board[ROWS - 1][c] = 'I';
    assert.equal(clearLines(board), 1);
    assert.equal(board[ROWS - 1][0], 'T');
    assert.equal(board[ROWS - 2][0], null);
  });

  test('retorna 0 se nenhuma linha está completa', () => {
    assert.equal(clearLines(newBoard()), 0);
  });
});

describe('computeGhostY', () => {
  test('retorna distância até o chão em tabuleiro vazio', () => {
    const piece = { x: 0, y: 0, shape: [[1]] };
    assert.equal(computeGhostY(newBoard(), piece), ROWS - 1);
  });

  test('para no topo de bloco existente', () => {
    const board = newBoard();
    board[ROWS - 1][0] = 'T';
    const piece = { x: 0, y: 0, shape: [[1]] };
    assert.equal(computeGhostY(board, piece), ROWS - 2);
  });

  test('retorna 0 quando peça já está apoiada', () => {
    const board = newBoard();
    const piece = { x: 0, y: ROWS - 1, shape: [[1]] };
    assert.equal(computeGhostY(board, piece), 0);
  });
});
