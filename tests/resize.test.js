import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { computeLayout } from '../js/resize.js';
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
});
