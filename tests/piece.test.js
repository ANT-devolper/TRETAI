import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { makePiece, rotate } from '../js/piece.js';
import { SHAPES } from '../js/constants.js';

describe('makePiece', () => {
  test('creates a piece with type, shape and zeroed position', () => {
    const p = makePiece('T');
    assert.equal(p.type, 'T');
    assert.deepEqual(p.shape, SHAPES.T);
    assert.equal(p.x, 0);
    assert.equal(p.y, 0);
  });

  test('clones the shape — mutating the piece does not affect SHAPES', () => {
    const p = makePiece('I');
    p.shape[0][0] = 99;
    assert.equal(SHAPES.I[0][0], 0);
  });
});

describe('rotate', () => {
  test('4 rotations return to the original matrix', () => {
    const shape = SHAPES.T.map(r => r.slice());
    let rotated = shape;
    for (let i = 0; i < 4; i++) rotated = rotate(rotated);
    assert.deepEqual(rotated, shape);
  });

  test('rotates 90° clockwise', () => {
    const shape = [[1, 0, 0], [1, 0, 0], [1, 0, 0]];
    const expected = [[1, 1, 1], [0, 0, 0], [0, 0, 0]];
    assert.deepEqual(rotate(shape), expected);
  });

  test('preserves square matrix dimensions', () => {
    const rotated = rotate(SHAPES.I);
    assert.equal(rotated.length, SHAPES.I.length);
    assert.equal(rotated[0].length, SHAPES.I[0].length);
  });

  test('does not mutate the original shape', () => {
    const shape = SHAPES.T.map(r => r.slice());
    const snapshot = JSON.stringify(shape);
    rotate(shape);
    assert.equal(JSON.stringify(shape), snapshot);
  });
});
