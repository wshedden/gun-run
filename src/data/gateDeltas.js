export const GATE_DELTA_TABLE = {
  fireRate: [1, 2, 3, -1, -2],
  power: [1, 2, -1],
  range: [60, 120, 180, -60, -120],
};

export const STARTING_STATS = {
  fireRate: 4,
  power: 1,
  range: 420,
};

export const STAT_CLAMPS = {
  fireRate: { min: 1, max: 30 },
  power: { min: 1, max: 50 },
  range: { min: 150, max: 1200 },
};

export const EASY_HITS = 4;
export const MEDIUM_HITS = 6;
export const HARD_HITS = 8;

export function requiredHitsFor(statType, delta) {
  const magnitude = Math.abs(delta);
  if (statType === 'fireRate') {
    if (magnitude >= 3) return HARD_HITS;
    if (magnitude >= 2) return MEDIUM_HITS;
    return EASY_HITS;
  }

  if (statType === 'power') {
    if (magnitude >= 2) return MEDIUM_HITS;
    return EASY_HITS;
  }

  if (statType === 'range') {
    if (magnitude >= 180) return HARD_HITS;
    if (magnitude >= 120) return MEDIUM_HITS;
    return EASY_HITS;
  }

  return EASY_HITS;
}
