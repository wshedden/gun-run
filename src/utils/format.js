export const formatStat = (statKey, value) => {
  if (statKey === 'fireRate') return value.toFixed(1);
  return `${Math.round(value)}`;
};

export const formatSigned = (value) => (value >= 0 ? `+${value}` : `${value}`);
