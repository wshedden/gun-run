import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/config';
import { levelMVP } from '../data/levelMVP';
import { PlayerGun } from '../entities/PlayerGun';
import { GatePair } from '../entities/GatePair';
import { MoneyBlock } from '../entities/MoneyBlock';
import { AutoFireSystem } from '../systems/AutoFireSystem';
import { StatSystem } from '../systems/StatSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { buildLevel } from '../systems/LevelBuilder';
import { formatStat } from '../utils/format';

const STATE = {
  MENU: 'MENU',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  RESULTS: 'RESULTS'
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.drawTrack();
    this.setupInput();
    this.setupUi();
    this.resetRun();
  }

  resetRun() {
    this.cleanupRun();
    this.runState = STATE.MENU;
    this.cash = 0;
    this.scrollOffset = 0;

    this.statSystem = new StatSystem();
    this.player = new PlayerGun(this);
    this.autoFire = new AutoFireSystem(this, this.player, this.statSystem);

    this.level = buildLevel();
    this.gatePairs = this.level.gateRows.map((row) => new GatePair(this, row));
    this.moneyBlocks = this.level.moneyBlocks.map((block) => new MoneyBlock(this, {
      ...block,
      reward: block.hp * block.rewardMultiplier
    }));
    this.bullets = [];

    this.endLine = this.add.rectangle(GAME_WIDTH / 2, this.level.endLineY, GAME_WIDTH - 20, 8, 0xffffff, 0.6);
    this.endLineLabel = this.add.text(GAME_WIDTH / 2, this.level.endLineY - 18, 'FINISH', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);

    this.resultsContainer.setVisible(false);
    this.startButton.setVisible(true);
    this.startText.setVisible(true);
    this.refreshHud();
  }

  cleanupRun() {
    this.player?.destroy();
    this.gatePairs?.forEach((pair) => pair.destroy());
    this.moneyBlocks?.forEach((block) => block.container?.destroy());
    this.bullets?.forEach((bullet) => bullet.destroy());
    this.endLine?.destroy();
    this.endLineLabel?.destroy();
  }

  setupInput() {
    this.keys = this.input.keyboard.addKeys('A,D,LEFT,RIGHT,P');
    this.input.on('pointerdown', (pointer) => {
      this.dragging = true;
      this.player?.setTargetX(pointer.x);
    });
    this.input.on('pointermove', (pointer) => {
      if (this.dragging) this.player?.setTargetX(pointer.x);
    });
    this.input.on('pointerup', () => { this.dragging = false; });

    this.input.keyboard.on('keydown-P', () => {
      if (this.runState === STATE.RUNNING) this.runState = STATE.PAUSED;
      else if (this.runState === STATE.PAUSED) this.runState = STATE.RUNNING;
    });
  }

  setupUi() {
    this.hud = this.add.text(16, 12, '', { fontSize: '18px', color: '#ffffff', stroke: '#000', strokeThickness: 3 });
    this.progressBox = this.add.rectangle(240, 84, 320, 18, 0x233142).setStrokeStyle(2, 0xffffff);
    this.progressFill = this.add.rectangle(82, 84, 0, 12, 0x7de2ff).setOrigin(0, 0.5);

    this.startButton = this.add.rectangle(240, 420, 220, 70, 0x2f7f50).setInteractive();
    this.startText = this.add.text(240, 420, 'START RUN', { fontSize: '30px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    this.startButton.on('pointerdown', () => {
      this.runState = STATE.RUNNING;
      this.startButton.setVisible(false);
      this.startText.setVisible(false);
    });

    this.resultsContainer = this.add.container(240, 400).setVisible(false);
    const panel = this.add.rectangle(0, 0, 360, 300, 0x101a2c, 0.95).setStrokeStyle(3, 0xffffff);
    this.resultsText = this.add.text(0, -40, '', { fontSize: '24px', color: '#fff', align: 'center' }).setOrigin(0.5);
    const playAgain = this.add.rectangle(0, 100, 180, 54, 0x2f7f50).setInteractive();
    const playText = this.add.text(0, 100, 'Play Again', { fontSize: '26px', color: '#fff' }).setOrigin(0.5);
    playAgain.on('pointerdown', () => this.resetRun());
    this.resultsContainer.add([panel, this.resultsText, playAgain, playText]);
  }

  drawTrack() {
    this.add.rectangle(240, 400, 390, 800, 0x10172a, 1).setStrokeStyle(3, 0x384665);
    for (let i = 0; i < 26; i += 1) {
      this.add.rectangle(240, i * 34, 2, 16, 0x4a5f8b, 0.3);
    }
    this.add.rectangle(60, 400, 2, 800, 0x8aa4d6);
    this.add.rectangle(420, 400, 2, 800, 0x8aa4d6);
  }

  addFloatingText(x, y, text, color = '#ffffff') {
    const t = this.add.text(x, y, text, { fontSize: '22px', color, fontStyle: 'bold', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: y - 30, alpha: 0, duration: 550, onComplete: () => t.destroy() });
  }

  update(_time, deltaMs) {
    const dt = deltaMs / 1000;
    if (!this.player) return;

    if (this.keys.A.isDown || this.keys.LEFT.isDown) this.player.setTargetX(this.player.targetX - 260 * dt);
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) this.player.setTargetX(this.player.targetX + 260 * dt);
    this.player.update(dt);

    if (this.runState !== STATE.RUNNING) return;

    this.scrollOffset += levelMVP.scrollSpeed * dt;

    this.autoFire.update(deltaMs, this.bullets);
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(dt);
      return bullet.active;
    });

    this.gatePairs = this.gatePairs.filter((pair) => {
      pair.update(this.scrollOffset);

      for (const bullet of this.bullets) {
        if (!bullet.active) continue;
        const bounds = bullet.getBounds();
        if (CollisionSystem.intersects(bounds, pair.leftGate.getBounds())) {
          pair.leftGate.registerHit(this.statSystem.get('power'));
          bullet.destroy();
          continue;
        }
        if (CollisionSystem.intersects(bounds, pair.rightGate.getBounds())) {
          pair.rightGate.registerHit(this.statSystem.get('power'));
          bullet.destroy();
        }
      }

      if (!pair.resolved && pair.leftGate.container.y >= this.player.y - 8) {
        pair.resolveChoice(this.player.x, (gate) => {
          const newValue = this.statSystem.apply(gate.statType, gate.delta);
          this.autoFire.refreshFromStats();
          this.addFloatingText(this.player.x, this.player.y - 60, `${gate.delta >= 0 ? '+' : ''}${gate.delta} ${gate.statType.toUpperCase()}`, gate.delta > 0 ? '#99ff99' : '#ff8f8f');
          if (newValue) this.refreshHud();
        });
      }

      return !pair.isOffscreen() && !pair.resolved;
    });

    this.moneyBlocks = this.moneyBlocks.filter((block) => {
      block.update(this.scrollOffset);

      for (const bullet of this.bullets) {
        if (!bullet.active || block.destroyed) continue;
        if (CollisionSystem.intersects(bullet.getBounds(), block.getBounds())) {
          const killed = block.takeDamage(this.statSystem.get('power'));
          bullet.destroy();
          if (killed) {
            this.cash += block.reward;
            this.addFloatingText(block.container.x, block.container.y - 24, `+$${block.reward}`, '#ffe385');
            this.refreshHud();
          }
        }
      }

      return !block.destroyed && block.container.y < 900;
    });

    this.endLine.y = this.level.endLineY + this.scrollOffset;
    this.endLineLabel.y = this.endLine.y - 18;

    const progress = Phaser.Math.Clamp(this.scrollOffset / this.level.totalDistance, 0, 1);
    this.progressFill.width = 312 * progress;

    if (this.endLine.y >= this.player.y - 20) {
      this.finishRun();
    }
  }

  finishRun() {
    this.runState = STATE.RESULTS;
    const stats = this.statSystem.getAll();
    this.resultsText.setText(
      `RUN COMPLETE\n\nCash: $${this.cash}\nFire Rate: ${formatStat('fireRate', stats.fireRate)}\nPower: ${formatStat('power', stats.power)}\nRange: ${formatStat('range', stats.range)}`
    );
    this.resultsContainer.setVisible(true);
  }

  refreshHud() {
    const stats = this.statSystem.getAll();
    this.hud.setText([
      `Cash: $${this.cash}`,
      `Fire Rate: ${formatStat('fireRate', stats.fireRate)}`,
      `Power: ${formatStat('power', stats.power)}`,
      `Range: ${formatStat('range', stats.range)}`
    ]);
  }
}
