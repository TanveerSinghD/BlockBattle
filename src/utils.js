export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomPosition(worldSize, size, margin = 160, avoid = []) {
  let pos = {
    x: rand(margin, worldSize - margin - size),
    y: rand(margin, worldSize - margin - size),
  };
  let attempts = 0;
  while (attempts < 20) {
    const tooClose = avoid.some((item) => {
      const hasSize = typeof item.size === "number";
      const ax = item.pos.x + (hasSize ? item.size / 2 : 0);
      const ay = item.pos.y + (hasSize ? item.size / 2 : 0);
      const bx = pos.x + size / 2;
      const by = pos.y + size / 2;
      const rA = item.radius || (hasSize ? item.size / 2 : 0);
      const rB = size / 2;
      return Math.hypot(ax - bx, ay - by) < rA + rB + 80;
    });
    if (!tooClose) break;
    pos = {
      x: rand(margin, worldSize - margin - size),
      y: rand(margin, worldSize - margin - size),
    };
    attempts += 1;
  }
  return pos;
}

export function circleRectOverlap(circle, rect) {
  const closestX = Math.max(rect.pos.x, Math.min(circle.x, rect.pos.x + rect.size));
  const closestY = Math.max(rect.pos.y, Math.min(circle.y, rect.pos.y + rect.size));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

export function rotatePoint(x, y, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}
