export class AutoFireSystem {
  constructor(scene, createBullet) {
    this.scene = scene;
    this.createBullet = createBullet;
    this.elapsed = 0;
  }

  update(delta, fireRate) {
    const intervalMs = 1000 / fireRate;
    this.elapsed += delta;
    while (this.elapsed >= intervalMs) {
      this.elapsed -= intervalMs;
      this.createBullet();
    }
  }

  reset() {
    this.elapsed = 0;
  }
}
