import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { lineScore, levelFromScore, dropIntervalForLevel } from '../js/scoring.js';

describe('lineScore', () => {
  test('aplica tabela [0,100,300,500,800] × level', () => {
    assert.equal(lineScore(1, 1), 100);
    assert.equal(lineScore(2, 1), 300);
    assert.equal(lineScore(3, 1), 500);
    assert.equal(lineScore(4, 1), 800);
  });

  test('escala com level', () => {
    assert.equal(lineScore(4, 5), 4000);
    assert.equal(lineScore(1, 8), 800);
    assert.equal(lineScore(2, 3), 900);
  });

  test('retorna 0 sem linhas', () => {
    assert.equal(lineScore(0, 1), 0);
    assert.equal(lineScore(0, 8), 0);
  });
});

describe('levelFromScore', () => {
  test('começa em 1 abaixo do primeiro threshold', () => {
    assert.equal(levelFromScore(0), 1);
    assert.equal(levelFromScore(250), 1);
    assert.equal(levelFromScore(499), 1);
  });

  test('cruza cada threshold progressivo', () => {
    assert.equal(levelFromScore(500), 2);
    assert.equal(levelFromScore(1499), 2);
    assert.equal(levelFromScore(1500), 3);
    assert.equal(levelFromScore(2999), 3);
    assert.equal(levelFromScore(3000), 4);
    assert.equal(levelFromScore(4999), 4);
    assert.equal(levelFromScore(5000), 5);
    assert.equal(levelFromScore(7999), 5);
    assert.equal(levelFromScore(8000), 6);
    assert.equal(levelFromScore(11999), 6);
    assert.equal(levelFromScore(12000), 7);
    assert.equal(levelFromScore(17999), 7);
    assert.equal(levelFromScore(18000), 8);
  });

  test('trava no nível 8 acima do último threshold', () => {
    assert.equal(levelFromScore(20000), 8);
    assert.equal(levelFromScore(999999), 8);
  });
});

describe('dropIntervalForLevel', () => {
  test('retorna o valor exato da tabela para cada nível 1..8', () => {
    assert.equal(dropIntervalForLevel(1), 1000);
    assert.equal(dropIntervalForLevel(2), 850);
    assert.equal(dropIntervalForLevel(3), 720);
    assert.equal(dropIntervalForLevel(4), 600);
    assert.equal(dropIntervalForLevel(5), 480);
    assert.equal(dropIntervalForLevel(6), 370);
    assert.equal(dropIntervalForLevel(7), 260);
    assert.equal(dropIntervalForLevel(8), 150);
  });

  test('trava no valor do nível 8 para níveis acima do cap', () => {
    assert.equal(dropIntervalForLevel(9), 150);
    assert.equal(dropIntervalForLevel(99), 150);
  });
});
