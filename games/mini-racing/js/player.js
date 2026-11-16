
export class Player {
  constructor(track, totalLaps = 3) {
    const start = track.points[0];
    const next = track.points[1];

    this.x = start.x;
    this.y = start.y;

    this.angle = Math.atan2(
      next.y - start.y,
      next.x - start.x
    );

    this.speed = 0;
    this.maxSpeed = 430;
    this.acceleration = 260;
    this.braking = 520;
    this.friction = 95;

    // Voltas
    this.totalLaps = Number(totalLaps) || 3;
    this.lap = 1;

    this.lastWaypoint = 0;
    this.progress = 0;
    this.finished = false;

    // Linha de chegada
    this.finishLineArmed = false;
    this.previousFinishSide = 0;

    this.color = "#e53935";
  }

  getFinishSide(track) {
    const start = track.points[0];
    const next = track.points[1];

    const dx = next.x - start.x;
    const dy = next.y - start.y;
    const length = Math.hypot(dx, dy);

    const tx = dx / length;
    const ty = dy / length;

    const px = this.x - start.x;
    const py = this.y - start.y;

    return {
      side: px * tx + py * ty,
      lateral: px * -ty + py * tx
    };
  }

  // Colisão física com as bordas da pista.
  resolveTrackBoundary(track) {
    const points = track.points;
    const total = points.length;

    let nearestX = 0;
    let nearestY = 0;
    let nearestDistance = Infinity;

    // Encontra o segmento mais próximo.
    for (let i = 0; i < total; i++) {
      const a = points[i];
      const b = points[(i + 1) % total];

      const dx = b.x - a.x;
      const dy = b.y - a.y;

      const lengthSquared = dx * dx + dy * dy;

      if (lengthSquared === 0) continue;

      const t = Math.max(
        0,
        Math.min(
          1,
          ((this.x - a.x) * dx +
            (this.y - a.y) * dy) /
            lengthSquared
        )
      );

      const closestX = a.x + dx * t;
      const closestY = a.y + dy * t;

      const distance = Math.hypot(
        this.x - closestX,
        this.y - closestY
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestX = closestX;
        nearestY = closestY;
      }
    }

    // Limite seguro para o tamanho do carro.
    const maxDistance = Math.max(
      0,
      track.width / 2 - 28
    );

    if (nearestDistance <= maxDistance) return;
    if (nearestDistance < 0.001) return;

    const dx = this.x - nearestX;
    const dy = this.y - nearestY;

    const nx = dx / nearestDistance;
    const ny = dy / nearestDistance;

    // Impede que o carro atravesse a parede.
    this.x = nearestX + nx * maxDistance;
    this.y = nearestY + ny * maxDistance;

    // Calcula a velocidade atual.
    const oldAngle = this.angle;

    let vx = Math.cos(this.angle) * this.speed;
    let vy = Math.sin(this.angle) * this.speed;

    // Verifica se o carro está empurrando contra a parede.
    const outwardSpeed = vx * nx + vy * ny;

    if (outwardSpeed > 0) {
      // Remove a velocidade que empurra o carro
      // para fora da pista.
      vx -= outwardSpeed * nx;
      vy -= outwardSpeed * ny;

      // Pequena perda de energia no impacto.
      vx *= 0.98;
      vy *= 0.98;

      const newSpeed = Math.hypot(vx, vy);

      if (newSpeed < 1) {
        this.speed = 0;
        return;
      }

      // Preserva a possibilidade de andar de ré.
      const headingX = Math.cos(oldAngle);
      const headingY = Math.sin(oldAngle);

      const direction =
        vx * headingX + vy * headingY < 0 ? -1 : 1;

      if (direction < 0) {
        this.angle = Math.atan2(-vy, -vx);
      } else {
        this.angle = Math.atan2(vy, vx);
      }

      this.speed = newSpeed * direction;
    }
  }

  update(input, track, dt) {
    if (this.finished) return;

    // Aceleração e frenagem.
    if (input.accelerate) {
      this.speed += this.acceleration * dt;
    } else if (input.brake) {
      if (this.speed > 0) {
        this.speed -= this.braking * dt;
      } else {
        this.speed -= this.acceleration * 0.55 * dt;
      }
    } else {
      if (this.speed > 0) {
        this.speed = Math.max(
          0,
          this.speed - this.friction * dt
        );
      } else if (this.speed < 0) {
        this.speed = Math.min(
          0,
          this.speed + this.friction * dt
        );
      }
    }

    this.speed = Math.max(
      -100,
      Math.min(this.maxSpeed, this.speed)
    );

    // Direção.
    const speedFactor = Math.min(
      1,
      Math.abs(this.speed) / 100
    );

    let steering = 0;

    if (input.left) steering -= 1;
    if (input.right) steering += 1;

    const reverseFactor = this.speed < 0 ? -1 : 1;

    this.angle +=
      steering *
      2.5 *
      speedFactor *
      reverseFactor *
      dt;

    // Movimento.
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;

    // Resolve a colisão imediatamente após o movimento.
    this.resolveTrackBoundary(track);

    this.updateProgress(track);
  }

  updateProgress(track) {
    const points = track.points;
    const total = points.length;

    let bestIndex = this.lastWaypoint;
    let bestDistance = Infinity;

    for (let offset = -3; offset <= 18; offset++) {
      const index =
        (this.lastWaypoint + offset + total) % total;

      const p = points[index];

      const dx = p.x - this.x;
      const dy = p.y - this.y;
      const distance = dx * dx + dy * dy;

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    }

    this.lastWaypoint = bestIndex;

    // Detecção da linha de chegada.
    const gate = this.getFinishSide(track);

    if (gate.side > 55) {
      this.finishLineArmed = true;
    }

    const crossedFinish =
      this.finishLineArmed &&
      this.previousFinishSide < 0 &&
      gate.side >= 0 &&
      Math.abs(gate.lateral) <= track.width / 2 + 30;

    if (crossedFinish) {
      this.lap++;

      if (this.lap > this.totalLaps) {
        this.lap = this.totalLaps;
        this.finished = true;
      }

      this.finishLineArmed = false;
    }

    this.previousFinishSide = gate.side;

    this.progress = Math.min(
      this.totalLaps * total,
      (this.lap - 1) * total + bestIndex
    );
  }
}

// Desenho dos carros.
export function drawCar(ctx, car, isPlayer = false) {
  ctx.save();

  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  // Sombra.
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(-17, -8, 38, 20);

  // Corpo.
  ctx.fillStyle = car.color || "#ffffff";
  ctx.fillRect(-19, -10, 38, 20);

  // Para-brisa.
  ctx.fillStyle = "#20252b";
  ctx.fillRect(1, -7, 9, 14);

  // Detalhe frontal.
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(14, -7, 4, 4);
  ctx.fillRect(14, 3, 4, 4);

  if (isPlayer) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(-20, -11, 40, 22);
  }

  ctx.restore();
}
