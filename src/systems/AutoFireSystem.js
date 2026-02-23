export class AutoFireSystem {
  constructor(scene, statSystem, fireFn) {
    this.scene = scene;
    this.statSystem = statSystem;
    this.fireFn = fireFn;
    this.timer = null;

    this.statSystem.on('changed', () => this.refresh());
  }

  start() {
    this.refresh();
  }

  refresh() {
    if (this.timer) {
      this.timer.remove(false);
      this.timer = null;
    }

    const fireRate = this.statSystem.get('fireRate');
    const delay = 1000 / fireRate;

    this.timer = this.scene.time.addEvent({
      delay,
      loop: true,
      callback: () => this.fireFn()
    });
  }

  stop() {
    if (this.timer) {
      this.timer.remove(false);
      this.timer = null;
    }
  }
}
