import { SHAPES } from './constants.js';

// Fisher-Yates shuffle, pure — returns a new array, does not mutate the input.
export function shuffleBag(types, rng = Math.random) {
  const out = types.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// A fresh, shuffled bag holding one of each of the 7 tetromino types.
export function newBag(rng = Math.random) {
  return shuffleBag(Object.keys(SHAPES), rng);
}

// Pull the next type from the bag, refilling from a new shuffled bag when empty.
// Returns { type, bag } where bag is the remaining queue for the caller to store.
export function nextType(bag, rng = Math.random) {
  const queue = bag && bag.length ? bag : newBag(rng);
  const [type, ...rest] = queue;
  return { type, bag: rest };
}
