
export class UI {
  constructor(economy, onBuild) {
    this.economy = economy;
    this.onBuild = onBuild;

    this.money = document.getElementById("money");
    this.wood = document.getElementById("wood");
    this.ore = document.getElementById("ore");
    this.products = document.getElementById("products");
    this.message = document.getElementById("gameMessage");

    this.buttons = document.querySelectorAll("[data-building]");

    for (const button of this.buttons) {
      button.addEventListener("click", () => {
        this.onBuild(button.dataset.building);
      });
    }
  }

  update() {
    this.money.textContent = Math.floor(this.economy.money).toLocaleString("pt-BR");
    this.wood.textContent = Math.floor(this.economy.wood);
    this.ore.textContent = Math.floor(this.economy.ore);

    if (this.products) {
      this.products.textContent = Math.floor(this.economy.products);
    }
  }

  setMessage(message) {
    this.message.textContent = message;
  }

  select(type) {
    for (const button of this.buttons) {
      button.classList.toggle(
        "active",
        button.dataset.building === type
      );
    }
  }
}
