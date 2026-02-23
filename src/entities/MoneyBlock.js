export class MoneyBlock {
  constructor(scene, config) {
    this.scene = scene;
    this.worldY = config.worldY;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.reward = config.reward;
    this.destroyed = false;

    this.container = scene.add.container(config.x, this.worldY);
    this.rect = scene.add.rectangle(0, 0, 90, 66, 0xd3af3d, 0.95).setStrokeStyle(3, 0xffe08b);
    this.icon = scene.add.text(0, -8, '$', { fontSize: '28px', color: '#2a2200', fontStyle: 'bold' }).setOrigin(0.5);
    this.hpText = scene.add.text(0, 20, `HP ${this.hp}`, {
      fontSize: '15px',
      color: '#2a2200',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.container.add([this.rect, this.icon, this.hpText]);
  }

  update(scrollOffset) {
    this.container.y = this.worldY + scrollOffset;
  }

  getBounds() {
    return this.rect.getBounds();
  }

  takeDamage(amount) {
    if (this.destroyed) return false;
    this.hp -= amount;
    this.hpText.setText(`HP ${Math.max(0, Math.ceil(this.hp))}`);
    this.scene.tweens.add({ targets: this.rect, scaleX: 1.06, scaleY: 1.06, duration: 50, yoyo: true });

    if (this.hp <= 0) {
      this.destroyed = true;
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1.25,
        scaleY: 1.25,
        alpha: 0,
        duration: 120,
        onComplete: () => this.container.destroy(true)
      });
      return true;
    }

    return false;
  }
}
