import Phaser from 'phaser';

export class PlayerGun extends Phaser.GameObjects.Container {
  constructor(scene, x, y, bounds) {
    super(scene, x, y);
    this.scene = scene;
    this.bounds = bounds;
    this.targetX = x;

    const body = scene.add.rectangle(0, 0, 42, 62, 0x4a90ff).setStrokeStyle(2, 0xe8f4ff);
    const barrel = scene.add.rectangle(0, -34, 12, 26, 0xdff2ff);
    this.flash = scene.add.rectangle(0, -50, 14, 14, 0xfff8a8).setVisible(false);

    this.add([body, barrel, this.flash]);
    scene.add.existing(this);

    this.moveSmoothing = 0.25;
  }

  setTargetX(x) {
    this.targetX = Phaser.Math.Clamp(x, this.bounds.minX, this.bounds.maxX);
  }

  update() {
    this.x = Phaser.Math.Linear(this.x, this.targetX, this.moveSmoothing);
    this.x = Phaser.Math.Clamp(this.x, this.bounds.minX, this.bounds.maxX);
  }

  playMuzzleFlash() {
    this.flash.setVisible(true);
    this.scene.time.delayedCall(35, () => this.flash.setVisible(false));
  }

  getMuzzle() {
    return { x: this.x, y: this.y - 46 };
  }
}
