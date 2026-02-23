import Phaser from 'phaser';

export class Bullet extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y) {
    super(scene, x, y, 6, 18, 0x9ce0ff);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setSize(6, 18);
    this.speed = 620;
    this.damage = 1;
    this.maxDistance = 420;
    this.startY = y;
    this.setVisible(false);
    this.setActive(false);
  }

  fire(x, y, damage, range) {
    this.setPosition(x, y);
    this.damage = damage;
    this.maxDistance = range;
    this.startY = y;
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.body.setVelocity(0, -this.speed);
  }

  preUpdate() {
    if (!this.active) return;
    if (this.startY - this.y > this.maxDistance || this.y < -40) {
      this.deactivate();
    }
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.body.stop();
    this.body.enable = false;
  }
}
