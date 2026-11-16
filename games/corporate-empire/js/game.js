import {
  createMap,
  drawMap,
  drawTerritoryInfo
} from "./map.js";
import { Camera } from "./camera.js";
import { Economy } from "./economy.js";
import { BuildingSystem } from "./buildings.js";
import { CompetitorAI } from "./competitors.js";
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
    this.competitor = new CompetitorAI();

    this.showTerritoryInfo = false;

this.territoryToggle = document.getElementById(
  "territoryToggle"
);

this.territoryToggle.addEventListener("click", () => {
  this.showTerritoryInfo = !this.showTerritoryInfo;

  this.territoryToggle.classList.toggle(
    "active",
    this.showTerritoryInfo
  );

  this.territoryToggle.textContent =
    this.showTerritoryInfo
      ? "👁 Informações: ON"
      : "👁 Informações: OFF";
});

    this.keys = new Set();
    this.selectedBuilding = null;

    this.mouse = {
      x: 0,
      y: 0,
      inside: false
    };

    this.time = 0;
    this.lastTime = 0;

    this.ui = new UI(
      this.economy,
      type => this.selectBuilding(type),
      this.buildings
    );

    this.resize();
    this.addEvents();

    this.ui.update(this.competitor);
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
        this.economy,
        this.competitor.buildings.buildings
      );

      this.ui.setMessage(result.message);

      if (result.ok) {
        this.selectBuilding(null);
      }

      this.ui.update(this.competitor);
    });
  }

  selectBuilding(type) {
    this.selectedBuilding = type;
    this.ui.select(type);

    if (type) {
      this.ui.setMessage(
        "Mova o mouse e clique para construir. ESC ou botão direito cancela."
      );
    } else {
      this.ui.setMessage("Construção cancelada.");
    }
  }

  update(dt) {
    this.time += dt;

   this.camera.update(
      this.keys,
      dt,
      this.map,
      this.canvas
    );

    // Atualiza sua empresa.
    this.buildings.update(
      dt,
      this.map,
      this.economy
    );

    // Atualiza a NEXUS INDUSTRIES.
    this.competitor.update(
      dt,
      this.map,
      this.buildings.buildings
    );

    // Atualiza o painel.
    this.ui.update(this.competitor);
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

if (this.showTerritoryInfo) {
  drawTerritoryInfo(ctx, this.map);
}

    this.buildings.draw(ctx);
    this.competitor.draw(ctx);

    drawWorkers(
      ctx,
      this.buildings.buildings,
      this.time
    );

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
        this.map,
        this.competitor.buildings.buildings
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