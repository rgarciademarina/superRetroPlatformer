import { COLORS, COYOTE_TIME, FRICTION_AIR, FRICTION_GROUND, GRAVITY, JUMP_BUFFER_TIME, JUMP_VELOCITY, MAX_FALL_SPEED, PLAYER_AIR_ACCEL, PLAYER_MAX_SPEED, PLAYER_MOVE_ACCEL } from './constants.js';

export class Entity {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = w;
    this.height = h;
    this.alive = true;
    this.onGround = false;
  }

  get left() { return this.x; }
  get right() { return this.x + this.width; }
  get top() { return this.y; }
  get bottom() { return this.y + this.height; }
}

export class Player extends Entity {
  constructor(x, y, sfx) {
    super(x, y, 12, 14);
    this.sfx = sfx;
    this.facing = 1;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.spawnX = x;
    this.spawnY = y;
    this.invincibleTime = 0;
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.alive = true;
    this.invincibleTime = 0.4;
  }

  update(input, level, dt, key) {
    const accel = this.onGround ? PLAYER_MOVE_ACCEL : PLAYER_AIR_ACCEL;
    if (input.isDown(key.LEFT)) {
      this.vx -= accel * dt;
      this.facing = -1;
    } else if (input.isDown(key.RIGHT)) {
      this.vx += accel * dt;
      this.facing = 1;
    } else if (this.onGround) {
      this.vx *= FRICTION_GROUND;
    } else {
      this.vx *= FRICTION_AIR;
    }

    this.vx = Math.max(-PLAYER_MAX_SPEED, Math.min(PLAYER_MAX_SPEED, this.vx));

    if (input.pressed(key.JUMP)) this.jumpBufferTimer = JUMP_BUFFER_TIME;
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    if (this.onGround) this.coyoteTimer = COYOTE_TIME; else if (this.coyoteTimer > 0) this.coyoteTimer -= dt;

    const canJump = (this.coyoteTimer > 0);
    if (canJump && this.jumpBufferTimer > 0) {
      this.vy = -JUMP_VELOCITY;
      this.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.sfx.play('jump');
    }

    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

    this.onGround = false;
    this.x += this.vx * dt;
    const collidedX = level.resolveCollisions(this);
    if (collidedX) this.vx = 0;
    this.y += this.vy * dt;
    const collidedY = level.resolveCollisions(this);
    if (collidedY) {
      if (this.vy > 0) this.onGround = true;
      this.vy = 0;
    }

    this.x = Math.max(0, Math.min(this.x, level.pixelWidth - this.width));
    if (this.y > level.pixelHeight + 40) {
      this.alive = false;
    }

    if (this.invincibleTime > 0) this.invincibleTime -= dt;
  }

  draw(ctx, cam) {
    const offset = cam.getOffset();
    const px = Math.floor(this.x - offset.x);
    const py = Math.floor(this.y - offset.y);
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(px, py, this.width, this.height);
    ctx.fillStyle = '#3b2e1e';
    const eyeX = px + (this.facing === 1 ? this.width - 5 : 3);
    ctx.fillRect(eyeX, py + 4, 2, 2);
  }
}

export class Enemy extends Entity {
  constructor(x, y) {
    super(x, y, 12, 12);
    this.dir = -1;
    this.speed = 40;
  }

  update(level, dt) {
    // Edge detection: if on ground and no ground ahead, turn around
    const footY = this.y + this.height + 1;
    const centerFootX = this.x + this.width / 2;
    const onGroundNow = level.isSolidAtPixel(centerFootX, footY);
    const frontFootX = this.x + (this.dir === 1 ? this.width + 1 : -1);
    const groundAhead = level.isSolidAtPixel(frontFootX, footY);
    if (onGroundNow && !groundAhead) {
      this.dir *= -1;
    }

    this.vx = this.dir * this.speed;
    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

    this.x += this.vx * dt;
    const hitX = level.resolveCollisions(this);
    if (hitX) this.dir *= -1;

    this.y += this.vy * dt;
    const hitY = level.resolveCollisions(this);
    if (hitY) {
      if (this.vy > 0) this.onGround = true; else this.onGround = false;
      this.vy = 0;
    } else {
      this.onGround = false;
    }

    if (this.y > level.pixelHeight + 200) this.alive = false;
  }

  draw(ctx, cam) {
    const o = cam.getOffset();
    const px = Math.floor(this.x - o.x);
    const py = Math.floor(this.y - o.y);
    ctx.fillStyle = COLORS.enemy;
    ctx.fillRect(px, py, this.width, this.height);
    ctx.fillStyle = '#3b2e1e';
    ctx.fillRect(px + 3, py + 4, 2, 2);
    ctx.fillRect(px + 7, py + 4, 2, 2);
  }
}

export class Projectile extends Entity {
  constructor(x, y, vx, vy) {
    super(x, y, 4, 4);
    this.vx = vx; this.vy = vy; this.alive = true;
  }
  update(level, dt) {
    this.x += this.vx * dt;
    if (level.resolveCollisions(this)) this.alive = false;
    this.y += this.vy * dt;
    if (level.resolveCollisions(this)) this.alive = false;
    if (this.x < -20 || this.y < -20 || this.x > level.pixelWidth + 20 || this.y > level.pixelHeight + 20) this.alive = false;
  }
  draw(ctx, cam) {
    const o = cam.getOffset();
    ctx.fillStyle = COLORS.projectile;
    ctx.fillRect(Math.floor(this.x - o.x), Math.floor(this.y - o.y), this.width, this.height);
  }
}

