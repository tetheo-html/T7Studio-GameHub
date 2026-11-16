
const TRACK_WIDTH = 190;
const POINT_COUNT = 220;

// =====================================
// SELEÇÃO DE CIRCUITOS
// =====================================

export function createTrack(trackId = "oval") {
  if (trackId === "oval") {
    return createOvalTrack();
  }

  if (trackId === "technical") {
    return createTechnicalTrack();
  }

  if (trackId === "grand-prix") {
    return createGrandPrixTrack();
  }

  throw new Error("Circuito não implementado: " + trackId);
}

// =====================================
// OVAL CIRCUIT
// =====================================

function createOvalTrack() {
  const points = [];

  for (let i = 0; i < POINT_COUNT; i++) {
    const t = -Math.PI / 2 +
      (i / POINT_COUNT) * Math.PI * 2;

    points.push({
      x: 1200 + 760 * Math.cos(t),
      y: 900 + 520 * Math.sin(t)
    });
  }

  return {
    id: "oval",
    points,
    width: TRACK_WIDTH
  };
}

// =====================================
// INTERPOLAÇÃO DOS WAYPOINTS
// =====================================

function interpolateTrack(controlPoints, id, steps) {
  const points = [];
  const count = controlPoints.length;

  for (let i = 0; i < count; i++) {
    const p0 = controlPoints[(i - 1 + count) % count];
    const p1 = controlPoints[i];
    const p2 = controlPoints[(i + 1) % count];
    const p3 = controlPoints[(i + 2) % count];

    for (let j = 0; j < steps; j++) {
      const t = j / steps;
      const t2 = t * t;
      const t3 = t2 * t;

      const x = 0.5 * (
        2 * p1.x +
        (-p0.x + p2.x) * t +
        (2*p0.x - 5*p1.x + 4*p2.x - p3.x) * t2 +
        (-p0.x + 3*p1.x - 3*p2.x + p3.x) * t3
      );

      const y = 0.5 * (
        2 * p1.y +
        (-p0.y + p2.y) * t +
        (2*p0.y - 5*p1.y + 4*p2.y - p3.y) * t2 +
        (-p0.y + 3*p1.y - 3*p2.y + p3.y) * t3
      );

      points.push({ x, y });
    }
  }

  return {
    id,
    points,
    width: TRACK_WIDTH
  };
}

// =====================================
// TECHNICAL CIRCUIT
// =====================================

function createTechnicalTrack() {
  const controlPoints = [
    { x: 800, y: 1400 },
    { x: 1400, y: 1400 },
    { x: 1800, y: 1400 },

    { x: 2020, y: 1370 },
    { x: 2150, y: 1250 },
    { x: 2150, y: 1100 },
    { x: 2050, y: 950 },
    { x: 1850, y: 900 },

   { x: 1650, y: 950 },
   { x: 1500, y: 1030 },
   { x: 1400, y: 1110 },
   { x: 1300, y: 1140 },
   { x: 1200, y: 1120 },
   { x: 1120, y: 1040 },
   { x: 1080, y: 930 },
   { x: 1080, y: 820 },
   { x: 1140, y: 720 },
   { x: 1250, y: 660 },
   { x: 1400, y: 650 },
   { x: 1400, y: 650 },
   { x: 1600, y: 600 },

    { x: 1750, y: 500 },
    { x: 1800, y: 350 },
    { x: 1700, y: 220 },
    { x: 1500, y: 180 },
    { x: 1300, y: 220 },
    { x: 1100, y: 350 },
    { x: 950, y: 500 },
    { x: 800, y: 600 },
    { x: 650, y: 600 },
    { x: 500, y: 520 },
    { x: 350, y: 500 },

    { x: 220, y: 600 },
    { x: 150, y: 800 },
    { x: 200, y: 1000 },
    { x: 350, y: 1150 },
    { x: 320, y: 1230 },
    { x: 340, y: 1310 },
    { x: 420, y: 1370 },
    { x: 550, y: 1400 }
  ];

  return interpolateTrack(
    controlPoints,
    "technical",
    8
  );
}

// =====================================
// GRAND PRIX CIRCUIT
// =====================================

function createGrandPrixTrack() {
  const controlPoints = [
  // Reta principal
  { x: 950, y: 1300 },
  { x: 1450, y: 1300 },
  { x: 1800, y: 1300 },

  // Setor 1
  { x: 2000, y: 1250 },
  { x: 2100, y: 1100 },
  { x: 2050, y: 950 },
  { x: 1900, y: 850 },
  { x: 1700, y: 850 },

  // Setor 2
  { x: 1600, y: 750 },
  { x: 1650, y: 600 },
  { x: 1800, y: 500 },
  { x: 1800, y: 350 },

  // Setor 3
  { x: 1650, y: 250 },
  { x: 1400, y: 200 },
  { x: 1150, y: 250 },
  { x: 1000, y: 400 },
  { x: 950, y: 550 },

  // Setor 4
  { x: 800, y: 650 },
  { x: 650, y: 600 },
  { x: 500, y: 500 },
  { x: 350, y: 550 },
  { x: 250, y: 700 },
  { x: 250, y: 900 },

  // Retorno à reta, curva mais aberta
{ x: 300, y: 1000 },
{ x: 350, y: 1120 },
{ x: 500, y: 1220 },
{ x: 700, y: 1280 },
{ x: 950, y: 1300 }

];

  return interpolateTrack(
    controlPoints,
    "grand-prix",
    12
  );
}

// =====================================
// DESENHO DA PISTA
// =====================================

export function drawTrack(ctx, track) {
  const points = track.points;

  ctx.fillStyle = "#397c42";
  ctx.fillRect(0, 0, 2400, 1800);

  ctx.fillStyle = "#43894b";

  for (let x = 40; x < 2400; x += 100) {
    for (let y = 40; y < 1800; y += 100) {
      ctx.fillRect(x, y, 3, 3);
    }
  }

  function drawPath(color, width) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  drawPath("#eeeeee", TRACK_WIDTH + 28);

  ctx.setLineDash([24, 18]);
  drawPath("#e53935", TRACK_WIDTH + 16);
  ctx.setLineDash([]);

  drawPath("#45494c", TRACK_WIDTH);

  ctx.setLineDash([18, 20]);
  drawPath("#ffffff35", 2);
  ctx.setLineDash([]);

  drawFinishLine(ctx, track);
}

// =====================================
// LINHA DE CHEGADA
// =====================================

export function drawFinishLine(ctx, track) {
  const a = track.points[0];
  const b = track.points[1];

  const angle = Math.atan2(
    b.y - a.y,
    b.x - a.x
  );

  const half = track.width / 2;
  const squares = 12;
  const squareSize = (half * 2) / squares;

  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(angle);

  for (let i = 0; i < squares; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#fff" : "#171717";
    ctx.fillRect(-8, -half + i * squareSize, 16, squareSize);
  }

  ctx.restore();
}

// =====================================
// WAYPOINTS E COLISÃO COM A PISTA
// =====================================

export function getNearestWaypoint(track, x, y) {
  let bestIndex = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < track.points.length; i++) {
    const p = track.points[i];

    const dx = p.x - x;
    const dy = p.y - y;
    const distance = dx * dx + dy * dy;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  return {
    index: bestIndex,
    distance: Math.sqrt(bestDistance)
  };
}

export function isOnTrack(track, x, y) {
  const nearest = getNearestWaypoint(track, x, y);

  return nearest.distance <= TRACK_WIDTH / 2 - 8;
}
