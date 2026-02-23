import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, '__bullet');
    this.damage = 1;
    this.distanceLeft = 420;
  }

  fire(x, y, speed, range, damage) {
    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.damage = damage;
    this.distanceLeft = range;
    this.setVelocity(0, -speed);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    const dy = Math.abs(this.body.velocity.y) * (delta / 1000);
    this.distanceLeft -= dy;
    if (this.distanceLeft <= 0 || this.y < -20) {
      this.disable();
    }
  }

  disable() {
    this.disableBody(true, true);
    this.setActive(false);
    this.setVisible(false);
  }
}
