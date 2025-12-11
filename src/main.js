import {
  BASE_BULLET_LIFE,
  BASE_BULLET_SPEED,
  BASE_DRAG,
  BASE_RELOAD,
  BASE_SPEED,
  FLAME_BASE_RANGE_BLOCKS,
  FLAME_MAX_RANGE_BLOCKS,
  FLAME_SPEED,
  FLAME_BURN_DURATION,
  FLAME_SPREAD,
  MAX_LEVEL,
  TOKEN_LEVEL_CAP,
  POWERUP_COOLDOWN,
  difficulties,
} from "./constants.js";
import { circleRectOverlap, rand, randomPosition } from "./utils.js";
import {
  createBlock,
  createBot,
  createMegaBlock,
  createPowerup,
  seedBlocks,
  seedPowerups,
  spawnBots,
} from "./spawns.js";
import { barrelAngles } from "./barrels.js";
import {
  drawBlocks,
  drawBorder,
  drawBots,
  drawBullets,
  drawGameOver,
  drawGrid,
  drawMega,
  drawPlayer,
  drawPowerups,
} from "./render.js";
import { powerupTypes } from "./powerups.js";
import { buildWeapons } from "./weapons.js";
import { buildUpgrades } from "./upgrades.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const xpFill = document.getElementById("xpFill");
const xpLabel = document.getElementById("xpLabel");
const levelLabel = document.getElementById("levelLabel");
const hpLabel = document.getElementById("hpLabel");
const buildLabel = document.getElementById("buildLabel");
const upgradeHud = document.getElementById("upgradeHud");
const weaponPopup = document.getElementById("weaponPopup");
const startMenu = document.getElementById("startMenu");
const difficultyList = document.getElementById("difficultyList");
const classList = document.getElementById("classList");
const startButton = document.getElementById("startButton");
const autoButton = document.getElementById("autoButton");
const exitButton = document.getElementById("exitButton");
const cooldownBar = document.getElementById("cooldownBar");
const cooldownFill = document.getElementById("cooldownFill");
const cooldownLabel = document.getElementById("cooldownLabel");
const adminPanel = document.getElementById("adminPanel");
const adminToggle = document.getElementById("adminToggle");
const adminBulletRow = document.getElementById("adminBulletRow");
const gameState = {
  started: false,
  over: false,
  difficulty: "easy",
  classChoice: "assault",
};

const world = {
  size: 2600,
  grid: 70,
  blocks: [],
  bullets: [],
  powerups: [],
  bots: [],
  mega: null,
  megaRespawn: 0,
};

const player = {
  pos: { x: world.size / 2, y: world.size / 2 },
  vel: { x: 0, y: 0 },
  radius: 26,
  speed: BASE_SPEED,
  drag: BASE_DRAG,
  health: 130,
  maxHealth: 130,
  regen: 6,
  reload: BASE_RELOAD,
  fireTimer: 0,
  bulletSpeed: BASE_BULLET_SPEED,
  bulletLife: BASE_BULLET_LIFE,
  bulletSize: 10,
  bulletDamage: 25,
  recoil: 0.2,
  level: 1,
  xp: 0,
  upgradePoints: 0,
  barrels: 1,
  buildName: "Single Barrel",
  regenDelay: 0,
};

let regenRateBase = 10;
function getUpgradeLevel(key) {
  const upgrade = upgrades.find((u) => u.key === key);
  return upgrade ? upgrade.level : 0;
}
function upgradeMaxLevel(upgrade) {
  return upgrade?.maxLevel || 10;
}
let upgrades = [];
const weapons = buildWeapons(player);
upgrades = buildUpgrades({
  player,
  world,
  gameState,
  getUpgradeLevel,
  setRegenRateBase: (v) => {
    regenRateBase = v;
  },
});

const botClassPool = ["assault", "spread", "sniper", "bruiser"];

function botCheckWeaponUnlock(bot) {
  if (!bot.weapons) bot.weapons = buildWeapons(bot);
  if (!bot.selectedWeapons) bot.selectedWeapons = new Set();
  let found = true;
  while (found) {
    const next = bot.weapons
      .filter((w) => w.class === bot.classChoice)
      .sort((a, b) => a.requiresLevel - b.requiresLevel)
      .find((w) => bot.level >= w.requiresLevel && !bot.selectedWeapons.has(w.id));
    if (!next) {
      found = false;
    } else {
      next.apply();
      bot.selectedWeapons.add(next.id);
      bot.activeWeapon = next.id;
    }
  }
}

function initBotBuild(bot) {
  if (!bot.classChoice) {
    bot.classChoice = botClassPool[Math.floor(Math.random() * botClassPool.length)];
  }
  if (!bot.barrels) bot.barrels = 1;
  if (!bot.buildName) bot.buildName = "Bot Cannon";
  if (!bot.weapons) bot.weapons = buildWeapons(bot);
  if (!bot.selectedWeapons) bot.selectedWeapons = new Set();
  if (!bot.moveDir) bot.moveDir = { x: 0, y: 0 };
  if (bot.targetRef === undefined) bot.targetRef = null;
  if (bot.targetType === undefined) bot.targetType = null;
  botCheckWeaponUnlock(bot);
}

function isBotVisible(bot, cam) {
  const x = bot.pos.x - cam.x;
  const y = bot.pos.y - cam.y;
  return x > -120 && x < canvas.width + 120 && y > -120 && y < canvas.height + 120;
}

