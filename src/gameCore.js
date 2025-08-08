import { SFX } from './audio.js';
import { Camera } from './camera.js';
import { COLORS, KEY, JUMP_VELOCITY } from './constants.js';
import { InputManager } from './input.js';
import { Player } from './entities.js';
import { ParticleSystem } from './particles.js';
import { Level } from './level.js';
import { drawCenterText, drawHud, drawScoreboard } from './hud.js';
import { loadScores, recordScore } from './scores.js';

export class GameCore {
  constructor(canvas, levels, hudCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hudCanvas = hudCanvas || null;
    this.hudCtx = this.hudCanvas ? this.hudCanvas.getContext('2d') : null;
    this.ctx.imageSmoothingEnabled = false;

    this.levels = levels;
    this.currentLevelIndex = 0;
    this.level = new Level(this.levels[this.currentLevelIndex]);
    this.camera = new Camera(canvas.width, canvas.height);
    this.camera.setWorldSize(this.level.pixelWidth, this.level.pixelHeight);

    this.input = new InputManager();
    this.sfx = new SFX();
    this.player = new Player(this.level.playerStart.x, this.level.playerStart.y, this.sfx);
    this.particles = new ParticleSystem();
    this.projectiles = [];

    this.score = 0;
    this.lives = 3;
    this.state = 'TITLE'; // TITLE, PLAY, DEAD, LEVEL_COMPLETE, WIN, GAME_OVER
    this.stateTimer = 0;
    this.pendingInitials = '';
    this.showScoreboard = false;
    this.recentScores = loadScores();

    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDt = 1 / 60;

    // Dev tools
    this.isDev = /(^|[?&])dev=1(?!\d)/i.test(window.location.search) || window.location.hash.includes('dev');
    if (this.isDev) this._bindDevShortcuts();
    this._timeSinceStart = 0;

    // Iniciales en móvil: elementos de overlay
    this.initialsOverlay = document.getElementById('initialsOverlay');
    this.initialsInput = document.getElementById('initialsInput');
    if (this.initialsOverlay && this.initialsInput) {
      this.initialsOverlay.hidden = true;
      this.initialsInput.addEventListener('input', () => {
        if (this.initialsInput.value.length > 3) this.initialsInput.value = this.initialsInput.value.slice(0, 3);
        this.pendingInitials = this.initialsInput.value.toUpperCase();
        if (this.pendingInitials.length >= 3) {
          this._submitInitialsFromOverlay();
        }
      });
      this.initialsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._submitInitialsFromOverlay();
        }
      });
    }
  }

  start() {
    requestAnimationFrame((t) => this._loop(t));
  }

  _loop(timeMs) {
    const t = timeMs / 1000;
    const dt = Math.min(0.05, t - this.lastTime || 0);
    this.lastTime = t;
    this.accumulator += dt;

    while (this.accumulator >= this.fixedDt) {
      this.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }
    this.draw();
    requestAnimationFrame((nt) => this._loop(nt));
  }

  _bindDevShortcuts() {
    this._devKeyHandler = (e) => {
      // Saltar de nivel rápido
      if (e.key === ']') {
        e.preventDefault();
        this._changeLevel(+1);
        return;
      }
      if (e.key === '[') {
        e.preventDefault();
        this._changeLevel(-1);
        return;
      }
      if (e.key.toLowerCase() === 'l') {
        // Prompt para ir a nivel específico (1..N)
        const input = window.prompt(`Ir a nivel (1..${this.levels.length}):`, String(this.currentLevelIndex + 1));
        if (input != null) {
          const n = Math.max(1, Math.min(this.levels.length, parseInt(input, 10) || 1));
          this._gotoLevel(n - 1);
        }
        return;
      }
      // Teclas numéricas 1..9/0 para salto directo (0 => 10)
      if (/^[0-9]$/.test(e.key)) {
        const n = (e.key === '0') ? 10 : parseInt(e.key, 10);
        if (n >= 1 && n <= this.levels.length) {
          e.preventDefault();
          this._gotoLevel(n - 1);
        }
      }
    };
    window.addEventListener('keydown', this._devKeyHandler);
  }

  _changeLevel(delta) {
    const next = (this.currentLevelIndex + delta + this.levels.length) % this.levels.length;
    this._gotoLevel(next);
  }

  _gotoLevel(targetIndex) {
    this.currentLevelIndex = targetIndex;
    this.level = new Level(this.levels[this.currentLevelIndex]);
    this.camera.setWorldSize(this.level.pixelWidth, this.level.pixelHeight);
    this.player.spawnX = this.level.playerStart.x;
    this.player.spawnY = this.level.playerStart.y;
    this.player.respawn();
    this.projectiles = [];
    this.particles = new ParticleSystem();
    this.state = 'PLAY';
  }

  update(dt) {
    this._timeSinceStart += dt;
    switch (this.state) {
      case 'TITLE':
        if (this.input.pressed(KEY.START) || (this.input.isTouchUI && this.input.pressed(KEY.JUMP))) {
          this.state = 'PLAY';
          this.sfx.play('coin');
        }
        break;
      case 'PLAY':
        this._updatePlay(dt);
        break;
      case 'DEAD':
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) this._respawnOrGameOver();
        break;
      case 'LEVEL_COMPLETE':
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) this._nextLevel();
        break;
      case 'WIN':
        this._handleNameEntry();
        if ((this.input.pressed(KEY.START) || (this.input.isTouchUI && this.input.pressed(KEY.JUMP))) && !this._isEnteringName()) this._resetGame();
        break;
      case 'GAME_OVER':
        this._handleNameEntry();
        if ((this.input.pressed(KEY.START) || (this.input.isTouchUI && this.input.pressed(KEY.JUMP))) && !this._isEnteringName()) this._resetGame();
        break;
      default:
        break;
    }
    // Actualizar partículas en todos los estados (confeti animado en WIN)
    this.particles.update(dt);
    this.input.update();
  }

  _updatePlay(dt) {
    this.player.update(this.input, this.level, dt, KEY);
    for (const e of this.level.enemies) e.update(this.level, dt);
    this.level.enemies = this.level.enemies.filter(e => e.alive);
    if (this.level.boss && this.level.boss.alive) {
      this.level.boss.update(this.level, dt, this.player, this.projectiles, this.sfx);
    }
    for (const p of this.projectiles) p.update(this.level, dt, this.particles);
    this.projectiles = this.projectiles.filter(p => p.alive);
    this._handlePlayerEnemyInteractions();
    this._handlePlayerBossInteractions();
    this._handlePlayerProjectileInteractions();

    this.camera.update(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, dt);

    // Emisores de lava del nivel
    this.level.spawnHazardProjectiles(this.projectiles, this._timeSinceStart, this.canvas.height);

    if (this.level.overlapsHazard(this.player)) {
      this.player.alive = false;
    }

    if (this._intersect(this.player, this.level.goal) && (!this.level.boss || !this.level.boss.alive)) {
      this.score += 500;
      this.sfx.play('goal');
      this.state = 'LEVEL_COMPLETE';
      this.stateTimer = 1.2;
      this.camera.addShake(1.2, 0.25);
    }

    if (!this.player.alive) {
      this.lives -= 1;
      this.sfx.play('hit');
      this.state = 'DEAD';
      this.stateTimer = 1.0;
      this.camera.addShake(2.3, 0.35);
    }
  }

  _handlePlayerEnemyInteractions() {
    for (const enemy of this.level.enemies) {
      if (!enemy.alive) continue;
      if (!this._aabbOverlap(this.player, enemy)) continue;
      const isStomp = this.player.vy > 60 && (this.player.bottom - enemy.top) < 10;
      if (isStomp) {
        enemy.alive = false;
        this.score += 100;
        this.player.vy = -JUMP_VELOCITY * 0.6;
        this.sfx.play('stomp');
        this.particles.burst(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, COLORS.enemy, 14, 160);
        this.camera.addShake(1.5, 0.2);
      } else if (this.player.invincibleTime <= 0) {
        this.player.alive = false;
      }
    }
  }

  _handlePlayerBossInteractions() {
    const boss = this.level.boss;
    if (!boss || !boss.alive) return;
    if (!this._aabbOverlap(this.player, boss)) return;
    const isStomp = this.player.vy > 60 && (this.player.bottom - boss.top) < 12;
    if (isStomp) {
      const hit = boss.takeHit(this.sfx, this.particles, this.camera);
      if (hit) {
        this.score += 300;
        this.player.vy = -JUMP_VELOCITY * 0.75;
      }
    } else if (this.player.invincibleTime <= 0) {
      this.player.alive = false;
    }
  }

  _handlePlayerProjectileInteractions() {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      if (this._aabbOverlap(this.player, p)) {
        p.alive = false;
        if (this.player.invincibleTime <= 0) this.player.alive = false;
      }
    }
  }

  _intersect(a, b) {
    return !(a.right < b.x || a.left > b.x + b.w || a.bottom < b.y || a.top > b.y + b.h);
  }

  _aabbOverlap(a, b) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  _respawnOrGameOver() {
    if (this.lives < 0) { this.state = 'GAME_OVER'; return; }
    // Resetear enemigos y jefe (preservar HP del jefe), y vaciar proyectiles
    this.level.resetEntities(true);
    this.projectiles = [];
    this.player.respawn();
    this.state = 'PLAY';
  }

  _nextLevel() {
    this.currentLevelIndex += 1;
    if (this.currentLevelIndex >= this.levels.length) {
      // Bonus por completar el juego y confeti
      this.score += 2000;
      this._spawnWinConfetti();
      this.pendingInitials = '';
      this.showScoreboard = false;
      this.state = 'WIN';
      return;
    }
    this.level = new Level(this.levels[this.currentLevelIndex]);
    this.camera.setWorldSize(this.level.pixelWidth, this.level.pixelHeight);
    this.player.spawnX = this.level.playerStart.x;
    this.player.spawnY = this.level.playerStart.y;
    this.player.respawn();
    this.state = 'PLAY';
  }

  _resetGame() {
    this.score = 0;
    this.lives = 3;
    this.currentLevelIndex = 0;
    this.level = new Level(this.levels[0]);
    this.camera.setWorldSize(this.level.pixelWidth, this.level.pixelHeight);
    this.player.spawnX = this.level.playerStart.x;
    this.player.spawnY = this.level.playerStart.y;
    this.player.respawn();
    this.state = 'TITLE';
    this.pendingInitials = '';
    this.showScoreboard = false;
  }

  draw() {
    const { ctx, canvas } = this;
    this.level.drawBackground(ctx, this.camera);
    this.level.drawTiles(ctx, this.camera);
    for (const e of this.level.enemies) e.draw(ctx, this.camera);
    if (this.level.boss) this.level.boss.draw(ctx, this.camera);
    for (const p of this.projectiles) p.draw(ctx, this.camera);
    if (this.player.alive || this.state !== 'DEAD') this.player.draw(ctx, this.camera);
    this.particles.draw(ctx, this.camera);

    const showLives = this.state !== 'GAME_OVER';
    const shouldDrawHud = this.state !== 'TITLE' && this.state !== 'WIN';
    // Limpiar HUD y dibujarlo encima
    if (this.hudCtx && this.hudCanvas) {
      this.hudCtx.clearRect(0, 0, this.hudCanvas.width, this.hudCanvas.height);
      if (shouldDrawHud) {
        drawHud(this.hudCtx, this.hudCanvas, this.score, this.currentLevelIndex, this.levels.length, this.lives, this.level.boss, showLives);
      }
    } else if (shouldDrawHud) {
      drawHud(ctx, canvas, this.score, this.currentLevelIndex, this.levels.length, this.lives, this.level.boss, showLives);
    }

    if (this.state === 'TITLE') {
      const uiCanvas = this.hudCanvas || canvas;
      const H = uiCanvas.height;
      this._drawCenterText('SUPER RETRO PLATFORMER', H * 0.18, '#f5f8ff');
      const welcome = this.input.isTouchUI ? 'Toca ⤒ para empezar | ◀ ▶ mover | ⤒ saltar' : 'Flechas: mover | Espacio: saltar';
      this._drawCenterText(welcome, H * 0.30, '#c8d0ff');
      // Scoreboard en dos columnas, hasta 10 entradas (5 por columna)
      drawScoreboard(this.hudCtx || ctx, this.hudCanvas || canvas, 'TOP SCORES', this.recentScores, 0.36, 5, 2);
      // Colocar el mensaje pegado al borde inferior, por debajo del panel
      {
        const scaleRef = Math.max(1, Math.floor(H / 180));
        const marginBottom = 2 * scaleRef;
        const enterY = H - marginBottom - (18 * scaleRef);
        const startMsg = this.input.isTouchUI ? 'Toca ⤒ para empezar' : 'Pulsa ENTER para empezar';
        this._drawCenterText(startMsg, enterY, '#a5b4fc');
      }
    } else if (this.state === 'LEVEL_COMPLETE') {
      this._drawCenterText('¡Nivel completado!', canvas.height * 0.45, '#a7f3d0');
    } else if (this.state === 'WIN') {
      // Usar la altura real del lienzo de HUD si existe para mantener el espaciado correcto
      const uiCanvas = this.hudCanvas || canvas;
      const H = uiCanvas.height;
      this._drawCenterText('¡Enhorabuena!', H * 0.35, '#fef3c7');
      this._drawCenterText('Has completado el juego (+2000)', H * 0.47, '#fde68a');
      if (this._isEnteringName()) {
        this._drawCenterText(`Introduce tus iniciales: [ ${this.pendingInitials.padEnd(3, '_')} ]`, H * 0.64, '#c7dbff');
      } else {
        this._drawCenterText('ENTER para reiniciar', H * 0.64, '#fde68a');
      }
      if (this.showScoreboard) {
        // Mostrar en dos columnas y con texto más pequeño (hasta 10 entradas)
        drawScoreboard(this.hudCtx || ctx, this.hudCanvas || canvas, 'TOP SCORES', this.recentScores, 0.66, 5, 2);
      }
    } else if (this.state === 'GAME_OVER') {
      const uiCanvas = this.hudCanvas || canvas;
      const H = uiCanvas.height;
      this._drawCenterText('GAME OVER', H * 0.40, '#fca5a5');
      if (this._isEnteringName()) {
        this._drawCenterText(`Introduce tus iniciales: [ ${this.pendingInitials.padEnd(3, '_')} ]`, H * 0.58, '#fecaca');
      } else {
        const restartMsg = this.input.isTouchUI ? 'Toca ⤒ para reiniciar' : 'ENTER para reiniciar';
        this._drawCenterText(restartMsg, H * 0.58, '#fecaca');
      }
      if (this.showScoreboard) {
        drawScoreboard(this.hudCtx || ctx, this.hudCanvas || canvas, 'TOP SCORES', this.recentScores, 0.62, 5, 2);
      }
    }

    // Overlay de ayuda dev (en HUD para no pixelar)
    if (this.isDev) {
      const overlayCtx = this.hudCtx || ctx;
      const overlayCanvas = this.hudCanvas || canvas;
      overlayCtx.save();
      const scaleRef = Math.max(1, Math.floor(overlayCanvas.height / 180));
      overlayCtx.fillStyle = '#c7dbff';
      overlayCtx.font = `${10 * scaleRef}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
      const text = 'DEV: [ y ] nivel | L ir a nivel | 1..9/0 salto directo | ?dev=1';
      overlayCtx.fillText(text, 8, overlayCanvas.height - 14 * scaleRef);
      overlayCtx.restore();
    }
  }

  _drawCenterText(text, y, color) {
    if (this.hudCtx && this.hudCanvas) {
      drawCenterText(this.hudCtx, this.hudCanvas, text, y, color);
    } else {
      drawCenterText(this.ctx, this.canvas, text, y, color);
    }
  }

  _isEnteringName() {
    return this.pendingInitials != null && this.pendingInitials.length >= 0 && this.pendingInitials.length < 3 && (this.state === 'WIN' || this.state === 'GAME_OVER');
  }

  _handleNameEntry() {
    if (!this._isEnteringName()) return;
    // En móvil mostrar overlay editable para que aparezca el teclado
    if (this.input.isTouchUI && this.initialsOverlay && this.initialsInput) {
      if (this.initialsOverlay.hidden) {
        this.initialsOverlay.hidden = false;
        this.initialsInput.value = this.pendingInitials || '';
        this.initialsInput.focus();
        this.initialsInput.select();
      }
      return;
    }
    // Leer letras/números y backspace/enter (teclado físico)
    const handler = (e) => {
      if (e.repeat) return;
      const key = e.key;
      if (/^[a-zA-Z0-9]$/.test(key) && this.pendingInitials.length < 3) {
        this.pendingInitials += key.toUpperCase();
        e.preventDefault();
      } else if (key === 'Backspace' && this.pendingInitials.length > 0) {
        this.pendingInitials = this.pendingInitials.slice(0, -1);
        e.preventDefault();
      } else if (key === 'Enter' && this.pendingInitials.length > 0) {
        // Guardar y mostrar clasificación
        this.recentScores = recordScore(this.pendingInitials, this.score);
        this.pendingInitials = null; // finalizado
        this.showScoreboard = true;
        e.preventDefault();
      }
      window.removeEventListener('keydown', handler, true);
      // volver a escuchar tras un tick para evitar autorepeat
      setTimeout(() => window.addEventListener('keydown', handler, true), 0);
    };
    // Asegurar un solo listener activo
    if (!this._nameListenerAttached) {
      window.addEventListener('keydown', handler, true);
      this._nameListenerAttached = true;
    }
  }

  _submitInitialsFromOverlay() {
    if (!this.pendingInitials || this.pendingInitials.length === 0) return;
    this.recentScores = recordScore(this.pendingInitials, this.score);
    this.pendingInitials = null;
    this.showScoreboard = true;
    if (this.initialsOverlay) this.initialsOverlay.hidden = true;
    // En móvil, permitir reiniciar también con el botón de salto
    if (this.input && this.input.isTouchUI) {
      // pequeña pausa para evitar doble trigger del Enter virtual
      setTimeout(() => {}, 0);
    }
  }

  _spawnWinConfetti() {
    const viewW = this.canvas.width;
    const viewH = this.canvas.height;
    const offset = this.camera.getOffset();
    const palette = [COLORS.flag, COLORS.particle, COLORS.projectile, COLORS.enemy, COLORS.boss, COLORS.white];
    const columns = 12;
    for (let i = 0; i < columns; i += 1) {
      const x = offset.x + (i + 0.5) * (viewW / columns);
      const y = offset.y + viewH - 4; // desde abajo
      const color = palette[i % palette.length];
      this.particles.confettiUp(x, y, color, 18 + Math.floor(Math.random() * 10), 420 + Math.random() * 220);
    }
  }
}


