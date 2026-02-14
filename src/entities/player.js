export class Player {
  constructor(canvasWidth, canvasHeight) {
    this.width = 52;
    this.height = 28;
    this.speed = 420;
    this.color = "#55d6be";
    this.cooldownMs = 260;
    this.lives = 3;
    this.resetPosition(canvasWidth, canvasHeight);
    this.cooldownLeft = 0;
  }

  resetPosition(canvasWidth, canvasHeight) {
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - this.height - 20;
  }

  update(dt, input, canvasWidth) {
    if (input.left) {
      this.x -= this.speed * dt;
    }
    if (input.right) {
      this.x += this.speed * dt;
    }

    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x + this.width > canvasWidth) {
      this.x = canvasWidth - this.width;
    }

    this.cooldownLeft = Math.max(0, this.cooldownLeft - dt * 1000);
  }

  canShoot() {
    return this.cooldownLeft <= 0;
  }

  triggerShotCooldown() {
    this.cooldownLeft = this.cooldownMs;
  }

  draw(ctx) {
    const sprite = [
      "0000011100000",
      "0001111111000",
      "0011111111100",
      "0111122221110",
      "1111222222111",
      "1111222222111",
      "1101100001011"
    ];
    const scale = 4;

    for (let row = 0; row < sprite.length; row += 1) {
      for (let col = 0; col < sprite[row].length; col += 1) {
        const pixel = sprite[row][col];
        if (pixel === "0") {
          continue;
        }

        ctx.fillStyle = pixel === "1" ? this.color : "#9df0df";
        ctx.fillRect(this.x + col * scale, this.y + row * scale, scale, scale);
      }
    }
  }
}
