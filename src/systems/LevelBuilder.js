import { Gate } from '../entities/Gate';
import { GatePair } from '../entities/GatePair';
import { MoneyBlock } from '../entities/MoneyBlock';
import { GATE_DELTA_TABLE, requiredHitsFor } from '../data/gateDeltas';
import {
  GATE_ROW_COUNT,
  LEVEL_SETTINGS,
  MID_MONEY_BLOCKS,
  FINAL_CASH_BLOCKS,
  MONEY_VALUE_MULTIPLIER,
} from '../data/levelMVP';
import { makeRng } from '../utils/random';

const STAT_TYPES = ['fireRate', 'power', 'range'];

export class LevelBuilder {
  constructor(scene, playfield) {
    this.scene = scene;
    this.playfield = playfield;
    this.rng = makeRng(202411);
  }

  build() {
    const gatePairs = [];
    for (let i = 0; i < GATE_ROW_COUNT; i += 1) {
      const z = LEVEL_SETTINGS.introDistance + i * LEVEL_SETTINGS.gateRowSpacing;
      const pairData = this.makeGatePairData(i);

      const leftX = this.playfield.minX + (this.playfield.maxX - this.playfield.minX) * 0.28;
      const rightX = this.playfield.minX + (this.playfield.maxX - this.playfield.minX) * 0.72;
      const startY = -z;

      const leftGate = new Gate(this.scene, leftX, startY, { ...pairData.left, rowId: i, side: 'left' });
      const rightGate = new Gate(this.scene, rightX, startY, { ...pairData.right, rowId: i, side: 'right' });

      gatePairs.push(new GatePair(leftGate, rightGate, z));
    }

    const moneyBlocks = [];
    [...MID_MONEY_BLOCKS, ...FINAL_CASH_BLOCKS].forEach((entry) => {
      const x = this.playfield.minX + (this.playfield.maxX - this.playfield.minX) * entry.x;
      const y = -entry.z;
      const reward = entry.hp * MONEY_VALUE_MULTIPLIER;
      moneyBlocks.push(new MoneyBlock(this.scene, x, y, entry.hp, reward));
    });

    return {
      gatePairs,
      moneyBlocks,
      endDistance: LEVEL_SETTINGS.endLineDistance,
    };
  }

  makeGatePairData(index) {
    const preferredType = STAT_TYPES[index % STAT_TYPES.length];
    const secondaryType = STAT_TYPES[(index + 1) % STAT_TYPES.length];

    const left = this.randomGate(preferredType);
    const right = this.randomGate(secondaryType);

    if (left.delta <= 0 && right.delta <= 0) {
      if (this.rng.next() > 0.5) {
        left.delta = this.forcePositiveDelta(left.statType);
      } else {
        right.delta = this.forcePositiveDelta(right.statType);
      }
    }

    left.requiredHits = requiredHitsFor(left.statType, left.delta);
    right.requiredHits = requiredHitsFor(right.statType, right.delta);

    return { left, right };
  }

  randomGate(statType) {
    const delta = this.rng.pick(GATE_DELTA_TABLE[statType]);
    return { statType, delta, requiredHits: 4 };
  }

  forcePositiveDelta(statType) {
    const positives = GATE_DELTA_TABLE[statType].filter((v) => v > 0);
    return this.rng.pick(positives);
  }
}
