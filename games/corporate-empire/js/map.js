
export function createMap() {
  return {
    width: 2400,
    height: 1600,

    resources: [
      { id: 1, type: "tree", x: 930, y: 620, amount: 500 },
      { id: 2, type: "tree", x: 1010, y: 570, amount: 500 },
      { id: 3, type: "tree", x: 850, y: 700, amount: 500 },
      { id: 4, type: "tree", x: 1450, y: 650, amount: 500 },
      { id: 5, type: "tree", x: 1530, y: 700, amount: 500 },

      { id: 6, type: "ore", x: 1500, y: 1050, amount: 600 },
      { id: 7, type: "ore", x: 1580, y: 1100, amount: 600 },
      { id: 8, type: "ore", x: 1430, y: 1150, amount: 600 }
    ]
  };
}

export function drawMap(ctx, map) {
  ctx.fillStyle = "#647c4d";
  ctx.fillRect(0, 0, map.width, map.height);

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
