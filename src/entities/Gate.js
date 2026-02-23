import Phaser from 'phaser';
import { formatDelta } from '../utils/format';

export class Gate extends Phaser.GameObjects.Container {
  constructor(scene, config) {
    super(scene, config.x, config.y);
    this.scene = scene;
    this.statType = config.statType;
    this.delta = config.delta;
    this.requiredHits = config.requiredHits;
    this.hits = 0;
    this.applied = false;
    this.rowIndex = config.rowIndex;

    const good = this.delta > 0;
    const color = good ? 0x2ecc71 : 0xe74c3c;
    this.panel = scene.add.rectangle(0, 0, 120, 170, color, 0.22).setStrokeStyle(4, color);
    this.label = scene.add
      .text(0, -26, formatDelta(this.statType, this.delta), {
        fontFamily: 'Arial',
        fontSize: '21px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
        wordWrap: { width: 110 }
      })
      .setOrigin(0.5);
    this.progress = scene.add
      .text(0, 36, `HITS 0`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(0.5);
    this.stacksLabel = scene.add
      .text(0, 62, `x0`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.add([this.panel, this.label, this.progress, this.stacksLabel]);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(120, 170);
    this.body.allowGravity = false;
    this.body.setImmovable(true);
  }

  receiveHit(damage) {
    this.hits += damage;
    const stacks = this.getStacks();
    this.progress.setText(`HITS ${Math.floor(this.hits)}`);
    this.stacksLabel.setText(`x${stacks}`);

    this.scene.tweens.add({
      targets: this.panel,
      alpha: 0.6,
      yoyo: true,
      duration: 65
    });

    if (stacks > 0) {
      this.panel.setStrokeStyle(6, 0xffffff);
    }
  }

  getStacks() {
    return Math.floor(this.hits / this.requiredHits);
  }
}
