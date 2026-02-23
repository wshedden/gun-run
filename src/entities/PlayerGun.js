import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/config';

export class PlayerGun {
  constructor(scene) {
    this.scene = scene;
    this.y = GAME_HEIGHT - 90;
    this.playMinX = 60;
    this.playMaxX = GAME_WIDTH - 60;
    this.x = GAME_WIDTH / 2;
    this.targetX = this.x;

    this.body = scene.add.rectangle(this.x, this.y, 44, 26, 0x6ec1ff).setStrokeStyle(2, 0xffffff);
    this.barrel = scene.add.rectangle(this.x, this.y - 18, 10, 24, 0xa4ddff).setStrokeStyle(1, 0xffffff);
    this.flash = scene.add.circle(this.x, this.y - 32, 4, 0xfff7a6).setAlpha(0);
  }

  setTargetX(x) {
    this.targetX = Phaser.Math.Clamp(x, this.playMinX, this.playMaxX);
  }

  update(dt) {
    this.x = Phaser.Math.Linear(this.x, this.targetX, Math.min(1, dt * 10));
    this.body.setX(this.x);
    this.barrel.setX(this.x);
    this.flash.setX(this.x);
    this.flash.setAlpha(Math.max(0, this.flash.alpha - dt * 8));
  }

  muzzleFlash() {
    this.flash.setAlpha(1);
  }

  destroy() {
    this.body.destroy();
    this.barrel.destroy();
    this.flash.destroy();
  }
}
