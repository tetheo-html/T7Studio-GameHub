
export function drawResources(ctx, resources) {
  for (const resource of resources) {
    if (resource.amount <= 0) continue;

    if (resource.type === "tree") {
      ctx.fillStyle = "#493725";
      ctx.fillRect(resource.x - 5, resource.y, 10, 20);

      ctx.fillStyle = "#244d2d";
      ctx.beginPath();
      ctx.arc(resource.x, resource.y - 8, 23, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#35683a";
      ctx.beginPath();
      ctx.arc(resource.x - 9, resource.y - 14, 13, 0, Math.PI * 2);
      ctx.fill();
    }

    if (resource.type === "ore") {
      ctx.fillStyle = "#626a70";
      ctx.beginPath();
      ctx.moveTo(resource.x - 23, resource.y + 12);
      ctx.lineTo(resource.x - 13, resource.y - 15);
      ctx.lineTo(resource.x + 7, resource.y - 23);
      ctx.lineTo(resource.x + 25, resource.y - 4);
      ctx.lineTo(resource.x + 17, resource.y + 17);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#a5afb5";
      ctx.fillRect(resource.x - 7, resource.y - 12, 10, 5);
    }
  }
}
