export function barrelMounts(count, classChoice, radius) {
  if (count <= 3) {
    const spacing = 12;
    const mid = (count - 1) / 2;
    return Array.from({ length: count }, (_, i) => ({
      x: 0,
      y: (i - mid) * spacing,
      angleOffset: (i - mid) * 0.16,
    }));
  }
  const isAssault = classChoice === "assault";
  const ring = isAssault ? radius * 0.55 : radius * 0.75;
  const arc = isAssault ? Math.PI * 0.8 : Math.PI * 2;
  const start = isAssault ? -arc / 2 : 0;
  const step = arc / Math.max(1, count - 1);
  return Array.from({ length: count }, (_, i) => {
    const theta = start + i * step;
    return {
      x: Math.cos(theta) * ring,
      y: Math.sin(theta) * ring,
      angleOffset: theta,
    };
  });
}

export function barrelAngles(baseAngle, count, classChoice, radius) {
  return barrelMounts(count, classChoice, radius).map((m) => baseAngle + m.angleOffset);
}
