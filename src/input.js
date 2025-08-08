import { KEY } from './constants.js';

export class InputManager {
  constructor() {
    this.keysDown = new Set();
    this.keysPressed = new Set();
    this.keysReleased = new Set();
    this.isTouchUI = false;

    window.addEventListener('keydown', (e) => {
      if (this._handledKeys().has(e.key)) e.preventDefault();
      if (!this.keysDown.has(e.key)) this.keysPressed.add(e.key);
      this.keysDown.add(e.key);
    });
    window.addEventListener('keyup', (e) => {
      if (this._handledKeys().has(e.key)) e.preventDefault();
      this.keysDown.delete(e.key);
      this.keysReleased.add(e.key);
    });

    // Controles táctiles (cuando existan en DOM)
    document.addEventListener('DOMContentLoaded', () => {
      const touchRoot = document.getElementById('touch');
      if (!touchRoot) return;
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (!isMobile) return; // no mostrar en desktop
      this.isTouchUI = true;
      touchRoot.removeAttribute('aria-hidden');

      const bindBtn = (selector, downKey, upKey = downKey) => {
        const el = touchRoot.querySelector(selector);
        if (!el) return;
        const press = (e) => { e.preventDefault(); this._pressVirtual(downKey); };
        const release = (e) => { e.preventDefault(); this._releaseVirtual(upKey); };
        el.addEventListener('touchstart', press, { passive: false });
        el.addEventListener('mousedown', press);
        el.addEventListener('touchend', release);
        el.addEventListener('mouseup', release);
        el.addEventListener('mouseleave', release);
        el.addEventListener('touchcancel', release);
      };
      bindBtn('.touch-left', 'ArrowLeft');
      bindBtn('.touch-right', 'ArrowRight');
      bindBtn('.touch-jump', ' ');
    });
  }

  _handledKeys() {
    return new Set([...KEY.LEFT, ...KEY.RIGHT, ...KEY.JUMP, ...KEY.START]);
  }

  update() {
    this.keysPressed.clear();
    this.keysReleased.clear();
  }

  isDown(anyOf) {
    return anyOf.some((k) => this.keysDown.has(k));
  }

  pressed(anyOf) {
    return anyOf.some((k) => this.keysPressed.has(k));
  }

  _pressVirtual(key) {
    if (!this.keysDown.has(key)) this.keysPressed.add(key);
    this.keysDown.add(key);
  }

  _releaseVirtual(key) {
    this.keysDown.delete(key);
    this.keysReleased.add(key);
  }
}


