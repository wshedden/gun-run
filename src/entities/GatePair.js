export class GatePair {
  constructor(leftGate, rightGate, z) {
    this.leftGate = leftGate;
    this.rightGate = rightGate;
    this.z = z;
    this.resolved = false;
  }

  gates() {
    return [this.leftGate, this.rightGate];
  }

  destroyAll() {
    this.leftGate?.destroyGate();
    this.rightGate?.destroyGate();
  }
}
