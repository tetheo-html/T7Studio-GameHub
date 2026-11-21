
import { CONFIG } from "./config.js";

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.width = CONFIG.playerSize;
    this.height = CONFIG.playerSize;

    this.color = "#d8c99b";

    // Direção do personagem.
    this.direction = "down";

    // Animação.
    this.animationTime = 0;
    this.animationFrame = 0;

    this.isMoving = false;
    this.isRunning = false;

    // Base para o futuro sistema de ruído.
    this.noiseLevel = 0;
  }

  update(deltaTime, keys, map) {
    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"]) dy--;
    if (keys["s"] || keys["arrowdown"]) dy++;
    if (keys["a"] || keys["arrowleft"]) dx--;
    if (keys["d"] || keys["arrowright"]) dx++;

    this.isMoving = dx !== 0 || dy !== 0;
    this.isRunning = this.isMoving && !!keys["shift"];

    // Atualiza a direção.
    if (this.isMoving) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? "right" : "left";
      } else {
        this.direction = dy > 0 ? "down" : "up";
      }
    }

    // Animação de movimento.
    if (this.isMoving) {
      this.animationTime += deltaTime;

      const animationSpeed = this.isRunning ? 0.09 : 0.16;

      this.animationFrame =
        Math.floor(this.animationTime / animationSpeed) % 2;
    } else {
      this.animationTime = 0;
      this.animationFrame = 0;
    }

    // Nível de ruído.
    this.noiseLevel = this.isRunning
      ? 1
      : this.isMoving
        ? 0.25
        : 0;

    // Normaliza movimento diagonal.
    const length = Math.hypot(dx, dy);

    if (length > 0) {
      dx /= length;
      dy /= length;
    }

    const speed = this.isRunning
      ? CONFIG.runSpeed
      : CONFIG.walkSpeed;

    const moveX = dx * speed * deltaTime;
    const moveY = dy * speed * deltaTime;

    const worldWidth = map.width * CONFIG.tileSize;
    const worldHeight = map.height * CONFIG.tileSize;

    // Movimento horizontal.
    const nextX = this.x + moveX;

    if (
      nextX >= 0 &&
      nextX + this.width <= worldWidth &&
      !map.isBlocked(nextX, this.y, this.width, this.height)
    ) {
      this.x = nextX;
    }

    // Movimento vertical.
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
    const x = Math.round(
      this.x + this.width / 2 - 7 - camera.x
    );

    const y = Math.round(
      this.y + this.height / 2 - 8 - camera.y
    );

    const frame = this.animationFrame;

    // Pequeno movimento vertical.
    const bob = this.isMoving && frame === 1 ? -1 : 0;

    // Sombra.
    ctx.fillStyle = "#111711";
    ctx.fillRect(x + 1, y + 14, 12, 3);

    // Pernas animadas.
    ctx.fillStyle = "#343d3c";

    if (this.isMoving && frame === 1) {
      ctx.fillRect(x + 3, y + 10 + bob, 3, 5);
      ctx.fillRect(x + 8, y + 11 + bob, 3, 4);
    } else {
      ctx.fillRect(x + 3, y + 10 + bob, 3, 4);
      ctx.fillRect(x + 8, y + 10 + bob, 3, 4);
    }

    // Botas.
    ctx.fillStyle = "#25231f";
    ctx.fillRect(x + 2, y + 13 + bob, 4, 2);
    ctx.fillRect(x + 8, y + 13 + bob, 4, 2);

    // Braços.
    ctx.fillStyle = "#80634c";
    ctx.fillRect(x + 1, y + 6 + bob, 3, 5);
    ctx.fillRect(x + 10, y + 6 + bob, 3, 5);

    // Corpo.
    ctx.fillStyle = "#526354";
    ctx.fillRect(x + 3, y + 5 + bob, 7, 7);

    // Mochila.
    ctx.fillStyle = "#394438";
    ctx.fillRect(x + 2, y + 6 + bob, 2, 5);

    // Cabeça.
    ctx.fillStyle = this.color;
    ctx.fillRect(x + 4, y + 1 + bob, 6, 5);

    // Cabelo.
    ctx.fillStyle = "#392c25";

    if (this.direction === "up") {
      ctx.fillRect(x + 4, y + bob, 6, 4);
    } else {
      ctx.fillRect(x + 4, y + bob, 6, 2);
    }

    // Rosto.
    ctx.fillStyle = "#30251e";

    if (this.direction === "down") {
      ctx.fillRect(x + 5, y + 4 + bob, 1, 1);
      ctx.fillRect(x + 8, y + 4 + bob, 1, 1);
    } else if (this.direction === "left") {
      ctx.fillRect(x + 4, y + 4 + bob, 1, 1);
    } else if (this.direction === "right") {
      ctx.fillRect(x + 9, y + 4 + bob, 1, 1);
    }

    // Detalhe da roupa.
    ctx.fillStyle = "#a1a17a";
    ctx.fillRect(x + 6, y + 6 + bob, 1, 3);
  }
}
