import { statLabels } from '../data/gateDeltas';
import { formatSigned } from '../utils/format';

export class Gate {
  constructor(scene, config) {
    this.scene = scene;
    this.statType = config.statType;
    this.delta = config.delta;
    this.requiredHits = config.requiredHits;
    this.hits = 0;
    this.isActive = false;
    this.side = config.side;
    this.applied = false;

    this.container = scene.add.container(config.x, config.y);
    const positive = this.delta > 0;
    const color = positive ? 0x1e9f58 : 0xa12a2a;
    const fill = positive ? 0x1e9f58 : 0xa12a2a;

    this.bg = scene.add.rectangle(0, 0, 160, 86, fill, 0.25).setStrokeStyle(3, color);
    this.label = scene.add.text(0, -10, `${formatSigned(this.delta)} ${statLabels[this.statType]}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
    this.progressText = scene.add.text(0, 24, `0/${this.requiredHits}`, {
      fontSize: '16px',
      color: '#f5f5f5',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.container.add([this.bg, this.label, this.progressText]);
  }

  updatePosition(y) {
    this.container.y = y;
  }

  registerHit(power) {
    if (this.isActive) return;
    this.hits = Math.min(this.requiredHits, this.hits + power);
    this.progressText.setText(`${Math.floor(this.hits)}/${this.requiredHits}`);
    this.bg.setFillStyle(0xffffff, 0.4);
    this.scene.tweens.add({ targets: this.bg, alpha: 0.5, duration: 70, yoyo: true });

    if (this.hits >= this.requiredHits) {
      this.isActive = true;
      this.progressText.setText('READY');
      this.bg.setFillStyle(0xa6ffcc, 0.6);
    }
  }

  getBounds() {
    return this.bg.getBounds();
  }

  destroy() {
    this.container.destroy(true);
  }
}
