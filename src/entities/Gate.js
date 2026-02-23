import Phaser from 'phaser';
import { formatGateEffect } from '../utils/format';

export class Gate extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config) {
    super(scene, x, y);
    this.statType = config.statType;
    this.delta = config.delta;
    this.requiredHits = config.requiredHits;
    this.hits = 0;
    this.isActivated = false;
    this.effectApplied = false;
    this.rowId = config.rowId;
    this.side = config.side;

    const positive = this.delta > 0;
    const bgColor = positive ? 0x1d6b36 : 0x7a2530;
    const borderColor = positive ? 0x63f28c : 0xff7d8f;

    this.panel = scene.add.rectangle(0, 0, 138, 154, bgColor, 0.28).setStrokeStyle(3, borderColor, 0.95);
    this.label = scene.add.text(0, -22, formatGateEffect(this.statType, this.delta), {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#0c0d12',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5);

    this.progressBg = scene.add.rectangle(0, 46, 94, 12, 0x111111, 0.7).setOrigin(0.5);
    this.progressFill = scene.add.rectangle(-47, 46, 0, 12, borderColor, 1).setOrigin(0, 0.5);
    this.progressText = scene.add.text(0, 62, `0/${this.requiredHits}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#e6efff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add([this.panel, this.label, this.progressBg, this.progressFill, this.progressText]);
    scene.add.existing(this);

    scene.physics.add.existing(this.panel, true);
    this.body = this.panel.body;
    this.panel.gateRef = this;
  }

  registerHit(damage = 1) {
    if (this.isActivated) return;
    this.hits = Math.min(this.requiredHits, this.hits + damage);
    const pct = this.hits / this.requiredHits;
    this.progressFill.width = 94 * pct;
    this.progressText.setText(`${Math.ceil(this.hits)}/${this.requiredHits}`);

    this.scene.tweens.add({
      targets: this.panel,
      alpha: 0.9,
      duration: 40,
      yoyo: true,
    });

    if (this.hits >= this.requiredHits) {
      this.isActivated = true;
      this.panel.setFillStyle(0xd4ffd6, 0.32);
      this.panel.setStrokeStyle(4, 0xffffff, 1);
      this.progressText.setText('READY');
    }
  }

  updateScroll(deltaY) {
    this.y += deltaY;
    this.panel.y = this.y;
    this.panel.x = this.x;
  }

  destroyGate() {
    this.panel.destroy();
    this.destroy();
  }
}
