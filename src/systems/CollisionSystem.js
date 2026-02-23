export class CollisionSystem {
  constructor(scene, bulletGroup, gateGroup, moneyGroup, onGateHit, onMoneyHit) {
    scene.physics.add.overlap(bulletGroup, gateGroup, (_b, _g) => {
      onGateHit(_b, _g);
    });

    scene.physics.add.overlap(bulletGroup, moneyGroup, (_b, _m) => {
      onMoneyHit(_b, _m);
    });
  }
}
