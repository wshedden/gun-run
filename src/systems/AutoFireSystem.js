import { Bullet } from '../entities/Bullet';

export class AutoFireSystem {
  constructor(scene, player, statSystem) {
    this.scene = scene;
    this.player = player;
    this.statSystem = statSystem;
    this.cooldownMs = 1000 / this.statSystem.get('fireRate');
    this.accumulator = 0;
  }

  refreshFromStats() {
    this.cooldownMs = 1000 / this.statSystem.get('fireRate');
  }

  update(dtMs, bullets) {
    this.accumulator += dtMs;

    while (this.accumulator >= this.cooldownMs) {
      this.accumulator -= this.cooldownMs;
      if (bullets.length > 180) break;
      const bullet = new Bullet(this.scene, this.player.x, this.player.y - 36, 680, this.statSystem.get('range'));
      bullets.push(bullet);
      this.player.muzzleFlash();
    }
  }
}
