
export function drawWorkers(ctx, buildings, time) {
  for (const building of buildings) {
    if (building.type === "headquarters") continue;

    for (let i = 0; i < 2; i++) {
      const angle = time * 1.5 + i * Math.PI;

      const x = building.x + Math.cos(angle) * 48;
      const y = building.y + Math.sin(angle) * 38;

      ctx.fillStyle = "#f0d49a";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#392b1c";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
