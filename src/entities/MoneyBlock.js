import Phaser from 'phaser';

export class MoneyBlock extends Phaser.GameObjects.Container {
  constructor(scene, x, y, hp, rewardMultiplier = 5) {
    super(scene, x, y);
    this.scene = scene;
    this.maxHp = hp;
    this.hp = hp;
    this.reward = hp * rewardMultiplier;

    this.bg = scene.add.rectangle(0, 0, 84, 64, 0xd4af37).setStrokeStyle(3, 0xffe88c);
    this.cashIcon = scene.add.text(0, -8, '$', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#1e1e1e',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.hpLabel = scene.add.text(0, 18, `${this.hp}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#1e1e1e',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add([this.bg, this.cashIcon, this.hpLabel]);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(84, 64);
    this.body.allowGravity = false;
    this.body.setImmovable(true);
  }

  receiveHit(damage) {
    this.hp -= damage;
    this.hpLabel.setText(`${Math.max(0, Math.ceil(this.hp))}`);
    this.scene.tweens.add({ targets: this, scaleX: 1.05, scaleY: 1.05, yoyo: true, duration: 60 });
    return this.hp <= 0;
  }
}
