import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTime } from '../js/time.js';

describe('formatTime', () => {
  test('formats zero as 0:00.00', () => {
    assert.equal(formatTime(0), '0:00.00');
  });

  test('formats sub-second values as centiseconds', () => {
    assert.equal(formatTime(500), '0:00.50');
    assert.equal(formatTime(90), '0:00.09');
  });

  test('truncates toward zero (does not round up centiseconds)', () => {
    assert.equal(formatTime(19), '0:00.01');
    assert.equal(formatTime(9), '0:00.00');
  });

  test('formats whole seconds with two-digit padding', () => {
    assert.equal(formatTime(1000), '0:01.00');
    assert.equal(formatTime(59000), '0:59.00');
  });

  test('rolls seconds into minutes', () => {
    assert.equal(formatTime(60000), '1:00.00');
    assert.equal(formatTime(73210), '1:13.21');
  });

  test('supports multi-digit minutes', () => {
    assert.equal(formatTime(600000), '10:00.00');
  });

  test('clamps invalid or negative input to zero', () => {
    assert.equal(formatTime(-100), '0:00.00');
    assert.equal(formatTime(NaN), '0:00.00');
  });
});