export class Boss extends Entity {
  constructor(x, y) {
    super(x, y, 18, 16);
    this.dir = -1;
    this.baseSpeed = 45;
    this.hp = 5;
    this.invuln = 0;
    this.shootTimer = 1.2;
    this.jumpTimer = 1.8;
  }

  get aliveAndPresent() { return this.alive && this.hp > 0; }

  _phase() {
    if (this.hp >= 4) return 1;
    if (this.hp >= 2) return 2;
    return 3;
  }

  update(level, dt, player, projectiles, sfx) {
    const phase = this._phase();
    const speedMul = phase === 1 ? 1.0 : phase === 2 ? 1.35 : 1.7;
    const shootEvery = phase === 1 ? 1.8 : phase === 2 ? 1.0 : 0.6;
    const jumpEvery = phase === 1 ? 9999 : phase === 2 ? 1.9 : 1.2;

    this.vx = this.dir * this.baseSpeed * speedMul;
    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

    this.x += this.vx * dt;
    if (level.resolveCollisions(this)) this.dir *= -1;
    this.y += this.vy * dt;
    if (level.resolveCollisions(this)) this.vy = 0;

    if (phase >= 2) {
      this.jumpTimer -= dt;
      if (this.jumpTimer <= 0) {
        this.vy = -260 * (1 + (phase - 1) * 0.2);
        this.jumpTimer = jumpEvery;
      }
    } else {
      this.jumpTimer = Math.max(this.jumpTimer, 0.5);
    }

    this.shootTimer -= dt;
    if (this.shootTimer <= 0) {
      let dx = player.x + player.width / 2 - (this.x + this.width / 2);
      let dy = player.y + player.height / 2 - (this.y + this.height / 2);
      // Limitar ángulo de tiro hacia arriba para evitar disparos casi verticales
      const upLimitDeg = phase === 1 ? 20 : phase === 2 ? 35 : 50;
      const maxUpSlope = Math.tan((upLimitDeg * Math.PI) / 180);
      if (dy < 0) {
        const maxUpward = Math.abs(dx) * maxUpSlope;
        if (-dy > maxUpward) dy = -maxUpward;
      }
      let len = Math.hypot(dx, dy);
      if (len < 0.001) { dx = this.dir; dy = 0; len = 1; }
      const spd = 110 * (1 + (phase - 1) * 0.3);
      const vx = (dx / len) * spd;
      const vy = (dy / len) * spd;
      projectiles.push(new Projectile(this.x + this.width / 2, this.y + this.height / 2, vx, vy));
      sfx.play('shoot');
      this.shootTimer = shootEvery;
    }

    if (this.invuln > 0) this.invuln -= dt;
  }

  takeHit(sfx, particles, camera) {
    if (this.invuln > 0 || !this.alive) return false;
    this.hp -= 1;
    this.invuln = 0.4;
    particles.burst(this.x + this.width / 2, this.y + this.height / 2, COLORS.boss, 18, 200);
    camera.addShake(2.1, 0.25);
    if (this.hp > 0) {
      sfx.play('bossHit');
    } else {
      this.alive = false;
      sfx.play('bossDie');
    }
    return true;
  }

  draw(ctx, cam) {
    if (!this.alive) return;
    const o = cam.getOffset();
    const px = Math.floor(this.x - o.x);
    const py = Math.floor(this.y - o.y);
    ctx.fillStyle = COLORS.boss;
    ctx.fillRect(px, py, this.width, this.height);
    ctx.fillStyle = '#1b1320';
    ctx.fillRect(px + 4, py + 5, 3, 3);
    ctx.fillRect(px + this.width - 7, py + 5, 3, 3);
  }
}

export class Fireball extends Entity {
  constructor(x, y, initialVy, size = 12) {
    super(x, y, size, size);
    this.vx = 0;
    this.vy = initialVy;
    this.originY = y;
  }
  update(level, dt, particles) {
    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;
    this.y += this.vy * dt;
    // Estela de partículas
    if (particles) {
      particles.burst(this.x + this.width / 2, this.y + this.height / 2, COLORS.fireball, 1, 50);
    }
    // Si toca suelo sólido por arriba o abajo, desaparecer
    if (level.resolveCollisions(this)) {
      this.alive = false;
      return;
    }
    // Cuando cae de vuelta al foso (por debajo del origen) desaparece
    if (this.vy > 0 && this.y >= this.originY) {
      this.alive = false;
    }
    if (this.y > level.pixelHeight + 60) this.alive = false;
  }
  draw(ctx, cam) {
    const o = cam.getOffset();
    const px = Math.floor(this.x - o.x);
    const py = Math.floor(this.y - o.y);
    const cx = px + this.width / 2;
    const cy = py + this.height / 2;
    // Glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(249, 115, 22, 0.28)';
    ctx.beginPath(); ctx.arc(cx, cy, this.width, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(249, 115, 22, 0.38)';
    ctx.beginPath(); ctx.arc(cx, cy, this.width * 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Núcleo
    ctx.fillStyle = COLORS.fireball;
    ctx.beginPath();
    ctx.arc(cx, cy, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}


