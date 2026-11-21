
import { CONFIG } from "./config.js";

export class DayNight {
  constructor() {
    this.phase = "day";
    this.phaseTime = 0;

    this.dayDuration = 240;
    this.nightDuration = 180;

    this.dayNumber = 1;

    this.lanternOn = false;
    this.battery = 100;

    // Canvas separado para desenhar a escuridão.
    this.darkCanvas = document.createElement("canvas");
    this.darkCanvas.width = CONFIG.width;
    this.darkCanvas.height = CONFIG.height;

    this.darkCtx = this.darkCanvas.getContext("2d");
  }

  update(deltaTime) {
    this.phaseTime += deltaTime;

    if (this.phase === "day") {
      if (this.phaseTime >= this.dayDuration) {
        this.phase = "night";
        this.phaseTime = 0;
      }
    } else {
      if (this.lanternOn && this.battery > 0) {
        this.battery -= deltaTime * 2;
        this.battery = Math.max(0, this.battery);
      }

      if (this.battery <= 0) {
        this.lanternOn = false;
      }

      if (this.phaseTime >= this.nightDuration) {
        this.phase = "day";
        this.phaseTime = 0;
        this.dayNumber++;
      }
    }
  }

  toggleLantern() {
    if (this.battery <= 0) {
      this.lanternOn = false;
      return;
    }

    this.lanternOn = !this.lanternOn;
  }

  getClock() {
    let hours;
    let minutes;

    if (this.phase === "day") {
      const progress = this.phaseTime / this.dayDuration;
      const totalMinutes = 8 * 60 + progress * 10 * 60;

      hours = Math.floor(totalMinutes / 60) % 24;
      minutes = Math.floor(totalMinutes % 60);
    } else {
      const progress = this.phaseTime / this.nightDuration;
      const totalMinutes = 18 * 60 + progress * 12 * 60;

      hours = Math.floor(totalMinutes / 60) % 24;
      minutes = Math.floor(totalMinutes % 60);
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  getPhaseName() {
    return this.phase === "day"
      ? "DIA | PREPARAÇÃO"
      : "NOITE | PERIGO";
  }

  draw(ctx, player, camera) {
    if (this.phase === "day") return;

    const darkness = this.darkCtx;

    darkness.clearRect(0, 0, CONFIG.width, CONFIG.height);

    // Camada de escuridão.
    darkness.fillStyle = "rgba(3, 7, 12, 0.94)";
    darkness.fillRect(0, 0, CONFIG.width, CONFIG.height);

    const playerX =
      player.x + player.width / 2 - camera.x;

    const playerY =
      player.y + player.height / 2 - camera.y;

    const radius = this.lanternOn ? 105 : 38;

    // Abre uma área de visão ao redor do jogador.
    const gradient = darkness.createRadialGradient(
      playerX,
      playerY,
      5,
      playerX,
      playerY,
      radius
    );

    gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
    gradient.addColorStop(0.65, "rgba(0, 0, 0, 0.75)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    darkness.globalCompositeOperation = "destination-out";
    darkness.fillStyle = gradient;
    darkness.fillRect(0, 0, CONFIG.width, CONFIG.height);

    darkness.globalCompositeOperation = "source-over";

    // Aplica a escuridão ao jogo.
    ctx.drawImage(this.darkCanvas, 0, 0);
  }
}
