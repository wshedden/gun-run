import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/config.js';
import { PlayerGun } from '../entities/PlayerGun.js';
import { Bullet } from '../entities/Bullet.js';
import { GatePair } from '../entities/GatePair.js';
import { MoneyBlock } from '../entities/MoneyBlock.js';
import { AutoFireSystem } from '../systems/AutoFireSystem.js';
import { StatSystem } from '../systems/StatSystem.js';
import { LevelBuilder } from '../systems/LevelBuilder.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { LEVEL_MVP } from '../data/levelMVP.js';

const RUN_STATE = {
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
    this.runState = RUN_STATE.MENU;
    this.scrollSpeed = LEVEL_MVP.scrollSpeed;
    this.cash = 0;

    this.createBackground();
    this.createGameplayObjects();
    this.createMenu();
    this.bindInputs();
  }

  createBackground() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x090f20);
    this.track = this.add.graphics();
    this.track.fillStyle(0x111a31, 1);
    this.track.fillRect(70, 0, 340, GAME_HEIGHT);

    this.grid = this.add.group();
    for (let i = 0; i < 22; i += 1) {
      const y = i * 40;
      const line = this.add.rectangle(GAME_WIDTH / 2, y, 320, 2, 0x293758, 0.7);
      this.grid.add(line);
    }
  }

  createGameplayObjects() {
    this.statSystem = new StatSystem();
    this.levelBuilder = new LevelBuilder(this);

    this.bulletGroup = this.physics.add.group({ classType: Bullet, maxSize: 110, runChildUpdate: true });
    this.gateGroup = this.physics.add.group();
    this.moneyGroup = this.physics.add.group();

    this.player = new PlayerGun(this, GAME_WIDTH / 2, GAME_HEIGHT - 95, { minX: 100, maxX: 380 });

    this.autoFire = new AutoFireSystem(this, this.statSystem, () => this.fireBullet());

    new CollisionSystem(
      this,
      this.bulletGroup,
      this.gateGroup,
      this.moneyGroup,
      (bullet, gate) => this.onBulletHitGate(bullet, gate),
      (bullet, block) => this.onBulletHitMoneyBlock(bullet, block)
    );

    this.statSystem.on('changed', () => this.emitHudUpdate());
  }

  createMenu() {
    this.menuContainer = this.add.container(0, 0).setDepth(5000);
    const panel = this.add.rectangle(240, 400, 360, 240, 0x101a2b).setStrokeStyle(3, 0x6bc0ff);
    const title = this.add.text(240, 350, 'GUN RUN MVP', { fontFamily: 'Arial Black', fontSize: '40px', color: '#fff' }).setOrigin(0.5);
    const subtitle = this.add.text(240, 410, 'Drag left/right\nShoot gates for upgrades', { fontFamily: 'Arial', fontSize: '24px', align: 'center', color: '#cfe9ff' }).setOrigin(0.5);
    const startBtn = this.add.rectangle(240, 495, 170, 52, 0x34a3ff).setInteractive({ useHandCursor: true });
    const startTxt = this.add.text(240, 495, 'START', { fontFamily: 'Arial Black', fontSize: '26px', color: '#fff' }).setOrigin(0.5);
    this.menuContainer.add([panel, title, subtitle, startBtn, startTxt]);

    startBtn.on('pointerdown', () => this.startRun());
  }

  bindInputs() {
    this.dragging = false;
    this.input.on('pointerdown', (pointer) => {
      this.dragging = true;
      if (this.runState === RUN_STATE.RUNNING) this.player.setTargetX(pointer.x);
    });
    this.input.on('pointermove', (pointer) => {
      if (this.dragging && this.runState === RUN_STATE.RUNNING) this.player.setTargetX(pointer.x);
    });
    this.input.on('pointerup', () => { this.dragging = false; });

    this.keys = this.input.keyboard.addKeys('A,D,LEFT,RIGHT,P');
    this.input.keyboard.on('keydown-P', () => {
      if (this.runState === RUN_STATE.RUNNING) this.runState = RUN_STATE.PAUSED;
      else if (this.runState === RUN_STATE.PAUSED) this.runState = RUN_STATE.RUNNING;
    });
  }

  startRun() {
    this.menuContainer.setVisible(false);
    this.restartRun();
  }

  restartRun() {
    this.cleanupRun();
    this.runState = RUN_STATE.RUNNING;
    this.events.emit('results:hide');

    this.cash = 0;
    this.distanceTravelled = 0;
    this.statSystem.reset();

    this.levelPlan = this.levelBuilder.build();
    this.gatePairs = this.levelPlan.gateRows.map((row) => {
      const pair = new GatePair(this, row.y, row.left, row.right, 150);
      this.gateGroup.add(pair.left);
      this.gateGroup.add(pair.right);
      return pair;
    });

    this.moneyBlocks = this.levelPlan.moneyBlocks.map((row) => {
      const x = GAME_WIDTH / 2 + row.lane * 120;
      const block = new MoneyBlock(this, x, row.y, row.hp);
      this.moneyGroup.add(block);
      return block;
    });

    this.endLineY = this.levelPlan.endLineY;
    this.autoFire.start();
    this.emitHudUpdate();
  }

  cleanupRun() {
    this.autoFire?.stop();
    this.bulletGroup?.children?.iterate((bullet) => bullet && bullet.destroy());
    this.gatePairs?.forEach((pair) => pair.destroy());
    this.moneyBlocks?.forEach((block) => block.destroy());

    this.gatePairs = [];
    this.moneyBlocks = [];
    this.bulletGroup.clear(true, true);
    this.gateGroup.clear(true, true);
    this.moneyGroup.clear(true, true);
  }

  update(_time, deltaMs) {
    if (this.runState !== RUN_STATE.RUNNING) return;

    const dt = deltaMs / 1000;
    const scrollDelta = this.scrollSpeed * dt;
    this.distanceTravelled += scrollDelta;

    this.updateKeyboardControl();
    this.player.update();

    this.grid.children.each((line) => {
      line.y += scrollDelta;
      if (line.y > GAME_HEIGHT + 10) line.y -= 40 * 22;
    });

    this.gatePairs.forEach((pair) => {
      pair.update(scrollDelta);
      if (!pair.resolved && pair.lineY >= this.player.y) {
        const { effect, chosen } = pair.resolve(this.player.x);
        if (effect) {
          this.applyGateEffect(effect, chosen);
        }
      }
    });

    this.moneyBlocks.forEach((block) => {
      block.y += scrollDelta;
    });

    this.endLineY += scrollDelta;
    const progress = Phaser.Math.Clamp(this.distanceTravelled / this.levelPlan.totalDistance, 0, 1);
    this.events.emit('progress:update', { progress });

    if (this.endLineY >= this.player.y - 80) {
      this.completeRun();
    }
  }

  updateKeyboardControl() {
    const speed = 7;
    if (this.keys.A.isDown || this.keys.LEFT.isDown) {
      this.player.setTargetX(this.player.targetX - speed);
    }
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) {
      this.player.setTargetX(this.player.targetX + speed);
    }
  }

  fireBullet() {
    if (this.runState !== RUN_STATE.RUNNING) return;
    const muzzle = this.player.getMuzzle();
    const bullet = this.bulletGroup.get(muzzle.x, muzzle.y);
    if (!bullet) return;
    bullet.fire(muzzle.x, muzzle.y, this.statSystem.get('power'), this.statSystem.get('range'));
    this.player.playMuzzleFlash();
  }

  onBulletHitGate(bullet, gate) {
    gate.registerHit(bullet.damage);
    bullet.deactivate();
  }

  onBulletHitMoneyBlock(bullet, block) {
    const destroyed = block.hit(bullet.damage);
    bullet.deactivate();
    if (destroyed) {
      this.cash += block.reward;
      this.showFloatingText(block.x, block.y - 40, `+${block.reward}`, 0x97ff9d);
      block.destroy();
      this.moneyBlocks = this.moneyBlocks.filter((item) => item !== block);
      this.emitHudUpdate();
    }
  }

  applyGateEffect(effect, gate) {
    this.statSystem.applyDelta(effect.statType, effect.delta);
    const color = effect.delta >= 0 ? 0x8eff97 : 0xff8b8b;
    this.showFloatingText(gate.x, gate.y - 65, `${effect.delta > 0 ? '+' : ''}${effect.delta} ${effect.statType}`, color);
  }

  showFloatingText(x, y, label, color) {
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 700,
      onComplete: () => text.destroy()
    });
  }

  emitHudUpdate() {
    this.events.emit('hud:update', {
      cash: this.cash,
      stats: this.statSystem.getStats()
    });
  }

  completeRun() {
    this.runState = RUN_STATE.RESULTS;
    this.autoFire.stop();
    this.events.emit('results:show', {
      cash: this.cash,
      stats: this.statSystem.getStats()
    });
  }
}
