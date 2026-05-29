import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { shuffleBag, newBag, nextType } from '../js/bag.js';
import { SHAPES } from '../js/constants.js';

const ALL_TYPES = Object.keys(SHAPES);

// Deterministic rng cycling through a fixed list of [0,1) values.
function seqRng(values) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('shuffleBag', () => {
  test('does not mutate its input', () => {
    const input = ALL_TYPES.slice();
    const snapshot = JSON.stringify(input);
    shuffleBag(input, seqRng([0.1, 0.9, 0.3, 0.7, 0.5, 0.2]));
    assert.equal(JSON.stringify(input), snapshot);
  });

  test('preserves the multiset of elements', () => {
    const out = shuffleBag(ALL_TYPES, seqRng([0.9, 0.1, 0.5, 0.3, 0.7, 0.2]));
    assert.deepEqual([...out].sort(), [...ALL_TYPES].sort());
  });
});

describe('newBag', () => {
  test('returns a permutation of exactly the 7 SHAPES keys, each once', () => {
    const bag = newBag(seqRng([0.4, 0.8, 0.1, 0.6, 0.2, 0.9]));
    assert.equal(bag.length, 7);
    assert.deepEqual([...bag].sort(), [...ALL_TYPES].sort());
  });

  test('with rng=()=>0 produces a fixed, known order', () => {
    // Fisher-Yates from [I,O,T,S,Z,J,L]: each step swaps out[i] with out[0].
    assert.deepEqual(newBag(() => 0), ['O', 'T', 'S', 'Z', 'J', 'L', 'I']);
  });
});

describe('nextType', () => {
  test('returns the head as type and the tail as the remaining bag', () => {
    const { type, bag } = nextType(['T', 'O', 'I']);
    assert.equal(type, 'T');
    assert.deepEqual(bag, ['O', 'I']);
  });

  test('refills from a fresh bag when the bag is empty', () => {
    const { type, bag } = nextType([], () => 0);
    assert.ok(ALL_TYPES.includes(type));
    assert.equal(bag.length, 6);
  });

  test('refills when the bag is missing (undefined)', () => {
    const { type, bag } = nextType(undefined, () => 0);
    assert.ok(ALL_TYPES.includes(type));
    assert.equal(bag.length, 6);
  });

  test('7-bag guarantee: every window of 7 pulls yields each type exactly once', () => {
    const rng = seqRng([0.13, 0.71, 0.42, 0.88, 0.05, 0.6, 0.27, 0.95, 0.34, 0.51]);
    let bag = [];
    const pulled = [];
    for (let i = 0; i < 7; i++) {
      const r = nextType(bag, rng);
      pulled.push(r.type);
      bag = r.bag;
    }
    assert.deepEqual([...pulled].sort(), [...ALL_TYPES].sort());
  });

  test('14 pulls across the refill seam yield each type exactly twice', () => {
    const rng = seqRng([0.13, 0.71, 0.42, 0.88, 0.05, 0.6, 0.27, 0.95, 0.34, 0.51]);
    let bag = [];
    const counts = {};
    for (let i = 0; i < 14; i++) {
      const r = nextType(bag, rng);
      counts[r.type] = (counts[r.type] || 0) + 1;
      bag = r.bag;
    }
    for (const t of ALL_TYPES) assert.equal(counts[t], 2, `type ${t} should appear twice`);
  });
});
