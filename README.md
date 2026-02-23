# Gun Runner + Upgrade Gates (Infinite MVP)

A browser-playable hyper-casual inspired runner prototype built with **Phaser 3 + Vite + JavaScript**.

## Features

- Endless auto-forward runner flow (world scrolls continuously)
- Mouse/touch **position-follow** horizontal movement (no drag hold required)
- Continuous auto-fire controlled by `fireRate`
- Gate pairs that modify exactly three mutable stats:
  - `fireRate`
  - `power`
  - `range`
- Stackable gate rewards: gate effect multiplier is based on hit stacks (`hits / requiredHits`), e.g. `x2`, `x3`, etc.
- Rule-enforced gate generation where every pair has at least one positive gate
- Money blocks with HP and cash rewards on destruction
- Deterministic seeded procedural spawning for reproducible runs
- Uncapped stat growth upward (minimum clamps only)

## Setup

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite (usually `http://localhost:5173`).

## Build / Preview

```bash
npm run build
npm run preview
```

## Controls

- **Move mouse/touch left-right**: Gun follows pointer X position
- Shooting is always automatic; no fire button is needed.

## Project Structure

```text
src/
  data/
    gateDeltas.js
    levelMVP.js
  entities/
    Bullet.js
    Gate.js
    GatePair.js
    MoneyBlock.js
    PlayerGun.js
  game/
    config.js
  scenes/
    BootScene.js
    GameScene.js
  systems/
    AutoFireSystem.js
    CollisionSystem.js
    LevelBuilder.js
    StatSystem.js
  utils/
    format.js
    random.js
  main.js
```

## Tuning Guide

- **Gate deltas**: edit `src/data/gateDeltas.js`
- **Level pacing / scroll speed / spacing**: edit `src/data/levelMVP.js`
- **Starting stats + min clamps**: edit `src/systems/StatSystem.js`
- **Money block HP/rewards**:
  - HP lists in `src/data/levelMVP.js`
  - Reward multiplier in `src/entities/MoneyBlock.js` and `src/systems/LevelBuilder.js`

## Notes

- Visuals use only primitive shapes/text labels (no external copyrighted assets).
- Gate pairs are generated so that both sides are never negative at the same time.
