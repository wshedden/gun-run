# Gun Runner + Upgrade Gates MVP

A local web MVP inspired by hyper-casual "gun runner + upgrade gate" gameplay. Built with **Node + Vite + Phaser 3** using only geometric shapes/text (no copyrighted assets).

## Setup

```bash
npm install
npm run dev
```

Then open the local Vite URL (usually `http://localhost:5173`).

### Production checks

```bash
npm run build
npm run preview
```

## Controls

- **Mouse/Touch drag**: move gun left/right only
- **Keyboard fallback**: `A/D` or `←/→`
- **Pause**: `P`
- Shooting is **automatic** (no shoot button)

## MVP Features

- Auto-forward runner model (world scrolls toward player)
- Continuous auto-fire with real-time fire-rate scaling
- 3 mutable stats with clamps:
  - `fireRate` (shots/sec)
  - `power` (damage)
  - `range` (bullet travel distance)
- Gate pairs with hit-to-activate logic and clear +/− labels
- Rule-enforced generation: every gate pair has at least one positive gate
- Money blocks between rows and in final end-zone bonus stretch
- Cash rewards, floating popups, and hit feedback
- HUD with cash, stats, and progress bar
- Results overlay with final stats and Play Again reset

## File Structure

```text
src/
  main.js
  game/config.js
  scenes/
    BootScene.js
    GameScene.js
    UIScene.js
  entities/
    PlayerGun.js
    Bullet.js
    Gate.js
    GatePair.js
    MoneyBlock.js
  systems/
    LevelBuilder.js
    AutoFireSystem.js
    StatSystem.js
    CollisionSystem.js
  data/
    gateDeltas.js
    levelMVP.js
  utils/
    random.js
    format.js
```

## Tuning Guide

- **Gate deltas**: edit `src/data/gateDeltas.js`
- **Level length/structure**: edit `src/data/levelMVP.js`
- **Starting stats + clamp limits**: edit `src/systems/StatSystem.js`
- **Scroll speed**: edit `scrollSpeed` in `src/data/levelMVP.js`
- **Money block HP/rewards**:
  - placement + HP in `src/data/levelMVP.js`
  - reward formula in `src/entities/MoneyBlock.js` (`reward = hp * 5`)
