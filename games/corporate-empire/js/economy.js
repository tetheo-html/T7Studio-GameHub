export class Economy {
  constructor() {
    this.money = 1000;
    this.wood = 100;
    this.ore = 50;

    this.products = 0;

    // Estoque inicial.
    this.productCapacity = 100;
  }

  canAfford(cost) {
    return (
      this.money >= (cost.money || 0) &&
      this.wood >= (cost.wood || 0) &&
      this.ore >= (cost.ore || 0)
    );
  }

  spend(cost) {
    if (!this.canAfford(cost)) return false;

    this.money -= cost.money || 0;
    this.wood -= cost.wood || 0;
    this.ore -= cost.ore || 0;

    return true;
  }

  add(resource, amount) {
    if (!(resource in this)) return;

    if (resource === "products") {
      this.products = Math.min(
        this.products + amount,
        this.productCapacity
      );

      return;
    }

    this[resource] += amount;
  }

  getStockPercentage() {
    if (this.productCapacity <= 0) return 0;

    return Math.min(
      100,
      (this.products / this.productCapacity) * 100
    );
  }
}