import Phaser from 'phaser';

export class MoneyBlock extends Phaser.GameObjects.Container {
  constructor(scene, x, y, hp, cashReward) {
    super(scene, x, y);
    this.hp = hp;
    this.maxHp = hp;
    this.cashReward = cashReward;

    this.bodyRect = scene.add.rectangle(0, 0, 84, 56, 0xd4a735, 0.9).setStrokeStyle(3, 0xffef9c, 1);
    this.label = scene.add.text(0, -4, '$', {
      fontFamily: 'Arial Black',
      fontSize: '30px',
      color: '#201505',
    }).setOrigin(0.5);
    this.hpText = scene.add.text(0, 22, `${this.hp} HP`, {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#1b1202',
      stroke: '#fff7dd',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.add([this.bodyRect, this.label, this.hpText]);
    scene.add.existing(this);

    scene.physics.add.existing(this.bodyRect, true);
    this.body = this.bodyRect.body;
    this.bodyRect.moneyRef = this;
  }

  updateScroll(deltaY) {
    this.y += deltaY;
    this.bodyRect.y = this.y;
    this.bodyRect.x = this.x;
  }

  applyDamage(damage) {
    this.hp -= damage;
    this.hpText.setText(`${Math.max(0, Math.ceil(this.hp))} HP`);
    this.scene.tweens.add({
      targets: this.bodyRect,
      scaleX: 1.07,
      scaleY: 1.07,
      duration: 50,
      yoyo: true,
    });

    if (this.hp <= 0) {
      return true;
    }
    return false;
  }

  destroyBlock() {
    this.bodyRect.destroy();
    this.destroy();
  }
}
