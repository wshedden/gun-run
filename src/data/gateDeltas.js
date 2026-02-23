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
  const magnitude = Math.abs(delta);
  if (statType === 'fireRate') {
    if (magnitude >= 3) return GATE_HITS.hard;
    if (magnitude >= 2) return GATE_HITS.medium;
    return GATE_HITS.easy;
  }

  if (statType === 'power') {
    if (magnitude >= 2) return GATE_HITS.medium;
    return GATE_HITS.easy;
  }

  if (magnitude >= 180) return GATE_HITS.hard;
  if (magnitude >= 120) return GATE_HITS.medium;
  return GATE_HITS.easy;
}
