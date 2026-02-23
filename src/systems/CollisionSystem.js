export class CollisionSystem {
  constructor(scene, bullets, gates, moneyBlocks, onGateHit, onMoneyDestroy) {
    this.scene = scene;

    scene.physics.add.overlap(bullets, gates, (_b, gate) => {
      if (!_b.active || !gate.active) return;
      onGateHit(_b, gate);
    });

    scene.physics.add.overlap(bullets, moneyBlocks, (_b, block) => {
      if (!_b.active || !block.active) return;
      onMoneyDestroy(_b, block);
    });
  }
}
