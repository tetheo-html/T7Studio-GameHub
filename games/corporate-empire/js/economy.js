export class Economy {
  constructor() {
    this.money = 1000;
    this.wood = 100;
    this.ore = 50;
    this.products = 0;
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

    this[resource] += amount;
  }
}