function levelBotTo(bot, targetLevel) {
  if (targetLevel <= bot.level) return;
  initBotBuild(bot);
  while (bot.level < targetLevel && bot.level < MAX_LEVEL) {
    bot.level += 1;
    bot.upgradePoints += 1;
    // spend the point and apply weapons if unlocked
    let guard = 0;
    while (bot.upgradePoints > 0 && guard < 20) {
      botAutoUpgrade(bot);
      guard += 1;
    }
    botCheckWeaponUnlock(bot);
  }
}

function syncOffscreenBots(cam) {
  const base = Math.max(1, player.level);
  if (base < 6) return; // no catch-up needed early
  for (const bot of world.bots) {
    if (isBotVisible(bot, cam)) continue;
    const offset = Math.floor(rand(5, 11)); // 5-10 levels behind
    const target = Math.max(1, Math.min(MAX_LEVEL, base - offset));
    if (bot.level < target) {
      levelBotTo(bot, target);
    }
  }
}

function lerpAngle(a, b, t) {
  const twoPi = Math.PI * 2;
  const diff = ((b - a + Math.PI) % twoPi) - Math.PI;
  return a + diff * t;
}

const selectedWeapons = new Set();
let activeWeapon = null;
let pendingWeapon = null;
let autoShoot = false;
let adminHidden = false;

let upgradeHudState = "";
const buffTimers = { speed: 0, damage: 0, reload: 0, regen: 0 };
const buffMultipliers = { speed: 1, damage: 1, reload: 1, regen: 1 };
let powerupCooldown = 0;
let lastPowerupLabel = "";
let xpBoost = 1;

function resetPlayer() {
  player.pos = { x: world.size / 2, y: world.size / 2 };
  player.vel = { x: 0, y: 0 };
  player.radius = 26;
  player.speed = BASE_SPEED;
  player.drag = BASE_DRAG;
  player.health = 130;
  player.maxHealth = 130;
  player.regen = 6;
  player.reload = getBaseReload();
  player.fireTimer = 0;
  player.bulletSpeed = BASE_BULLET_SPEED;
  player.bulletLife = BASE_BULLET_LIFE;
  player.bulletSize = 10;
  player.bulletDamage = 25;
  player.recoil = 0.2;
  player.level = 1;
  player.xp = 0;
  player.upgradePoints = 0;
  player.barrels = 1;
  player.buildName = "Single Barrel";
  player.regenDelay = 0;
}

function resetUpgrades() {
  upgrades.forEach((u) => {
    u.level = 0;
  });
  selectedWeapons.clear();
  activeWeapon = null;
  pendingWeapon = null;
  upgradeHudState = "";
  Object.keys(buffTimers).forEach((k) => {
    buffTimers[k] = 0;
  buffMultipliers[k] = 1;
  });
  powerupCooldown = 0;
  lastPowerupLabel = "";
}

function resetWorldForDifficulty(diffKey) {
  const config = difficulties[diffKey] || difficulties.easy;
  gameState.difficulty = diffKey;
  world.size = config.worldSize;
  world.bullets = [];
  world.blocks = [];
  world.powerups = [];
  world.bots = [];
  resetPlayer();
  // random player spawn
  const spawnPos = randomPosition(world.size, player.radius * 2, 200);
  player.pos.x = spawnPos.x + player.radius;
  player.pos.y = spawnPos.y + player.radius;
  world.mega = createMegaBlock(world, config, [{ pos: player.pos, radius: player.radius }]);
  world.megaRespawn = 0;
  resetUpgrades();
  seedBlocks(world, player, config.blockCount);
  spawnBots(world, player, config.bots);
  world.bots.forEach(initBotBuild);
  seedPowerups(world, player, powerupTypes);
  renderUpgradeHud();
}

function startGame() {
  resetWorldForDifficulty(gameState.difficulty);
  gameState.started = true;
  gameState.over = false;
  if (startMenu) startMenu.classList.add("hidden");
  if (autoButton) {
    autoShoot = false;
    autoButton.textContent = "Auto Shoot: Off";
    autoButton.classList.remove("active");
  }
  setXpBoost(1);
  if (adminPanel) adminPanel.classList.remove("collapsed");
  if (adminToggle) {
    adminHidden = false;
    adminToggle.textContent = "»";
  }
  syncClassRestrictions();
  renderCooldownHud();
  lastTime = performance.now();
}

function showStartMenu() {
  if (startMenu) startMenu.classList.remove("hidden");
}

function renderUpgradeHud() {
  if (!upgradeHud) return;
  const allowed = upgrades.filter(isUpgradeAllowed);
  const snapshot = `${gameState.classChoice}|${player.upgradePoints}|${allowed
    .map((u) => `${u.key}:${u.level}:${upgradeMaxLevel(u)}`)
    .join("|")}`;
  if (snapshot === upgradeHudState) return;
  upgradeHudState = snapshot;
  const html = allowed
    .map((u) => {
      const maxLevel = upgradeMaxLevel(u);
      const fill = Math.min(100, (u.level / maxLevel) * 100);
      return `
        <div class="upgrade-item" data-key="${u.key}">
          <div>
            <div class="upgrade-name">${upgradeLabel(u)}</div>
            <div class="upgrade-bar"><span style="width:${fill}%; background:${u.color};"></span></div>
          </div>
          <div class="upgrade-key">[${u.key}]</div>
          <div class="upgrade-level">Lv ${u.level}</div>
        </div>
      `;
    })
    .join("");
  upgradeHud.innerHTML = html;
  upgradeHud.classList.toggle("ready", player.upgradePoints > 0);
}

