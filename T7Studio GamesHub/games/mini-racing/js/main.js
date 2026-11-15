
window.addEventListener("DOMContentLoaded", () => {
  console.log("T7Studio: menu carregado!");

  const homePanel = document.getElementById("homePanel");
  const tracksPanel = document.getElementById("tracksPanel");

  const playButton = document.getElementById("playButton");
  const backButton = document.getElementById("backButton");
  const startRaceButton = document.getElementById("startRaceButton");

  const trackCards = document.querySelectorAll(
    'button.track-card[data-track]'
  );

  let selectedLaps = 3;
  let selectedTrack = "oval";
  let game = null;

  // JOGAR
  playButton.addEventListener("click", () => {
    console.log("Botão JOGAR clicado!");

    homePanel.classList.add("hidden");
    tracksPanel.classList.remove("hidden");
  });

  // VOLTAR
  backButton.addEventListener("click", () => {
    tracksPanel.classList.add("hidden");
    homePanel.classList.remove("hidden");
  });

  // SELEÇÃO DE CIRCUITOS
  trackCards.forEach((card) => {
    card.addEventListener("click", () => {
      selectedTrack = card.dataset.track;

      trackCards.forEach((item) => {
        item.classList.remove("selected");
      });

      card.classList.add("selected");

      document.getElementById(
        "selectedTrackName"
      ).textContent = card.querySelector("h3").textContent;
    });
  });

// DURAÇÃO DA CORRIDA
const lapButtons = document.querySelectorAll(".lap-option");

lapButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedLaps = Number(button.dataset.laps);

    lapButtons.forEach((item) => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");

    document.querySelectorAll(".lap-option").forEach((button) => {
      
  button.addEventListener("click", () => {
    selectedLaps = Number(button.dataset.laps);

    document.querySelectorAll(".lap-option").forEach((item) => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");
  });
});
  });
});

  // INICIAR CORRIDA
  startRaceButton.addEventListener("click", async () => {
    if (game) return;

    try {
      console.log("Carregando corrida...");

      const { Game } = await import("./game.js");

     game = new Game(selectedTrack, selectedLaps);
      game.start();

    } catch (error) {
      console.error("Erro ao iniciar corrida:", error);
      alert("Erro ao carregar a corrida. Confira o Console (F12).");
    }
  });
});
