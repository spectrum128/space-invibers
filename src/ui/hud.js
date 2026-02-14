export function drawHud(ctx, { score, lives, level, state, width, height, paused }) {
  ctx.fillStyle = "#f5f8ff";
  ctx.font = '20px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`Score: ${score}`, 18, 30);
  ctx.fillText(`Lives: ${lives}`, 18, 56);
  ctx.fillText(`Level: ${level}`, width - 110, 30);

  if (state === "start") {
    drawCenteredOverlay(ctx, width, height, "SPACE INVADERS", "Press Enter to Start");
  }

  if (paused) {
    drawCenteredOverlay(ctx, width, height, "Paused", "Press P to Resume");
  }

  if (state === "gameOver") {
    drawCenteredOverlay(ctx, width, height, "Game Over", "Press Enter to Restart");
  }

  if (state === "win") {
    drawCenteredOverlay(ctx, width, height, "You Win", "Press Enter for Next Level");
  }
}

function drawCenteredOverlay(ctx, width, height, title, subtitle) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#f5f8ff";
  ctx.textAlign = "center";
  ctx.font = 'bold 48px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(title, width / 2, height / 2 - 24);
  ctx.font = '22px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(subtitle, width / 2, height / 2 + 24);
  ctx.textAlign = "start";
}