function showWeaponPopup(weapon) {
  if (!weaponPopup) return;
  pendingWeapon = weapon;
  weaponPopup.innerHTML = `
    <h2>Weapon Unlock</h2>
    <p>Reached Level ${weapon.requiresLevel}! Choose your weapon.</p>
    <div class="weapon-option">
      <div>
        <div class="upgrade-name">${weapon.name}</div>
        <div class="upgrade-bar"><span style="width:60%; background:${upgrades[0].color};"></span></div>
      </div>
      <button id="chooseWeaponBtn">Choose</button>
    </div>
  `;
  const btn = weaponPopup.querySelector("#chooseWeaponBtn");
  if (btn) {
    btn.addEventListener("click", () => selectWeapon(weapon));
  }
  weaponPopup.classList.remove("hidden");
}

function hideWeaponPopup() {
  if (!weaponPopup) return;
  weaponPopup.classList.add("hidden");
  weaponPopup.innerHTML = "";
  pendingWeapon = null;
}

function selectWeapon(weapon) {
  weapon.apply();
  activeWeapon = weapon.id;
  selectedWeapons.add(weapon.id);
  hideWeaponPopup();
  renderUpgradeHud();
  checkWeaponUnlocks();
}

function checkWeaponUnlocks() {
  if (pendingWeapon) return;
  const available = weapons
    .filter((w) => w.class === gameState.classChoice)
    .sort((a, b) => a.requiresLevel - b.requiresLevel)
    .find((w) => player.level >= w.requiresLevel && !selectedWeapons.has(w.id));
  if (available) showWeaponPopup(available);
}

const input = {
  keys: new Set(),
  mouse: { x: 0, y: 0, down: false, worldX: 0, worldY: 0 },
};

let lastTime = performance.now();

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (["1", "2", "3", "4", "5", "6"].includes(key) && player.upgradePoints > 0) {
    if (!isUpgradeAllowedKey(key)) return;
    const upgrade = upgrades.find((u) => u.key === key);
    if (upgrade && upgrade.level < upgradeMaxLevel(upgrade)) {
      player.upgradePoints -= 1;
      upgrade.apply();
      upgrade.level += 1;
      updateBuildTier();
      renderUpgradeHud();
    }
    return;
  }
  input.keys.add(key);
});

window.addEventListener("keyup", (e) => {
  input.keys.delete(e.key.toLowerCase());
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  input.mouse.x = e.clientX - rect.left;
  input.mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("mousedown", () => {
  input.mouse.down = true;
});

canvas.addEventListener("mouseup", () => {
  input.mouse.down = false;
});

window.addEventListener("mouseup", () => {
  input.mouse.down = false;
});

if (difficultyList) {
  difficultyList.addEventListener("click", (e) => {
    const card = e.target.closest(".difficulty");
    if (!card) return;
    const diff = card.dataset.difficulty || "easy";
    gameState.difficulty = diff;
    [...difficultyList.querySelectorAll(".difficulty")].forEach((el) =>
      el.classList.toggle("active", el === card)
    );
  });
}

if (classList) {
  classList.addEventListener("click", (e) => {
    const card = e.target.closest(".class-card");
    if (!card) return;
    const cls = card.dataset.class || "assault";
    gameState.classChoice = cls;
    [...classList.querySelectorAll(".class-card")].forEach((el) =>
      el.classList.toggle("active", el === card)
    );
    syncClassRestrictions();
  });
}

if (startButton) {
  startButton.addEventListener("click", () => {
    startGame();
  });
}

if (exitButton) {
  exitButton.addEventListener("click", () => {
    gameState.started = false;
    gameState.over = false;
    world.bullets = [];
    world.powerups = [];
    world.blocks = [];
    world.bots = [];
    world.mega = null;
    if (startMenu) startMenu.classList.remove("hidden");
  });
}

if (autoButton) {
  autoButton.addEventListener("click", () => {
    autoShoot = !autoShoot;
    autoButton.textContent = `Auto Shoot: ${autoShoot ? "On" : "Off"}`;
    autoButton.classList.toggle("active", autoShoot);
  });
}

if (adminPanel) {
  adminPanel.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-upgrade]");
    const xpBtn = e.target.closest("button[data-xpboost]");
    if (btn) {
      const key = btn.dataset.upgrade;
      const amount = Number(btn.dataset.amount || 1);
      grantAdminUpgrades(key, amount);
    } else if (xpBtn) {
      const boost = Number(xpBtn.dataset.xpboost || 1);
      setXpBoost(boost);
    }
  });
}

if (adminToggle) {
  adminToggle.addEventListener("click", () => {
    adminHidden = !adminHidden;
    adminToggle.textContent = adminHidden ? "«" : "»";
    if (adminPanel) {
      adminPanel.classList.toggle("collapsed", adminHidden);
    }
  });
}

function requiredXP(level) {
  if (level >= MAX_LEVEL) return Infinity;
  return 40 + Math.floor(level * level * 12);
}

function botGainXP(bot, amount) {
  initBotBuild(bot);
  bot.xp += amount;
  let needed = requiredXP(bot.level);
  while (bot.xp >= needed && bot.level < MAX_LEVEL) {
    bot.xp -= needed;
    bot.level += 1;
    bot.upgradePoints += 1;
    botAutoUpgrade(bot);
    botCheckWeaponUnlock(bot);
    needed = requiredXP(bot.level);
  }
}

