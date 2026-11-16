
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
  }
};

export class BuildingSystem {
  constructor(startX = 1200, startY = 800) {
    this.buildings = [
      {
        type: "headquarters",
        x: startX,
        y: startY,
        timer: 0
      }
    ];
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

    // Verifica os edifícios das duas empresas.
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
    for (const building of this.buildings) {
      const definition = BUILDING_TYPES[building.type];

      if (!definition.output) continue;

      // Produção da fábrica.
      if (definition.recipe) {
        const recipe = definition.recipe;

        const hasMaterials =
          economy.wood >= recipe.wood &&
          economy.ore >= recipe.ore;

        if (!hasMaterials) {
          building.timer = 0;
          continue;
        }

        building.timer += dt;

        if (building.timer >= definition.productionTime) {
          economy.wood -= recipe.wood;
          economy.ore -= recipe.ore;

          economy.add("products", 1);

          building.timer -= definition.productionTime;
        }

        continue;
      }

      // Produção das construções tradicionais.
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

      building.timer += dt;

      const possibleProduction = Math.floor(
        building.timer * definition.rate
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

        building.timer -= wholeUnits / definition.rate;
      }
    }
  }

  draw(ctx, borderColor = "#e4d5a7", companyName = null) {
    for (const building of this.buildings) {
      const definition = BUILDING_TYPES[building.type];

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
        definition.name,
        building.x,
        building.y + definition.height / 2 + 17
      );

      // Identifica a sede de cada empresa.
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
