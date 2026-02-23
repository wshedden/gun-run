import { Gate } from './Gate';

export class GatePair {
  constructor(scene, rowConfig) {
    this.scene = scene;
    this.worldY = rowConfig.worldY;
    this.resolved = false;

    this.leftGate = new Gate(scene, { ...rowConfig.leftGate, side: 'left', x: 140, y: this.worldY });
    this.rightGate = new Gate(scene, { ...rowConfig.rightGate, side: 'right', x: 340, y: this.worldY });
  }

  update(scrollOffset) {
    const y = this.worldY + scrollOffset;
    this.leftGate.updatePosition(y);
    this.rightGate.updatePosition(y);
  }

  resolveChoice(playerX, onApply) {
    if (this.resolved) return;
    const chosen = playerX < 240 ? this.leftGate : this.rightGate;

    if (chosen.isActive && !chosen.applied) {
      chosen.applied = true;
      onApply(chosen);
    }

    this.resolved = true;
    this.destroy();
  }

  isOffscreen() {
    return this.leftGate.container.y > 920;
  }

  destroy() {
    this.leftGate.destroy();
    this.rightGate.destroy();
  }
}
