import {
  BASE_BULLET_LIFE,
  BASE_BULLET_SPEED,
  BASE_DRAG,
  BASE_SPEED,
  FLAME_BASE_RANGE_BLOCKS,
  FLAME_MAX_RANGE_BLOCKS,
  FLAME_SPEED,
} from "./constants.js";

export function buildUpgrades({ player, world, gameState, getUpgradeLevel, setRegenRateBase }) {
  return [
    {
      key: "1",
      name: "Damage",
      level: 0,
      color: "#ff6b6b",
      description: "Heavier shots",
      apply: () => {
        player.bulletDamage += 5;
        player.bulletSize += 0.5;
      },
    },
    {
      key: "2",
      name: "Reload",
      level: 0,
      color: "#5ad86a",
      description: "Faster fire rate",
      apply: () => {
        if (gameState.classChoice === "flamethrower") return;
        player.reload = Math.max(0.16, player.reload - 0.03);
        player.bulletLife += 0.05;
      },
    },
    {
      key: "3",
      name: "Mobility",
      level: 0,
      maxLevel: 5,
      color: "#2b8df8",
      description: "More speed",
      apply: () => {
        const targetLevel = getUpgradeLevel("3");
        const nextLevel = targetLevel + 1;
        const speedFactor = Math.min(1.25, 1 + nextLevel * 0.05); // up to 1.25x at level 5
        player.speed = BASE_SPEED * speedFactor;
        player.drag = Math.min(0.995, BASE_DRAG + nextLevel * 0.002);
      },
    },
    {
      key: "4",
      name: "Defense",
      level: 0,
      color: "#c58afd",
      description: "Survive longer",
      apply: () => {
        player.maxHealth += 111;
        player.health = Math.min(player.maxHealth, player.health + 111);
        player.regen += 1.2;
      },
    },
    {
      key: "5",
      name: "Bullet Speed",
      level: 0,
      color: "#ffa94d",
      description: "Faster bullets / longer flame",
      apply: () => {
        const targetLevel = getUpgradeLevel("5");
        const nextLevel = targetLevel + 1;
        if (gameState.classChoice === "flamethrower") {
          const rangeBlocks =
            FLAME_BASE_RANGE_BLOCKS +
            (nextLevel / 10) * (FLAME_MAX_RANGE_BLOCKS - FLAME_BASE_RANGE_BLOCKS);
          player.bulletLife = (rangeBlocks * world.grid) / FLAME_SPEED;
        } else {
          player.bulletSpeed = BASE_BULLET_SPEED * (1 + nextLevel * 0.08);
          player.bulletLife = BASE_BULLET_LIFE + nextLevel * 0.04;
        }
      },
    },
    {
      key: "6",
      name: "Regen Speed",
      level: 0,
      color: "#4ad7d1",
      description: "Faster regen tick rate",
      apply: () => {
        const targetLevel = getUpgradeLevel("6");
        const next = targetLevel + 1;
        if (setRegenRateBase) {
          setRegenRateBase(10 + (next - 1) * 4.4); // level 1 =>10, level 10 =>50
        }
      },
    },
  ];
}
