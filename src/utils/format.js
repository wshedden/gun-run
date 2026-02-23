export function formatStatLabel(statType) {
  if (statType === 'fireRate') return 'FIRE RATE';
  if (statType === 'power') return 'POWER';
  return 'RANGE';
}

export function formatDelta(statType, delta) {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta} ${formatStatLabel(statType)}`;
}
