import { Game } from "./game.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

if (!canvas || !ctx) {
  throw new Error("Failed to initialize canvas context");
}

const game = new Game(canvas, ctx);
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnShoot = document.getElementById("btn-shoot");
const btnStart = document.getElementById("btn-start");
const btnPause = document.getElementById("btn-pause");

const touchState = {
  left: false,
  right: false,
  shoot: false
};

const keys = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right"
};

window.addEventListener("keydown", (event) => {
  const moveKey = keys[event.code];
  if (moveKey) {
    game.input[moveKey] = true;
  }

  if (event.code === "Space") {
    event.preventDefault();
    game.firePlayerShot();
  }

  if (event.code === "Enter") {
    if (game.state === "start") {
      game.startGame();
    } else if (game.state === "gameOver") {
      game.restart();
    } else if (game.state === "win") {
      game.restart({ preserveScore: true, nextLevel: true });
    }
  }

  if (event.code === "KeyP") {
    game.togglePause();
  }
});

window.addEventListener("keyup", (event) => {
  const moveKey = keys[event.code];
  if (moveKey) {
    game.input[moveKey] = false;
  }
});

function handleStartAction() {
  if (game.state === "start") {
    game.startGame();
  } else if (game.state === "gameOver") {
    game.restart();
  } else if (game.state === "win") {
    game.restart({ preserveScore: true, nextLevel: true });
  }
}

function bindHoldButton(button, onStart, onEnd) {
  if (!button) {
    return;
  }

  const pressStart = (event) => {
    event.preventDefault();
    button.classList.add("is-pressed");
    onStart();
  };

  const pressEnd = (event) => {
    event.preventDefault();
    button.classList.remove("is-pressed");
    onEnd();
  };

  button.addEventListener("pointerdown", pressStart);
  button.addEventListener("pointerup", pressEnd);
  button.addEventListener("pointercancel", pressEnd);
  button.addEventListener("pointerleave", pressEnd);
}

bindHoldButton(
  btnLeft,
  () => {
    touchState.left = true;
    game.input.left = true;
  },
  () => {
    touchState.left = false;
    game.input.left = false;
  }
);

bindHoldButton(
  btnRight,
  () => {
    touchState.right = true;
    game.input.right = true;
  },
  () => {
    touchState.right = false;
    game.input.right = false;
  }
);

bindHoldButton(
  btnShoot,
  () => {
    touchState.shoot = true;
    game.firePlayerShot();
  },
  () => {
    touchState.shoot = false;
  }
);

if (btnStart) {
  btnStart.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    btnStart.classList.add("is-pressed");
  });
  btnStart.addEventListener("pointerup", (event) => {
    event.preventDefault();
    btnStart.classList.remove("is-pressed");
    handleStartAction();
  });
  btnStart.addEventListener("pointercancel", () => btnStart.classList.remove("is-pressed"));
  btnStart.addEventListener("pointerleave", () => btnStart.classList.remove("is-pressed"));
}

if (btnPause) {
  btnPause.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    btnPause.classList.add("is-pressed");
  });
  btnPause.addEventListener("pointerup", (event) => {
    event.preventDefault();
    btnPause.classList.remove("is-pressed");
    game.togglePause();
  });
  btnPause.addEventListener("pointercancel", () => btnPause.classList.remove("is-pressed"));
  btnPause.addEventListener("pointerleave", () => btnPause.classList.remove("is-pressed"));
}

let lastTimestamp = 0;
function frame(timestamp) {
  const dt = Math.min(0.033, (timestamp - lastTimestamp) / 1000 || 0);
  lastTimestamp = timestamp;
  if (touchState.shoot) {
    game.firePlayerShot();
  }
  game.update(dt);
  game.render();
  window.requestAnimationFrame(frame);
}

window.requestAnimationFrame(frame);
