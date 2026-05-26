import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createBurst, stepParticles } from '../js/particles.js';

const seq = (...values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('createBurst', () => {
  test('emits exactly count particles at the origin', () => {
    const burst = createBurst(50, 80, '#f00', 12, { rand: () => 0.5 });
    assert.equal(burst.length, 12);
    for (const p of burst) {
      assert.equal(p.x, 50);
      assert.equal(p.y, 80);
      assert.equal(p.color, '#f00');
    }
  });

  test('count = 0 returns an empty array', () => {
    assert.deepEqual(createBurst(0, 0, '#fff', 0), []);
  });

  test('initial life matches maxLife (alpha starts at 1)', () => {
    const burst = createBurst(0, 0, '#0f0', 5, { rand: () => 0.3 });
    for (const p of burst) assert.equal(p.life, p.maxLife);
  });

  test('upwardBias subtracts from vy (initial upward kick)', () => {
    const burst = createBurst(0, 0, '#fff', 4, {
      rand: seq(0, 0),
      minSpeed: 100, maxSpeed: 100,
      upwardBias: 50,
    });
    for (const p of burst) {
      assert.equal(p.vy, Math.sin(0) * 100 - 50);
    }
  });

  test('respects size/speed/life ranges', () => {
    const burst = createBurst(0, 0, '#fff', 50, {
      minSpeed: 10, maxSpeed: 20,
      minLife: 0.1, maxLife: 0.2,
      minSize: 1, maxSize: 3,
    });
    for (const p of burst) {
      const speed = Math.hypot(p.vx, p.vy + 80);
      assert.ok(speed >= 10 - 1e-9 && speed <= 20 + 1e-9, `speed out of range: ${speed}`);
      assert.ok(p.life >= 0.1 && p.life <= 0.2);
      assert.ok(p.size >= 1 && p.size <= 3);
    }
  });
});

describe('stepParticles', () => {
  test('advances position by velocity × dt', () => {
    const particles = [{ x: 0, y: 0, vx: 100, vy: 0, life: 1, maxLife: 1, size: 2, color: '#fff' }];
    const next = stepParticles(particles, 0.5, 0);
    assert.equal(next.length, 1);
    assert.equal(next[0].x, 50);
    assert.equal(next[0].y, 0);
  });

  test('applies gravity by adding to vy', () => {
    const particles = [{ x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1, size: 2, color: '#fff' }];
    const next = stepParticles(particles, 0.5, 100);
    assert.equal(next[0].vy, 50);
  });

  test('decrements life and removes dead particles', () => {
    const particles = [
      { x: 0, y: 0, vx: 0, vy: 0, life: 0.3, maxLife: 1, size: 2, color: '#fff' },
      { x: 0, y: 0, vx: 0, vy: 0, life: 0.05, maxLife: 1, size: 2, color: '#fff' },
    ];
    const next = stepParticles(particles, 0.1, 0);
    assert.equal(next.length, 1);
    assert.equal(next[0].life.toFixed(2), '0.20');
  });

  test('does not mutate the input array', () => {
    const particles = [{ x: 10, y: 10, vx: 5, vy: 5, life: 1, maxLife: 1, size: 2, color: '#fff' }];
    const snapshot = JSON.stringify(particles);
    stepParticles(particles, 0.5, 100);
    assert.equal(JSON.stringify(particles), snapshot);
  });

  test('empty list returns an empty list', () => {
    assert.deepEqual(stepParticles([], 0.016), []);
  });
});