function botAutoUpgrade(bot) {
  const options = ["damage", "reload", "mobility", "defense"].filter(
    (key) => bot.upgrades[key] < 10
  );
  if (bot.upgradePoints <= 0 || options.length === 0) return;
  const key = options[Math.floor(Math.random() * options.length)];
  bot.upgradePoints -= 1;
  bot.upgrades[key] += 1;
  if (key === "damage") {
    bot.bulletDamage += 3;
    bot.bulletSpeed += 15;
  } else if (key === "reload") {
    bot.reload = Math.max(0.6, bot.reload - 0.03);
    bot.bulletLife += 0.04;
  } else if (key === "mobility") {
    bot.speed += 10;
    bot.drag = Math.min(0.995, bot.drag + 0.005);
  } else if (key === "defense") {
    bot.maxHealth += 12;
    bot.health = Math.min(bot.maxHealth, bot.health + 12);
    bot.regen += 0.4;
  }
}

function ensurePowerups() {
  const target = 6;
  while (world.powerups.length < target) {
    world.powerups.push(createPowerup(world, player, powerupTypes));
  }
}

function applyPowerupEffect(power) {
  const buff = power.type;
  const typeDef = powerupTypes.find((p) => p.type === buff);
  if (!typeDef) return;
  buffTimers[buff] = typeDef.duration;
  buffMultipliers[buff] = typeDef.multiplier;
  powerupCooldown = POWERUP_COOLDOWN;
  lastPowerupLabel = typeDef.label || buff;
}

function updateBuffs(dt) {
  Object.keys(buffTimers).forEach((k) => {
    if (buffTimers[k] > 0) {
      buffTimers[k] -= dt;
      if (buffTimers[k] <= 0) {
        buffTimers[k] = 0;
        buffMultipliers[k] = 1;
      }
    }
  });
  if (powerupCooldown > 0) {
    powerupCooldown = Math.max(0, powerupCooldown - dt);
  }
}

function renderCooldownHud() {
  if (!cooldownBar || !cooldownFill || !cooldownLabel) return;
  if (powerupCooldown > 0) {
    cooldownBar.style.display = "block";
    const pct = Math.max(0, Math.min(1, powerupCooldown / POWERUP_COOLDOWN));
    cooldownFill.style.width = `${pct * 100}%`;
    const label = lastPowerupLabel ? `${lastPowerupLabel} buff` : "Power-up";
    cooldownLabel.textContent = `${label} cooldown: ${powerupCooldown.toFixed(1)}s`;
  } else {
    cooldownBar.style.display = "none";
  }
}
renderUpgradeHud();

function getCamera() {
  return {
    x: player.pos.x - canvas.width / 2,
    y: player.pos.y - canvas.height / 2,
  };
}

function movePlayer(dt) {
  let dx = 0;
  let dy = 0;
  if (input.keys.has("w") || input.keys.has("arrowup")) dy -= 1;
  if (input.keys.has("s") || input.keys.has("arrowdown")) dy += 1;
  if (input.keys.has("a") || input.keys.has("arrowleft")) dx -= 1;
  if (input.keys.has("d") || input.keys.has("arrowright")) dx += 1;
  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;

  const accel = player.speed * buffMultipliers.speed * dt;
  player.vel.x += dx * accel;
  player.vel.y += dy * accel;

  player.vel.x *= player.drag;
  player.vel.y *= player.drag;

  player.pos.x += player.vel.x * dt;
  player.pos.y += player.vel.y * dt;

  player.pos.x = Math.max(player.radius, Math.min(world.size - player.radius, player.pos.x));
  player.pos.y = Math.max(player.radius, Math.min(world.size - player.radius, player.pos.y));
}

function shoot(dt) {
  player.fireTimer -= dt;
  const cam = getCamera();
  input.mouse.worldX = input.mouse.x + cam.x;
  input.mouse.worldY = input.mouse.y + cam.y;

  const angle = Math.atan2(input.mouse.worldY - player.pos.y, input.mouse.worldX - player.pos.x);
  if (player.fireTimer <= 0 && (input.mouse.down || autoShoot)) {
    const usingFlame = gameState.classChoice === "flamethrower";
    const shots = usingFlame ? 3 : 1;
    const baseAngles = barrelAngles(angle, player.barrels, gameState.classChoice, player.radius);
    baseAngles.forEach((base) => {
      for (let i = 0; i < shots; i += 1) {
        const jitter = usingFlame ? rand(-FLAME_SPREAD, FLAME_SPREAD) : 0;
        const a = base + jitter;
        const dir = { x: Math.cos(a), y: Math.sin(a) };
        const start = {
          x: player.pos.x + dir.x * (player.radius + player.bulletSize),
          y: player.pos.y + dir.y * (player.radius + player.bulletSize),
        };
        const speed = usingFlame ? FLAME_SPEED : player.bulletSpeed;
        const level5 = getUpgradeLevel("5");
        const flameRangeBlocks =
          FLAME_BASE_RANGE_BLOCKS +
          (level5 / 10) * (FLAME_MAX_RANGE_BLOCKS - FLAME_BASE_RANGE_BLOCKS);
        const life = usingFlame
          ? (flameRangeBlocks * world.grid) / FLAME_SPEED
          : player.bulletLife;
        const radius = usingFlame ? 7 : player.bulletSize;
        const damage = usingFlame
          ? player.bulletDamage * 0.7 * buffMultipliers.damage
          : player.bulletDamage * buffMultipliers.damage;
        world.bullets.push({
          pos: { ...start },
          vel: { x: dir.x * speed, y: dir.y * speed },
          radius,
          damage,
          life,
          owner: "player",
          type: usingFlame ? "flame" : "bullet",
        });
      }
    });
    player.fireTimer = player.reload * buffMultipliers.reload * (usingFlame ? 0.6 : 1);
  }
}

