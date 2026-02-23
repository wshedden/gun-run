import Phaser from 'phaser';
import { STARTING_STATS, STAT_CLAMPS } from '../data/gateDeltas';

export class StatSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.stats = { ...STARTING_STATS };
  }

  get(statType) {
    return this.stats[statType];
  }

  all() {
    return { ...this.stats };
  }

  applyDelta(statType, delta) {
    const clamp = STAT_CLAMPS[statType];
    this.stats[statType] = Phaser.Math.Clamp(this.stats[statType] + delta, clamp.min, clamp.max);
    return this.stats[statType];
  }
}
