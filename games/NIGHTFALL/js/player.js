
import { CONFIG } from "./config.js";

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.width = CONFIG.playerSize;
    this.height = CONFIG.playerSize;

    this.speed = CONFIG.walkSpeed;
    this.color = "#d8c99b";
  }

  update(deltaTime, keys, map) {
    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"]) dy--;
    if (keys["s"] || keys["arrowdown"]) dy++;
    if (keys["a"] || keys["arrowleft"]) dx--;
    if (keys["d"] || keys["arrowright"]) dx++;

    // Evita movimento diagonal mais rápido.
    const length = Math.hypot(dx, dy);

    if (length > 0) {
      dx /= length;
      dy /= length;
    }

    const speed = keys["shift"]
      ? CONFIG.runSpeed
      : CONFIG.walkSpeed;

    const moveX = dx * speed * deltaTime;
    const moveY = dy * speed * deltaTime;

    const worldWidth = map.width * CONFIG.tileSize;
    const worldHeight = map.height * CONFIG.tileSize;

    const nextX = this.x + moveX;

    if (
      nextX >= 0 &&
      nextX + this.width <= worldWidth &&
      !map.isBlocked(nextX, this.y, this.width, this.height)
    ) {
      this.x = nextX;
    }

    const nextY = this.y + moveY;

    if (
      nextY >= 0 &&
      nextY + this.height <= worldHeight &&
      !map.isBlocked(this.x, nextY, this.width, this.height)
    ) {
      this.y = nextY;
    }
  }

  draw(ctx, camera) {
    const screenX = Math.round(this.x - camera.x);
    const screenY = Math.round(this.y - camera.y);

    // Sombra.
    ctx.fillStyle = "#111711";
    ctx.fillRect(
      screenX - 1,
      screenY + 7,
      this.width + 2,
      4
    );

    // Corpo.
    ctx.fillStyle = "#6d5543";
    ctx.fillRect(
      screenX + 2,
      screenY + 3,
      6,
      7
    );

    // Cabeça.
    ctx.fillStyle = this.color;
    ctx.fillRect(
      screenX + 2,
      screenY,
      6,
      5
    );
  }
}