function updateBots(dt) {
  const diff = difficulties[gameState.difficulty] || difficulties.easy;
  const cfg = diff.bots;
  if (cfg) {
    while (world.bots.length < cfg.count) {
      const newBot = createBot(world, player, cfg, world.bots);
      initBotBuild(newBot);
      world.bots.push(newBot);
    }
  }
  for (let i = world.bots.length - 1; i >= 0; i -= 1) {
    const bot = world.bots[i];
    initBotBuild(bot);
    bot.fireTimer -= dt;
    bot.aiTimer -= dt;
    const dx = player.pos.x - bot.pos.x;
    const dy = player.pos.y - bot.pos.y;
    const dist = Math.hypot(dx, dy) || 1;
    const aggro = dist < (cfg?.aggroRange || 300);

    // pick/keep target with hysteresis to avoid snapping
    const nearestBlock = (() => {
      let best = null;
      let bestDist = Infinity;
      for (const blk of world.blocks) {
        const cx = blk.pos.x + blk.size / 2;
        const cy = blk.pos.y + blk.size / 2;
        const d = (cx - bot.pos.x) ** 2 + (cy - bot.pos.y) ** 2;
        if (d < bestDist) {
          bestDist = d;
          best = { ref: blk, x: cx, y: cy, dist2: d };
        }
      }
      if (world.mega) {
        const m = world.mega;
        const cx = m.pos.x + m.size / 2;
        const cy = m.pos.y + m.size / 2;
        const d = (cx - bot.pos.x) ** 2 + (cy - bot.pos.y) ** 2;
        if (d < bestDist) {
          best = { ref: m, x: cx, y: cy, dist2: d };
          bestDist = d;
        }
      }
      return best;
    })();

    if (aggro) {
      bot.targetRef = player;
      bot.targetType = "player";
    } else {
      const hasCurrentBlock =
        bot.targetRef && bot.targetType === "block" && world.blocks.includes(bot.targetRef);
      const hasMega = bot.targetRef && bot.targetType === "mega" && world.mega === bot.targetRef;
      if (!hasCurrentBlock && !hasMega) {
        bot.targetRef = null;
        bot.targetType = null;
      }
      if (nearestBlock) {
        const currentPos = bot.targetRef
          ? { x: bot.targetRef.pos.x + (bot.targetRef.size || 0) / 2, y: bot.targetRef.pos.y + (bot.targetRef.size || 0) / 2 }
          : null;
        const currentDist2 = currentPos
          ? (currentPos.x - bot.pos.x) ** 2 + (currentPos.y - bot.pos.y) ** 2
          : Infinity;
        const threshold = 60 * 60;
        if (!bot.targetRef || nearestBlock.dist2 + threshold < currentDist2) {
          bot.targetRef = nearestBlock.ref;
          bot.targetType = nearestBlock.ref === world.mega ? "mega" : "block";
        }
      }
    }

    const target =
      bot.targetRef === player
        ? player.pos
        : bot.targetRef
        ? {
            x: bot.targetRef.pos.x + (bot.targetRef.size || 0) / 2,
            y: bot.targetRef.pos.y + (bot.targetRef.size || 0) / 2,
          }
        : null;
    const tdx = target ? target.x - bot.pos.x : 0;
    const tdy = target ? target.y - bot.pos.y : 0;
    const tdist = target ? Math.hypot(tdx, tdy) || 1 : Infinity;

    if (bot.aiTimer <= 0) {
      bot.strafe = rand(-0.7, 0.7);
      bot.aiTimer = rand(0.8, 1.4);
    }
    if (target) {
      let mx = 0;
      let my = 0;
      const targetSize =
        bot.targetType === "player" ? player.radius * 2 : (bot.targetRef?.size || 30);
      const desired = bot.targetType === "player" ? 200 : targetSize * 1.8;
      const nx = tdx / tdist;
      const ny = tdy / tdist;
      if (tdist > desired + 40) {
        mx = nx;
        my = ny;
      } else {
        const tangentX = -ny;
        const tangentY = nx;
        mx = tangentX * bot.orbitDir + nx * 0.2;
        my = tangentY * bot.orbitDir + ny * 0.2;
      }
      // lateral strafe for player
      if (bot.targetType === "player") {
        const sideX = -my;
        const sideY = mx;
        mx += sideX * bot.strafe * 0.4;
        my += sideY * bot.strafe * 0.4;
      }
      const len = Math.hypot(mx, my) || 1;
      mx /= len;
      my /= len;
      // smooth movement direction
      bot.moveDir.x = bot.moveDir.x * 0.85 + mx * 0.15;
      bot.moveDir.y = bot.moveDir.y * 0.85 + my * 0.15;
      const accel = bot.speed * dt;
      bot.vel.x += bot.moveDir.x * accel;
      bot.vel.y += bot.moveDir.y * accel;
    }

    bot.vel.x *= bot.drag;
    bot.vel.y *= bot.drag;
    bot.pos.x += bot.vel.x * dt;
    bot.pos.y += bot.vel.y * dt;
    bot.pos.x = Math.max(bot.radius, Math.min(world.size - bot.radius, bot.pos.x));
    bot.pos.y = Math.max(bot.radius, Math.min(world.size - bot.radius, bot.pos.y));
    bot.health = Math.min(bot.maxHealth, bot.health + bot.regen * dt);

    if (target) bot.aimAngle = lerpAngle(bot.aimAngle || 0, Math.atan2(tdy, tdx), 0.18);

    const playerTarget = aggro && target === player.pos;
    const canFire =
      target && bot.fireTimer <= 0 && (!playerTarget || tdist <= (cfg?.aggroRange || 300) + 20);
    if (canFire) {
      const angle = bot.aimAngle;
      const baseAngles = barrelAngles(angle, bot.barrels || 1, bot.classChoice || "assault", bot.radius || 22);
      baseAngles.forEach((a) => {
        const dir = { x: Math.cos(a), y: Math.sin(a) };
        const start = {
          x: bot.pos.x + dir.x * (bot.radius + bot.bulletSize),
          y: bot.pos.y + dir.y * (bot.radius + bot.bulletSize),
        };
        world.bullets.push({
          pos: { ...start },
          vel: { x: dir.x * bot.bulletSpeed, y: dir.y * bot.bulletSpeed },
          radius: bot.bulletSize,
          damage: bot.bulletDamage,
          life: bot.bulletLife,
          owner: "bot",
          ownerRef: bot,
        });
      });
      bot.fireTimer = bot.reload;
    }

    if (bot.health <= 0) {
      const reward = (80 + bot.level * 12) * xpBoost;
      player.xp += reward;
      world.bots.splice(i, 1);
    }
  }
}

