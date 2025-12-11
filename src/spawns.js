import { randomPosition, rand } from "./utils.js";

export function createBlock(world, player) {
  const roll = Math.random();
  const type =
    roll > 0.8
      ? { size: 44, health: 120, xp: 45, color: "#f7d154" }
      : roll > 0.4
      ? { size: 32, health: 70, xp: 24, color: "#f4ad47" }
      : { size: 22, health: 40, xp: 14, color: "#e7893a" };
  const margin = 120;
  let pos = {
    x: rand(margin, world.size - margin - type.size),
    y: rand(margin, world.size - margin - type.size),
  };
  let attempts = 0;
  while (attempts < 10) {
    const dx = pos.x - player.pos.x;
    const dy = pos.y - player.pos.y;
    if (Math.hypot(dx, dy) > 220) break;
    pos = {
      x: rand(margin, world.size - margin - type.size),
      y: rand(margin, world.size - margin - type.size),
    };
    attempts += 1;
  }
  return { ...type, pos, maxHealth: type.health, burnTime: 0, burnDps: 0, burnOwnerRef: null };
}

export function seedBlocks(world, player, count) {
  world.blocks = [];
  for (let i = 0; i < count; i += 1) {
    world.blocks.push(createBlock(world, player));
  }
}

export function createPowerup(world, player, powerupTypes) {
  const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
  const size = 18;
  const margin = 120;
  let pos = {
    x: rand(margin, world.size - margin - size),
    y: rand(margin, world.size - margin - size),
  };
  let attempts = 0;
  while (attempts < 10) {
    const dx = pos.x - player.pos.x;
    const dy = pos.y - player.pos.y;
    if (Math.hypot(dx, dy) > 200) break;
    pos = { x: rand(margin, world.size - margin - size), y: rand(margin, world.size - margin - size) };
    attempts += 1;
  }
  return { ...type, pos, size };
}

export function seedPowerups(world, player, powerupTypes) {
  world.powerups = [];
  for (let i = 0; i < 6; i += 1) {
    world.powerups.push(createPowerup(world, player, powerupTypes));
  }
}

export function createMegaBlock(world, config, avoid = []) {
  const health = config.worldSize === 2600 ? 10000 : config.worldSize === 3200 ? 30000 : 50000;
  const size = 160;
  const pos = randomPosition(world.size, size, 200, avoid);
  return {
    size,
    pos,
    health,
    maxHealth: health,
    xp: Math.floor(health / 5),
    color: "#d14af0",
    burnTime: 0,
    burnDps: 0,
    burnOwnerRef: null,
  };
}

export function createBot(world, player, config, avoid = []) {
  const pos = randomPosition(world.size, 44, 180, [
    { pos: player.pos, radius: player.radius },
    ...avoid.map((b) => ({ pos: b.pos, radius: b.radius })),
  ]);
  return {
    pos,
    vel: { x: 0, y: 0 },
    radius: 22,
    speed: config.speed,
    drag: 0.97,
    health: config.health,
    maxHealth: config.health,
    regen: 2.5,
    reload: config.reload,
    fireTimer: 0,
    bulletSpeed: config.bulletSpeed,
    bulletLife: 1.4,
    bulletSize: 9,
    bulletDamage: config.damage,
    recoil: 0.14,
    strafe: rand(-0.6, 0.6),
    aiTimer: rand(0.8, 1.6),
    level: 1,
    xp: 0,
    upgradePoints: 0,
    upgrades: { damage: 0, reload: 0, mobility: 0, defense: 0 },
    aimAngle: 0,
    orbitDir: Math.random() > 0.5 ? 1 : -1,
    burnTime: 0,
    burnDps: 0,
    burnOwnerRef: null,
    moveDir: { x: 0, y: 0 },
    targetRef: null,
    targetType: null,
  };
}

export function spawnBots(world, player, botCfg) {
  world.bots = [];
  if (!botCfg) return;
  for (let i = 0; i < botCfg.count; i += 1) {
    world.bots.push(createBot(world, player, botCfg, world.bots));
  }
}
