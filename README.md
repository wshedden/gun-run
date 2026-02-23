# Gun Runner + Upgrade Gates (MVP)

A browser-playable hyper-casual inspired runner prototype built with **Phaser 3 + Vite + JavaScript**.

## Features

- Infinite auto-forward runner flow (world scrolls forever)
- Mouse/touch position controls horizontal movement (no drag required)
- Continuous auto-fire controlled by `fireRate`
- Gate pairs that modify exactly three mutable stats:
  - `fireRate`
  - `power`
  - `range`
- Gate hit requirements (`4`, `6`, `8`) with **stacked activations** per gate (e.g. `x3` means triple effect)
- No upper cap on positive stat growth (`fireRate`/`power` can keep scaling)
- Rule-enforced gate generation where every pair has at least one positive gate
- Money blocks with HP and cash rewards on destruction
- Infinite row spawning with deterministic seeded generation

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

- **Move mouse/finger horizontally**: Gun follows pointer X position
- **P**: Pause toggle
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
- **Spawn spacing/scroll speed**: edit `src/data/levelMVP.js`
- **Starting stats + minimum bounds**: edit `src/systems/StatSystem.js`
- **Money block rewards**: edit multipliers in `src/systems/LevelBuilder.js` and `src/entities/MoneyBlock.js`

## Notes

- Visuals use only primitive shapes/text labels (no external copyrighted assets).
- Level generation uses seeded deterministic randomness for reproducible runs.
