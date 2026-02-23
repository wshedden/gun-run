# Gun Runner + Upgrade Gates MVP

A browser-playable hyper-casual inspired runner prototype built with **Vite + Phaser 3 + JavaScript**.

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

- **Mouse/touch drag**: Move gun left/right
- **Keyboard fallback**: `A/D` or `←/→`
- **P**: Pause/unpause run
- Shooting is fully automatic.

## MVP Features

- Auto-scrolling lane corridor
- Auto-fire gun with upgradable stats (`fireRate`, `power`, `range`)
- Gate pairs with hit-to-activate logic and full-only application
- Guaranteed positive option in every gate pair
- Mid-level and final-zone money blocks with HP and cash rewards
- HUD with stats + cash + level progress
- Results screen with final stats and Play Again restart

## Tuning Cheatsheet

- **Gate deltas**: `src/data/gateDeltas.js`
- **Level length and shape**: `src/data/levelMVP.js` and `src/systems/LevelBuilder.js`
- **Starting stats**: `src/data/levelMVP.js` (`startStats`)
- **Scroll speed**: `src/data/levelMVP.js` (`scrollSpeed`)
- **Money block HP/reward scaling**: `src/systems/LevelBuilder.js` (money block `hp` and `rewardMultiplier`)

## File Tree

```text
.
├── index.html
├── package.json
├── README.md
└── src
    ├── data
    │   ├── gateDeltas.js
    │   └── levelMVP.js
    ├── entities
    │   ├── Bullet.js
    │   ├── Gate.js
    │   ├── GatePair.js
    │   ├── MoneyBlock.js
    │   └── PlayerGun.js
    ├── game
    │   └── config.js
    ├── main.js
    ├── scenes
    │   ├── BootScene.js
    │   └── GameScene.js
    ├── systems
    │   ├── AutoFireSystem.js
    │   ├── CollisionSystem.js
    │   ├── LevelBuilder.js
    │   └── StatSystem.js
    └── utils
        ├── format.js
        └── random.js
```
