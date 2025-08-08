import { COLORS, TILE_SIZE, GRAVITY } from './constants.js';
import { Boss, Enemy, Fireball } from './entities.js';

export class Level {
  constructor(mapString) {
    const rows = mapString.split('\n');
    this.height = rows.length;
    this.width = Math.max(...rows.map(r => r.length));
    this.tiles = Array.from({ length: this.height }, (_, y) => {
      const row = rows[y].padEnd(this.width, '-');
      return Array.from(row);
    });
    this.pixelWidth = this.width * TILE_SIZE;
    this.pixelHeight = this.height * TILE_SIZE;
    this.playerStart = { x: TILE_SIZE, y: TILE_SIZE };
    this.enemies = [];
    this.boss = null;
    this.goal = { x: (this.width - 3) * TILE_SIZE, y: (this.height - 3) * TILE_SIZE, w: 12, h: 24 };
    // Spawns iniciales para poder resetear tras muerte
    this.initialEnemySpawns = [];
    this.initialBossSpawn = null;
    this.hazardEmitters = [];
    this._parseEntities();
  }

  _parseEntities() {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const c = this.tiles[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        if (c === 'P') {
          this.tiles[y][x] = '-';
          this.playerStart = { x: px + 2, y: py + 2 };
        } else if (c === 'E') {
          this.tiles[y][x] = '-';
          const sx = px + 2, sy = py + 2;
          this.initialEnemySpawns.push({ x: sx, y: sy });
          this.enemies.push(new Enemy(sx, sy));
        } else if (c === 'G') {
          this.tiles[y][x] = '-';
          this.goal = { x: px + 2, y: py + (TILE_SIZE - 24), w: 12, h: 24 };
        } else if (c === 'K') {
          this.tiles[y][x] = '-';
          const sx = px + 2, sy = py + 2;
          this.initialBossSpawn = { x: sx, y: sy };
          this.boss = new Boss(sx, sy);
        } else if (c === 'L') {
          // Lava; registrar posibles emisores de bolas de fuego si hay foso vertical
          // Un emisor por cada celda 'L' que tenga espacio vertical por encima
          const aboveTy = y - 1;
          if (aboveTy >= 0) {
            this.hazardEmitters.push({ x: px + TILE_SIZE / 2 - 3, y: py + TILE_SIZE - 6, interval: 2.2, offset: Math.random() * 2.2, lastPhase: undefined });
          }
        } else if (c === 'F' || c === 'f') {
          // Emisores explícitos: 'F' lento, 'f' rápido
          this.tiles[y][x] = '-';
          const interval = (c === 'F') ? 1.1 : 1.6; // F más rápida que f
          const size = (c === 'F') ? 16 : 12;       // F más grande que f
          const power = (c === 'F') ? 540 : 500;    // F sube más pero sin salirse
          const rand = (c === 'F') ? 100 : 80;      // variación en potencia
          this.hazardEmitters.push({ x: px + TILE_SIZE / 2 - 3, y: py + TILE_SIZE - 6, interval, offset: Math.random() * interval, lastPhase: undefined, size, power, rand });
        }
      }
    }
  }

  resetEntities(preserveBossHP = false) {
    // Resetear enemigos a sus posiciones iniciales
    this.enemies = this.initialEnemySpawns.map(({ x, y }) => new Enemy(x, y));
    // Resetear jefe a spawn, opcionalmente preservando su vida
    if (this.initialBossSpawn) {
      if (preserveBossHP && this.boss) {
        const prevHp = this.boss.hp;
        this.boss = new Boss(this.initialBossSpawn.x, this.initialBossSpawn.y);
        this.boss.hp = prevHp;
        if (prevHp <= 0) this.boss.alive = false;
      } else {
        this.boss = new Boss(this.initialBossSpawn.x, this.initialBossSpawn.y);
      }
    } else {
      this.boss = null;
    }
  }

  spawnHazardProjectiles(projectiles, timeAccumulator, viewHeight = 180) {
    if (!this.hazardEmitters.length) return;
    for (const em of this.hazardEmitters) {
      const phase = Math.floor((timeAccumulator + (em.offset || 0)) / (em.interval || 2.2));
      if (em.lastPhase === phase) continue;
      em.lastPhase = phase;
      const size = em.size ?? 12;
      // Randomiza altura objetivo entre media pantalla y casi el tope
      const half = viewHeight * 0.5;
      const nearTop = viewHeight * 0.95;
      const targetH = half + Math.random() * (nearTop - half);
      const v0 = Math.sqrt(2 * GRAVITY * targetH);
      const fb = new Fireball(em.x, em.y, -v0, size);
      projectiles.push(fb);
    }
  }

  isSolidAtPixel(x, y) {
    if (x < 0 || y < 0) return true;
    const tx = Math.floor(x / TILE_SIZE);
    const ty = Math.floor(y / TILE_SIZE);
    return this.isSolidAtTile(tx, ty);
  }

  isSolidAtTile(tx, ty) {
    if (tx < 0 || tx >= this.width || ty < 0) return true;
    if (ty >= this.height) return false;
    const c = this.tiles[ty][tx];
    return c === 'X' || c === 'B' || c === '?';
  }

  isHazardAtTile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return false;
    const c = this.tiles[ty][tx];
    return c === 'L';
  }

  overlapsHazard(body) {
    const minTx = Math.floor(body.left / TILE_SIZE);
    const maxTx = Math.floor((body.right - 1) / TILE_SIZE);
    const minTy = Math.floor(body.top / TILE_SIZE);
    const maxTy = Math.floor((body.bottom - 1) / TILE_SIZE);
    for (let ty = minTy; ty <= maxTy; ty += 1) {
      for (let tx = minTx; tx <= maxTx; tx += 1) {
        if (this.isHazardAtTile(tx, ty)) return true;
      }
    }
    return false;
  }

  resolveCollisions(body) {
    let collided = false;
    const minTx = Math.floor((body.left) / TILE_SIZE) - 1;
    const maxTx = Math.floor((body.right) / TILE_SIZE) + 1;
    const minTy = Math.floor((body.top) / TILE_SIZE) - 1;
    const maxTy = Math.floor((body.bottom) / TILE_SIZE) + 1;
    for (let ty = minTy; ty <= maxTy; ty += 1) {
      for (let tx = minTx; tx <= maxTx; tx += 1) {
        if (!this.isSolidAtTile(tx, ty)) continue;
        const tileLeft = tx * TILE_SIZE;
        const tileTop = ty * TILE_SIZE;
        const tileRight = tileLeft + TILE_SIZE;
        const tileBottom = tileTop + TILE_SIZE;
        if (body.right <= tileLeft || body.left >= tileRight || body.bottom <= tileTop || body.top >= tileBottom) continue;
        const dx1 = tileRight - body.left;
        const dx2 = body.right - tileLeft;
        const dy1 = tileBottom - body.top;
        const dy2 = body.bottom - tileTop;
        const minX = Math.min(dx1, dx2);
        const minY = Math.min(dy1, dy2);
        if (minX < minY) {
          if (dx1 < dx2) body.x = tileRight; else body.x = tileLeft - body.width;
          collided = true;
        } else {
          if (dy1 < dy2) body.y = tileBottom; else body.y = tileTop - body.height;
          collided = true;
        }
      }
    }
    return collided;
  }

  drawBackground(ctx, cam) {
    const o = cam.getOffset();
    const g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    g.addColorStop(0, COLORS.skyTop);
    g.addColorStop(1, COLORS.skyBottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const parallax = (x, factor) => Math.floor((x - o.x) * factor);
    ctx.fillStyle = COLORS.hill2;
    for (let i = -1; i < 6; i += 1) {
      const bx = parallax(i * 140, 0.3);
      ctx.beginPath(); ctx.arc(bx, 160, 120, Math.PI, 2 * Math.PI); ctx.fill();
    }
    ctx.fillStyle = COLORS.hill1;
    for (let i = -1; i < 6; i += 1) {
      const bx = parallax(i * 180 + 60, 0.5);
      ctx.beginPath(); ctx.arc(bx, 170, 90, Math.PI, 2 * Math.PI); ctx.fill();
    }
  }

  drawTiles(ctx, cam) {
    const o = cam.getOffset();
    const startTx = Math.floor(o.x / TILE_SIZE) - 1;
    const endTx = Math.ceil((o.x + ctx.canvas.width) / TILE_SIZE) + 1;
    const startTy = Math.floor(o.y / TILE_SIZE) - 1;
    const endTy = Math.ceil((o.y + ctx.canvas.height) / TILE_SIZE) + 1;
    for (let ty = startTy; ty <= endTy; ty += 1) {
      if (ty < 0 || ty >= this.height) continue;
      for (let tx = startTx; tx <= endTx; tx += 1) {
        if (tx < 0 || tx >= this.width) continue;
        const c = this.tiles[ty][tx];
        if (c === '-' || c === 'P' || c === 'E' || c === 'G') continue;
        const x = tx * TILE_SIZE - o.x;
        const y = ty * TILE_SIZE - o.y;
        if (c === 'X') {
          ctx.fillStyle = COLORS.ground;
          ctx.fillRect(Math.floor(x), Math.floor(y), TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#3a2d24';
          ctx.fillRect(Math.floor(x), Math.floor(y + TILE_SIZE - 4), TILE_SIZE, 4);
        } else if (c === 'B') {
          ctx.fillStyle = COLORS.brick;
          ctx.fillRect(Math.floor(x), Math.floor(y), TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#5f3b2c';
          ctx.fillRect(Math.floor(x + 1), Math.floor(y + 1), TILE_SIZE - 2, TILE_SIZE - 2);
        } else if (c === '?') {
          ctx.fillStyle = COLORS.block;
          ctx.fillRect(Math.floor(x), Math.floor(y), TILE_SIZE, TILE_SIZE);
        } else if (c === 'L') {
          ctx.fillStyle = COLORS.hazard;
          ctx.fillRect(Math.floor(x), Math.floor(y), TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(Math.floor(x), Math.floor(y + TILE_SIZE - 3), TILE_SIZE, 3);
        }
      }
    }

    const gx = Math.floor(this.goal.x - o.x);
    const gy = Math.floor(this.goal.y - o.y);
    ctx.fillStyle = '#2a374d';
    ctx.fillRect(gx + 5, gy - 12, 2, this.goal.h + 12);
    ctx.fillStyle = COLORS.flag;
    ctx.fillRect(gx + 7, gy, 10, 6);
  }
}