function updateBullets(dt) {
  for (let i = world.bullets.length - 1; i >= 0; i -= 1) {
    const b = world.bullets[i];
    b.pos.x += b.vel.x * dt;
    b.pos.y += b.vel.y * dt;
    b.life -= dt;
    if (b.life <= 0) {
      world.bullets.splice(i, 1);
      continue;
    }
    if (b.pos.x < 0 || b.pos.x > world.size || b.pos.y < 0 || b.pos.y > world.size) {
      world.bullets.splice(i, 1);
    }
  }
}

function findNearestBlock(pos) {
  let nearest = null;
  let best = Infinity;
  for (const block of world.blocks) {
    const dx = block.pos.x - pos.x;
    const dy = block.pos.y - pos.y;
    const d = dx * dx + dy * dy;
    if (d < best) {
      best = d;
      nearest = block;
    }
  }
  if (world.mega) {
    const m = world.mega;
    const center = { x: m.pos.x + m.size / 2, y: m.pos.y + m.size / 2 };
    const dx = center.x - pos.x;
    const dy = center.y - pos.y;
    const d = dx * dx + dy * dy;
    if (d < best) nearest = { ...m, pos: m.pos, size: m.size };
  }
  return nearest;
}

function handleCollisions(dt) {
  for (let i = world.bullets.length - 1; i >= 0; i -= 1) {
    const b = world.bullets[i];
    let hit = false;
    if (b.owner === "player") {
      for (let j = world.blocks.length - 1; j >= 0; j -= 1) {
        const block = world.blocks[j];
        if (circleRectOverlap({ x: b.pos.x, y: b.pos.y, radius: b.radius }, block)) {
          block.health -= b.damage;
          if (b.type === "flame") applyBurnBlock(block, b.damage * 0.5);
          hit = true;
          if (block.health <= 0) {
            player.xp += block.xp * xpBoost;
            world.blocks.splice(j, 1);
            world.blocks.push(createBlock(world, player));
          }
          break;
        }
      }
      if (!hit) {
        for (let k = world.bots.length - 1; k >= 0; k -= 1) {
          const bot = world.bots[k];
          const dx = b.pos.x - bot.pos.x;
          const dy = b.pos.y - bot.pos.y;
          if (dx * dx + dy * dy <= (b.radius + bot.radius) * (b.radius + bot.radius)) {
            bot.health -= b.damage;
            if (b.type === "flame") applyBurnBot(bot, b.damage * 0.5);
            hit = true;
            if (bot.health <= 0) {
              const reward = (80 + bot.level * 12) * xpBoost;
              player.xp += reward;
              world.bots.splice(k, 1);
            }
            break;
          }
        }
      }
      if (!hit && world.mega) {
        const m = world.mega;
        if (circleRectOverlap({ x: b.pos.x, y: b.pos.y, radius: b.radius }, { pos: m.pos, size: m.size })) {
          m.health -= b.damage;
          if (b.type === "flame") applyBurnMega(b.damage * 0.5);
          hit = true;
          if (m.health <= 0) {
            player.xp += m.xp * xpBoost;
            world.mega = null;
            world.megaRespawn = 12;
          }
        }
      }
    } else if (b.owner === "bot") {
      const dx = b.pos.x - player.pos.x;
      const dy = b.pos.y - player.pos.y;
      if (dx * dx + dy * dy <= (b.radius + player.radius) * (b.radius + player.radius)) {
        applyPlayerDamage(b.damage);
        hit = true;
      }
      if (!hit) {
        for (let j = world.blocks.length - 1; j >= 0; j -= 1) {
          const block = world.blocks[j];
          if (circleRectOverlap({ x: b.pos.x, y: b.pos.y, radius: b.radius }, block)) {
            block.health -= b.damage;
            hit = true;
            if (block.health <= 0 && b.ownerRef) {
              botGainXP(b.ownerRef, block.xp);
              world.blocks.splice(j, 1);
              world.blocks.push(createBlock(world, player));
            }
            break;
          }
        }
      }
      if (!hit && world.mega && b.ownerRef) {
        const m = world.mega;
        if (circleRectOverlap({ x: b.pos.x, y: b.pos.y, radius: b.radius }, { pos: m.pos, size: m.size })) {
          m.health -= b.damage;
          hit = true;
          if (m.health <= 0) {
            botGainXP(b.ownerRef, m.xp);
            world.mega = null;
            world.megaRespawn = 12;
          }
        }
      }
    }
    if (hit) world.bullets.splice(i, 1);
  }

  if (world.mega) {
    const m = world.mega;
    const center = { x: m.pos.x + m.size / 2, y: m.pos.y + m.size / 2 };
    const dx = player.pos.x - center.x;
    const dy = player.pos.y - center.y;
    const half = m.size / 2 + player.radius;
    if (Math.abs(dx) < half && Math.abs(dy) < half) {
      applyPlayerDamage(80 * dt);
      const len = Math.hypot(dx, dy) || 1;
      player.vel.x += (dx / len) * 120 * dt;
      player.vel.y += (dy / len) * 120 * dt;
    }
  }

  for (let i = world.blocks.length - 1; i >= 0; i -= 1) {
    const block = world.blocks[i];
    if (circleRectOverlap({ x: player.pos.x, y: player.pos.y, radius: player.radius }, block)) {
      const touchDps = block.size > 40 ? 22 : block.size > 30 ? 14 : 8;
      applyPlayerDamage(touchDps * dt);
      const dx = player.pos.x - (block.pos.x + block.size / 2);
      const dy = player.pos.y - (block.pos.y + block.size / 2);
      const len = Math.hypot(dx, dy) || 1;
      player.vel.x += (dx / len) * 80 * dt;
      player.vel.y += (dy / len) * 80 * dt;
    }
  }
}

