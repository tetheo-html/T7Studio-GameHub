
import { CONFIG } from "./config.js";

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  follow(target, map) {
    this.x = target.x + target.width / 2 - CONFIG.width / 2;
    this.y = target.y + target.height / 2 - CONFIG.height / 2;

    const maxX = map.width * CONFIG.tileSize - CONFIG.width;
    const maxY = map.height * CONFIG.tileSize - CONFIG.height;

    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
  }
}
