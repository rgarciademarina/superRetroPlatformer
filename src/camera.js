export class Camera {
  constructor(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.x = 0;
    this.y = 0;
    this.worldWidth = viewWidth;
    this.worldHeight = viewHeight;
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
  }

  setWorldSize(w, h) {
    this.worldWidth = w;
    this.worldHeight = h;
  }

  update(targetX, targetY, dt) {
    const targetCamX = targetX - this.viewWidth / 2;
    const targetCamY = targetY - this.viewHeight / 2;
    const lerp = 1 - Math.pow(0.001, dt);
    this.x += (targetCamX - this.x) * lerp;
    this.y += (targetCamY - this.y) * lerp;
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.viewWidth));
    this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.viewHeight));

    if (this.shakeTime > 0) this.shakeTime -= dt;
  }

  addShake(magnitude, time) {
    this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
    this.shakeTime = Math.max(this.shakeTime, time);
  }

  getOffset() {
    if (this.shakeTime > 0) {
      const dx = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
      const dy = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
      return { x: this.x + dx, y: this.y + dy };
    }
    return { x: this.x, y: this.y };
  }
}