function updatePowerups(dt) {
  ensurePowerups();
  for (let i = world.powerups.length - 1; i >= 0; i -= 1) {
    const p = world.powerups[i];
    const dx = p.pos.x - player.pos.x;
    const dy = p.pos.y - player.pos.y;
    if (powerupCooldown <= 0 && dx * dx + dy * dy <= (p.size + player.radius) * (p.size + player.radius)) {
      applyPowerupEffect(p);
      world.powerups.splice(i, 1);
    }
  }
  updateBuffs(dt);
  if (!world.mega && world.megaRespawn > 0) {
    world.megaRespawn -= dt;
    if (world.megaRespawn <= 0) {
      const config = difficulties[gameState.difficulty] || difficulties.easy;
      world.mega = createMegaBlock(world, config, [{ pos: player.pos, radius: player.radius }]);
    }
  }
}

function applyRegen(dt) {
  if (player.regenDelay > 0) {
    player.regenDelay = Math.max(0, player.regenDelay - dt);
    return;
  }
  const rate = regenRateBase * buffMultipliers.regen;
  player.health = Math.min(player.maxHealth, player.health + rate * dt);
}

function applyPlayerDamage(amount) {
  player.health -= amount;
  player.regenDelay = 4;
}

function applyBurnBlock(block, dps) {
  block.burnTime = Math.max(block.burnTime, FLAME_BURN_DURATION);
  block.burnDps = Math.max(block.burnDps, dps);
  block.burnOwnerRef = "player";
}

function applyBurnBot(bot, dps) {
  bot.burnTime = Math.max(bot.burnTime, FLAME_BURN_DURATION);
  bot.burnDps = Math.max(bot.burnDps, dps);
  bot.burnOwnerRef = "player";
}

function applyBurnMega(dps) {
  if (!world.mega) return;
  world.mega.burnTime = Math.max(world.mega.burnTime, FLAME_BURN_DURATION);
  world.mega.burnDps = Math.max(world.mega.burnDps, dps);
  world.mega.burnOwnerRef = "player";
}

function tickBurn(dt) {
  for (let i = world.blocks.length - 1; i >= 0; i -= 1) {
    const block = world.blocks[i];
    if (block.burnTime > 0) {
      block.burnTime = Math.max(0, block.burnTime - dt);
      block.health -= block.burnDps * dt;
      if (block.health <= 0) {
        player.xp += block.xp * xpBoost;
        world.blocks.splice(i, 1);
        world.blocks.push(createBlock(world, player));
        continue;
      }
    }
  }
  for (let i = world.bots.length - 1; i >= 0; i -= 1) {
    const bot = world.bots[i];
    if (bot.burnTime > 0) {
      bot.burnTime = Math.max(0, bot.burnTime - dt);
      bot.health -= bot.burnDps * dt;
      if (bot.health <= 0) {
        const reward = (80 + bot.level * 12) * xpBoost;
        player.xp += reward;
        world.bots.splice(i, 1);
        continue;
      }
    }
  }
  if (world.mega && world.mega.burnTime > 0) {
    world.mega.burnTime = Math.max(0, world.mega.burnTime - dt);
    world.mega.health -= world.mega.burnDps * dt;
    if (world.mega.health <= 0) {
      player.xp += world.mega.xp * xpBoost;
      world.mega = null;
      world.megaRespawn = 12;
    }
  }
}

function checkLevelUps() {
  let needed = requiredXP(player.level);
  while (player.xp >= needed && player.level < MAX_LEVEL) {
    player.xp -= needed;
    player.level += 1;
    if (player.level <= TOKEN_LEVEL_CAP) {
      const gain = player.level <= 5 ? 2 : 1;
      player.upgradePoints += gain;
    }
    updateBuildTier();
    checkWeaponUnlocks();
    needed = requiredXP(player.level);
  }
  if (player.level >= MAX_LEVEL) {
    player.xp = 0;
  }
}

