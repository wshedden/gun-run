import Phaser from 'phaser';

export class PlayerGun extends Phaser.GameObjects.Container {
  constructor(scene, x, y, bounds) {
    super(scene, x, y);
    this.bounds = bounds;
    this.targetX = x;

    const base = scene.add.rectangle(0, 0, 36, 32, 0x73d2de).setStrokeStyle(2, 0xffffff, 0.8);
    const barrel = scene.add.rectangle(0, -20, 10, 20, 0xbaf4ff);
    this.flash = scene.add.circle(0, -32, 7, 0xfff3a0, 0);

    this.add([base, barrel, this.flash]);
    scene.add.existing(this);
  }

  setTargetX(targetX) {
    this.targetX = Phaser.Math.Clamp(targetX, this.bounds.minX, this.bounds.maxX);
  }

  update(_time, delta) {
    this.x = Phaser.Math.Linear(this.x, this.targetX, 0.24 * (delta / 16.666));
    this.x = Phaser.Math.Clamp(this.x, this.bounds.minX, this.bounds.maxX);
    this.flash.setAlpha(Math.max(0, this.flash.alpha - delta * 0.006));
  }

  pulseMuzzleFlash() {
    this.flash.setAlpha(0.95);
  }

  muzzleWorldPosition() {
    return { x: this.x, y: this.y - 32 };
  }
}
