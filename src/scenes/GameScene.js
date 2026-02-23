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
  RUNNING: 'RUNNING',
  RESULTS: 'RESULTS',
  PAUSED: 'PAUSED'
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

    this.gates = this.physics.add.group();
    this.moneyBlocks = this.physics.add.group();
    this.bullets = this.physics.add.group({ runChildUpdate: true });

    this.player = new PlayerGun(this, GAME_WIDTH / 2, GAME_HEIGHT - 84, { minX: 48, maxX: GAME_WIDTH - 48 });
    this.playerDepth = 10;
    this.player.setDepth(this.playerDepth);

    const levelConfig = {
      ...LEVEL_CONFIG,
      midMoneyBlocks: [...LEVEL_CONFIG.midMoneyBlocks],
      finalMoneyBlocks: [...LEVEL_CONFIG.finalMoneyBlocks]
    };
    const builder = new LevelBuilder(this, levelConfig);
    this.levelBuilder = builder;
    this.gatePairs = builder.buildInitial(this.gates, this.moneyBlocks, 8);
    this.scrollSpeed = levelConfig.scrollSpeed;
    this.totalResolvedRows = 0;

    this.autoFire = new AutoFireSystem(this, this.player, this.statSystem, this.bullets);
    this.collisionSystem = new CollisionSystem(
      this,
      this.bullets,
      this.gates,
      this.moneyBlocks,
      (bullet, gate) => this.onGateHit(bullet, gate),
      (bullet, money) => this.onMoneyHit(bullet, money)
    );

    this.updateHud();
    this.resultOverlay.setVisible(false);
    this.menuOverlay.setVisible(false);
  }

  setupInput() {
    this.pointerX = GAME_WIDTH / 2;

    this.input.on('pointermove', (pointer) => {
      this.pointerX = pointer.x;
    });

    this.input.on('pointerdown', (pointer) => {
      this.pointerX = pointer.x;
    });

    this.keys = this.input.keyboard.addKeys({
      p: Phaser.Input.Keyboard.KeyCodes.P
    });
  }

  setupUi() {
    this.hudText = this.add.text(12, 10, '', {
      fontFamily: 'Arial',
      fontSize: '19px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setDepth(20);

    this.progressBox = this.add.rectangle(GAME_WIDTH / 2, 98, 320, 14, 0x1a1e2d).setStrokeStyle(2, 0x99a5c2).setDepth(20);
    this.progressFill = this.add.rectangle(GAME_WIDTH / 2 - 158, 98, 0, 10, 0x4dd0e1).setOrigin(0, 0.5).setDepth(20);

    this.menuOverlay = this.add.container(0, 0).setDepth(30);
    const menuBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 340, 260, 0x101626, 0.92).setStrokeStyle(3, 0x5f7aa5);
    const menuTitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 58, 'GUN RUNNER MVP', { fontFamily: 'Arial', fontSize: '34px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const menuDesc = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 4, 'Drag left/right\nShoot gates to upgrade stats', { fontFamily: 'Arial', fontSize: '20px', color: '#c9d8ff', align: 'center' }).setOrigin(0.5);
    const startBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 68, 200, 60, 0x2ecc71).setStrokeStyle(3, 0xffffff).setInteractive();
    const startLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 68, 'START', { fontFamily: 'Arial', fontSize: '28px', color: '#0b2416', fontStyle: 'bold' }).setOrigin(0.5);
    startBtn.on('pointerdown', () => this.startRun());
    this.menuOverlay.add([menuBg, menuTitle, menuDesc, startBtn, startLabel]);

    this.resultOverlay = this.add.container(0, 0).setDepth(40).setVisible(false);
    const resultBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 360, 330, 0x111729, 0.95).setStrokeStyle(3, 0x90a4c8);
    this.resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 56, '', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    const replayBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 118, 220, 58, 0x4fc3f7).setStrokeStyle(2, 0xffffff).setInteractive();
    const replayLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 118, 'PLAY AGAIN', { fontFamily: 'Arial', fontSize: '27px', color: '#0c2030', fontStyle: 'bold' }).setOrigin(0.5);
    replayBtn.on('pointerdown', () => this.startRun());
    this.resultOverlay.add([resultBg, this.resultText, replayBtn, replayLabel]);
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
    const popup = this.add.text(x, y, text, { fontFamily: 'Arial', fontSize: '24px', color, stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5);
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
      const leftPast = pair.leftGate.y > this.player.y + 20;
      const rightPast = pair.rightGate.y > this.player.y + 20;
      if (!leftPast || !rightPast) continue;

      pair.resolved = true;
      const chosen = pair.getChosenGate(this.player.x);
      const other = pair.getOtherGate(this.player.x);

      if (chosen.activations > 0 && !chosen.applied) {
        chosen.applied = true;
        const totalDelta = chosen.delta * chosen.activations;
        this.statSystem.apply(chosen.statType, totalDelta);
        this.spawnFloatingText(this.player.x, this.player.y - 90, `${totalDelta > 0 ? '+' : ''}${totalDelta} ${chosen.statType.toUpperCase()}`, totalDelta > 0 ? '#9cff9c' : '#ff9c9c');
      }

      chosen.destroy();
      other.destroy();
      this.nextGateIndex += 1;
      this.totalResolvedRows += 1;
      this.gatePairs.push(this.levelBuilder.spawnNextRow(this.gates, this.moneyBlocks));
      this.updateHud();
    }
  }

  updateHud() {
    if (!this.statSystem) return;
    const s = this.statSystem.stats;
    this.hudText.setText([
      `Cash: $${this.cash}`,
      `Fire Rate: ${s.fireRate.toFixed(1)}   Power: ${s.power.toFixed(1)}   Range: ${Math.round(s.range)}`,
      `Next Gate: ${this.nextGateIndex}   Cleared: ${this.totalResolvedRows}`
    ]);

    // Infinite mode uses a looping progress pulse rather than 0-100 completion.
    const progress = (this.scrollDistance % 1200) / 1200;
    this.progressFill.width = progress * 316;
  }

  handleKeyboardPause() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.p)) {
      this.state = this.state === STATES.PAUSED ? STATES.RUNNING : STATES.PAUSED;
    }
  }

  update(_time, delta) {
    if (this.state !== STATES.RUNNING && this.state !== STATES.PAUSED) return;

    this.handleKeyboardPause();
    this.player.setTargetX(this.pointerX);
    if (this.state === STATES.PAUSED) return;

    this.scrollDistance += (this.scrollSpeed * delta) / 1000;

    this.gates.children.each((gate) => {
      gate.y += (this.scrollSpeed * delta) / 1000;
      if (gate.y > GAME_HEIGHT + 220) gate.destroy();
    });

    this.moneyBlocks.children.each((money) => {
      money.y += (this.scrollSpeed * delta) / 1000;
      if (money.y > GAME_HEIGHT + 120) money.destroy();
    });

    this.player.update();
    this.autoFire.update(delta);

    this.resolveGateRows();
    this.updateHud();

    // Infinite run mode: no end trigger.
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
