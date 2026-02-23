export const GATE_DELTAS = {
  fireRate: [2, 4, 6, -1, -2],
  power: [1, 2, 4, -1],
  range: [80, 160, 260, -80, -140]
};

export const GATE_HITS = {
  easy: 4,
  medium: 6,
  hard: 8
};

export function requiredHitsForDelta(statType, delta) {
  const abs = Math.abs(delta);
  if (statType === 'fireRate') {
    if (abs >= 6) return GATE_HITS.hard;
    if (abs >= 4) return GATE_HITS.medium;
    return GATE_HITS.easy;
  }

  if (statType === 'power') {
    if (abs >= 4) return GATE_HITS.hard;
    if (abs >= 2) return GATE_HITS.medium;
    return GATE_HITS.easy;
  }

  if (abs >= 260) return GATE_HITS.hard;
  if (abs >= 160) return GATE_HITS.medium;
  return GATE_HITS.easy;
}
