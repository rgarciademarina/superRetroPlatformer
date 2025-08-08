import { GameCore as Game } from './gameCore.js';
import { initFullscreen, requestFullscreenIfMobile } from './fullscreen.js';
import { LEVELS } from './levels.js';

const canvas = document.getElementById('game');
const hudCanvas = document.getElementById('hud');
const wrapper = document.querySelector('.game-wrapper');

function resizeCanvasToPixelPerfect(canvasEl) {
  const baseWidth = canvasEl.width;   // 320
  const baseHeight = canvasEl.height; // 180

  const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  const target = fsEl || document.documentElement;
  const availableWidth = fsEl ? target.clientWidth : window.innerWidth;
  const availableHeight = fsEl ? target.clientHeight : window.innerHeight;

  const scale = Math.max(1, Math.floor(
    Math.min(availableWidth / baseWidth, availableHeight / baseHeight)
  ));
  const cssW = baseWidth * scale;
  const cssH = baseHeight * scale;
  canvasEl.style.width = `${cssW}px`;
  canvasEl.style.height = `${cssH}px`;
  // Ajustar HUD para cubrir exactamente el canvas escalado y compensar el borde
  if (hudCanvas && wrapper) {
    const styles = getComputedStyle(canvasEl);
    const borderL = parseFloat(styles.borderLeftWidth) || 0;
    const borderT = parseFloat(styles.borderTopWidth) || 0;
    const w = Math.max(1, Math.round(parseFloat(canvasEl.style.width)));
    const h = Math.max(1, Math.round(parseFloat(canvasEl.style.height)));
    hudCanvas.width = w;
    hudCanvas.height = h;
    hudCanvas.style.width = `${w}px`;
    hudCanvas.style.height = `${h}px`;
    hudCanvas.style.left = `${borderL}px`;
    hudCanvas.style.top = `${borderT}px`;
  }
}

resizeCanvasToPixelPerfect(canvas);
window.addEventListener('resize', () => resizeCanvasToPixelPerfect(canvas));
document.addEventListener('fullscreenchange', () => resizeCanvasToPixelPerfect(canvas));
document.addEventListener('webkitfullscreenchange', () => resizeCanvasToPixelPerfect(canvas));

const game = new Game(canvas, LEVELS, hudCanvas);
game.start();

// Inicializar botón de pantalla completa
initFullscreen(wrapper);

// En móvil, intentar entrar a pantalla completa tras el primer gesto/tap en la página
document.addEventListener('touchend', () => requestFullscreenIfMobile(wrapper), { once: true, passive: true });
document.addEventListener('click', () => requestFullscreenIfMobile(wrapper), { once: true, passive: true });


