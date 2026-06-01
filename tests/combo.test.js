import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceCombo, comboBonus, comboParticleCount, comboToneFreq,
} from '../js/combo.js';
import {
  COMBO_BONUS_PER_LEVEL, COMBO_PARTICLE_MAX, COMBO_TONE_BASE,
} from '../js/constants.js';

describe('advanceCombo', () => {
  test('increments while lines keep clearing', () => {
    assert.equal(advanceCombo(0, 1), 1);
    assert.equal(advanceCombo(1, 2), 2);
    assert.equal(advanceCombo(2, 4), 3);
  });

  test('resets to 0 when a lock clears nothing', () => {
    assert.equal(advanceCombo(3, 0), 0);
    assert.equal(advanceCombo(0, 0), 0);
  });

  test('a full chain builds then breaks', () => {
    let c = 0;
    c = advanceCombo(c, 1); // 1
    c = advanceCombo(c, 1); // 2
    c = advanceCombo(c, 1); // 3
    assert.equal(c, 3);
    c = advanceCombo(c, 0); // broken
    assert.equal(c, 0);
  });
});

describe('comboBonus', () => {
  test('is 0 below the display threshold (combo 0 and 1)', () => {
    assert.equal(comboBonus(0, 1), 0);
    assert.equal(comboBonus(1, 8), 0);
  });

  test('pays 50 × (combo-1) × level from combo 2 up', () => {
    assert.equal(comboBonus(2, 1), COMBO_BONUS_PER_LEVEL * 1 * 1); // 50
    assert.equal(comboBonus(3, 1), COMBO_BONUS_PER_LEVEL * 2 * 1); // 100
    assert.equal(comboBonus(4, 1), COMBO_BONUS_PER_LEVEL * 3 * 1); // 150
  });

  test('scales with level', () => {
    assert.equal(comboBonus(2, 5), 50 * 5);   // 250
    assert.equal(comboBonus(3, 8), 100 * 8);  // 800
  });
});

describe('comboParticleCount', () => {
  test('returns the base count below the combo threshold', () => {
    assert.equal(comboParticleCount(10, 0), 10);
    assert.equal(comboParticleCount(10, 1), 10);
  });

  test('boosts the count from combo 2 up', () => {
    assert.equal(comboParticleCount(10, 2), 15); // round(10 * 1.5)
    assert.equal(comboParticleCount(10, 3), 20); // round(10 * 2.0)
  });

  test('grows monotonically with the combo', () => {
    assert.ok(comboParticleCount(10, 3) > comboParticleCount(10, 2));
    assert.ok(comboParticleCount(10, 4) > comboParticleCount(10, 3));
  });

  test('is capped at COMBO_PARTICLE_MAX', () => {
    assert.equal(comboParticleCount(16, 99), COMBO_PARTICLE_MAX);
  });
});

describe('comboToneFreq', () => {
  test('starts at the base frequency on the first counted combo', () => {
    assert.equal(comboToneFreq(2), COMBO_TONE_BASE);
  });

  test('rises with each link of the chain', () => {
    assert.ok(comboToneFreq(3) > comboToneFreq(2));
    assert.ok(comboToneFreq(4) > comboToneFreq(3));
  });

  test('saturates at the step cap', () => {
    assert.equal(comboToneFreq(99), comboToneFreq(8));
    assert.ok(comboToneFreq(99) > COMBO_TONE_BASE);
  });
});
