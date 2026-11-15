console.log("T7Studio Hub carregado!");

document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    console.log("Navegando para:", link.href);
  });
});