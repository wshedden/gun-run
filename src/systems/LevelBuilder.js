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
    this.rowCounter = 0;
    this.spawnDistance = levelConfig.introDistance;
    this.statCycle = ['fireRate', 'power', 'range'];
  }

  buildInitial(gateGroup, moneyGroup, rows = 8) {
    const gatePairs = [];
    for (let i = 0; i < rows; i += 1) {
      gatePairs.push(this.spawnNextRow(gateGroup, moneyGroup));
    }
    return gatePairs;
  }

  spawnNextRow(gateGroup, moneyGroup) {
    const i = this.rowCounter;
    this.rowCounter += 1;

    const statA = this.statCycle[i % this.statCycle.length];
    const statB = this.statCycle[(i + 1) % this.statCycle.length];

    const leftOption = this.makeGateOption(statA);
    const rightOption = this.makeGateOption(statB);

    if (leftOption.delta <= 0 && rightOption.delta <= 0) {
      rightOption.delta = Math.abs(rightOption.delta) || 1;
    }

    leftOption.requiredHits = requiredHitsForDelta(leftOption.statType, leftOption.delta);
    rightOption.requiredHits = requiredHitsForDelta(rightOption.statType, rightOption.delta);

    const y = -this.spawnDistance;
    const leftGate = new Gate(this.scene, { ...leftOption, x: TRACK.leftGateX, y, rowIndex: i + 1 });
    const rightGate = new Gate(this.scene, { ...rightOption, x: TRACK.rightGateX, y, rowIndex: i + 1 });
    gateGroup.add(leftGate);
    gateGroup.add(rightGate);

    const pair = new GatePair(leftGate, rightGate, y, i + 1);

    this.spawnDistance += this.levelConfig.gateSpacing;

    if (i % 2 === 1) {
      const moneyHpOptions = [6, 8, 10, 12, 14, 16, 18];
      const hp = pick(this.rand, moneyHpOptions);
      const x = TRACK.midLaneX[Math.floor(this.rand() * TRACK.midLaneX.length)];
      const money = new MoneyBlock(this.scene, x, -(this.spawnDistance - 140), hp, 6 + Math.floor(i / 6));
      moneyGroup.add(money);
    }

    return pair;
  }

  makeGateOption(statType) {
    const delta = pick(this.rand, GATE_DELTAS[statType]);
    return { statType, delta, requiredHits: 4 };
  }
}
