
import { createTrack, drawTrack } from "./track.js";
import { Player, drawCar } from "./player.js";
import { Opponents } from "./opponents.js";
import { Camera } from "./camera.js";
import { createControls } from "./controls.js";
import { updateHUD, showResult } from "./hud.js";
import { resolveCollisions } from "./collision.js";

export class Game {
    constructor(trackId = "oval", totalLaps = 3) {
      this.totalLaps = totalLaps;
      
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Cria o circuito escolhido no menu.
    this.track = createTrack(trackId);

    this.player = new Player(this.track, this.totalLaps);
    this.opponents = new Opponents(this.track, this.totalLaps);
    this.camera = new Camera();
    this.controls = createControls();

    this.camera.x = this.player.x;
    this.camera.y = this.player.y;

    this.started = false;
    this.running = true;
    this.resultShown = false;

    this.startTime = 0;
    this.lastFrame = performance.now();

    this.finishOrder = [];

    document.getElementById(
      "restartButton"
    ).addEventListener("click", () => {
      window.location.reload();
    });

    requestAnimationFrame((time) => this.loop(time));
  }

  start() {
    if (this.started) return;

    this.started = true;
    this.startTime = performance.now();

    document.getElementById(
      "menuScreen"
    ).classList.add("hidden");

    document.body.classList.add("racing");
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  registerFinishers() {
    const racers = [
      this.player,
      ...this.opponents.cars
    ];

    for (const racer of racers) {
      if (
        racer.finished &&
        !this.finishOrder.includes(racer)
      ) {
        this.finishOrder.push(racer);

        console.log(
          "Piloto chegou em:",
          this.finishOrder.length
        );
      }
    }
  }

  getPosition() {
    const racers = [
      this.player,
      ...this.opponents.cars
    ];

    racers.sort((a, b) => {
      return b.progress - a.progress;
    });

    return racers.indexOf(this.player) + 1;
  }

  update(dt) {
    if (!this.started || !this.running) return;

    this.player.update(
      this.controls,
      this.track,
      dt
    );

    this.opponents.update(
      this.track,
      dt,
      this.player
    );

    resolveCollisions(
      this.player,
      this.opponents
    );

    this.registerFinishers();

    this.camera.update(this.player, dt);

    const elapsed =
      performance.now() - this.startTime;

    const position = this.getPosition();

    updateHUD(
      this.player,
      position,
      elapsed
    );

    if (
      this.player.finished &&
      !this.resultShown
    ) {
      this.running = false;
      this.resultShown = true;

                const racers = [
            this.player,
            ...this.opponents.cars
          ];

          showResult(
            position,
            elapsed,
            racers,
            this.player
          );
    }
  }

  render() {
    const ctx = this.ctx;

    ctx.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    ctx.save();

    this.camera.apply(ctx, this.canvas);

    drawTrack(ctx, this.track);
    this.opponents.draw(ctx);
    drawCar(ctx, this.player, true);

    ctx.restore();
  }

  loop(time) {
    const dt = Math.min(
      (time - this.lastFrame) / 1000,
      0.033
    );

    this.lastFrame = time;

    this.update(dt);
    this.render();

    requestAnimationFrame((nextTime) => {
      this.loop(nextTime);
    });
  }
}
