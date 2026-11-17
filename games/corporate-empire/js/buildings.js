
export const BUILDING_TYPES = {
  headquarters: {
    name: "Sede",
    width: 100,
    height: 80,
    color: "#b49a63"
  },

  sawmill: {
    name: "Serraria",
    width: 76,
    height: 64,
    color: "#9b7144",
    cost: { money: 250, wood: 40 },
    resource: "tree",
    output: "wood",
    rate: 1.2
  },

  mine: {
    name: "Mineradora",
    width: 76,
    height: 64,
    color: "#777f86",
    cost: { money: 350, wood: 50 },
    resource: "ore",
    output: "ore",
    rate: 1.2
  },

  commercialCenter: {
    name: "Centro Comercial",
    width: 90,
    height: 76,
    color: "#a9cf47",
    cost: { money: 400, wood: 30 },
    output: "money",
    rate: 3
  },

  factory: {
    name: "Fábrica",
    width: 92,
    height: 78,
    color: "#668da8",
    cost: { money: 600, wood: 50 },
    recipe: {
      wood: 2,
      ore: 1
    },
    output: "products",
    productionTime: 5
  },

  warehouse: {
    name: "Armazém",
    width: 86,
    height: 72,
    color: "#b58b53",
    cost: { money: 300, wood: 40 }
  }
};

const UPGRADE_COSTS = {
  sawmill: [500, 900],
  mine: [600, 1000],
  factory: [800, 1300],
  commercialCenter: [700, 1100],
  warehouse: [400, 700]
};

export class BuildingSystem {
  constructor(startX = 1200, startY = 800) {
    this.buildings = [
      {
        type: "headquarters",
        x: startX,
        y: startY,
        timer: 0,
        level: 1
      }
    ];
  }

  findBuildingAt(x, y) {
    // Verifica primeiro as construções desenhadas por último.
    for (let i = this.buildings.length - 1; i >= 0; i--) {
      const building = this.buildings[i];
      const definition = BUILDING_TYPES[building.type];

      if (
        Math.abs(x - building.x) <= definition.width / 2 &&
        Math.abs(y - building.y) <= definition.height / 2
      ) {
        return building;
      }
    }

    return null;
  }

  getUpgradeInfo(building) {
    if (!building) return null;

    const costs = UPGRADE_COSTS[building.type];

    if (!costs) return null;

    const level = building.level || 1;

    if (level >= 3) return null;

    const cost = costs[level - 1];

    const effects = {
      sawmill: "Produção de madeira +25%",
      mine: "Produção de minério +25%",
      factory: "Tempo de produção reduzido",
      commercialCenter: "Geração de dinheiro +50%",
      warehouse: "Capacidade do estoque +100"
    };

    return {
      currentLevel: level,
      nextLevel: level + 1,
      cost,
      effect: effects[building.type]
    };
  }

  upgrade(building, economy) {
    const info = this.getUpgradeInfo(building);

    if (!info) {
      return {
        ok: false,
        message: "Essa construção já está no nível máximo."
      };
    }

    if (!economy.spend({ money: info.cost })) {
      return {
        ok: false,
        message: "Dinheiro insuficiente para a melhoria."
      };
    }

    building.level = info.nextLevel;

    return {
      ok: true,
      message: `${BUILDING_TYPES[building.type].name} melhorada para o nível ${building.level}!`
    };
  }

  checkPlacement(type, x, y, map, occupiedBuildings = []) {
    const definition = BUILDING_TYPES[type];

    if (!definition || !definition.cost) {
      return {
        ok: false,
        message: "Construção inválida."
      };
    }

    const halfWidth = definition.width / 2;
    const halfHeight = definition.height / 2;

    if (
      x - halfWidth < 0 ||
      y - halfHeight < 0 ||
      x + halfWidth > map.width ||
      y + halfHeight > map.height
    ) {
      return {
        ok: false,
        message: "Fora dos limites do mapa."
      };
    }

    const spacing = 12;

    const allBuildings = [
      ...this.buildings,
      ...occupiedBuildings
    ];

    for (const building of allBuildings) {
      const other = BUILDING_TYPES[building.type];

      const overlaps =
        Math.abs(x - building.x) <
          (definition.width + other.width) / 2 + spacing &&
        Math.abs(y - building.y) <
          (definition.height + other.height) / 2 + spacing;

      if (overlaps) {
        return {
          ok: false,
          message: "Espaço ocupado."
        };
      }
    }

    let target = null;

    if (definition.resource) {
      target = map.resources
        .filter(resource =>
          resource.type === definition.resource &&
          resource.amount > 0
        )
        .sort((a, b) =>
          Math.hypot(a.x - x, a.y - y) -
          Math.hypot(b.x - x, b.y - y)
        )[0];

      if (
        !target ||
        Math.hypot(target.x - x, target.y - y) > 260
      ) {
        return {
          ok: false,
          message: definition.resource === "tree"
            ? "Construa perto de árvores."
            : "Construa perto de minério."
        };
      }
    }

    return {
      ok: true,
      target
    };
  }

