import Phaser from 'phaser';
import { GAME_WIDTH } from '../game/config';
import { formatMoney } from '../utils/format';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    this.hud = {
      cash: this.add.text(20, 16, '$0', { fontFamily: 'Arial Black', fontSize: '24px', color: '#ffd465' }),
      fireRate: this.add.text(20, 48, 'FR: 4', { fontFamily: 'Arial', fontSize: '20px', color: '#e4edff' }),
      power: this.add.text(20, 72, 'PW: 1', { fontFamily: 'Arial', fontSize: '20px', color: '#e4edff' }),
      range: this.add.text(20, 96, 'RG: 420', { fontFamily: 'Arial', fontSize: '20px', color: '#e4edff' }),
      progress: this.add.rectangle(GAME_WIDTH / 2, 28, 300, 14, 0x1f2448, 1).setStrokeStyle(2, 0xffffff, 0.6),
      progressFill: this.add.rectangle(GAME_WIDTH / 2 - 150, 28, 0, 14, 0x6ce7ff, 1).setOrigin(0, 0.5),
    };

    this.resultsOverlay = this.add.container(0, 0).setVisible(false);
    const panel = this.add.rectangle(240, 400, 380, 420, 0x080a14, 0.95).setStrokeStyle(3, 0xffffff, 0.7);
    this.resultsText = this.add.text(240, 280, '', {
      align: 'center',
      fontFamily: 'Arial',
      fontSize: '27px',
      color: '#ffffff',
      lineSpacing: 10,
    }).setOrigin(0.5, 0);

    const replayBtn = this.add.rectangle(240, 620, 220, 64, 0x40d57e, 1).setStrokeStyle(3, 0xffffff, 0.8).setInteractive({ useHandCursor: true });
    const replayText = this.add.text(240, 620, 'PLAY AGAIN', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#083019',
      stroke: '#ffffff',
      strokeThickness: 3,
    }).setOrigin(0.5);

    replayBtn.on('pointerdown', () => {
      this.resultsOverlay.setVisible(false);
      this.scene.get('GameScene').events.emit('ui-restart-requested');
    });

    this.resultsOverlay.add([panel, this.resultsText, replayBtn, replayText]);

    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('hud-update', this.onHudUpdate, this);
    gameScene.events.on('show-results', this.showResults, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameScene.events.off('hud-update', this.onHudUpdate, this);
      gameScene.events.off('show-results', this.showResults, this);
    });
  }

  onHudUpdate(payload) {
    this.hud.cash.setText(formatMoney(payload.cash));
    this.hud.fireRate.setText(`FR: ${payload.stats.fireRate.toFixed(1)}`);
    this.hud.power.setText(`PW: ${payload.stats.power.toFixed(0)}`);
    this.hud.range.setText(`RG: ${payload.stats.range.toFixed(0)}`);
    this.hud.progressFill.width = 300 * payload.progress;
  }

  showResults({ cash, stats }) {
    this.resultsText.setText(
      `RUN COMPLETE\n\nCash: ${formatMoney(cash)}\nFire Rate: ${stats.fireRate.toFixed(1)}\nPower: ${stats.power.toFixed(0)}\nRange: ${stats.range.toFixed(0)}`,
    );
    this.resultsOverlay.setVisible(true);
  }
}
