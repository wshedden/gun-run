import { Bullet } from '../entities/Bullet';

export class AutoFireSystem {
  constructor(scene, player, statSystem, bulletGroup) {
    this.scene = scene;
    this.player = player;
    this.statSystem = statSystem;
    this.bulletGroup = bulletGroup;
    this.fireAccumulator = 0;
    this.maxBullets = 400;
  }

  update(deltaMs) {
    const fireRate = this.statSystem.get('fireRate');
    const interval = 1000 / fireRate;
    this.fireAccumulator += deltaMs;

    while (this.fireAccumulator >= interval) {
      this.fireAccumulator -= interval;
      this.spawnBullet();
    }
  }

  spawnBullet() {
    if (this.bulletGroup.getLength() >= this.maxBullets) return;
    const bullet = new Bullet(this.scene, this.player.x, this.player.y - 24, this.statSystem.get('power'), this.statSystem.get('range'));
    this.bulletGroup.add(bullet);
    this.player.flashMuzzle();
  }
}
