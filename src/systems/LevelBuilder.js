import { gateDeltas } from '../data/gateDeltas';
import { levelMVP } from '../data/levelMVP';
import { createSeededRandom, pickOne } from '../utils/random';

const hitRequirement = (statType, delta) => {
  const magnitude = Math.abs(delta);
  if (statType === 'fireRate') return magnitude >= 3 ? 8 : magnitude >= 2 ? 6 : 4;
  if (statType === 'power') return magnitude >= 2 ? 6 : 4;
  if (statType === 'range') return magnitude >= 180 ? 8 : magnitude >= 120 ? 6 : 4;
  return 4;
};

const randomGate = (random, forcePositive = false) => {
  const statType = pickOne(random, ['fireRate', 'power', 'range']);
  const pool = gateDeltas[statType].filter((delta) => (forcePositive ? delta > 0 : true));
  const delta = pickOne(random, pool);
  return {
    statType,
    delta,
    requiredHits: hitRequirement(statType, delta)
  };
};

export function buildLevel() {
  const random = createSeededRandom(levelMVP.seed);
  const gateRows = [];
  const moneyBlocks = [];
  let cursorY = -levelMVP.introDistance;

  for (let i = 0; i < levelMVP.gatePairs; i += 1) {
    cursorY -= levelMVP.gateSpacing;
    let leftGate = randomGate(random);
    let rightGate = randomGate(random);

    if (leftGate.delta <= 0 && rightGate.delta <= 0) {
      if (random() < 0.5) leftGate = randomGate(random, true);
      else rightGate = randomGate(random, true);
    }

    gateRows.push({ worldY: cursorY, leftGate, rightGate });

    if (i % 2 === 1) {
      moneyBlocks.push({
        worldY: cursorY - levelMVP.midMoneySpacing / 2,
        x: random() < 0.5 ? 170 : 310,
        hp: [6, 8, 10, 12][Math.floor(random() * 4)],
        rewardMultiplier: 6
      });
    }
  }

  cursorY -= 240;
  const finalHP = [8, 10, 12, 12, 14];
  for (let i = 0; i < levelMVP.finalMoneyCount; i += 1) {
    cursorY -= levelMVP.finalMoneySpacing;
    moneyBlocks.push({
      worldY: cursorY,
      x: 110 + i * 85,
      hp: finalHP[i],
      rewardMultiplier: 10
    });
  }

  const endLineY = cursorY - levelMVP.endPadding;

  return {
    gateRows,
    moneyBlocks,
    endLineY,
    totalDistance: Math.abs(endLineY) + 200
  };
}
