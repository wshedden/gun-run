import Phaser from 'phaser';
import { levelMVP } from '../data/levelMVP';

const CLAMPS = {
  fireRate: [1, 30],
  power: [1, 50],
  range: [150, 1200]
};

export class StatSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.stats = { ...levelMVP.startStats };
  }

  apply(statType, delta) {
    const [min, max] = CLAMPS[statType];
    this.stats[statType] = Phaser.Math.Clamp(this.stats[statType] + delta, min, max);
    return this.stats[statType];
  }

  get(statType) {
    return this.stats[statType];
  }

  getAll() {
    return { ...this.stats };
  }
}
