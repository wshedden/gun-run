export const GATE_DELTAS = {
  fireRate: [1, 2, 3, -1, -2],
  power: [1, 2, -1],
  range: [60, 120, 180, -60, -120]
};

export const GATE_HITS = {
  easy: 4,
  medium: 6,
  hard: 8
};

export function requiredHitsForDelta(statType, delta) {
  const abs = Math.abs(delta);
  if (statType === 'fireRate') {
    if (abs >= 3) return GATE_HITS.hard;
    if (abs >= 2) return delta > 0 ? GATE_HITS.medium : GATE_HITS.easy;
    return GATE_HITS.easy;
  }

  if (statType === 'power') {
    if (abs >= 2) return delta > 0 ? GATE_HITS.medium : GATE_HITS.easy;
    return GATE_HITS.easy;
  }

  if (abs >= 180) return GATE_HITS.hard;
  if (abs >= 120) return delta > 0 ? GATE_HITS.medium : GATE_HITS.easy;
  return GATE_HITS.easy;
}
