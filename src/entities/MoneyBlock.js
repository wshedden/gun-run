import Phaser from 'phaser';

export class MoneyBlock extends Phaser.GameObjects.Container {
  constructor(scene, x, y, hp) {
    super(scene, x, y);
    this.scene = scene;
    this.maxHp = hp;
    this.hp = hp;
    this.reward = hp * 5;

    this.bodyRect = scene.add.rectangle(0, 0, 92, 70, 0xaf8f1a).setStrokeStyle(3, 0xffe083);
    this.label = scene.add.text(0, -6, '$', {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: '#fff8d9'
    }).setOrigin(0.5);
    this.hpText = scene.add.text(0, 20, `${hp} HP`, {
      fontFamily: 'Arial',
      fontSize: '17px',
      color: '#fff1b8'
    }).setOrigin(0.5);

    this.add([this.bodyRect, this.label, this.hpText]);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setSize(92, 70);
    this.body.setImmovable(true);
  }

  hit(damage) {
    this.hp -= damage;
    this.hpText.setText(`${Math.max(0, Math.ceil(this.hp))} HP`);
    this.scene.tweens.add({ targets: this.bodyRect, alpha: 0.4, duration: 45, yoyo: true });
    return this.hp <= 0;
  }
}
