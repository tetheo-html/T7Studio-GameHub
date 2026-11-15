export class Camera {
  constructor() {
    this.x = 1200;
    this.y = 900;
    this.smoothing = 5;
  }

  update(target, dt) {
    const factor = 1 - Math.exp(-this.smoothing * dt);

    this.x += (target.x - this.x) * factor;
    this.y += (target.y - this.y) * factor;
  }

  apply(ctx, canvas) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.translate(-this.x, -this.y);
  }
}