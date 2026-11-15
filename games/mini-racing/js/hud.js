
function formatTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const ms = Math.floor(milliseconds % 1000);

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0") +
    "." +
    String(ms).padStart(3, "0")
  );
}

export function updateHUD(player, position, elapsed) {
  document.getElementById("lap").textContent =
    `${player.lap} / ${player.totalLaps}`;
      
  document.getElementById("position").textContent =
    `${position} / 6`;

  document.getElementById("timer").textContent =
    formatTime(elapsed);

  document.getElementById("speed").textContent =
    `${Math.round(Math.abs(player.speed) * 0.45)} km/h`;
}

export function showResult(position, elapsed, racers, player) {
  const result = document.getElementById("result");
  const title = document.getElementById("resultTitle");
  const text = document.getElementById("resultText");
  const standings = document.getElementById("resultStandings");

  title.textContent =
    position === 1 ? "VOCÊ VENCEU!" : "CORRIDA FINALIZADA";

  text.innerHTML = `
    <div class="result-stat">
      <span>POSIÇÃO</span>
      <strong>${position}º</strong>
    </div>

    <div class="result-stat">
      <span>TEMPO TOTAL</span>
      <strong>${formatTime(elapsed)}</strong>
    </div>
  `;

  const ranking = racers
    .map((racer, index) => ({
      racer,
      originalIndex: index
    }))
    .sort((a, b) => b.racer.progress - a.racer.progress);

  standings.innerHTML = "";

  ranking.forEach((entry, index) => {
    const isPlayer = entry.racer === player;

    const name = isPlayer
      ? "VOCÊ"
      : `PILOTO ${String(entry.originalIndex).padStart(2, "0")}`;

    const row = document.createElement("div");
    row.className = "standing-row";

    if (isPlayer) {
      row.classList.add("player-row");
    }

    row.innerHTML = `
      <strong class="standing-position">${index + 1}º</strong>
      <span class="standing-name">${name}</span>
      <span class="standing-status">
        ${isPlayer ? "FINALIZOU" : "EM CORRIDA"}
      </span>
    `;

    standings.appendChild(row);
  });

  result.classList.remove("hidden");
}
