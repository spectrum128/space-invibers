export class Projectile {
  constructor({ x, y, vy, owner }) {
    this.x = x;
    this.y = y;
    this.vy = vy;
    this.owner = owner;
    this.width = 4;
    this.height = 12;
    this.active = true;
  }

  update(dt, canvasHeight) {
    this.y += this.vy * dt;
    if (this.y + this.height < 0 || this.y > canvasHeight) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) {
      return;
    }
    ctx.fillStyle = this.owner === "player" ? "#a7f3d0" : "#ff8787";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
