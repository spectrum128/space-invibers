import { Game } from "./game.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

if (!canvas || !ctx) {
  throw new Error("Failed to initialize canvas context");
}

const game = new Game(canvas, ctx);

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

let lastTimestamp = 0;
function frame(timestamp) {
  const dt = Math.min(0.033, (timestamp - lastTimestamp) / 1000 || 0);
  lastTimestamp = timestamp;
  game.update(dt);
  game.render();
  window.requestAnimationFrame(frame);
}

window.requestAnimationFrame(frame);
