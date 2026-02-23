import Phaser from 'phaser';
import { formatGateDelta } from '../utils/format.js';

export class Gate extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, data) {
    super(scene, x, y);
    this.scene = scene;
    this.data = data;
    this.requiredHits = data.requiredHits;
    this.hitsAccumulated = 0;
    this.isActivated = false;
    this.isResolved = false;

    this.bg = scene.add.rectangle(0, 0, width, 118, data.delta > 0 ? 0x1c6136 : 0x6a2323, 0.4)
      .setStrokeStyle(4, data.delta > 0 ? 0x46dd7b : 0xff6868);
    this.label = scene.add.text(0, -10, formatGateDelta(data.statType, data.delta), {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);

    this.progressText = scene.add.text(0, 34, `0/${this.requiredHits}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#f6f6f6'
    }).setOrigin(0.5);

    this.add([this.bg, this.label, this.progressText]);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setSize(width, 118);
    this.body.setImmovable(true);
  }

  registerHit(damage) {
    if (this.isActivated || this.isResolved) return;
    this.hitsAccumulated = Math.min(this.requiredHits, this.hitsAccumulated + damage);
    this.progressText.setText(`${Math.floor(this.hitsAccumulated)}/${this.requiredHits}`);
    this.scene.tweens.add({ targets: this.bg, alpha: 0.85, duration: 40, yoyo: true });

    if (this.hitsAccumulated >= this.requiredHits) {
      this.isActivated = true;
      this.progressText.setText('READY');
      this.bg.setStrokeStyle(6, 0xffffff);
    }
  }

  resolvePassThrough() {
    this.isResolved = true;
    if (this.isActivated) {
      return { statType: this.data.statType, delta: this.data.delta };
    }
    return null;
  }

  destroyGate() {
    this.destroy(true);
  }
}
