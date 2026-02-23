import { Gate } from '../entities/Gate';
import { GatePair } from '../entities/GatePair';
import { MoneyBlock } from '../entities/MoneyBlock';
import { GATE_DELTAS, requiredHitsForDelta } from '../data/gateDeltas';
import { pick, createSeededRandom } from '../utils/random';

const TRACK = {
  leftGateX: 140,
  rightGateX: 340,
  midLaneX: [120, 240, 360]
};

export class LevelBuilder {
  constructor(scene, levelConfig) {
    this.scene = scene;
    this.levelConfig = levelConfig;
    this.rand = createSeededRandom(levelConfig.seed);
    this.rowIndex = 0;
    this.nextRowDistance = levelConfig.introDistance;
    this.statCycle = ['fireRate', 'power', 'range'];
    this.moneyHpCycle = [...levelConfig.midMoneyBlocks, ...levelConfig.finalMoneyBlocks];
    this.moneyCycleIndex = 0;
  }

  spawnUntilDistance(targetDistance, gateGroup, moneyGroup, gatePairs) {
    while (this.nextRowDistance < targetDistance) {
      this.spawnRow(gateGroup, moneyGroup, gatePairs);
      this.nextRowDistance += this.levelConfig.gateSpacing;
    }
  }

  spawnRow(gateGroup, moneyGroup, gatePairs) {
    const i = this.rowIndex;
    const statA = this.statCycle[i % this.statCycle.length];
    const statB = this.statCycle[(i + 1) % this.statCycle.length];

    const leftOption = this.makeGateOption(statA);
    const rightOption = this.makeGateOption(statB);

    // Non-negotiable rule: never both negative.
    if (leftOption.delta <= 0 && rightOption.delta <= 0) {
      rightOption.delta = Math.abs(rightOption.delta) || 1;
    }

    leftOption.requiredHits = requiredHitsForDelta(leftOption.statType, leftOption.delta);
    rightOption.requiredHits = requiredHitsForDelta(rightOption.statType, rightOption.delta);

    const y = -this.nextRowDistance;
    const leftGate = new Gate(this.scene, { ...leftOption, x: TRACK.leftGateX, y, rowIndex: i + 1 });
    const rightGate = new Gate(this.scene, { ...rightOption, x: TRACK.rightGateX, y, rowIndex: i + 1 });
    gateGroup.add(leftGate);
    gateGroup.add(rightGate);
    gatePairs.push(new GatePair(leftGate, rightGate, y, i + 1));

    // Place money blocks between every second row to keep a steady economy in endless mode.
    if (i % 2 === 1) {
      const hp = this.moneyHpCycle[this.moneyCycleIndex % this.moneyHpCycle.length];
      this.moneyCycleIndex += 1;
      const x = TRACK.midLaneX[Math.floor(this.rand() * TRACK.midLaneX.length)];
      const money = new MoneyBlock(this.scene, x, -(this.nextRowDistance + 180), hp, 7);
      moneyGroup.add(money);
    }

    this.rowIndex += 1;
  }

  makeGateOption(statType) {
    const delta = pick(this.rand, GATE_DELTAS[statType]);
    return { statType, delta, requiredHits: 4 };
  }
}
