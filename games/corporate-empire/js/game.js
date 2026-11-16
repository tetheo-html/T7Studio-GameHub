import { createMap, drawMap } from "./map.js";
import { Camera } from "./camera.js";
import { Economy } from "./economy.js";
import { BuildingSystem } from "./buildings.js";
import { drawResources } from "./resources.js";
import { drawWorkers } from "./workers.js";
import { UI } from "./ui.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.map = createMap();
    this.camera = new Camera();
    this.economy = new Economy();
    this.buildings = new BuildingSystem();

    this.keys = new Set();
    this.selectedBuilding = null;

    // Guardamos a posição do mouse na tela.
    // A posição no mundo é recalculada durante a renderização,
    // inclusive quando a câmera se move.
    this.mouse = {
      x: 0,
      y: 0,
      inside: false
    };

    this.time = 0;
    this.lastTime = 0;

    this.ui = new UI(
      this.economy,
      type => this.selectBuilding(type)
    );

    this.resize();
    this.addEvents();
    this.ui.update();
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  getWorldPosition(event) {
    const rect = this.canvas.getBoundingClientRect();

    return this.camera.screenToWorld(
      event.clientX - rect.left,
      event.clientY - rect.top,
      this.canvas
    );
  }

  addEvents() {
    window.addEventListener("resize", () => this.resize());

    window.addEventListener("keydown", event => {
      const key = event.key.toLowerCase();
      this.keys.add(key);

      if (key.startsWith("arrow")) {
        event.preventDefault();
      }

      if (key === "escape" && this.selectedBuilding) {
        this.selectBuilding(null);
      }
    });

    window.addEventListener("keyup", event => {
      this.keys.delete(event.key.toLowerCase());
    });

    this.canvas.addEventListener("mousemove", event => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = event.clientX - rect.left;
      this.mouse.y = event.clientY - rect.top;
      this.mouse.inside = true;
    });

    this.canvas.addEventListener("mouseenter", () => {
      this.mouse.inside = true;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mouse.inside = false;
    });

    this.canvas.addEventListener("wheel", event => {
      event.preventDefault();
      this.camera.zoomAt(event.deltaY);
    }, { passive: false });

    // Botão direito cancela o modo de construção.
    this.canvas.addEventListener("contextmenu", event => {
      if (this.selectedBuilding) {
        event.preventDefault();
        this.selectBuilding(null);
      }
    });

    this.canvas.addEventListener("click", event => {
      if (!this.selectedBuilding) return;

      const world = this.getWorldPosition(event);

      const result = this.buildings.place(
        this.selectedBuilding,
        world.x,
        world.y,
        this.map,
        this.economy
      );

      this.ui.setMessage(result.message);

      if (result.ok) {
        this.selectBuilding(null);
      }

      this.ui.update();
    });
  }

  selectBuilding(type) {
    this.selectedBuilding = type;
    this.ui.select(type);

    if (type) {
      this.ui.setMessage("Mova o mouse e clique para construir. ESC ou botão direito cancela.");
    } else {
      this.ui.setMessage("Construção cancelada.");
    }
  }

  update(dt) {
    this.time += dt;

    this.camera.update(
      this.keys,
      dt,
      this.map
    );

    this.buildings.update(
      dt,
      this.map,
      this.economy
    );

    this.ui.update();
  }

  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const zoom = this.camera.zoom;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(
      canvas.width / 2 - this.camera.x * zoom,
      canvas.height / 2 - this.camera.y * zoom
    );

    ctx.scale(zoom, zoom);

    drawMap(ctx, this.map);
    drawResources(ctx, this.map.resources);
    this.buildings.draw(ctx);

    drawWorkers(
      ctx,
      this.buildings.buildings,
      this.time
    );

    // Prévia do edifício selecionado.
    if (this.selectedBuilding && this.mouse.inside) {
      const world = this.camera.screenToWorld(
        this.mouse.x,
        this.mouse.y,
        this.canvas
      );

      this.buildings.drawPreview(
        ctx,
        this.selectedBuilding,
        world.x,
        world.y,
        this.map
      );
    }
  }

  loop = (timestamp) => {
    const dt = this.lastTime
      ? Math.min((timestamp - this.lastTime) / 1000, 0.05)
      : 0;

    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop);
  };

  start() {
    requestAnimationFrame(this.loop);
  }
}
