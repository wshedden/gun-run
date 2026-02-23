import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/config';
import { Bullet } from '../entities/Bullet';
import { PlayerGun } from '../entities/PlayerGun';
import { AutoFireSystem } from '../systems/AutoFireSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { LevelBuilder } from '../systems/LevelBuilder';
import { StatSystem } from '../systems/StatSystem';
import { LEVEL_SETTINGS } from '../data/levelMVP';

const RUN_STATES = {
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  RESULTS: 'RESULTS',
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.playfield = {
      minX: LEVEL_SETTINGS.corridorPadding,
      maxX: GAME_WIDTH - LEVEL_SETTINGS.corridorPadding,
    };

    this.drawBackground();
    this.initInput();
    this.setupRun();

    this.events.on('ui-restart-requested', this.restartRun, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off('ui-restart-requested', this.restartRun, this);
    });
  }

  setupRun() {
    this.runState = RUN_STATES.RUNNING;
    this.scrollDistance = 0;
    this.cash = 0;

    this.statSystem = new StatSystem();
    this.player = new PlayerGun(this, GAME_WIDTH / 2, GAME_HEIGHT - 82, this.playfield);

    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: LEVEL_SETTINGS.maxBullets,
      runChildUpdate: true,
    });

    const builder = new LevelBuilder(this, this.playfield);
    const { gatePairs, moneyBlocks, endDistance } = builder.build();
    this.gatePairs = gatePairs;
    this.moneyBlocks = moneyBlocks;
    this.endDistance = endDistance;

    this.gatePanelGroup = this.physics.add.staticGroup();
    this.moneyPanelGroup = this.physics.add.staticGroup();

    this.gatePairs.forEach((pair) => pair.gates().forEach((gate) => this.gatePanelGroup.add(gate.panel)));
    this.moneyBlocks.forEach((block) => this.moneyPanelGroup.add(block.bodyRect));

    this.autoFire = new AutoFireSystem(this, () => this.spawnBullet());
    this.collisionSystem = new CollisionSystem(
      this,
      this.bullets,
      this.gatePanelGroup,
      this.moneyPanelGroup,
      (bullet, gate) => this.handleGateHit(bullet, gate),
      (bullet, money) => this.handleMoneyHit(bullet, money),
    );

    this.emitHud();
  }

  restartRun() {
    this.cleanupRunObjects();
    this.setupRun();
  }

  cleanupRunObjects() {
    this.player?.destroy();
    this.bullets?.clear(true, true);

    this.gatePairs?.forEach((pair) => pair.destroyAll());
    this.moneyBlocks?.forEach((block) => block.destroyBlock());

    this.gatePanelGroup?.clear(true, true);
    this.moneyPanelGroup?.clear(true, true);
  }

  initInput() {
    this.dragging = false;
    this.input.on('pointerdown', (pointer) => {
      this.dragging = true;
      this.player?.setTargetX(pointer.x);
    });
    this.input.on('pointermove', (pointer) => {
      if (this.dragging) this.player?.setTargetX(pointer.x);
    });
    this.input.on('pointerup', () => {
      this.dragging = false;
    });

    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      p: Phaser.Input.Keyboard.KeyCodes.P,
    });

    this.input.keyboard.on('keydown-P', () => {
      if (this.runState === RUN_STATES.RESULTS) return;
      this.runState = this.runState === RUN_STATES.RUNNING ? RUN_STATES.PAUSED : RUN_STATES.RUNNING;
    });
  }

  drawBackground() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0f1533, 1);
    const g = this.add.graphics();
    g.lineStyle(2, 0x1e2e62, 0.8);
    for (let y = 0; y < GAME_HEIGHT; y += 54) {
      g.lineBetween(40, y, GAME_WIDTH - 40, y + 12);
    }
    g.lineStyle(3, 0x284188, 0.9);
    g.lineBetween(this.playfield?.minX ?? 40, 0, this.playfield?.minX ?? 40, GAME_HEIGHT);
    g.lineBetween(this.playfield?.maxX ?? (GAME_WIDTH - 40), 0, this.playfield?.maxX ?? (GAME_WIDTH - 40), GAME_HEIGHT);
  }

  update(_time, delta) {
    if (!this.player) return;

    if (this.runState === RUN_STATES.PAUSED || this.runState === RUN_STATES.RESULTS) {
      this.player.update(_time, delta);
      return;
    }

    this.applyKeyboardControl(delta);
    this.player.update(_time, delta);

    this.autoFire.update(delta, this.statSystem.get('fireRate'));

    const deltaY = (LEVEL_SETTINGS.scrollSpeed * delta) / 1000;
    this.scrollDistance += deltaY;

    this.gatePairs.forEach((pair) => pair.gates().forEach((gate) => gate.updateScroll(deltaY)));
    this.moneyBlocks.forEach((block) => block.updateScroll(deltaY));

    this.resolveGateRows();
    this.cullOffscreen();

    if (this.scrollDistance >= this.endDistance) {
      this.completeRun();
    }

    this.emitHud();
  }

  applyKeyboardControl(delta) {
    const dir = (this.keys.left.isDown || this.keys.a.isDown ? -1 : 0) + (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0);
    if (dir !== 0) {
      const speed = 290 * (delta / 1000);
      this.player.setTargetX(this.player.targetX + dir * speed * 5.5);
    }
  }

  spawnBullet() {
    if (this.runState !== RUN_STATES.RUNNING) return;
    const bullet = this.bullets.get();
    if (!bullet) return;

    const muzzle = this.player.muzzleWorldPosition();
    bullet.fire(muzzle.x, muzzle.y, LEVEL_SETTINGS.bulletSpeed, this.statSystem.get('range'), this.statSystem.get('power'));
    this.player.pulseMuzzleFlash();
  }

  handleGateHit(bullet, gate) {
    if (!bullet.active || !gate) return;
    gate.registerHit(bullet.damage);
    bullet.disable();
  }

  handleMoneyHit(bullet, moneyBlock) {
    if (!bullet.active || !moneyBlock) return;
    const destroyed = moneyBlock.applyDamage(bullet.damage);
    bullet.disable();

    if (destroyed) {
      this.cash += moneyBlock.cashReward;
      this.showFloatingText(moneyBlock.x, moneyBlock.y, `+$${moneyBlock.cashReward}`, '#ffe38d');
      const idx = this.moneyBlocks.indexOf(moneyBlock);
      if (idx >= 0) this.moneyBlocks.splice(idx, 1);
      this.moneyPanelGroup.remove(moneyBlock.bodyRect);
      moneyBlock.destroyBlock();
    }
  }

  resolveGateRows() {
    const gateLineY = this.player.y + 10;
    this.gatePairs.forEach((pair) => {
      if (pair.resolved) return;
      const rowY = pair.leftGate.y;
      if (rowY < gateLineY) return;

      const distanceLeft = Math.abs(this.player.x - pair.leftGate.x);
      const distanceRight = Math.abs(this.player.x - pair.rightGate.x);
      const chosen = distanceLeft <= distanceRight ? pair.leftGate : pair.rightGate;

      if (chosen.isActivated && !chosen.effectApplied) {
        this.statSystem.applyDelta(chosen.statType, chosen.delta);
        chosen.effectApplied = true;
        const sign = chosen.delta > 0 ? '+' : '';
        this.showFloatingText(this.player.x, this.player.y - 70, `${sign}${chosen.delta} ${chosen.statType.toUpperCase()}`, chosen.delta > 0 ? '#93ffb4' : '#ff8ca0');
      }

      pair.resolved = true;
      pair.gates().forEach((gate) => {
        this.gatePanelGroup.remove(gate.panel);
        gate.destroyGate();
      });
    });
  }

  cullOffscreen() {
    this.moneyBlocks = this.moneyBlocks.filter((block) => {
      const keep = block.y < GAME_HEIGHT + 80;
      if (!keep) {
        this.moneyPanelGroup.remove(block.bodyRect);
        block.destroyBlock();
      }
      return keep;
    });
  }

  emitHud() {
    this.events.emit('hud-update', {
      cash: this.cash,
      stats: this.statSystem.all(),
      progress: Phaser.Math.Clamp(this.scrollDistance / this.endDistance, 0, 1),
    });
  }

  completeRun() {
    this.runState = RUN_STATES.RESULTS;
    this.events.emit('show-results', {
      cash: this.cash,
      stats: this.statSystem.all(),
    });
  }

  showFloatingText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: t,
      y: y - 52,
      alpha: 0,
      duration: 620,
      onComplete: () => t.destroy(),
    });
  }
}
