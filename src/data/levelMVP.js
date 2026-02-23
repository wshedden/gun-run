export const LEVEL_MVP = {
  seed: 1337,
  scrollSpeed: 145,
  gateCount: 8,
  introDistance: 260,
  gateSpacing: 260,
  moneyBetweenRows: [
    { afterGateIndex: 1, lane: -1, hp: 6 },
    { afterGateIndex: 3, lane: 1, hp: 8 },
    { afterGateIndex: 4, lane: 0, hp: 10 },
    { afterGateIndex: 6, lane: -0.45, hp: 12 }
  ],
  finalZoneDistance: 500,
  finalMoneyBlocks: [
    { lane: -1, hp: 8 },
    { lane: -0.35, hp: 10 },
    { lane: 0.35, hp: 12 },
    { lane: 1, hp: 12 }
  ]
};
