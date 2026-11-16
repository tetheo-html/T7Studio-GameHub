export class Camera {
  constructor() {
    this.x = 1200;
    this.y = 800;
    this.zoom = 0.8;
    this.speed = 650;
  }

  update(keys, dt, map, canvas) {
    let dx = 0;
    let dy = 0;

    if (keys.has("w") || keys.has("arrowup")) dy -= 1;
    if (keys.has("s") || keys.has("arrowdown")) dy += 1;
    if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
    if (keys.has("d") || keys.has("arrowright")) dx += 1;

    const length = Math.hypot(dx, dy) || 1;

    this.x += (dx / length) * this.speed * dt / this.zoom;
    this.y += (dy / length) * this.speed * dt / this.zoom;

    const viewportWidth = canvas ? canvas.width : 1000;
    const viewportHeight = canvas ? canvas.height : 600;

    const halfWidth = Math.min(
      map.width / 2,
      viewportWidth / (2 * this.zoom)
    );

    const halfHeight = Math.min(
      map.height / 2,
      viewportHeight / (2 * this.zoom)
    );

    this.x = Math.max(
      halfWidth,
      Math.min(map.width - halfWidth, this.x)
    );

    this.y = Math.max(
      halfHeight,
      Math.min(map.height - halfHeight, this.y)
    );
  }

  screenToWorld(screenX, screenY, canvas) {
    return {
      x: (screenX - canvas.width / 2) / this.zoom + this.x,
      y: (screenY - canvas.height / 2) / this.zoom + this.y
    };
  }

  zoomAt(delta) {
    this.zoom *= delta > 0 ? 0.9 : 1.1;
    this.zoom = Math.max(0.4, Math.min(1.6, this.zoom));
  }

  // Aproxima ou afasta mantendo o ponto escolhido no mesmo lugar.
  zoomAtPoint(screenX, screenY, canvas, factor) {
    const worldBefore = this.screenToWorld(
      screenX,
      screenY,
      canvas
    );

    this.zoom = Math.max(
      0.4,
      Math.min(1.6, this.zoom * factor)
    );

    this.x = worldBefore.x -
      (screenX - canvas.width / 2) / this.zoom;

    this.y = worldBefore.y -
      (screenY - canvas.height / 2) / this.zoom;
  }
}