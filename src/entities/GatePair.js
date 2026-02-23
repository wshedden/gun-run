import Phaser from 'phaser';
import { Gate } from './Gate.js';

export class GatePair {
  constructor(scene, y, leftData, rightData, laneWidth) {
    this.scene = scene;
    this.y = y;
    this.resolved = false;
    this.lineY = y + 70;

    const leftX = scene.scale.width * 0.5 - laneWidth * 0.7;
    const rightX = scene.scale.width * 0.5 + laneWidth * 0.7;

    this.left = new Gate(scene, leftX, y, laneWidth, leftData);
    this.right = new Gate(scene, rightX, y, laneWidth, rightData);

    this.leftLaneRect = new Phaser.Geom.Rectangle(leftX - laneWidth * 0.5, y - 59, laneWidth, 118);
    this.rightLaneRect = new Phaser.Geom.Rectangle(rightX - laneWidth * 0.5, y - 59, laneWidth, 118);
  }

  update(scrollDelta) {
    this.left.y += scrollDelta;
    this.right.y += scrollDelta;
    this.lineY += scrollDelta;
    this.leftLaneRect.y += scrollDelta;
    this.rightLaneRect.y += scrollDelta;
  }

  resolve(playerX) {
    if (this.resolved) return null;
    this.resolved = true;
    const chooseLeft = Math.abs(playerX - this.left.x) <= Math.abs(playerX - this.right.x);
    const chosen = chooseLeft ? this.left : this.right;
    const ignored = chooseLeft ? this.right : this.left;
    const effect = chosen.resolvePassThrough();
    ignored.isResolved = true;
    ignored.setAlpha(0.25);
    return { effect, chosen, ignored };
  }

  destroy() {
    this.left.destroyGate();
    this.right.destroyGate();
  }
}
