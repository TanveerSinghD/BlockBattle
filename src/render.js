import { rotatePoint } from "./utils.js";
import { barrelMounts } from "./barrels.js";

export function drawGrid(ctx, world, canvas, cam) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.05)";
  ctx.lineWidth = 1;
  const startX = -((cam.x % world.grid) + world.grid);
  const startY = -((cam.y % world.grid) + world.grid);
  for (let x = startX; x < canvas.width + world.grid; x += world.grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = startY; y < canvas.height + world.grid; y += world.grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawBlocks(ctx, world, cam) {
  for (const block of world.blocks) {
    const x = block.pos.x - cam.x;
    const y = block.pos.y - cam.y;
    const hpRatio = block.health / block.maxHealth;
    ctx.fillStyle = block.color;
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x, y, block.size, block.size);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x, y - 8, block.size, 4);
    ctx.fillStyle = "#7cf29c";
    ctx.fillRect(x, y - 8, block.size * hpRatio, 4);
  }
}

export function drawMega(ctx, world, cam) {
  if (!world.mega) return;
  const m = world.mega;
  const x = m.pos.x - cam.x;
  const y = m.pos.y - cam.y;
  const hpRatio = Math.max(0, m.health / m.maxHealth);
  ctx.save();
  ctx.fillStyle = m.color;
  ctx.strokeStyle = "#22052f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.rect(x, y, m.size, m.size);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(x, y - 10, m.size, 6);
  ctx.fillStyle = "#ff9cf0";
  ctx.fillRect(x, y - 10, m.size * hpRatio, 6);
  ctx.restore();
}

export function drawBots(ctx, world, cam) {
  for (const bot of world.bots) {
    const x = bot.pos.x - cam.x;
    const y = bot.pos.y - cam.y;
    ctx.save();
    ctx.translate(x, y);
    const angle = bot.aimAngle || 0;
    const mounts = barrelMounts(bot.barrels || 1, bot.classChoice || "assault", bot.radius || 22);
    ctx.fillStyle = "#f38b3a";
    ctx.strokeStyle = "#0a0f1a";
    ctx.lineWidth = 3;
    mounts.forEach((m) => {
      const offset = rotatePoint(m.x, m.y, angle);
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.rotate(angle + m.angleOffset);
      ctx.beginPath();
      ctx.rect((bot.radius || 22) * 0.15, -5, (bot.radius || 22) + 10, 10);
      ctx.fillStyle = "#f3b03f";
      ctx.fill();
      ctx.restore();
    });
    ctx.fillStyle = "#f38b3a";
    ctx.beginPath();
    ctx.arc(0, 0, bot.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    const hpPercent = Math.max(0, bot.health / bot.maxHealth);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x - bot.radius, y + bot.radius + 4, bot.radius * 2, 5);
    ctx.fillStyle = "#ffcf70";
    ctx.fillRect(x - bot.radius, y + bot.radius + 4, bot.radius * 2 * hpPercent, 5);
  }
}

export function drawPowerups(ctx, world, cam) {
  for (const p of world.powerups) {
    const x = p.pos.x - cam.x;
    const y = p.pos.y - cam.y;
    ctx.save();
    ctx.fillStyle = p.color;
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "12px \"Trebuchet MS\", sans-serif";
    ctx.textAlign = "center";
    const label = (p.label || p.type || "").toUpperCase();
    ctx.fillText(label[0] || "", x, y + 4);
    ctx.restore();
  }
}

export function drawBullets(ctx, world, cam) {
  for (const b of world.bullets) {
    if (b.type === "flame") {
      const grad = ctx.createRadialGradient(
        b.pos.x - cam.x,
        b.pos.y - cam.y,
        b.radius * 0.2,
        b.pos.x - cam.x,
        b.pos.y - cam.y,
        b.radius * 1.6
      );
      grad.addColorStop(0, "rgba(255,210,120,0.9)");
      grad.addColorStop(1, "rgba(255,120,60,0.3)");
      ctx.fillStyle = grad;
      ctx.strokeStyle = "rgba(255,150,80,0.6)";
      ctx.lineWidth = 2;
    } else {
      ctx.fillStyle = "#7cf29c";
      ctx.strokeStyle = null;
    }
    ctx.beginPath();
    ctx.arc(b.pos.x - cam.x, b.pos.y - cam.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    if (b.type === "flame") ctx.stroke();
  }
}

export function drawPlayer(ctx, world, player, input, cam, classChoice) {
  const screenX = player.pos.x - cam.x;
  const screenY = player.pos.y - cam.y;
  const aimAngle = Math.atan2(input.mouse.worldY - player.pos.y, input.mouse.worldX - player.pos.x);
  const mounts = barrelMounts(player.barrels, classChoice, player.radius);

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.fillStyle = "#4ad7d1";
  ctx.strokeStyle = "#0a0f1a";
  ctx.lineWidth = 3;
  mounts.forEach((m) => {
    const offset = rotatePoint(m.x, m.y, aimAngle);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.rotate(aimAngle + m.angleOffset);
    ctx.beginPath();
    ctx.rect(player.radius * 0.2, -6, player.radius + 18, 12);
    ctx.fillStyle = "#5ff0c8";
    ctx.fill();
    ctx.restore();
  });
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(screenX - player.radius, screenY + player.radius + 6, player.radius * 2, 6);
  ctx.fillStyle = "#7cf29c";
  const hpPercent = Math.max(0, player.health / player.maxHealth);
  ctx.fillRect(screenX - player.radius, screenY + player.radius + 6, player.radius * 2 * hpPercent, 6);
}

export function drawBorder(ctx, world, cam) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 4;
  ctx.strokeRect(-cam.x, -cam.y, world.size, world.size);
  ctx.restore();
}

export function drawGameOver(ctx, canvas) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f66";
  ctx.font = "28px \"Trebuchet MS\", sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("You were destroyed", canvas.width / 2, canvas.height / 2 - 10);
  ctx.fillStyle = "#e8eefc";
  ctx.font = "16px \"Trebuchet MS\", sans-serif";
  ctx.fillText("Refresh to try again", canvas.width / 2, canvas.height / 2 + 18);
  ctx.restore();
}
