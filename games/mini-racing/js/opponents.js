
import { drawCar } from "./player.js";

function angleDifference(target, current) {
  let difference = target - current;

  while (difference > Math.PI) {
    difference -= Math.PI * 2;
  }

  while (difference < -Math.PI) {
    difference += Math.PI * 2;
  }

  return difference;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class Opponents {
  constructor(track, totalLaps = 3) {
    this.cars = [];
    this.totalLaps = totalLaps;

    const colors = [
      "#2979ff",
      "#fdd835",
      "#8e24aa",
      "#eeeeee",
      "#ff8f00"
    ];

    const speeds = [340, 350, 330, 345, 335];
    const lanes = [-25, 25, -12, 12, 0];

    for (let i = 0; i < 5; i++) {
      const index = (i + 1) * 5;

      const point = track.points[index];
      const next = track.points[
        (index + 1) % track.points.length
      ];

      const angle = Math.atan2(
        next.y - point.y,
        next.x - point.x
      );

      this.cars.push({
        x: point.x,
        y: point.y,
        angle,

        speed: 0,
        maxSpeed: speeds[i],
        targetSpeed: speeds[i],

        waypoint: index,
        startWaypoint: index,

        lap: 1,
        progress: index,
        finished: false,

        baseLane: lanes[i],
        laneOffset: lanes[i],

        color: colors[i]
      });
    }
  }

  getAvoidance(car) {
    let avoidance = 0;

    const forwardX = Math.cos(car.angle);
    const forwardY = Math.sin(car.angle);

    for (const other of [this.player, ...this.cars]) {
      if (!other || other === car || other.finished) continue;

      const dx = other.x - car.x;
      const dy = other.y - car.y;

      const forwardDistance =
        dx * forwardX + dy * forwardY;

      const sideDistance =
        dx * -forwardY + dy * forwardX;

      if (
        forwardDistance > 0 &&
        forwardDistance < 150 &&
        Math.abs(sideDistance) < 65
      ) {
        avoidance += sideDistance >= 0 ? -65 : 65;
      }
    }

    return clamp(avoidance, -65, 65);
  }

  update(track, dt, player = null) {
    const points = track.points;
    const total = points.length;

    this.player = player;

    for (const car of this.cars) {
      // Não param mais quando terminam a corrida.
      if (car.finished) continue;

      let target = points[car.waypoint];

      let distance = Math.hypot(
        target.x - car.x,
        target.y - car.y
      );

      let attempts = 0;

      while (distance < 65 && attempts < 5) {
        const previousWaypoint = car.waypoint;

        car.waypoint = (car.waypoint + 1) % total;

        if (
          car.waypoint < previousWaypoint &&
          !car.finished
        ) {
          car.lap++;

          if (car.lap > this.totalLaps) {
  car.lap = this.totalLaps;
  car.finished = true;
  car.progress = this.totalLaps * total;

  console.log("Bot terminou a corrida!");

  break;
  }
}

        target = points[car.waypoint];

        distance = Math.hypot(
          target.x - car.x,
          target.y - car.y
        );

        attempts++;
      }

      const avoidance = this.getAvoidance(car);

      const desiredLane = clamp(
        car.baseLane + avoidance * 0.35,
        -40,
        40
      );

      car.laneOffset += (
        desiredLane - car.laneOffset
      ) * Math.min(1, dt * 3);

      const lookAhead = 8;

      const previous = points[
        (car.waypoint - 2 + total) % total
      ];

      const lookAheadPoint = points[
        (car.waypoint + lookAhead) % total
      ];

      const trackAngle = Math.atan2(
        lookAheadPoint.y - previous.y,
        lookAheadPoint.x - previous.x
      );

      const targetX =
        target.x - Math.sin(trackAngle) * car.laneOffset;

      const targetY =
        target.y + Math.cos(trackAngle) * car.laneOffset;

      const targetAngle = Math.atan2(
        targetY - car.y,
        targetX - car.x
      );

      const difference = angleDifference(
        targetAngle,
        car.angle
      );

      const turnRate = 2.5 * dt;

      car.angle += clamp(
        difference,
        -turnRate,
        turnRate
      );

      car.speed += (
        car.targetSpeed - car.speed
      ) * Math.min(1, dt * 2);

      car.x += Math.cos(car.angle) * car.speed * dt;
      car.y += Math.sin(car.angle) * car.speed * dt;

      // O progresso fica congelado após a chegada.
      if (!car.finished) {
        car.progress =
          (car.lap - 1) * total + car.waypoint;
      }
    }
  }

  draw(ctx) {
  for (const car of this.cars) {
    if (car.finished) continue;

    drawCar(ctx, car);
    }
  }
}