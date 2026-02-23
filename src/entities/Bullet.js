export class Bullet {
  constructor(scene, x, y, speed, maxRange) {
    this.scene = scene;
    this.speed = speed;
    this.maxRange = maxRange;
    this.travelled = 0;
    this.active = true;
    this.sprite = scene.add.rectangle(x, y, 6, 14, 0xffffff);
  }

  update(dt) {
    if (!this.active) return;
    const distance = this.speed * dt;
    this.sprite.y -= distance;
    this.travelled += distance;

    if (this.sprite.y < -20 || this.travelled >= this.maxRange) {
      this.destroy();
    }
  }

  getBounds() {
    return this.sprite.getBounds();
  }

  destroy() {
    if (!this.active) return;
    this.active = false;
    this.sprite.destroy();
  }
}
