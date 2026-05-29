import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { lineScore, levelFromScore, dropIntervalForLevel } from '../js/scoring.js';

describe('lineScore', () => {
  test('applies the [0,100,300,500,800] × level table', () => {
    assert.equal(lineScore(1, 1), 100);
    assert.equal(lineScore(2, 1), 300);
    assert.equal(lineScore(3, 1), 500);
    assert.equal(lineScore(4, 1), 800);
  });

  test('scales with level', () => {
    assert.equal(lineScore(4, 5), 4000);
    assert.equal(lineScore(1, 8), 800);
    assert.equal(lineScore(2, 3), 900);
  });

  test('returns 0 when no lines are cleared', () => {
    assert.equal(lineScore(0, 1), 0);
    assert.equal(lineScore(0, 8), 0);
  });
});

describe('levelFromScore', () => {
  test('starts at 1 below the first threshold', () => {
    assert.equal(levelFromScore(0), 1);
    assert.equal(levelFromScore(750), 1);
    assert.equal(levelFromScore(1499), 1);
  });

  test('crosses each progressive threshold', () => {
    assert.equal(levelFromScore(1500), 2);
    assert.equal(levelFromScore(3999), 2);
    assert.equal(levelFromScore(4000), 3);
    assert.equal(levelFromScore(7999), 3);
    assert.equal(levelFromScore(8000), 4);
    assert.equal(levelFromScore(13999), 4);
    assert.equal(levelFromScore(14000), 5);
    assert.equal(levelFromScore(21999), 5);
    assert.equal(levelFromScore(22000), 6);
    assert.equal(levelFromScore(33999), 6);
    assert.equal(levelFromScore(34000), 7);
    assert.equal(levelFromScore(49999), 7);
    assert.equal(levelFromScore(50000), 8);
  });

  test('caps at level 8 above the last threshold', () => {
    assert.equal(levelFromScore(60000), 8);
    assert.equal(levelFromScore(999999), 8);
  });
});

describe('dropIntervalForLevel', () => {
  test('returns the exact table value for each level 1..8', () => {
    assert.equal(dropIntervalForLevel(1), 1000);
    assert.equal(dropIntervalForLevel(2), 850);
    assert.equal(dropIntervalForLevel(3), 720);
    assert.equal(dropIntervalForLevel(4), 600);
    assert.equal(dropIntervalForLevel(5), 480);
    assert.equal(dropIntervalForLevel(6), 370);
    assert.equal(dropIntervalForLevel(7), 260);
    assert.equal(dropIntervalForLevel(8), 150);
  });

  test('caps at the level 8 value for levels above the cap', () => {
    assert.equal(dropIntervalForLevel(9), 150);
    assert.equal(dropIntervalForLevel(99), 150);
  });
});
