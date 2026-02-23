import Phaser from 'phaser';

export class StatSystem extends Phaser.Events.EventEmitter {
  constructor() {
    super();
    this.baseStats = {
      fireRate: 4,
      power: 1,
      range: 420
    };

    this.min = { fireRate: 1, power: 1, range: 150 };
    this.max = { fireRate: 30, power: 50, range: 1200 };
    this.stats = { ...this.baseStats };
  }

  reset() {
    this.stats = { ...this.baseStats };
    this.emit('changed', this.getStats());
  }

  applyDelta(statType, delta) {
    const next = Phaser.Math.Clamp(this.stats[statType] + delta, this.min[statType], this.max[statType]);
    this.stats[statType] = Number(next.toFixed(statType === 'fireRate' ? 2 : 0));
    this.emit('changed', this.getStats());
  }

  get(statType) {
    return this.stats[statType];
  }

  getStats() {
    return { ...this.stats };
  }
}
