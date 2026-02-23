import { GATE_DELTAS, requiredHitsForDelta } from '../data/gateDeltas.js';
import { LEVEL_MVP } from '../data/levelMVP.js';
import { SeededRandom } from '../utils/random.js';

export class LevelBuilder {
  constructor(scene) {
    this.scene = scene;
    this.random = new SeededRandom(LEVEL_MVP.seed);
  }

  build() {
    const plan = {
      gateRows: [],
      moneyBlocks: [],
      endLineY: 0,
      totalDistance: 0
    };

    let cursorY = -LEVEL_MVP.introDistance;

    for (let i = 0; i < LEVEL_MVP.gateCount; i += 1) {
      const left = this.createGateData();
      let right = this.createGateData();

      if (left.delta <= 0 && right.delta <= 0) {
        right = this.createGateData(true);
      }

      plan.gateRows.push({ y: cursorY, left, right, index: i + 1 });

      const moneyConfig = LEVEL_MVP.moneyBetweenRows.find((item) => item.afterGateIndex === i);
      if (moneyConfig) {
        plan.moneyBlocks.push({
          y: cursorY - LEVEL_MVP.gateSpacing * 0.5,
          lane: moneyConfig.lane,
          hp: moneyConfig.hp
        });
      }

      cursorY -= LEVEL_MVP.gateSpacing;
    }

    const finalStart = cursorY - LEVEL_MVP.finalZoneDistance * 0.2;
    LEVEL_MVP.finalMoneyBlocks.forEach((block, index) => {
      plan.moneyBlocks.push({
        y: finalStart - index * 135,
        lane: block.lane,
        hp: block.hp,
        isFinal: true
      });
    });

    plan.endLineY = finalStart - LEVEL_MVP.finalZoneDistance;
    plan.totalDistance = Math.abs(plan.endLineY) + 300;
    return plan;
  }

  createGateData(forcePositive = false) {
    const statType = this.random.pick(Object.keys(GATE_DELTAS));
    let delta = this.random.pick(GATE_DELTAS[statType]);

    if (forcePositive && delta <= 0) {
      const positives = GATE_DELTAS[statType].filter((d) => d > 0);
      delta = this.random.pick(positives);
    }

    return {
      statType,
      delta,
      requiredHits: requiredHitsForDelta(statType, delta)
    };
  }
}
