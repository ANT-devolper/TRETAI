import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { makePiece, randomPiece, rotate } from '../js/piece.js';
import { SHAPES, COLS } from '../js/constants.js';

describe('makePiece', () => {
  test('cria peça com tipo, shape e posição zerada', () => {
    const p = makePiece('T');
    assert.equal(p.type, 'T');
    assert.deepEqual(p.shape, SHAPES.T);
    assert.equal(p.x, 0);
    assert.equal(p.y, 0);
  });

  test('clona a shape — mutação da peça não afeta SHAPES', () => {
    const p = makePiece('I');
    p.shape[0][0] = 99;
    assert.equal(SHAPES.I[0][0], 0);
  });
});

describe('randomPiece', () => {
  test('centraliza a peça horizontalmente', () => {
    const original = Math.random;
    Math.random = () => 0;
    const p = randomPiece();
    Math.random = original;
    assert.equal(p.x, Math.floor((COLS - p.shape[0].length) / 2));
  });

  test('gera apenas tipos válidos', () => {
    const types = new Set(Object.keys(SHAPES));
    for (let i = 0; i < 50; i++) {
      assert.ok(types.has(randomPiece().type));
    }
  });

  test('cada chamada retorna instância independente', () => {
    const original = Math.random;
    Math.random = () => 0;
    const a = randomPiece();
    const b = randomPiece();
    Math.random = original;
    a.shape[0][0] = 42;
    assert.notEqual(b.shape[0][0], 42);
  });
});

describe('rotate', () => {
  test('4 rotações retornam à matriz original', () => {
    const shape = SHAPES.T.map(r => r.slice());
    let rotated = shape;
    for (let i = 0; i < 4; i++) rotated = rotate(rotated);
    assert.deepEqual(rotated, shape);
  });

  test('rotação 90° no sentido horário', () => {
    const shape = [[1, 0, 0], [1, 0, 0], [1, 0, 0]];
    const expected = [[1, 1, 1], [0, 0, 0], [0, 0, 0]];
    assert.deepEqual(rotate(shape), expected);
  });

  test('preserva dimensão da matriz quadrada', () => {
    const rotated = rotate(SHAPES.I);
    assert.equal(rotated.length, SHAPES.I.length);
    assert.equal(rotated[0].length, SHAPES.I[0].length);
  });

  test('não muta shape original', () => {
    const shape = SHAPES.T.map(r => r.slice());
    const snapshot = JSON.stringify(shape);
    rotate(shape);
    assert.equal(JSON.stringify(shape), snapshot);
  });
});
