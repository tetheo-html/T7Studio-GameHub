export function createControls() {
  const input = {
    accelerate: false,
    brake: false,
    left: false,
    right: false
  };

  const keyMap = {
    ArrowUp: "accelerate",
    KeyW: "accelerate",
    ArrowDown: "brake",
    KeyS: "brake",
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right"
  };

  window.addEventListener("keydown", (event) => {
    const control = keyMap[event.code];

    if (control) {
      input[control] = true;
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    const control = keyMap[event.code];

    if (control) {
      input[control] = false;
      event.preventDefault();
    }
  });

  document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.dataset.control;

    const start = (event) => {
      event.preventDefault();
      input[control] = true;
      button.setPointerCapture?.(event.pointerId);
    };

    const stop = (event) => {
      event.preventDefault();
      input[control] = false;
    };

    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("lostpointercapture", stop);
  });

  window.addEventListener("blur", () => {
    for (const key in input) {
      input[key] = false;
    }
  });

  return input;
}