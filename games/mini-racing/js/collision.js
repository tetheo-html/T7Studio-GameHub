
const CAR_LENGTH = 38;
const CAR_WIDTH = 20;

function getAxes(car) {
  return [
    {
      x: Math.cos(car.angle),
      y: Math.sin(car.angle)
    },
    {
      x: -Math.sin(car.angle),
      y: Math.cos(car.angle)
    }
  ];
}

function projectRadius(car, axis) {
  const forward = {
    x: Math.cos(car.angle),
    y: Math.sin(car.angle)
  };

  const side = {
    x: -forward.y,
    y: forward.x
  };

  return (
    CAR_LENGTH / 2 * Math.abs(forward.x * axis.x + forward.y * axis.y) +
    CAR_WIDTH / 2 * Math.abs(side.x * axis.x + side.y * axis.y)
  );
}

function resolveCarCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  const axes = [...getAxes(a), ...getAxes(b)];

  let smallestOverlap = Infinity;
  let collisionAxis = null;

  for (const axis of axes) {
    const distance = dx * axis.x + dy * axis.y;

    const radiusA = projectRadius(a, axis);
    const radiusB = projectRadius(b, axis);

    const overlap = radiusA + radiusB - Math.abs(distance);

    if (overlap <= 0) return;

    if (overlap < smallestOverlap) {
      smallestOverlap = overlap;

      collisionAxis = {
        x: axis.x * (distance < 0 ? -1 : 1),
        y: axis.y * (distance < 0 ? -1 : 1)
      };
    }
  }

  if (!collisionAxis) return;

  const push = (smallestOverlap + 0.5) / 2;

  a.x -= collisionAxis.x * push;
  a.y -= collisionAxis.y * push;

  b.x += collisionAxis.x * push;
  b.y += collisionAxis.y * push;

  a.speed *= 0.97;
  b.speed *= 0.97;
}

// Encontra o segmento central mais próximo do carro.
function getNearestSegment(car, track) {
  let nearest = null;
  let nearestDistance = Infinity;

  const points = track.points;

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) continue;

    const t = Math.max(
      0,
      Math.min(
        1,
        ((car.x - a.x) * dx + (car.y - a.y) * dy) /
          lengthSquared
      )
    );

    const x = a.x + dx * t;
    const y = a.y + dy * t;

    const distance = Math.hypot(car.x - x, car.y - y);

    if (distance < nearestDistance) {
      nearestDistance = distance;

      const length = Math.sqrt(lengthSquared);

      nearest = {
        x,
        y,
        tx: dx / length,
        ty: dy / length
      };
    }
  }

  return nearest;
}

// Colisão retangular do carro com as bordas.
function resolveTrackBoundary(car, track) {
  const segment = getNearestSegment(car, track);

  if (!segment) return;

  const nx = -segment.ty;
  const ny = segment.tx;

  const dx = car.x - segment.x;
  const dy = car.y - segment.y;

  const lateral = dx * nx + dy * ny;

  const forwardX = Math.cos(car.angle);
  const forwardY = Math.sin(car.angle);

  const sideX = -forwardY;
  const sideY = forwardX;

  // Quanto o retângulo do carro ocupa na direção da borda.
  const extent =
    CAR_LENGTH / 2 * Math.abs(forwardX * nx + forwardY * ny) +
    CAR_WIDTH / 2 * Math.abs(sideX * nx + sideY * ny);

  const limit = Math.max(0, track.width / 2 - extent);

  if (Math.abs(lateral) <= limit) return;

  const direction = Math.sign(lateral) || 1;
  const correction = Math.abs(lateral) - limit;

  car.x -= nx * direction * correction;
  car.y -= ny * direction * correction;

  // Remove apenas a velocidade que empurra o carro para fora.
  let vx = Math.cos(car.angle) * car.speed;
  let vy = Math.sin(car.angle) * car.speed;

  const outwardX = nx * direction;
  const outwardY = ny * direction;

  const outwardSpeed = vx * outwardX + vy * outwardY;

  if (outwardSpeed > 0) {
    vx -= outwardSpeed * outwardX;
    vy -= outwardSpeed * outwardY;

    vx *= 0.98;
    vy *= 0.98;

    const newSpeed = Math.hypot(vx, vy);

    if (newSpeed < 1) {
      car.speed = 0;
      return;
    }

    const oldForwardX = Math.cos(car.angle);
    const oldForwardY = Math.sin(car.angle);

    const reverse =
      vx * oldForwardX + vy * oldForwardY < 0;

    if (reverse) {
      car.angle = Math.atan2(-vy, -vx);
      car.speed = -newSpeed;
    } else {
      car.angle = Math.atan2(vy, vx);
      car.speed = newSpeed;
    }
  }
}

export function resolveCollisions(player, opponents, track) {
  const bots = opponents.cars.filter(car => !car.finished);

  const cars = [player, ...bots];

  // Colisão entre carros.
  for (let i = 0; i < cars.length; i++) {
    for (let j = i + 1; j < cars.length; j++) {
      resolveCarCollision(cars[i], cars[j]);
    }
  }

  // Colisão com as bordas.
  for (const car of cars) {
    resolveTrackBoundary(car, track);
  }
}
