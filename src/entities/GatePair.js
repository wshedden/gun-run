export class GatePair {
  constructor(leftGate, rightGate, y, index) {
    this.leftGate = leftGate;
    this.rightGate = rightGate;
    this.y = y;
    this.index = index;
    this.resolved = false;
  }

  getChosenGate(playerX) {
    return playerX < 240 ? this.leftGate : this.rightGate;
  }

  getOtherGate(playerX) {
    return playerX < 240 ? this.rightGate : this.leftGate;
  }
}
