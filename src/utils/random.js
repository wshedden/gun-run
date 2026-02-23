export function createSeededRandom(seed = 1) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function pickOne(random, list) {
  return list[Math.floor(random() * list.length)];
}
