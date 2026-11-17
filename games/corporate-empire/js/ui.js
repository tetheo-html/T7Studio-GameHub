
export class UI {
  constructor(economy, onBuild, buildings, onUpgrade) {
    this.economy = economy;
    this.onBuild = onBuild;
    this.buildings = buildings;
    this.onUpgrade = onUpgrade;

    // Recursos do jogador.
    this.money = document.getElementById("money");
    this.wood = document.getElementById("wood");
    this.ore = document.getElementById("ore");
    this.products = document.getElementById("products");
    this.message = document.getElementById("gameMessage");

    // Estoque.
    this.stockStatus = document.createElement("div");
    this.stockStatus.style.cssText = `
      font-size: 12px;
      color: #c9c9c9;
      margin-top: 5px;
    `;

    this.stockBar = document.createElement("div");
    this.stockBar.style.cssText = `
      width: 120px;
      height: 6px;
      background: #333;
      border-radius: 5px;
      overflow: hidden;
      margin-top: 5px;
    `;

    this.stockFill = document.createElement("div");
    this.stockFill.style.cssText = `
      width: 0%;
      height: 100%;
      background: #55bd76;
      transition: width 0.2s;
    `;

    this.stockBar.appendChild(this.stockFill);

    if (this.products?.parentElement) {
      this.products.parentElement.append(
        this.stockStatus,
        this.stockBar
      );
    }

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

    // Botões de construção.
    this.buttons = document.querySelectorAll("[data-building]");

    for (const button of this.buttons) {
      button.addEventListener("click", () => {
        this.onBuild(button.dataset.building);
      });
    }

    // Painel de melhorias.
    this.upgradeTarget = null;

    this.upgradePanel = document.createElement("div");

    this.upgradePanel.style.cssText = `
      position: fixed;
      right: 20px;
      bottom: 90px;
      width: 230px;
      padding: 16px;
      background: #19191f;
      color: white;
      border: 1px solid #66552f;
      border-radius: 10px;
      z-index: 1000;
      font-family: Arial, sans-serif;
      display: none;
      box-shadow: 0 5px 20px rgba(0,0,0,0.4);
      box-sizing: border-box;
    `;

    this.upgradeTitle = document.createElement("h3");

    this.upgradeTitle.style.cssText = `
      margin: 0 0 8px;
      font-size: 17px;
    `;

    this.upgradeDetails = document.createElement("p");

    this.upgradeDetails.style.cssText = `
      font-size: 13px;
      color: #c5c5c5;
      line-height: 1.6;
      white-space: pre-line;
    `;

    this.upgradeButton = document.createElement("button");

    this.upgradeButton.style.cssText = `
      width: 100%;
      padding: 10px;
      background: #b58b35;
      color: #171717;
      border: 0;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    `;

    this.closeUpgradeButton = document.createElement("button");

    this.closeUpgradeButton.textContent = "Fechar";

    this.closeUpgradeButton.style.cssText = `
      width: 100%;
      margin-top: 7px;
      padding: 7px;
      background: #303038;
      color: white;
      border: 0;
      border-radius: 6px;
      cursor: pointer;
    `;

    this.upgradePanel.append(
      this.upgradeTitle,
      this.upgradeDetails,
      this.upgradeButton,
      this.closeUpgradeButton
    );

    document.body.appendChild(this.upgradePanel);

    this.upgradeButton.addEventListener("click", () => {
      if (this.upgradeTarget && this.onUpgrade) {
        this.onUpgrade(this.upgradeTarget);
      }
    });

    this.closeUpgradeButton.addEventListener("click", () => {
      this.hideUpgrade();
    });
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

    // Estoque.
    const percentage = this.economy.getStockPercentage();

    this.stockStatus.textContent =
      `Estoque: ${Math.floor(this.economy.products)} / ${this.economy.productCapacity}`;

    this.stockFill.style.width = percentage + "%";

    this.stockFill.style.background =
      percentage >= 100 ? "#e05252" :
      percentage >= 80 ? "#e0a83e" :
      "#55bd76";

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

  showUpgrade(building, info) {
    this.upgradeTarget = building;
    this.upgradePanel.style.display = "block";

    const names = {
      sawmill: "Serraria",
      mine: "Mineradora",
      factory: "Fábrica",
      commercialCenter: "Centro Comercial",
      warehouse: "Armazém"
    };

    const name = names[building.type] || "Construção";
    const level = building.level || 1;

    this.upgradeTitle.textContent = name;

    if (!info) {
      this.upgradeDetails.textContent =
        `Nível ${level} | Nível máximo atingido.`;

      this.upgradeButton.textContent = "Nível máximo";
      this.upgradeButton.disabled = true;
      this.upgradeButton.style.opacity = "0.5";

      return;
    }

    this.upgradeDetails.textContent =
      `Nível atual: ${info.currentLevel}\n` +
      `Próximo nível: ${info.nextLevel}\n` +
      `Benefício: ${info.effect}\n` +
      `Custo: ${this.formatMoney(info.cost)}`;

    this.upgradeButton.textContent =
      `Melhorar por ${this.formatMoney(info.cost)}`;

    this.upgradeButton.disabled = false;
    this.upgradeButton.style.opacity = "1";
  }

  hideUpgrade() {
    this.upgradeTarget = null;
    this.upgradePanel.style.display = "none";
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
