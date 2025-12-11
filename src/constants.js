export const MAX_LEVEL = 60;
export const TOKEN_LEVEL_CAP = 40;

export const BASE_SPEED = 320;
export const BASE_DRAG = 0.98;
export const BASE_BULLET_SPEED = 780;
export const BASE_BULLET_LIFE = 1.6;
export const BASE_RELOAD = 0.38;

export const FLAME_BASE_RANGE_BLOCKS = 4;
export const FLAME_MAX_RANGE_BLOCKS = 7;
export const FLAME_SPEED = 520;
export const FLAME_SPREAD = 0.16;
export const FLAME_BURN_DURATION = 2.2;
export const POWERUP_COOLDOWN = 10;

export const difficulties = {
  easy: {
    worldSize: 2600,
    blockCount: 80,
    bots: {
      count: 4,
      speed: 210,
      damage: 18,
      reload: 1.2,
      health: 100,
      bulletSpeed: 540,
      aggroRange: 280,
    },
  },
  medium: {
    worldSize: 3200,
    blockCount: 95,
    bots: {
      count: 7,
      speed: 230,
      damage: 22,
      reload: 1.0,
      health: 130,
      bulletSpeed: 620,
      aggroRange: 300,
    },
  },
  hard: {
    worldSize: 3800,
    blockCount: 110,
    bots: {
      count: 10,
      speed: 260,
      damage: 28,
      reload: 0.9,
      health: 160,
      bulletSpeed: 700,
      aggroRange: 320,
    },
  },
};

export const classes = {
  assault: { name: "Assault", description: "Balanced cannons with sustained fire." },
  sniper: { name: "Sniper", description: "High damage rails and lances." },
  spread: { name: "Spread", description: "Wide spreads and close-range storms." },
  bruiser: { name: "Bruiser", description: "Heavy cannons and tanky volleys." },
  flamethrower: { name: "Flamethrower", description: "Short-range fire that scales distance." },
};
