import Phaser from 'phaser';

export class PlayerGun extends Phaser.GameObjects.Container {
  constructor(scene, x, y, bounds) {
    super(scene, x, y);
    this.scene = scene;
    this.bounds = bounds;
    this.targetX = x;

    this.base = scene.add.rectangle(0, 0, 50, 24, 0x5f7aa5).setStrokeStyle(2, 0xd6e4ff);
    this.barrel = scene.add.rectangle(0, -18, 10, 20, 0xa7bfe8);
    this.muzzle = scene.add.circle(0, -30, 5, 0xffdf80, 0.9).setVisible(false);
    this.add([this.base, this.barrel, this.muzzle]);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(50, 24);
    this.body.setImmovable(true);
    this.body.allowGravity = false;
  }

  setTargetX(x) {
    this.targetX = Phaser.Math.Clamp(x, this.bounds.minX, this.bounds.maxX);
  }

  update() {
    this.x = Phaser.Math.Linear(this.x, this.targetX, 0.22);
  }

  flashMuzzle() {
    this.muzzle.setVisible(true);
    this.scene.time.delayedCall(35, () => this.muzzle.setVisible(false));
  }
}
