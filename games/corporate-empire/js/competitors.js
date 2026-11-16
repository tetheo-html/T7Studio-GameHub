import { Economy } from "./economy.js";
import { BuildingSystem } from "./buildings.js";

export class CompetitorAI {
  constructor() {
    this.name = "NEXUS INDUSTRIES";

    // Economia independente da empresa rival.
    this.economy = new Economy();
    this.economy.money = 1500;
    this.economy.wood = 160;
    this.economy.ore = 80;

    // A sede da NEXUS fica no outro lado do mapa.
    this.buildings = new BuildingSystem(2150, 1400);

    this.decisionTimer = 0;
    this.decisionInterval = 5;
  }

  count(type) {
    return this.buildings.buildings.filter(
      building => building.type === type
    ).length;
  }

  tryBuild(type, positions, map, playerBuildings) {
    for (const position of positions) {
      const result = this.buildings.place(
        type,
        position.x,
        position.y,
        map,
        this.economy,
        playerBuildings
      );

      if (result.ok) {
        console.log(
          `[${this.name}] ${result.message}`
        );

        return true;
      }
    }

    return false;
  }

  makeDecision(map, playerBuildings) {
    // 1. Primeiro, constrói uma serraria.
    if (this.count("sawmill") < 1) {
      const trees = map.resources
        .filter(resource =>
          resource.type === "tree" &&
          resource.amount > 0
        );

      for (const tree of trees) {
        const built = this.tryBuild(
          "sawmill",
          [
            { x: tree.x - 100, y: tree.y - 80 },
            { x: tree.x + 100, y: tree.y + 80 },
            { x: tree.x - 100, y: tree.y + 80 }
          ],
          map,
          playerBuildings
        );

        if (built) return;
      }
    }

    // 2. Depois, constrói uma mineradora.
    if (this.count("mine") < 1) {
      const deposits = map.resources
        .filter(resource =>
          resource.type === "ore" &&
          resource.amount > 0
        );

      for (const deposit of deposits) {
        const built = this.tryBuild(
          "mine",
          [
            { x: deposit.x - 100, y: deposit.y - 70 },
            { x: deposit.x + 100, y: deposit.y + 70 },
            { x: deposit.x - 100, y: deposit.y + 70 }
          ],
          map,
          playerBuildings
        );

        if (built) return;
      }
    }

    // 3. Depois, investe em fábricas.
    const factories = this.count("factory");

    if (factories < 2) {
      const positions = factories === 0
        ? [
            { x: 1950, y: 1400 },
            { x: 1950, y: 1250 },
            { x: 2050, y: 1200 }
          ]
        : [
            { x: 2050, y: 1200 },
            { x: 1850, y: 1400 },
            { x: 1950, y: 1150 }
          ];

      this.tryBuild(
        "factory",
        positions,
        map,
        playerBuildings
      );
    }
  }

  update(dt, map, playerBuildings) {
    // Pequena receita da sede para manter a expansão.
    this.economy.money += dt * 1.5;

    // Produção automática da NEXUS.
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
        playerBuildings
      );
    }
  }

  draw(ctx) {
    this.buildings.draw(
      ctx,
      "#e85d5d",
      this.name
    );
  }
}