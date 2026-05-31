import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { computeLayout, scaleToFit } from '../js/resize.js';
import { COLS, ROWS } from '../js/constants.js';

describe('computeLayout', () => {
  test('standard desktop viewport (1920×1080) returns a reasonable cell', () => {
    const { cell, panelWidth, previewSize, previewCell } = computeLayout(1920, 1080);
    assert.ok(cell > 30, `expected cell > 30, got ${cell}`);
    assert.ok(panelWidth >= 140 && panelWidth <= 200);
    assert.ok(previewSize >= 60 && previewSize <= 120);
    assert.ok(previewCell > 0);
  });

  test('small mobile viewport (375×667) guarantees cell >= 10', () => {
    const { cell } = computeLayout(375, 667);
    assert.ok(cell >= 10, `expected cell >= 10, got ${cell}`);
  });

  test('cell never exceeds what fits on screen', () => {
    const { cell } = computeLayout(1000, 600);
    assert.ok(cell * ROWS <= 600);
    assert.ok(cell * COLS <= 1000);
  });

  test('ultrawide (3440×1440) treats height as the limiting dimension', () => {
    const { cell } = computeLayout(3440, 1440);
    assert.ok(cell * ROWS <= 1440);
  });

  test('panelWidth respects the 140-200 clamp', () => {
    assert.equal(computeLayout(500, 800).panelWidth, 140);
    assert.equal(computeLayout(3000, 1080).panelWidth, 200);
  });

  test('previewCell always fits inside previewSize', () => {
    for (const [vw, vh] of [[800, 600], [1280, 720], [1920, 1080], [3000, 1500]]) {
      const { previewSize, previewCell } = computeLayout(vw, vh);
      assert.ok(previewCell * 5 <= previewSize + 5);
    }
  });

  test('previewSize shrinks on a short viewport', () => {
    const short = computeLayout(1280, 500).previewSize;
    const tall = computeLayout(1280, 1080).previewSize;
    assert.ok(short < tall, `expected ${short} < ${tall}`);
  });

  test('previewSize keeps the 60px floor even on a very short viewport', () => {
    assert.ok(computeLayout(1280, 300).previewSize >= 60);
  });

  test('previewSize keeps the 120px ceiling on a tall viewport', () => {
    assert.ok(computeLayout(1280, 2000).previewSize <= 120);
  });
});

describe('scaleToFit', () => {
  test('returns 1 when the content already fits', () => {
    assert.equal(scaleToFit(400, 600), 1);
  });

  test('never exceeds 1', () => {
    assert.equal(scaleToFit(100, 9999), 1);
  });

  test('shrinks proportionally when the content is too tall', () => {
    assert.equal(scaleToFit(800, 400), 0.5);
    assert.ok(Math.abs(scaleToFit(1000, 250) - 0.25) < 1e-9);
  });

  test('treats a zero or negative natural height as 1 (no division by zero)', () => {
    assert.equal(scaleToFit(0, 500), 1);
    assert.equal(scaleToFit(-10, 500), 1);
  });
});
