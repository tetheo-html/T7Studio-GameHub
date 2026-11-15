
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function resolveCollisions(player, opponents) {
  const cars = [player, ...opponents.cars];

  const CAR_RADIUS = 23;
  const PUSH_FORCE = 0.55;
  const SPEED_LOSS = 0.97;
  const IMPACT_LOSS = 5;

  for (let i = 0; i < cars.length; i++) {
    for (let j = i + 1; j < cars.length; j++) {
      const a = cars[i];
      const b = cars[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;

      const distance = Math.hypot(dx, dy);
      const minDistance = CAR_RADIUS * 2;

      if (distance >= minDistance) continue;

      const nx = distance > 0 ? dx / distance : 1;
      const ny = distance > 0 ? dy / distance : 0;

      const overlap = minDistance - distance;

      // Separa os carros
      a.x -= nx * overlap * 0.5;
      a.y -= ny * overlap * 0.5;

      b.x += nx * overlap * 0.5;
      b.y += ny * overlap * 0.5;

      // Perda pequena de velocidade
      a.speed = Math.max(0, a.speed * SPEED_LOSS - IMPACT_LOSS);
      b.speed = Math.max(0, b.speed * SPEED_LOSS - IMPACT_LOSS);

      // Pequeno impulso
      a.speed -= PUSH_FORCE;
      b.speed -= PUSH_FORCE;

      a.speed = clamp(a.speed, 0, a.maxSpeed || 430);
      b.speed = clamp(b.speed, 0, b.maxSpeed || 430);
    }
  }
}
