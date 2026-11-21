export class UI {
  constructor(economy, onBuild, buildings, onUpgrade) {
    this.economy = economy;
    this.onBuild = onBuild;
    this.buildings = buildings;
    this.onUpgrade = onUpgrade;

    // HUD.
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

    // Painel de concorrência compacto.
this.competitorPanel = document.querySelector(".competitor-panel");

this.companyRows = new Map();

if (this.competitorPanel) {
  this.competitorPanel.innerHTML = "";

  this.competitorPanel.style.cssText += `
    width: 190px;
    padding: 8px;
  `;

  this.competitionHeading = document.createElement("div");
  this.competitionHeading.className = "competitor-heading";
  this.competitionHeading.textContent = "DISPUTA CORPORATIVA";

  this.competitionHeading.style.cssText = `
    font-size: 9px;
    font-weight: bold;
    margin-bottom: 6px;
    color: #e4bd62;
  `;

  this.competitionList = document.createElement("div");

  this.competitionList.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 4px;
  `;

  this.economicLeader = document.createElement("div");

  this.economicLeader.style.cssText = `
    border-top: 1px solid #465448;
    margin-top: 6px;
    padding-top: 5px;
    font-size: 8px;
    color: #e4bd62;
    font-weight: bold;
  `;

  this.competitorPanel.append(
    this.competitionHeading,
    this.competitionList,
    this.economicLeader
  );
}
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
    this.upgradePanel.classList.add("upgrade-panel");
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

    // Painel de comércio.
    this.marketPanel = document.createElement("div");
    this.marketPanel.classList.add("market-panel");

    this.marketPanel.style.cssText = `
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 230px;
      padding: 14px;
      background: #19191f;
      color: white;
      border: 1px solid #66552f;
      border-radius: 10px;
      z-index: 999;
      font-family: Arial, sans-serif;
      box-shadow: 0 5px 20px rgba(0,0,0,0.4);
      box-sizing: border-box;
    `;

    this.marketTitle = document.createElement("h3");
    this.marketTitle.textContent = "📦 Mercado";
    this.marketTitle.style.cssText = `
      margin: 0 0 8px;
      font-size: 17px;
    `;

    this.marketPanel.style.height = "fit-content";
    this.marketPanel.style.maxHeight = "none";
    this.marketPanel.style.overflow = "hidden";

    this.marketPrice = document.createElement("p");
    this.marketPrice.style.cssText = `
      font-size: 13px;
      color: #c5c5c5;
      margin: 5px 0;
    `;

    this.marketStock = document.createElement("p");
    this.marketStock.style.cssText = `
      font-size: 13px;
      color: #c5c5c5;
      margin: 5px 0 12px;
    `;

    this.marketButtons = document.createElement("div");
    this.marketButtons.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    `;

    this.sellOneButton = this.createMarketButton("Vender 1");
    this.sellTenButton = this.createMarketButton("Vender 10");
    this.sellAllButton = this.createMarketButton("Vender tudo");

    this.sellAllButton.style.gridColumn = "1 / -1";

    this.marketButtons.append(
      this.sellOneButton,
      this.sellTenButton,
      this.sellAllButton
    );

    this.marketPanel.append(
      this.marketTitle,
      this.marketPrice,
      this.marketStock,
      this.marketButtons
    );

    document.body.appendChild(this.marketPanel);

    // Botão para esconder e mostrar os painéis.
this.panelsToggleButton = document.getElementById("togglePanels");

if (this.panelsToggleButton) {
  this.panelsToggleButton.addEventListener("click", () => {
    const hidden = document.body.classList.toggle("panels-hidden");

    this.panelsToggleButton.textContent = hidden
      ? "＋ MOSTRAR"
      : "☰ PAINÉIS";
  });
}

    this.sellOneButton.addEventListener("click", () => {
      this.sellProducts(1);
    });

    this.sellTenButton.addEventListener("click", () => {
      this.sellProducts(10);
    });

    this.sellAllButton.addEventListener("click", () => {
      this.sellProducts("all");
    });

    // Arrastar painéis.
    this.makeDraggable(this.marketPanel, this.marketTitle);
    this.makeDraggable(this.upgradePanel, this.upgradeTitle);

    if (this.competitorPanel) {
      const handle = this.competitorPanel.querySelector(
        ".competitor-heading"
      );

      if (handle) {
        this.makeDraggable(this.competitorPanel, handle);
      }
    }
  }

  createCompanyRow(name, color) {
  const row = document.createElement("div");

  row.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    padding: 5px;
    background: rgba(0,0,0,0.2);
    border-left: 2px solid ${color};
    border-radius: 4px;
    min-width: 0;
  `;

  const identity = document.createElement("div");

  identity.style.cssText = `
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  `;

  const rank = document.createElement("span");
  rank.style.cssText = "color:#9da99d;font-size:8px;";

  const title = document.createElement("strong");
  title.textContent = name;
  title.style.cssText = `
    color:${color};
    font-size:8px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  `;

  const capital = document.createElement("strong");
  capital.style.cssText = `
    color:white;
    font-size:9px;
    white-space:nowrap;
  `;

  identity.append(rank, title);
  row.append(identity, capital);

  return { row, rank, title, capital };
}

updateCompetition(competitors, player) {
  if (!this.competitionList) return;

  const companies = [
    {
      name: "T7STUDIO",
      money: player.money,
      color: "#e4bd62"
    },
    ...competitors.map(competitor => ({
      name: competitor.name,
      money: competitor.economy.money,
      color: competitor.color
    }))
  ];

  companies.sort((a, b) => b.money - a.money);

  for (const company of companies) {
    if (!this.companyRows.has(company.name)) {
      const elements = this.createCompanyRow(
        company.name,
        company.color
      );

      this.companyRows.set(company.name, elements);
      this.competitionList.appendChild(elements.row);
    }
  }

  companies.forEach((company, index) => {
    const elements = this.companyRows.get(company.name);

    elements.rank.textContent = `#${index + 1}`;
    elements.capital.textContent = this.formatMoney(company.money);

    this.competitionList.appendChild(elements.row);
  });

  const first = companies[0];
  const second = companies[1];

  if (first && second) {
    if (Math.floor(first.money) === Math.floor(second.money)) {
      this.economicLeader.textContent = "LÍDER: EMPATE";
      this.economicLeader.style.color = "#fff";
    } else {
      this.economicLeader.textContent = `LÍDER: ${first.name}`;
      this.economicLeader.style.color = first.color;
    }
  }
}
  makeDraggable(panel, handle) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let panelX = 0;
    let panelY = 0;

    handle.style.cursor = "grab";
    handle.style.userSelect = "none";
    handle.style.touchAction = "none";

    handle.addEventListener("pointerdown", event => {
      if (event.button !== 0) return;

      dragging = true;

      const rect = panel.getBoundingClientRect();

      panelX = rect.left;
      panelY = rect.top;

      startX = event.clientX;
      startY = event.clientY;

      panel.style.left = `${panelX}px`;
      panel.style.top = `${panelY}px`;
      panel.style.right = "auto";
      panel.style.bottom = "auto";

      handle.style.cursor = "grabbing";

      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener("pointermove", event => {
      if (!dragging) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      const maxX = Math.max(
        0,
        window.innerWidth - panel.offsetWidth
      );

      const maxY = Math.max(
        0,
        window.innerHeight - panel.offsetHeight
      );

      const newX = Math.max(
        0,
        Math.min(maxX, panelX + dx)
      );

      const newY = Math.max(
        0,
        Math.min(maxY, panelY + dy)
      );

      panel.style.left = `${newX}px`;
      panel.style.top = `${newY}px`;
    });

    const stopDragging = () => {
      dragging = false;
      handle.style.cursor = "grab";
    };

    handle.addEventListener("pointerup", stopDragging);
    handle.addEventListener("pointercancel", stopDragging);
  }

  createMarketButton(label) {
    const button = document.createElement("button");
    button.textContent = label;

    button.style.cssText = `
      padding: 9px 5px;
      background: #b58b35;
      color: #171717;
      border: 0;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
    `;

    return button;
  }

  sellProducts(amount) {
    const result = this.economy.sellProducts(amount);

    this.setMessage(result.message);
    this.updateMarket();

    return result;
  }

  updateMarket() {
    const products = Math.floor(this.economy.products);

    this.marketPrice.textContent =
      `Preço por produto: ${this.formatMoney(this.economy.productPrice)}`;

    this.marketStock.textContent =
      `Disponíveis para venda: ${products}`;

    this.sellOneButton.disabled = products < 1;
    this.sellTenButton.disabled = products < 10;
    this.sellAllButton.disabled = products < 1;

    for (const button of [
      this.sellOneButton,
      this.sellTenButton,
      this.sellAllButton
    ]) {
      button.style.opacity = button.disabled ? "0.4" : "1";

      button.style.cursor = button.disabled
        ? "not-allowed"
        : "pointer";
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

  update(competitors = []) {
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

    this.updateMarket();

    // Atualizar concorrência.
const player = this.getCompanyStats(
  this.economy,
  this.buildings.buildings
);

this.updateCompetition(competitors, player);
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