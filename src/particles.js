import { COLORS } from './constants.js';

class Particle {
  constructor(x, y, vx, vy, life, color) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.life = life; this.color = color;
    this.size = 2 + Math.floor(Math.random() * 2);
  }
  update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.vy += 800 * dt; this.life -= dt; }
  draw(ctx, cam) {
    const o = cam.getOffset();
    if (this.life <= 0) return;
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.floor(this.x - o.x), Math.floor(this.y - o.y), this.size, this.size);
  }
}

export class ParticleSystem {
  constructor() { this.particles = []; }
  burst(x, y, color = COLORS.particle, count = 10, speed = 120) {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.5 + Math.random());
      this.particles.push(new Particle(x, y, Math.cos(a) * v, Math.sin(a) * v, 0.4 + Math.random() * 0.5, color));
    }
  }
  // Confeti orientado hacia arriba con ligera inclinación
  confettiUp(x, y, color = COLORS.particle, count = 16, baseSpeed = 420) {
    for (let i = 0; i < count; i += 1) {
      // Ángulo alrededor de -90° con +/- 35° de variación
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.39);
      const v = baseSpeed * (0.7 + Math.random() * 0.6);
      const vx = Math.cos(angle) * v;
      const vy = Math.sin(angle) * v; // negativo (hacia arriba)
      const life = 0.8 + Math.random() * 0.9;
      this.particles.push(new Particle(x, y, vx, vy, life, color));
    }
  }
  update(dt) { this.particles = this.particles.filter(p => (p.life > 0)); this.particles.forEach(p => p.update(dt)); }
  draw(ctx, cam) { this.particles.forEach(p => p.draw(ctx, cam)); }
}


