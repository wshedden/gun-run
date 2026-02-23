export class CollisionSystem {
  constructor(scene, bullets, gatePanels, moneyPanels, onGateHit, onMoneyHit) {
    this.scene = scene;
    scene.physics.add.overlap(bullets, gatePanels, (bullet, panel) => {
      onGateHit(bullet, panel.gateRef);
    });

    scene.physics.add.overlap(bullets, moneyPanels, (bullet, panel) => {
      onMoneyHit(bullet, panel.moneyRef);
    });
  }
}
