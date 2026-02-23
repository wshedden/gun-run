import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 6, 14);
    g.generateTexture('__bullet', 6, 14);
    g.destroy();

    this.scene.start('MenuScene');
  }
}
