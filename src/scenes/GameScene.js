import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/config';
import { PlayerGun } from '../entities/PlayerGun';
import { StatSystem } from '../systems/StatSystem';
import { AutoFireSystem } from '../systems/AutoFireSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { LEVEL_CONFIG } from '../data/levelMVP';
import { LevelBuilder } from '../systems/LevelBuilder';

const STATES = {
  MENU: 'MENU',
  RUNNING: 'RUNNING'
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.drawBackground();
    this.setupUi();
    this.setupInput();
    this.showMenu();
  }

  startRun() {
    this.clearRunObjects();

    this.state = STATES.RUNNING;
    this.scrollDistance = 0;
    this.cash = 0;
    this.nextGateIndex = 1;

    this.statSystem = new StatSystem();
    this.gatePairs = [];

    this.gates = this.physics.add.group();
    this.moneyBlocks = this.physics.add.group();
    this.bullets = this.physics.add.group({ runChildUpdate: true });

    this.player = new PlayerGun(this, GAME_WIDTH / 2, GAME_HEIGHT - 84, { minX: 48, maxX: GAME_WIDTH - 48 });
    this.player.setDepth(10);

    this.levelBuilder = new LevelBuilder(this, {
      ...LEVEL_CONFIG,
      midMoneyBlocks: [...LEVEL_CONFIG.midMoneyBlocks],
      finalMoneyBlocks: [...LEVEL_CONFIG.finalMoneyBlocks]
    });

    this.scrollSpeed = LEVEL_CONFIG.scrollSpeed;

    this.autoFire = new AutoFireSystem(this, this.player, this.statSystem, this.bullets);
    this.collisionSystem = new CollisionSystem(
      this,
      this.bullets,
      this.gates,
      this.moneyBlocks,
      (bullet, gate) => this.onGateHit(bullet, gate),
      (bullet, money) => this.onMoneyHit(bullet, money)
    );

    this.levelBuilder.spawnUntilDistance(this.scrollDistance + 2200, this.gates, this.moneyBlocks, this.gatePairs);
    this.updateHud();
    this.menuOverlay.setVisible(false);
  }

  setupInput() {
    this.mouseX = GAME_WIDTH / 2;

    this.input.on('pointermove', (pointer) => {
      this.mouseX = pointer.x;
      if (this.state === STATES.RUNNING && this.player) {
        this.player.setTargetX(pointer.x);
      }
    });

    this.input.on('pointerdown', (pointer) => {
      this.mouseX = pointer.x;
      if (this.state === STATES.RUNNING && this.player) {
        this.player.setTargetX(pointer.x);
      }
    });
  }

  setupUi() {
    this.hudText = this.add
      .text(12, 10, '', {
        fontFamily: 'Arial',
        fontSize: '19px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      })
      .setDepth(20);

    this.menuOverlay = this.add.container(0, 0).setDepth(30);
    const menuBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 360, 280, 0x101626, 0.92).setStrokeStyle(3, 0x5f7aa5);
    const menuTitle = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 64, 'GUN RUNNER INFINITE', { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);
    const menuDesc = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 4, 'Move mouse/touch left-right\nGun always auto-fires\nGate hits can stack: x2, x3, x4...', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#c9d8ff',
        align: 'center'
      })
      .setOrigin(0.5);
    const startBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 84, 220, 60, 0x2ecc71).setStrokeStyle(3, 0xffffff).setInteractive();
    const startLabel = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 84, 'START RUN', { fontFamily: 'Arial', fontSize: '28px', color: '#0b2416', fontStyle: 'bold' })
      .setOrigin(0.5);
    startBtn.on('pointerdown', () => this.startRun());
    this.menuOverlay.add([menuBg, menuTitle, menuDesc, startBtn, startLabel]);
  }

  showMenu() {
    this.state = STATES.MENU;
    this.menuOverlay.setVisible(true);
  }

  onGateHit(bullet, gate) {
    gate.receiveHit(bullet.power);
    bullet.destroy();
  }

  onMoneyHit(bullet, money) {
    const destroyed = money.receiveHit(bullet.power);
    bullet.destroy();
    if (destroyed) {
      this.cash += money.reward;
      this.spawnFloatingText(money.x, money.y, `+$${money.reward}`, '#ffe082');
      money.destroy();
      this.updateHud();
    }
  }

  spawnFloatingText(x, y, text, color = '#ffffff') {
    const popup = this.add
      .text(x, y, text, { fontFamily: 'Arial', fontSize: '24px', color, stroke: '#000000', strokeThickness: 3 })
      .setOrigin(0.5);
    this.tweens.add({
      targets: popup,
      y: y - 40,
      alpha: 0,
      duration: 500,
      onComplete: () => popup.destroy()
    });
  }

  resolveGateRows() {
    for (const pair of this.gatePairs) {
      if (pair.resolved) continue;
      if (!pair.leftGate.active || !pair.rightGate.active) {
        pair.resolved = true;
        continue;
      }

      const leftPast = pair.leftGate.y > this.player.y + 20;
      const rightPast = pair.rightGate.y > this.player.y + 20;
      if (!leftPast || !rightPast) continue;

      pair.resolved = true;
      const chosen = pair.getChosenGate(this.player.x);
      const other = pair.getOtherGate(this.player.x);
      const stacks = chosen.getStacks();

      if (!chosen.applied && stacks > 0) {
        chosen.applied = true;
        const totalDelta = chosen.delta * stacks;
        this.statSystem.apply(chosen.statType, totalDelta);
        this.spawnFloatingText(
          this.player.x,
          this.player.y - 90,
          `${totalDelta > 0 ? '+' : ''}${totalDelta} ${chosen.statType.toUpperCase()}`,
          totalDelta > 0 ? '#9cff9c' : '#ff9c9c'
        );
      }

      chosen.destroy();
      other.destroy();
      this.nextGateIndex += 1;
      this.updateHud();
    }
  }

  updateHud() {
    if (!this.statSystem) return;
    const s = this.statSystem.stats;
    this.hudText.setText([
      `Cash: $${this.cash}   Distance: ${Math.floor(this.scrollDistance)}`,
      `Fire Rate: ${s.fireRate.toFixed(1)}   Power: ${s.power.toFixed(1)}   Range: ${Math.round(s.range)}`,
      `Gate Row: ${this.nextGateIndex} (Endless)`
    ]);
  }

  update(_time, delta) {
    if (this.state !== STATES.RUNNING) return;

    this.scrollDistance += (this.scrollSpeed * delta) / 1000;

    this.levelBuilder.spawnUntilDistance(this.scrollDistance + 2200, this.gates, this.moneyBlocks, this.gatePairs);

    this.gates.children.each((gate) => {
      gate.y += (this.scrollSpeed * delta) / 1000;
      if (gate.y > GAME_HEIGHT + 220) gate.destroy();
    });

    this.moneyBlocks.children.each((money) => {
      money.y += (this.scrollSpeed * delta) / 1000;
      if (money.y > GAME_HEIGHT + 120) money.destroy();
    });

    this.player.setTargetX(this.mouseX);
    this.player.update();
    this.autoFire.update(delta);

    this.resolveGateRows();
    this.updateHud();
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x0c1220, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    g.fillStyle(0x111a2e, 1);
    g.fillRect(50, 0, GAME_WIDTH - 100, GAME_HEIGHT);

    g.lineStyle(1, 0x243655, 0.6);
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      g.lineBetween(50, y, GAME_WIDTH - 50, y);
    }
    g.lineStyle(2, 0x3a4f77, 0.8);
    g.lineBetween(50, 0, 50, GAME_HEIGHT);
    g.lineBetween(GAME_WIDTH - 50, 0, GAME_WIDTH - 50, GAME_HEIGHT);
    g.lineBetween(GAME_WIDTH / 2, 0, GAME_WIDTH / 2, GAME_HEIGHT);
  }

  clearRunObjects() {
    this.gates?.clear(true, true);
    this.moneyBlocks?.clear(true, true);
    this.bullets?.clear(true, true);
    this.player?.destroy();
  }
}
