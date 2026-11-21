
import { CONFIG } from "./config.js";

export class GameMap {
  constructor() {
    this.width = CONFIG.mapWidth;
    this.height = CONFIG.mapHeight;
    this.tileSize = CONFIG.tileSize;

    this.trees = [];
    this.generate();
  }

  random(seed) {
    const value = Math.sin(seed * 127.1) * 43758.5453;
    return value - Math.floor(value);
  }

  generate() {
    this.trees = [];

    for (let y = 2; y < this.height - 2; y++) {
      for (let x = 2; x < this.width - 2; x++) {
        // Espaço reservado para a cabana e seus arredores.
        if (x >= 27 && x <= 33 && y >= 26 && y <= 33) {
          continue;
        }

        const seed = x * 73 + y * 191;
        const chance = this.random(seed);

        if (chance > 0.88) {
          this.trees.push({
            x: x * this.tileSize,
            y: y * this.tileSize,
            size: this.tileSize
          });
        }
      }
    }
  }

  isBlocked(x, y, width, height) {
    const cabin = {
      x: 29 * this.tileSize,
      y: 28 * this.tileSize,
      width: 3 * this.tileSize,
      height: 3 * this.tileSize
    };

    if (
      x < cabin.x + cabin.width &&
      x + width > cabin.x &&
      y < cabin.y + cabin.height &&
      y + height > cabin.y
    ) {
      return true;
    }

    for (const tree of this.trees) {
      const treeBox = {
        x: tree.x + 2,
        y: tree.y + 5,
        width: 12,
        height: 9
      };

      if (
        x < treeBox.x + treeBox.width &&
        x + width > treeBox.x &&
        y < treeBox.y + treeBox.height &&
        y + height > treeBox.y
      ) {
        return true;
      }
    }

    return false;
  }

  draw(ctx, camera) {
    const size = this.tileSize;

    const startX = Math.max(0, Math.floor(camera.x / size));
    const startY = Math.max(0, Math.floor(camera.y / size));

    const endX = Math.min(
      this.width,
      Math.ceil((camera.x + CONFIG.width) / size) + 1
    );

    const endY = Math.min(
      this.height,
      Math.ceil((camera.y + CONFIG.height) / size) + 1
    );

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const variation = this.random(x * 73 + y * 191);
        const color = variation > 0.5
          ? CONFIG.colors.grass
          : CONFIG.colors.darkGrass;

        ctx.fillStyle = color;
        ctx.fillRect(
          x * size - camera.x,
          y * size - camera.y,
          size,
          size
        );
      }
    }

    this.drawCabin(ctx, camera);
    this.drawTrees(ctx, camera);
  }

  drawCabin(ctx, camera) {
    const x = 29 * this.tileSize - camera.x;
    const y = 28 * this.tileSize - camera.y;

    // Sombra.
    ctx.fillStyle = "#152018";
    ctx.fillRect(x - 3, y + 8, 54, 43);

    // Paredes.
    ctx.fillStyle = "#756044";
    ctx.fillRect(x, y + 8, 48, 40);

    // Telhado.
    ctx.fillStyle = "#493b30";
    ctx.fillRect(x - 4, y, 56, 22);

    ctx.fillStyle = "#8d714a";
    ctx.fillRect(x + 5, y + 23, 38, 3);

    // Porta.
    ctx.fillStyle = "#30251d";
    ctx.fillRect(x + 19, y + 29, 10, 19);

    // Janela.
    ctx.fillStyle = "#9b9b6b";
    ctx.fillRect(x + 6, y + 29, 8, 8);
  }

  drawTrees(ctx, camera) {
    for (const tree of this.trees) {
      const x = tree.x - camera.x;
      const y = tree.y - camera.y;

      if (
        x < -32 || y < -32 ||
        x > CONFIG.width + 32 ||
        y > CONFIG.height + 32
      ) {
        continue;
      }

      // Tronco.
      ctx.fillStyle = "#493b28";
      ctx.fillRect(x + 5, y + 8, 6, 8);

      // Copa.
      ctx.fillStyle = CONFIG.colors.treeShadow;
      ctx.fillRect(x + 1, y + 5, 14, 10);

      ctx.fillStyle = CONFIG.colors.tree;
      ctx.fillRect(x + 3, y + 1, 10, 12);

      ctx.fillStyle = "#29482d";
      ctx.fillRect(x + 5, y + 3, 5, 5);
    }
  }
}
