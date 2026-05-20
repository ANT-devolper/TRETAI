import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { lineScore, levelFromLines, dropIntervalForLevel } from '../js/scoring.js';

describe('lineScore', () => {
  test('aplica tabela [0,100,300,500,800] × level', () => {
    assert.equal(lineScore(1, 1), 100);
    assert.equal(lineScore(2, 1), 300);
    assert.equal(lineScore(3, 1), 500);
    assert.equal(lineScore(4, 1), 800);
  });

  test('escala com level', () => {
    assert.equal(lineScore(4, 5), 4000);
    assert.equal(lineScore(1, 10), 1000);
    assert.equal(lineScore(2, 3), 900);
  });

  test('retorna 0 sem linhas', () => {
    assert.equal(lineScore(0, 1), 0);
    assert.equal(lineScore(0, 99), 0);
  });
});

describe('levelFromLines', () => {
  test('começa em 1 e permanece até 9 linhas', () => {
    assert.equal(levelFromLines(0), 1);
    assert.equal(levelFromLines(5), 1);
    assert.equal(levelFromLines(9), 1);
  });

  test('sobe a cada 10 linhas', () => {
    assert.equal(levelFromLines(10), 2);
    assert.equal(levelFromLines(19), 2);
    assert.equal(levelFromLines(20), 3);
  });

  test('escala alta sem limite', () => {
    assert.equal(levelFromLines(99), 10);
    assert.equal(levelFromLines(100), 11);
    assert.equal(levelFromLines(1000), 101);
  });
});

describe('dropIntervalForLevel', () => {
  test('começa em 1000ms no level 1', () => {
    assert.equal(dropIntervalForLevel(1), 1000);
  });

  test('decresce 80ms por level', () => {
    assert.equal(dropIntervalForLevel(2), 920);
    assert.equal(dropIntervalForLevel(5), 680);
    assert.equal(dropIntervalForLevel(10), 280);
  });

  test('clamp em 80ms para níveis altos', () => {
    assert.equal(dropIntervalForLevel(12), 120);
    assert.equal(dropIntervalForLevel(13), 80);
    assert.equal(dropIntervalForLevel(99), 80);
  });
});
