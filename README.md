# Gun Runner + Upgrade Gates (MVP)

A local browser MVP inspired by hyper-casual **gun runner + upgrade gates** gameplay, built with **Vite + Phaser 3 + JavaScript**.

## Setup

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Controls

- **Mouse / Touch drag:** move gun left/right
- **Keyboard fallback:** `A` / `D` or `←` / `→`
- **Pause (optional):** `P`
- Gun firing is **automatic** (no fire button)

## MVP Features

- Auto-runner flow with downward-scrolling track and fixed player near screen bottom
- Continuous auto-fire with fire-rate dependent cadence
- Three mutable stats with clamping:
  - `fireRate` (shots/sec)
  - `power` (damage)
  - `range` (bullet distance)
- Gate pairs with hit-to-activate logic and readable labels/progress bars
- Pair generation guarantees at least one positive gate in every row
- Shootable money blocks that award cash on destruction
- Final bonus cash section + end-of-level results overlay
- Clean restart via **Play Again** with full reset of stats/cash/objects/timers

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
    MenuScene.js
    UIScene.js
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

- **Gate delta pools:** `src/data/gateDeltas.js`
- **Level length / gate count / section spacing / scroll speed:** `src/data/levelMVP.js`
- **Starting stats + clamps:** `src/data/gateDeltas.js`
- **Scroll speed:** `LEVEL_SETTINGS.scrollSpeed` in `src/data/levelMVP.js`
- **Money HP/reward scaling:** `src/data/levelMVP.js` (`MID_MONEY_BLOCKS`, `FINAL_CASH_BLOCKS`, `MONEY_VALUE_MULTIPLIER`)

## Notes

- No copyrighted/trademarked assets are used.
- Visuals are geometric shapes and text only.
