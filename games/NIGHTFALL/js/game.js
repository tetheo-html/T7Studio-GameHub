
import { CONFIG } from "./config.js";
import { GameMap } from "./map.js";
import { Player } from "./player.js";
import { Camera } from "./camera.js";
import { DayNight } from "./daynight.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.canvas.width = CONFIG.width;
    this.canvas.height = CONFIG.height;

    this.map = new GameMap();

    this.player = new Player(
      30 * CONFIG.tileSize + 24,
      33 * CONFIG.tileSize
    );

    this.camera = new Camera();
    this.dayNight = new DayNight();

    this.keys = {};
    this.lastTime = 0;
    this.running = false;

    this.statusElement = document.getElementById("status");
    this.clockElement = document.getElementById("clock");
    this.lanternElement = document.getElementById("lantern-status");

    this.setupInput();
  }

  setupInput() {
    window.addEventListener("keydown", event => {
      const key = event.key.toLowerCase();

      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
          .includes(key)
      ) {
        event.preventDefault();
      }

      // Evita repetir o comando enquanto F estiver pressionado.
      if (key === "f" && !event.repeat) {
        this.dayNight.toggleLantern();
      }

      this.keys[key] = true;
    });

    window.addEventListener("keyup", event => {
      this.keys[event.key.toLowerCase()] = false;
    });

    window.addEventListener("blur", () => {
      this.keys = {};
    });
  }

  start() {
    if (this.running) return;

    this.running = true;
    requestAnimationFrame(time => this.loop(time));
  }

  loop(timestamp) {
    if (!this.running) return;

    const deltaTime = this.lastTime
      ? Math.min((timestamp - this.lastTime) / 1000, 0.05)
      : 0;

    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(time => this.loop(time));
  }

  update(deltaTime) {
    this.player.update(deltaTime, this.keys, this.map);

    this.dayNight.update(deltaTime);

    this.camera.follow(this.player, this.map);

    this.updateHUD();
  }

  updateHUD() {
    this.statusElement.textContent =
      `DIA ${this.dayNight.dayNumber} | ${this.dayNight.getPhaseName()}`;

    this.clockElement.textContent =
      this.dayNight.getClock();

    this.lanternElement.textContent =
      `LANTERNA: ${Math.ceil(this.dayNight.battery)}%`;
  }

  render() {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

    this.map.draw(ctx, this.camera);
    this.player.draw(ctx, this.camera);

    this.dayNight.draw(ctx, this.player, this.camera);
  }
}
