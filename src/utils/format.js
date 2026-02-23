export function formatStatLabel(statType) {
  if (statType === 'fireRate') return 'FIRE RATE';
  if (statType === 'power') return 'POWER';
  return 'RANGE';
}

export function formatGateEffect(statType, delta) {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta} ${formatStatLabel(statType)}`;
}

export function formatMoney(value) {
  return `$${Math.round(value)}`;
}
