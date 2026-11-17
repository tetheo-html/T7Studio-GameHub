import { Economy } from "./economy.js";
import { BuildingSystem } from "./buildings.js";

export class CompetitorAI {
  constructor(config = {}) {
    this.name = config.name || "NEXUS INDUSTRIES";
    this.color = config.color || "#e85d5d";
    this.strategy = config.strategy || "balanced";

    this.economy = new Economy();
    this.economy.money = config.money ?? 1500;
    this.economy.wood = config.wood ?? 160;
    this.economy.ore = config.ore ?? 80;

    this.startX = config.x ?? 2150;
    this.startY = config.y ?? 1400;

    this.buildings = new BuildingSystem(
      this.startX,
      this.startY
    );

    this.decisionTimer = 0;
    this.decisionInterval = config.interval ?? 5;
    this.passiveIncome = config.passiveIncome ?? 1.5;

    this.factoryPositions = [
      { x: 160, y: 130 },
      { x: -160, y: 130 },
      { x: 160, y: -130 },
      { x: -160, y: -130 },
      { x: 0, y: 190 },
      { x: 0, y: -190 }
    ];

    this.commercialPositions = [
      { x: 0, y: 160 },
      { x: 0, y: -160 },
      { x: 190, y: 0 },
      { x: -190, y: 0 }
    ];

    this.warehousePositions = [
      { x: 210, y: 150 },
      { x: -210, y: 150 },
      { x: 210, y: -150 },
      { x: -210, y: -150 }
    ];
  }

  count(type) {
    return this.buildings.buildings.filter(
      building => building.type === type
    ).length;
  }

  tryBuild(type, positions, map, occupiedBuildings) {
    for (const position of positions) {
      const result = this.buildings.place(
        type,
        position.x,
        position.y,
        map,
        this.economy,
        occupiedBuildings
      );

      if (result.ok) {
        console.log(`[${this.name}] ${result.message}`);
        return true;
      }
    }

    return false;
  }

  getResourcePositions(resourceType, map) {
    const deposits = map.resources
      .filter(resource =>
        resource.type === resourceType &&
        resource.amount > 0
      )
      .sort((a, b) => {
        const distanceA = Math.hypot(
          a.x - this.startX,
          a.y - this.startY
        );

        const distanceB = Math.hypot(
          b.x - this.startX,
          b.y - this.startY
        );

        return distanceA - distanceB;
      });

    const offsets = [
      { x: -100, y: -80 },
      { x: 100, y: -80 },
      { x: -100, y: 80 },
      { x: 100, y: 80 },
      { x: 0, y: -120 },
      { x: 0, y: 120 }
    ];

    const positions = [];

    for (const deposit of deposits) {
      for (const offset of offsets) {
        positions.push({
          x: deposit.x + offset.x,
          y: deposit.y + offset.y
        });
      }
    }

    return positions;
  }

  getBasePositions(positionList, buildingCount) {
    const positions = [];

    for (let i = buildingCount; i < positionList.length; i++) {
      positions.push({
        x: this.startX + positionList[i].x,
        y: this.startY + positionList[i].y
      });
    }

    return positions;
  }

  buildSawmill(map, occupiedBuildings) {
    if (this.count("sawmill") >= 1) return false;

    return this.tryBuild(
      "sawmill",
      this.getResourcePositions("tree", map),
      map,
      occupiedBuildings
    );
  }

  buildMine(map, occupiedBuildings) {
    if (this.count("mine") >= 1) return false;

    return this.tryBuild(
      "mine",
      this.getResourcePositions("ore", map),
      map,
      occupiedBuildings
    );
  }

  buildFactory(map, occupiedBuildings, maximum) {
    const count = this.count("factory");

    if (count >= maximum) return false;

    return this.tryBuild(
      "factory",
      this.getBasePositions(this.factoryPositions, count),
      map,
      occupiedBuildings
    );
  }

  buildCommercialCenter(map, occupiedBuildings, maximum) {
    const count = this.count("commercialCenter");

    if (count >= maximum) return false;

    return this.tryBuild(
      "commercialCenter",
      this.getBasePositions(this.commercialPositions, count),
      map,
      occupiedBuildings
    );
  }

  buildWarehouse(map, occupiedBuildings, maximum) {
    const count = this.count("warehouse");

    if (count >= maximum) return false;

    return this.tryBuild(
      "warehouse",
      this.getBasePositions(this.warehousePositions, count),
      map,
      occupiedBuildings
    );
  }

  makeDecision(map, occupiedBuildings) {
    // Todas as empresas precisam de madeira e minério.
    if (this.buildSawmill(map, occupiedBuildings)) return;
    if (this.buildMine(map, occupiedBuildings)) return;

    // Estratégia da NEXUS: expansão equilibrada.
    if (this.strategy === "balanced") {
      if (this.buildCommercialCenter(map, occupiedBuildings, 1)) return;
      if (this.buildFactory(map, occupiedBuildings, 2)) return;
      if (this.buildWarehouse(map, occupiedBuildings, 1)) return;
    }

    // Estratégia da VERTEX: comércio e armazenamento.
    if (this.strategy === "commercial") {
      if (this.buildCommercialCenter(map, occupiedBuildings, 3)) return;
      if (this.buildWarehouse(map, occupiedBuildings, 2)) return;
      if (this.buildFactory(map, occupiedBuildings, 1)) return;
    }

    // Estratégia da FORGECORE: produção industrial.
    if (this.strategy === "industrial") {
      if (this.buildFactory(map, occupiedBuildings, 3)) return;
      if (this.buildWarehouse(map, occupiedBuildings, 1)) return;
      if (this.buildCommercialCenter(map, occupiedBuildings, 1)) return;
    }
  }

  update(dt, map, occupiedBuildings = []) {
    this.economy.money += dt * this.passiveIncome;

    this.buildings.update(
      dt,
      map,
      this.economy
    );

    this.decisionTimer += dt;

    if (this.decisionTimer >= this.decisionInterval) {
      this.decisionTimer = 0;

      this.makeDecision(
        map,
        occupiedBuildings
      );
    }
  }

  draw(ctx) {
    this.buildings.draw(
      ctx,
      this.color,
      this.name
    );
  }
}