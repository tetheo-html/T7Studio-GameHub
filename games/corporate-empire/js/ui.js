export class UI {
  constructor(economy, onBuild, buildings) {
    this.economy = economy;
    this.onBuild = onBuild;
    this.buildings = buildings;

    // Recursos do jogador.
    this.money = document.getElementById("money");
    this.wood = document.getElementById("wood");
    this.ore = document.getElementById("ore");
    this.products = document.getElementById("products");
    this.message = document.getElementById("gameMessage");

    // Painel de concorrência.
    this.playerCapital = document.getElementById("playerCapital");
    this.playerProducts = document.getElementById("playerProducts");
    this.playerFactories = document.getElementById("playerFactories");
    this.playerProduction = document.getElementById("playerProduction");

    this.rivalCapital = document.getElementById("rivalCapital");
    this.rivalProducts = document.getElementById("rivalProducts");
    this.rivalFactories = document.getElementById("rivalFactories");
    this.rivalProduction = document.getElementById("rivalProduction");

    this.economicLeader = document.getElementById("economicLeader");

    this.buttons = document.querySelectorAll("[data-building]");

    for (const button of this.buttons) {
      button.addEventListener("click", () => {
        this.onBuild(button.dataset.building);
      });
    }
  }

  formatMoney(value) {
    return "$" + Math.floor(value).toLocaleString("pt-BR");
  }

  getCompanyStats(economy, buildingList) {
    const factories = buildingList.filter(
      building => building.type === "factory"
    ).length;

    return {
      money: economy.money,
      products: economy.products,
      factories,
      production: factories * 12
    };
  }

  update(competitor) {
    // Recursos do jogador.
    this.money.textContent = Math.floor(
      this.economy.money
    ).toLocaleString("pt-BR");

    this.wood.textContent = Math.floor(this.economy.wood);
    this.ore.textContent = Math.floor(this.economy.ore);
    this.products.textContent = Math.floor(this.economy.products);

    // Dados das empresas.
    const player = this.getCompanyStats(
      this.economy,
      this.buildings.buildings
    );

    const rival = this.getCompanyStats(
      competitor.economy,
      competitor.buildings.buildings
    );

    // T7STUDIO.
    this.playerCapital.textContent = this.formatMoney(player.money);
    this.playerProducts.textContent = Math.floor(player.products);
    this.playerFactories.textContent = player.factories;
    this.playerProduction.textContent = player.production + "/min";

    // NEXUS INDUSTRIES.
    this.rivalCapital.textContent = this.formatMoney(rival.money);
    this.rivalProducts.textContent = Math.floor(rival.products);
    this.rivalFactories.textContent = rival.factories;
    this.rivalProduction.textContent = rival.production + "/min";

    // Liderança econômica.
    if (player.money > rival.money) {
      this.economicLeader.textContent = "T7STUDIO";
      this.economicLeader.style.color = "#e4bd62";
    } else if (rival.money > player.money) {
      this.economicLeader.textContent = "NEXUS INDUSTRIES";
      this.economicLeader.style.color = "#ed7777";
    } else {
      this.economicLeader.textContent = "EMPATE";
      this.economicLeader.style.color = "#ffffff";
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