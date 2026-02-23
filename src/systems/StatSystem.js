const STAT_MIN = {
  fireRate: 1,
  power: 1,
  range: 150
};

export class StatSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.stats = {
      fireRate: 4,
      power: 1,
      range: 420
    };
  }

  apply(statType, delta) {
    const next = this.stats[statType] + delta;
    this.stats[statType] = Math.max(STAT_MIN[statType], next);
    return this.stats[statType];
  }

  get(statType) {
    return this.stats[statType];
  }
}