function updateBuildTier() {
  if (activeWeapon || pendingWeapon) return;
  const previous = player.barrels;
  if (player.level >= 18) {
    player.barrels = 3;
    player.buildName = "Trishot";
  } else if (player.level >= 10) {
    player.barrels = 2;
    player.buildName = "Twin";
  } else {
    player.barrels = 1;
    player.buildName = "Single Barrel";
  }
  if (player.barrels !== previous) {
    player.reload = Math.max(0.2, player.reload - 0.02);
  }
}

function updateUI() {
  const need = requiredXP(player.level);
  const percent = player.level >= MAX_LEVEL ? 1 : Math.min(1, player.xp / need);
  xpFill.style.width = `${(percent * 100).toFixed(1)}%`;
  xpLabel.textContent =
    player.level >= MAX_LEVEL
      ? `Lv ${player.level} • MAX`
      : `Lv ${player.level} • ${Math.floor(player.xp)}/${need} XP`;
  levelLabel.textContent = player.level;
  hpLabel.textContent = `${Math.max(0, Math.floor(player.health))}/${Math.floor(player.maxHealth)}`;
  const pts = player.upgradePoints > 0 ? ` (+${player.upgradePoints} pts)` : "";
  buildLabel.textContent = `${player.buildName}${pts}`;
  renderUpgradeHud();
  renderCooldownHud();
}

function grantAdminUpgrades(key, amount) {
  const upgrade = upgrades.find((u) => u.key === key);
  if (!upgrade || !isUpgradeAllowed(upgrade)) return;
  const maxLevel = upgradeMaxLevel(upgrade);
  for (let i = 0; i < amount; i += 1) {
    if (upgrade.level >= maxLevel) break;
    upgrade.apply();
    upgrade.level += 1;
  }
  updateBuildTier();
  renderUpgradeHud();
}

function setXpBoost(multiplier) {
  xpBoost = Math.max(1, multiplier);
}

function isUpgradeAllowed(upgrade) {
  if (upgrade.key === "5" && gameState.classChoice === "sniper") return false;
  if (upgrade.key === "2" && gameState.classChoice === "flamethrower") return false;
  return true;
}

function isUpgradeAllowedKey(key) {
  if (key === "5" && gameState.classChoice === "sniper") return false;
  if (key === "2" && gameState.classChoice === "flamethrower") return false;
  return true;
}

function syncClassRestrictions() {
  if (adminBulletRow) {
    adminBulletRow.style.display = gameState.classChoice === "sniper" ? "none" : "grid";
    const label = adminBulletRow.querySelector(".name");
    if (label) {
      label.textContent = gameState.classChoice === "flamethrower" ? "Fire Distance" : "Bullet Speed";
    }
  }
  const adminReloadRow = adminPanel?.querySelector('[data-upgrade="2"]')?.parentElement;
  if (adminReloadRow) {
    adminReloadRow.style.display = gameState.classChoice === "flamethrower" ? "none" : "grid";
  }
}

function getBaseReload() {
  return gameState.classChoice === "flamethrower" ? BASE_RELOAD * 0.25 : BASE_RELOAD;
}

function upgradeLabel(upgrade) {
  if (upgrade.key === "5" && gameState.classChoice === "flamethrower") return "Fire Distance";
  return upgrade.name;
}

function upgradeDesc(upgrade) {
  if (upgrade.key === "5" && gameState.classChoice === "flamethrower") return "Extend flame reach";
  return upgrade.description;
}

function drawUpgradePrompt() {
  if (player.upgradePoints <= 0) return;
  const lines = upgrades
    .filter(isUpgradeAllowed)
    .map((u) => `${u.key} – ${upgradeLabel(u)}: ${upgradeDesc(u)} (Lv ${u.level}/${upgradeMaxLevel(u)})`);
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 2;
  const boxWidth = 320;
  const boxHeight = 24 + lines.length * 18;
  const x = canvas.width / 2 - boxWidth / 2;
  const y = canvas.height - boxHeight - 22;
  ctx.beginPath();
  ctx.rect(x, y, boxWidth, boxHeight);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#0f1a2c";
  ctx.font = "13px \"Trebuchet MS\", sans-serif";
  ctx.fillText(`Upgrade points: ${player.upgradePoints}`, x + 12, y + 16);
  ctx.fillStyle = "#9ab0d8";
  lines.forEach((line, i) => {
    ctx.fillText(line, x + 12, y + 32 + i * 16);
  });
  ctx.restore();
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameState.started) {
    drawGrid(ctx, world, canvas, getCamera());
    requestAnimationFrame(loop);
    return;
  }
  const cam = getCamera();

  drawGrid(ctx, world, canvas, cam);
  movePlayer(dt);
  shoot(dt);
  updateBots(dt);
  updateBullets(dt);
  handleCollisions(dt);
  updatePowerups(dt);
  tickBurn(dt);
  applyRegen(dt);
  checkLevelUps();
  syncOffscreenBots(cam);
  updateUI();

  drawBlocks(ctx, world, cam);
  drawMega(ctx, world, cam);
  drawBots(ctx, world, cam);
  drawBullets(ctx, world, cam);
  drawPlayer(ctx, world, player, input, cam, gameState.classChoice);
  drawPowerups(ctx, world, cam);
  drawBorder(ctx, world, cam);
  drawUpgradePrompt();

  if (player.health <= 0 && gameState.started) {
    gameState.started = false;
    gameState.over = true;
    showStartMenu();
  }
  if (gameState.over && !gameState.started) {
    drawGameOver(ctx, canvas);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
