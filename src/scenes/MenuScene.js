import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/config';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x101429, 1);
    this.add.text(GAME_WIDTH / 2, 250, 'GUN RUN MVP', {
      fontFamily: 'Arial Black',
      fontSize: '46px',
      color: '#e9f0ff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 340, 'Drag / A-D to move\nAuto-fire is always on', {
      align: 'center',
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#b9c7f0',
    }).setOrigin(0.5);

    const btn = this.add.rectangle(GAME_WIDTH / 2, 520, 240, 72, 0x3aa4ff, 1).setStrokeStyle(3, 0xffffff, 0.9).setInteractive({ useHandCursor: true });
    this.add.text(btn.x, btn.y, 'START', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#00304f',
      strokeThickness: 4,
    }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });
  }
}
