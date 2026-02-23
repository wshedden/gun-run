const STAT_CLAMPS = {
  fireRate: { min: 1 },
  power: { min: 1 },
  range: { min: 150 }
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
    const clamp = STAT_CLAMPS[statType];
    const next = this.stats[statType] + delta;
    this.stats[statType] = Math.max(clamp.min, next);
    return this.stats[statType];
  }

  get(statType) {
    return this.stats[statType];
  }
}
