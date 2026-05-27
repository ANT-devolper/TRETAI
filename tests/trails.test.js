import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDropTrail, stepTrails } from '../js/trails.js';
import { TRAIL_DURATION } from '../js/constants.js';

const oPiece = { type: 'O', x: 4, y: 0, shape: [[1, 1], [1, 1]] };
const tPiece = { type: 'T', x: 3, y: 0, shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] };

describe('createDropTrail', () => {
  test('returns an empty array when endY equals startY', () => {
    assert.deepEqual(createDropTrail(oPiece, 5, 5, 30, '#f0f000'), []);
  });

  test('returns an empty array when endY is less than startY', () => {
    assert.deepEqual(createDropTrail(oPiece, 5, 2, 30, '#f0f000'), []);
  });

  test('emits one rectangle per filled cell in the piece shape', () => {
    const trails = createDropTrail(oPiece, 0, 10, 30, '#f0f000');
    assert.equal(trails.length, 4);
    const tTrails = createDropTrail(tPiece, 0, 10, 30, '#a000f0');
    assert.equal(tTrails.length, 4);
  });

  test('positions each rectangle based on piece coordinates and cell size', () => {
    const trails = createDropTrail(oPiece, 2, 12, 30, '#f0f000');
    const xs = trails.map(t => t.x).sort((a, b) => a - b);
    const ys = trails.map(t => t.y).sort((a, b) => a - b);
    assert.deepEqual(xs, [120, 120, 150, 150]);
    assert.deepEqual(ys, [60, 60, 90, 90]);
  });

  test('rectangle height spans the dropped distance', () => {
    const trails = createDropTrail(oPiece, 0, 8, 25, '#f0f000');
    for (const t of trails) {
      assert.equal(t.width, 25);
      assert.equal(t.height, 8 * 25);
    }
  });

  test('initializes life and maxLife to TRAIL_DURATION', () => {
    const trails = createDropTrail(oPiece, 0, 5, 30, '#f0f000');
    for (const t of trails) {
      assert.equal(t.life, TRAIL_DURATION);
      assert.equal(t.maxLife, TRAIL_DURATION);
    }
  });

  test('uses the provided color on every rectangle', () => {
    const trails = createDropTrail(oPiece, 0, 5, 30, '#abcdef');
    for (const t of trails) assert.equal(t.color, '#abcdef');
  });
});

describe('stepTrails', () => {
  test('decrements life by dt', () => {
    const trails = [{ x: 0, y: 0, width: 10, height: 10, color: '#fff', life: 0.3, maxLife: 0.4 }];
    const next = stepTrails(trails, 0.1);
    assert.equal(next.length, 1);
    assert.ok(Math.abs(next[0].life - 0.2) < 1e-9);
    assert.equal(next[0].maxLife, 0.4);
  });

  test('removes trails whose life reached zero', () => {
    const trails = [
      { x: 0, y: 0, width: 10, height: 10, color: '#fff', life: 0.05, maxLife: 0.4 },
      { x: 0, y: 0, width: 10, height: 10, color: '#fff', life: 0.5, maxLife: 0.5 },
    ];
    const next = stepTrails(trails, 0.1);
    assert.equal(next.length, 1);
    assert.equal(next[0].maxLife, 0.5);
  });

  test('does not mutate the input array', () => {
    const trails = [{ x: 0, y: 0, width: 10, height: 10, color: '#fff', life: 0.3, maxLife: 0.4 }];
    const snapshot = JSON.stringify(trails);
    stepTrails(trails, 0.1);
    assert.equal(JSON.stringify(trails), snapshot);
  });

  test('empty list returns an empty list', () => {
    assert.deepEqual(stepTrails([], 0.016), []);
  });
});
