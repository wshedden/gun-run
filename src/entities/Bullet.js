import Phaser from 'phaser';

const SPEED = 620;

export class Bullet extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, power, range) {
    super(scene, x, y, 5, 18, 0x8be9fd);
    this.scene = scene;
    this.power = power;
    this.range = range;
    this.travel = 0;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setVelocityY(-SPEED);
    this.body.allowGravity = false;
  }

  preUpdate(_time, delta) {
    this.travel += (SPEED * delta) / 1000;
    if (this.travel >= this.range || this.y < -30) {
      this.destroy();
    }
  }
}
