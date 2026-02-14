import { Player } from "./entities/player.js";
import { Projectile } from "./entities/projectile.js";
import { createAlienGrid } from "./entities/alien.js";
import { intersects } from "./systems/collision.js";
import { drawHud } from "./ui/hud.js";

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;

    this.state = "start";
    this.paused = false;
    this.level = 1;
    this.score = 0;

    this.input = {
      left: false,
      right: false
    };

    this.player = new Player(this.width, this.height);
    this.projectiles = [];
    this.alienProjectiles = [];
    this.explosions = [];
    this.playerVisible = true;
    this.playerRespawnTimer = 0;
    this.alienDirection = 1;
    this.alienSpeed = 28;
    this.alienShootCooldown = 900;
    this.alienShootTimer = this.alienShootCooldown;
    this.alienAnimationTimeMs = 0;
    this.aliens = this.createAliensForLevel(this.level);
  }

  createAliensForLevel(level) {
    const speedBoost = (level - 1) * 8;
    this.alienSpeed = 28 + speedBoost;
    return createAlienGrid();
  }

  startGame() {
    this.state = "playing";
    this.paused = false;
  }

  restart({ preserveScore = false, nextLevel = false } = {}) {
    if (!preserveScore) {
      this.score = 0;
      this.level = 1;
      this.player.lives = 3;
    } else if (nextLevel) {
      this.level += 1;
    }

    this.player.resetPosition(this.width, this.height);
    this.projectiles = [];
    this.alienProjectiles = [];
    this.explosions = [];
    this.playerVisible = true;
    this.playerRespawnTimer = 0;
    this.alienDirection = 1;
    this.alienShootTimer = this.alienShootCooldown;
    this.alienAnimationTimeMs = 0;
    this.aliens = this.createAliensForLevel(this.level);
    this.state = "playing";
    this.paused = false;
  }

  togglePause() {
    if (this.state === "playing") {
      this.paused = !this.paused;
    }
  }

  firePlayerShot() {
    if (this.state !== "playing" || this.paused || !this.player.canShoot()) {
      return;
    }

    this.player.triggerShotCooldown();
    this.projectiles.push(
      new Projectile({
        x: this.player.x + this.player.width / 2 - 2,
        y: this.player.y - 12,
        vy: -520,
        owner: "player"
      })
    );
  }

  update(dt) {
    if (this.state !== "playing" || this.paused) {
      return;
    }

    this.player.update(dt, this.input, this.width);
    this.alienAnimationTimeMs += dt * 1000;
    this.updatePlayerRespawn(dt);
    this.updateAliens(dt);
    this.updateProjectiles(dt);
    this.updateAlienShooting(dt);
    this.updateExplosions(dt);
    this.resolveCollisions();
    this.checkEndConditions();
  }

  updateAliens(dt) {
    const aliveAliens = this.aliens.filter((alien) => alien.alive);
    if (aliveAliens.length === 0) {
      return;
    }

    let hitEdge = false;
    for (const alien of aliveAliens) {
      alien.x += this.alienDirection * this.alienSpeed * dt;
      if (alien.x <= 0 || alien.x + alien.width >= this.width) {
        hitEdge = true;
      }
    }

    if (hitEdge) {
      this.alienDirection *= -1;
      for (const alien of aliveAliens) {
        alien.y += 16;
      }
    }
  }

  updateProjectiles(dt) {
    for (const projectile of this.projectiles) {
      projectile.update(dt, this.height);
    }
    for (const projectile of this.alienProjectiles) {
      projectile.update(dt, this.height);
    }

    this.projectiles = this.projectiles.filter((p) => p.active);
    this.alienProjectiles = this.alienProjectiles.filter((p) => p.active);
  }

  updatePlayerRespawn(dt) {
    if (this.playerVisible || this.playerRespawnTimer <= 0) {
      return;
    }
    this.playerRespawnTimer = Math.max(0, this.playerRespawnTimer - dt);
    if (this.playerRespawnTimer === 0 && this.player.lives > 0) {
      this.player.resetPosition(this.width, this.height);
      this.playerVisible = true;
    }
  }

  updateExplosions(dt) {
    for (const explosion of this.explosions) {
      explosion.life -= dt;
      for (const particle of explosion.particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
      }
    }
    this.explosions = this.explosions.filter((explosion) => explosion.life > 0);
  }

  updateAlienShooting(dt) {
    this.alienShootTimer -= dt * 1000;
    if (this.alienShootTimer > 0) {
      return;
    }

    const aliveAliens = this.aliens.filter((alien) => alien.alive);
    if (aliveAliens.length === 0) {
      return;
    }

    const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
    this.alienProjectiles.push(
      new Projectile({
        x: shooter.x + shooter.width / 2 - 2,
        y: shooter.y + shooter.height,
        vy: 280 + this.level * 12,
        owner: "alien"
      })
    );

    const baseCooldown = 900 - Math.min(500, (this.level - 1) * 80);
    this.alienShootCooldown = baseCooldown;
    this.alienShootTimer = this.alienShootCooldown;
  }

  resolveCollisions() {
    for (const shot of this.projectiles) {
      if (!shot.active) {
        continue;
      }
      for (const alien of this.aliens) {
        if (!alien.alive) {
          continue;
        }
        if (intersects(shot, alien)) {
          shot.active = false;
          alien.alive = false;
          this.score += alien.points;
          this.spawnAlienExplosion(alien);
          break;
        }
      }
    }

    for (const shot of this.alienProjectiles) {
      if (!shot.active) {
        continue;
      }
      if (this.playerVisible && intersects(shot, this.player)) {
        shot.active = false;
        this.spawnPlayerExplosion();
        this.player.lives -= 1;
        this.playerVisible = false;
        this.playerRespawnTimer = 0.45;
      }
    }
  }

  checkEndConditions() {
    const aliveAliens = this.aliens.filter((alien) => alien.alive);
    if (aliveAliens.length === 0) {
      this.state = "win";
      return;
    }

    const invaded = aliveAliens.some((alien) => alien.y + alien.height >= this.player.y);
    if (invaded || this.player.lives <= 0) {
      this.state = "gameOver";
    }
  }

  spawnAlienExplosion(alien) {
    const centerX = alien.x + alien.width / 2;
    const centerY = alien.y + alien.height / 2;
    const particleCount = 20;
    const particles = [];

    for (let i = 0; i < particleCount; i += 1) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 80 + Math.random() * 130;
      particles.push({
        x: centerX + (Math.random() * 10 - 5),
        y: centerY + (Math.random() * 10 - 5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
      });
    }

    this.explosions.push({
      life: 0.5,
      maxLife: 0.5,
      color: alien.palette.body,
      particles
    });
  }

  spawnPlayerExplosion() {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    const particleCount = 24;
    const particles = [];

    for (let i = 0; i < particleCount; i += 1) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 85 + Math.random() * 140;
      particles.push({
        x: centerX + (Math.random() * 12 - 6),
        y: centerY + (Math.random() * 12 - 6),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
      });
    }

    this.explosions.push({
      life: 0.55,
      maxLife: 0.55,
      color: this.player.color,
      particles
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackgroundGrid();

    for (const alien of this.aliens) {
      alien.draw(this.ctx, this.alienAnimationTimeMs);
    }
    if (this.playerVisible) {
      this.player.draw(this.ctx);
    }
    for (const shot of this.projectiles) {
      shot.draw(this.ctx);
    }
    for (const shot of this.alienProjectiles) {
      shot.draw(this.ctx);
    }
    this.drawExplosions();

    drawHud(this.ctx, {
      score: this.score,
      lives: this.player.lives,
      level: this.level,
      state: this.state,
      width: this.width,
      height: this.height,
      paused: this.paused
    });
  }

  drawBackgroundGrid() {
    this.ctx.strokeStyle = "rgba(102, 153, 255, 0.12)";
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 32) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 32) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  drawExplosions() {
    for (const explosion of this.explosions) {
      const alpha = Math.max(0, explosion.life / explosion.maxLife);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = explosion.color;
      for (const particle of explosion.particles) {
        this.ctx.fillRect(particle.x, particle.y, 3, 3);
      }
      this.ctx.restore();
    }
  }
}