  place(type, x, y, map, economy, occupiedBuildings = []) {
    const definition = BUILDING_TYPES[type];

    const validation = this.checkPlacement(
      type,
      x,
      y,
      map,
      occupiedBuildings
    );

    if (!validation.ok) {
      return validation;
    }

    if (!economy.spend(definition.cost)) {
      return {
        ok: false,
        message: "Recursos insuficientes."
      };
    }

    this.buildings.push({
      type,
      x,
      y,
      timer: 0,
      level: 1,
      targetId: validation.target
        ? validation.target.id
        : null
    });

    return {
      ok: true,
      message: definition.name + " construída!"
    };
  }

  update(dt, map, economy) {
    // Capacidade: 100 iniciais + 100 por nível de armazém.
    const warehouses = this.buildings.filter(
      building => building.type === "warehouse"
    );

    economy.productCapacity = 100;

    for (const warehouse of warehouses) {
      const level = warehouse.level || 1;

      economy.productCapacity += 100 * level;
    }

    for (const building of this.buildings) {
      const definition = BUILDING_TYPES[building.type];
      const level = building.level || 1;

      if (!definition.output) continue;

      // Fábrica.
      if (definition.recipe) {
        if (economy.products >= economy.productCapacity) {
          continue;
        }

        const recipe = definition.recipe;

        const hasMaterials =
          economy.wood >= recipe.wood &&
          economy.ore >= recipe.ore;

        if (!hasMaterials) {
          building.timer = 0;
          continue;
        }

        const productionTime = Math.max(
          2.5,
          definition.productionTime - (level - 1) * 0.75
        );

        building.timer += dt;

        if (building.timer >= productionTime) {
          economy.wood -= recipe.wood;
          economy.ore -= recipe.ore;

          economy.add("products", 1);

          building.timer -= productionTime;
        }

        continue;
      }

      // Produção de madeira, minério e dinheiro.
      const resource = definition.resource
        ? map.resources.find(
            item => item.id === building.targetId
          )
        : null;

      if (
        definition.resource &&
        (!resource || resource.amount <= 0)
      ) {
        continue;
      }

      let rate = definition.rate;

      if (building.type === "sawmill" || building.type === "mine") {
        rate *= 1 + (level - 1) * 0.25;
      }

      if (building.type === "commercialCenter") {
        rate *= 1 + (level - 1) * 0.5;
      }

      building.timer += dt;

      const possibleProduction = Math.floor(
        building.timer * rate
      );

      const wholeUnits = definition.resource
        ? Math.min(
            possibleProduction,
            Math.floor(resource.amount)
          )
        : possibleProduction;

      if (wholeUnits >= 1) {
        if (definition.output === "money") {
          economy.money += wholeUnits;
        } else {
          economy.add(definition.output, wholeUnits);
          resource.amount -= wholeUnits;
        }

        building.timer -= wholeUnits / rate;
      }
    }
  }

  draw(ctx, borderColor = "#e4d5a7", companyName = null) {
    for (const building of this.buildings) {
      const definition = BUILDING_TYPES[building.type];
      const level = building.level || 1;

      ctx.fillStyle = "rgba(0,0,0,0.25)";

      ctx.fillRect(
        building.x - definition.width / 2 + 5,
        building.y - definition.height / 2 + 6,
        definition.width,
        definition.height
      );

      ctx.fillStyle = definition.color;

      ctx.fillRect(
        building.x - definition.width / 2,
        building.y - definition.height / 2,
        definition.width,
        definition.height
      );

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;

      ctx.strokeRect(
        building.x - definition.width / 2,
        building.y - definition.height / 2,
        definition.width,
        definition.height
      );

      ctx.fillStyle = "#fff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";

      ctx.fillText(
        `${definition.name} (N${level})`,
        building.x,
        building.y + definition.height / 2 + 17
      );

      if (
        companyName &&
        building.type === "headquarters"
      ) {
        ctx.fillStyle = borderColor;
        ctx.font = "bold 14px Arial";

        ctx.fillText(
          companyName,
          building.x,
          building.y - definition.height / 2 - 12
        );
      }
    }
  }

  drawPreview(ctx, type, x, y, map, occupiedBuildings = []) {
    const definition = BUILDING_TYPES[type];

    if (!definition) return;

    const validation = this.checkPlacement(
      type,
      x,
      y,
      map,
      occupiedBuildings
    );

    const valid = validation.ok;

    ctx.save();
    ctx.globalAlpha = 0.55;

    ctx.fillStyle = valid ? "#42d66b" : "#ef4545";

    ctx.fillRect(
      x - definition.width / 2,
      y - definition.height / 2,
      definition.width,
      definition.height
    );

    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 3;
    ctx.strokeStyle = valid ? "#baffc8" : "#ffc0c0";

    ctx.strokeRect(
      x - definition.width / 2,
      y - definition.height / 2,
      definition.width,
      definition.height
    );

    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      valid ? "LOCAL VÁLIDO" : validation.message,
      x,
      y - definition.height / 2 - 10
    );

    ctx.restore();
  }
}
