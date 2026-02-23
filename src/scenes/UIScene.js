import Phaser from 'phaser';
import { formatCash } from '../utils/format.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    this.gameScene = this.scene.get('GameScene');
    this.createHud();
    this.bindEvents();
  }

  createHud() {
    const style = { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff', stroke: '#000', strokeThickness: 4 };
    this.cashText = this.add.text(16, 12, 'Cash: $0', style).setDepth(2000);
    this.statsText = this.add.text(16, 44, 'FR 4.0 | PW 1 | RG 420', { ...style, fontSize: '18px' }).setDepth(2000);

    this.add.rectangle(240, 84, 320, 16, 0x1a2030).setDepth(2000);
    this.progressFill = this.add.rectangle(80, 84, 0, 12, 0x54d0ff).setOrigin(0, 0.5).setDepth(2001);
    this.progressLabel = this.add.text(404, 70, '0%', { fontFamily: 'Arial', fontSize: '16px', color: '#cde7ff' }).setDepth(2002);

    this.resultsOverlay = this.add.container(0, 0).setDepth(4000).setVisible(false);
    const shade = this.add.rectangle(240, 400, 480, 800, 0x000000, 0.72);
    const panel = this.add.rectangle(240, 400, 360, 300, 0x141d30).setStrokeStyle(3, 0x7bc0ff);
    this.resultsTitle = this.add.text(240, 290, 'RUN COMPLETE', { fontFamily: 'Arial Black', fontSize: '34px', color: '#ffffff' }).setOrigin(0.5);
    this.resultsText = this.add.text(240, 395, '', { fontFamily: 'Arial', fontSize: '24px', color: '#e7f6ff', align: 'center' }).setOrigin(0.5);
    this.playAgainBtn = this.add.rectangle(240, 500, 190, 52, 0x39a6ff).setInteractive({ useHandCursor: true });
    const btnText = this.add.text(240, 500, 'PLAY AGAIN', { fontFamily: 'Arial Black', fontSize: '23px', color: '#ffffff' }).setOrigin(0.5);
    this.resultsOverlay.add([shade, panel, this.resultsTitle, this.resultsText, this.playAgainBtn, btnText]);
  }

  bindEvents() {
    this.gameScene.events.on('hud:update', (payload) => {
      this.cashText.setText(`Cash: ${formatCash(payload.cash)}`);
      this.statsText.setText(`FR ${payload.stats.fireRate.toFixed(1)} | PW ${payload.stats.power} | RG ${payload.stats.range}`);
    });

    this.gameScene.events.on('progress:update', ({ progress }) => {
      const width = 320 * progress;
      this.progressFill.width = width;
      this.progressLabel.setText(`${Math.round(progress * 100)}%`);
    });

    this.gameScene.events.on('results:show', (payload) => {
      this.resultsText.setText([
        `Cash: ${formatCash(payload.cash)}`,
        `Fire Rate: ${payload.stats.fireRate.toFixed(1)}`,
        `Power: ${payload.stats.power}`,
        `Range: ${payload.stats.range}`
      ].join('\n'));
      this.resultsOverlay.setVisible(true);
    });

    this.gameScene.events.on('results:hide', () => this.resultsOverlay.setVisible(false));

    this.playAgainBtn.on('pointerdown', () => {
      this.gameScene.restartRun();
    });
  }
}
