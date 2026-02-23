/**
 * Deterministic linear congruential generator for reproducible levels.
 */
export function makeRng(seed = 1337) {
  let state = seed >>> 0;
  return {
    next() {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 4294967296;
    },
    pick(arr) {
      return arr[Math.floor(this.next() * arr.length)];
    },
    range(min, max) {
      return min + this.next() * (max - min);
    },
  };
}
