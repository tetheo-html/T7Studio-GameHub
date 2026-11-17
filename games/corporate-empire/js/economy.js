
export class Economy {
  constructor() {
    this.money = 1000;
    this.wood = 100;
    this.ore = 50;

    this.products = 0;
    this.productCapacity = 100;

    // Preço inicial de cada produto.
    this.productPrice = 45;
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

  sellProducts(amount = "all") {
    const available = Math.floor(this.products);

    const quantity = amount === "all"
      ? available
      : Math.min(Math.floor(amount), available);

    if (quantity <= 0) {
      return {
        ok: false,
        message: "Você não possui produtos para vender."
      };
    }

    const earned = quantity * this.productPrice;

    this.products -= quantity;
    this.money += earned;

    return {
      ok: true,
      sold: quantity,
      earned,
      message: `${quantity} produtos vendidos por $${earned.toLocaleString("pt-BR")}!`
    };
  }
}
