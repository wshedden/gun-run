export const STAT_LABELS = {
  fireRate: 'FIRE RATE',
  power: 'POWER',
  range: 'RANGE'
};

export function formatCash(value) {
  return `$${Math.round(value)}`;
}

export function formatGateDelta(statType, delta) {
  const prefix = delta > 0 ? '+' : '';
  return `${prefix}${delta} ${STAT_LABELS[statType]}`;
}
