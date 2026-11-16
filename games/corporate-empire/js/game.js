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

    this.cancelButton = document.getElementById("cancelBuild");

    this.cancelButton.addEventListener("click", () => {
      this.selectBuilding(null);
    });

    this.keys = new Set();
    this.selectedBuilding = null;

    this.mouse = {
      x: 0,
      y: 0,
      inside: false
    };

    // Controle de toques.
    this.activePointers = new Map();
    this.touchStart = null;
    this.pinchDistance = null;

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

  getCanvasPosition(event) {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  getWorldPosition(event) {
    const position = this.getCanvasPosition(event);

    return this.camera.screenToWorld(
      position.x,
      position.y,
      this.canvas
    );
  }

  updateMouse(event) {
    const position = this.getCanvasPosition(event);

    this.mouse.x = position.x;
    this.mouse.y = position.y;
    this.mouse.inside = true;
  }

  placeBuilding(event) {
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
  }

  getPointerDistance(a, b) {
    return Math.hypot(
      a.x - b.x,
      a.y - b.y
    );
  }

  getPointerMidpoint(a, b) {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    };
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

    // Movimento do mouse e dos dedos.
    this.canvas.addEventListener("pointermove", event => {
      this.updateMouse(event);

      if (event.pointerType !== "touch") return;

      if (!this.activePointers.has(event.pointerId)) return;

      const previous = this.activePointers.get(event.pointerId);

      const current = {
        x: event.clientX,
        y: event.clientY
      };

      this.activePointers.set(event.pointerId, current);

      // Dois dedos: zoom.
      if (this.activePointers.size >= 2) {
        const pointers = [...this.activePointers.values()];

        const distance = this.getPointerDistance(
          pointers[0],
          pointers[1]
        );

        const midpoint = this.getPointerMidpoint(
          pointers[0],
          pointers[1]
        );

        if (this.pinchDistance && distance > 0) {
          const factor = distance / this.pinchDistance;
          const rect = this.canvas.getBoundingClientRect();

          this.camera.zoomAtPoint(
            midpoint.x - rect.left,
            midpoint.y - rect.top,
            this.canvas,
            factor
          );
        }

        this.pinchDistance = distance;
        this.touchStart = null;

        return;
      }

      // Um dedo: arrastar o mapa.
      if (this.activePointers.size === 1 && this.touchStart) {
        const dx = current.x - previous.x;
        const dy = current.y - previous.y;

        const totalMovement = Math.hypot(
          current.x - this.touchStart.startX,
          current.y - this.touchStart.startY
        );

        if (totalMovement > 8) {
          this.touchStart.moved = true;
        }

        if (this.touchStart.moved) {
          this.camera.x -= dx / this.camera.zoom;
          this.camera.y -= dy / this.camera.zoom;
        }
      }
    });

    this.canvas.addEventListener("pointerdown", event => {
      if (event.pointerType !== "touch") return;

      this.canvas.setPointerCapture(event.pointerId);

      const position = {
        x: event.clientX,
        y: event.clientY
      };

      this.activePointers.set(event.pointerId, position);

      if (this.activePointers.size === 1) {
        this.touchStart = {
          startX: position.x,
          startY: position.y,
          moved: false
        };

        this.pinchDistance = null;
      }

      if (this.activePointers.size === 2) {
        const pointers = [...this.activePointers.values()];

        this.pinchDistance = this.getPointerDistance(
          pointers[0],
          pointers[1]
        );

        this.touchStart = null;
      }
    });

    this.canvas.addEventListener("pointerup", event => {
      if (event.pointerType === "touch") {
        const wasSingleTouch = this.activePointers.size === 1;

        const wasTap =
          wasSingleTouch &&
          this.touchStart &&
          !this.touchStart.moved;

        this.activePointers.delete(event.pointerId);

        if (wasTap) {
          this.placeBuilding(event);
        }

        this.touchStart = null;
        this.pinchDistance = null;

        return;
      }

      // Clique normal do computador.
      if (event.pointerType === "mouse" && event.button === 0) {
        this.updateMouse(event);
        this.placeBuilding(event);
      }
    });

    this.canvas.addEventListener("pointercancel", event => {
      this.activePointers.delete(event.pointerId);
      this.touchStart = null;
      this.pinchDistance = null;
    });

    this.canvas.addEventListener("pointerleave", event => {
      if (event.pointerType === "mouse") {
        this.mouse.inside = false;
      }
    });

    this.canvas.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse") {
        this.mouse.inside = true;
      }
    });

    // Zoom com roda do mouse.
    this.canvas.addEventListener("wheel", event => {
      event.preventDefault();

      this.camera.zoomAt(event.deltaY);
    }, { passive: false });

    // Cancelamento com botão direito.
    this.canvas.addEventListener("contextmenu", event => {
      if (this.selectedBuilding) {
        event.preventDefault();
        this.selectBuilding(null);
      }
    });
  }

  selectBuilding(type) {
    this.selectedBuilding = type;
    this.ui.select(type);

    if (type) {
      this.ui.setMessage(
        "Toque ou clique para construir. Arraste para mover o mapa."
      );

      this.cancelButton.hidden = false;
    } else {
      this.ui.setMessage("Construção cancelada.");
      this.cancelButton.hidden = true;
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

    this.buildings.update(
      dt,
      this.map,
      this.economy
    );

    this.competitor.update(
      dt,
      this.map,
      this.buildings.buildings
    );

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