
const MAP_WIDTH = 4000;
const MAP_HEIGHT = 3000;

// Regiões permanentes do mapa.
// width e height definem o tamanho de cada região.
const REGIONS = [
  // FLORESTAS
  { type: "forest", x: 650, y: 500, width: 520, height: 380, count: 12 },
  { type: "forest", x: 1200, y: 1050, width: 500, height: 400, count: 14 },
  { type: "forest", x: 1950, y: 1150, width: 520, height: 400, count: 14 },
  { type: "forest", x: 2600, y: 450, width: 520, height: 400, count: 12 },
  { type: "forest", x: 3400, y: 800, width: 500, height: 420, count: 12 },
  { type: "forest", x: 500, y: 2200, width: 520, height: 400, count: 12 },
  { type: "forest", x: 1800, y: 2400, width: 550, height: 400, count: 14 },
  { type: "forest", x: 3100, y: 2200, width: 550, height: 420, count: 14 },

  // MONTANHAS
  { type: "mountain", x: 1450, y: 950, width: 440, height: 350, count: 9 },
  { type: "mountain", x: 2250, y: 1450, width: 500, height: 400, count: 11 },
  { type: "mountain", x: 3000, y: 1250, width: 500, height: 400, count: 10 },
  { type: "mountain", x: 700, y: 1550, width: 450, height: 400, count: 9 },
  { type: "mountain", x: 2300, y: 2600, width: 500, height: 350, count: 10 },
  { type: "mountain", x: 3500, y: 2250, width: 450, height: 400, count: 9 }
];

function randomPointInRegion(region) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.sqrt(Math.random());

  return {
    x: region.x + Math.cos(angle) * region.width / 2 * distance,
    y: region.y + Math.sin(angle) * region.height / 2 * distance
  };
}

function generateResources(regions) {
  const resources = [];
  let nextId = 1;

  for (const region of regions) {
    const resourceType =
      region.type === "forest" ? "tree" : "ore";

    const amount =
      resourceType === "tree" ? 500 : 600;

    for (let i = 0; i < region.count; i++) {
      let position = null;

      // Evita que os depósitos fiquem muito amontoados.
      for (let attempt = 0; attempt < 80; attempt++) {
        const candidate = randomPointInRegion(region);

        const tooClose = resources.some(resource =>
          Math.hypot(
            resource.x - candidate.x,
            resource.y - candidate.y
          ) < 55
        );

        if (!tooClose) {
          position = candidate;
          break;
        }
      }

      // Se não encontrar espaço, usa uma posição aleatória.
      if (!position) {
        position = randomPointInRegion(region);
      }

       resources.push({
  id: nextId++,
  regionId: REGIONS.indexOf(region),
  type: resourceType,
  x: position.x,
  y: position.y,
  amount
});
    }
  }

  return resources;
}

export function createMap() {
  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,

    regions: REGIONS,

    resources: generateResources(REGIONS)
  };
}

export function drawMap(ctx, map) {
  // Terreno principal.
  ctx.fillStyle = "#647c4d";
  ctx.fillRect(0, 0, map.width, map.height);

  // Desenha as regiões naturais.
  for (const region of map.regions) {
    ctx.beginPath();

    ctx.ellipse(
      region.x,
      region.y,
      region.width / 2,
      region.height / 2,
      0,
      0,
      Math.PI * 2
    );

    if (region.type === "forest") {
      ctx.fillStyle = "rgba(31, 76, 39, 0.42)";
      ctx.strokeStyle = "rgba(39, 91, 45, 0.7)";
    } else {
      ctx.fillStyle = "rgba(105, 111, 116, 0.48)";
      ctx.strokeStyle = "rgba(145, 148, 145, 0.75)";
    }

    ctx.fill();
    ctx.lineWidth = 5;
    ctx.stroke();

    // Nome da região.
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      region.type === "forest" ? "FLORESTA" : "MONTANHAS",
      region.x,
      region.y
    );
  }

  // Grade do terreno.
  ctx.strokeStyle = "rgba(25, 45, 25, 0.12)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= map.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, map.height);
    ctx.stroke();
  }

  for (let y = 0; y <= map.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(map.width, y);
    ctx.stroke();
  }

  // Limites do mapa.
  ctx.strokeStyle = "#d2bd83";
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, map.width, map.height);
}

export function drawTerritoryInfo(ctx, map) {
  for (let i = 0; i < map.regions.length; i++) {
    const region = map.regions[i];

    const deposits = map.resources.filter(
      resource => resource.regionId === i
    );

    const available = deposits.filter(
      resource => resource.amount > 0
    );

    const total = deposits.reduce(
      (sum, resource) => sum + resource.amount,
      0
    );

    const resourceName =
      region.type === "forest" ? "MADEIRA" : "MINÉRIO";

    const color =
      region.type === "forest" ? "#a8d88b" : "#c5cbd1";

    const boxWidth = 230;
    const boxHeight = 76;

    const x = region.x - boxWidth / 2;
    const y = region.y - boxHeight / 2;

    ctx.save();

    // Fundo da informação.
    ctx.fillStyle = "rgba(15, 22, 17, 0.88)";
    ctx.fillRect(x, y, boxWidth, boxHeight);

    // Borda.
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    // Nome da região.
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.font = "bold 16px Arial";

    ctx.fillText(
      region.type === "forest" ? "REGIÃO FLORESTAL" : "REGIÃO MONTANHOSA",
      region.x,
      y + 22
    );

    // Quantidade de depósitos.
    ctx.fillStyle = "#ffffff";
    ctx.font = "13px Arial";

    ctx.fillText(
      `${available.length}/${deposits.length} depósitos ativos`,
      region.x,
      y + 43
    );

    // Estoque restante.
    ctx.fillStyle = "#e4bd62";

    ctx.fillText(
      `${resourceName}: ${Math.floor(total).toLocaleString("pt-BR")} unidades`,
      region.x,
      y + 62
    );

    ctx.restore();
  }
}