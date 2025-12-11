# Block Battle

Arcade-style browser tank arena inspired by Diep.io. Pick a class, level up, and blast blocks/bots to unlock new cannons and passives.

## Play game on the web
https://tanveersinghd.github.io/BlockBattle/

## Features
- Difficulty & class selection with class-specific weapon trees (assault, spread, sniper, bruiser, flamethrower).
- Bots that level up offscreen to stay competitive and visibly mirror their unlocked cannons.
- Power-ups, mega-square boss spawns, burn effects for flamethrower, and admin panel for quick boosts.
- Modular JS code split into spawns, rendering, weapons, upgrades, powerups, and utilities.

## Controls
- Move: WASD / Arrow keys
- Aim: Mouse
- Fire: Mouse click (or toggle Auto Shoot button)
- Upgrades: Keys 1–6 when you have upgrade points
- Exit to menu: Bottom-right Exit button

## Run
- Simply open `index.html` in a modern browser. No build step required.

## Files of interest
- `src/main.js` – game loop, input, upgrades, and orchestration.
- `src/render.js` – all canvas drawing.
- `src/spawns.js` – block/powerup/bot/mega spawning and bot templates.
- `src/weapons.js`, `src/upgrades.js`, `src/powerups.js`, `src/constants.js` – gameplay data/config.
- `src/utils.js`, `src/barrels.js` – helpers and barrel geometry.

## Mechanics at a glance
- Max level 60; upgrade points awarded until level 40 (scaled early game).
- Class-specific weapon unlocks every 5–10 levels; bots mirror class and cannon unlocks.
- Power-ups with cooldown, burn effects for flamethrower, and mega-square boss with difficulty-scaled HP.
- Admin panel to grant upgrades or XP boosts for testing/balancing.
