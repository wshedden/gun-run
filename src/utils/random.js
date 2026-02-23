export class SeededRandom {
  constructor(seed = 1) {
    this.seed = seed >>> 0;
  }

  next() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  pick(array) {
    return array[Math.floor(this.next() * array.length)];
  }

  bool(chance = 0.5) {
    return this.next() < chance;
  }
}
