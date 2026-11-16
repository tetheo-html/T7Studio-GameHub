
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Colisão do carro com os limites da pista.
function resolveTrackBoundary(car, track) {
  const points = track.points;
  const total = points.length;

  let nearestX = 0;
  let nearestY = 0;
  let nearestDistance = Infinity;

  // Procura o segmento mais próximo da linha central.
  for (let i = 0; i < total; i++) {
    const a = points[i];
    const b = points[(i + 1) % total];

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) continue;

    const t = clamp(
      ((car.x - a.x) * dx + (car.y - a.y) * dy) /
        lengthSquared,
      0,
      1
    );

    const closestX = a.x + dx * t;
    const closestY = a.y + dy * t;

    const distance = Math.hypot(
      car.x - closestX,
      car.y - closestY
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestX = closestX;
      nearestY = closestY;
    }
  }

  // Margem de segurança para o tamanho do carro.
  const maxDistance = Math.max(0, track.width / 2 - 28);

  if (nearestDistance <= maxDistance) return;
  if (nearestDistance < 0.001) return;

  const dx = car.x - nearestX;
  const dy = car.y - nearestY;
  
  const nx = dx / nearestDistance;
  const ny = dy / nearestDistance;

  // Coloca o carro de volta dentro da pista.
  car.x = nearestX + nx * maxDistance;
  car.y = nearestY + ny * maxDistance;

  // Perde velocidade ao bater na borda.
  car.speed *= 0.88;
}

// Colisões entre os veículos e com a pista.
export function resolveCollisions(player, opponents, track) {
  const cars = [
    player,
    ...opponents.cars.filter(car => !car.finished)
  ];

  const CAR_RADIUS = 23;
  const SPEED_LOSS = 0.97;
  const IMPACT_LOSS = 5;
  const PUSH_FORCE = 0.55;

  // Colisão entre carros.
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

      a.x -= nx * overlap * 0.5;
      a.y -= ny * overlap * 0.5;

      b.x += nx * overlap * 0.5;
      b.y += ny * overlap * 0.5;

      a.speed = Math.max(
        0,
        a.speed * SPEED_LOSS - IMPACT_LOSS
      );

      b.speed = Math.max(
        0,
        b.speed * SPEED_LOSS - IMPACT_LOSS
      );

      a.speed -= PUSH_FORCE;
      b.speed -= PUSH_FORCE;

      a.speed = clamp(a.speed, 0, a.maxSpeed || 430);
      b.speed = clamp(b.speed, 0, b.maxSpeed || 430);
    }
  }

  // Colisão com os limites da pista.
  for (const car of cars) {
    resolveTrackBoundary(car, track);
  }
}
