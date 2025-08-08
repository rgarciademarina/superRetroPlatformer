export function initFullscreen(wrapperElement) {
  try {
    if (!wrapperElement) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fullscreen-btn';
    button.setAttribute('aria-label', 'Pantalla completa');
    updateButton();

    const toggle = () => {
      const isFs = isFullscreen();
      if (isFs) {
        exitFullscreen();
      } else {
        requestFullscreen(wrapperElement);
      }
    };

    button.addEventListener('click', (e) => { e.preventDefault(); toggle(); });
    document.addEventListener('fullscreenchange', updateButton);
    document.addEventListener('webkitfullscreenchange', updateButton);

    // Atajos: F o Alt+Enter
    const keyHandler = (e) => {
      const key = String(e.key || '').toLowerCase();
      if (key === 'f' || (e.altKey && key === 'enter')) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', keyHandler, { passive: false });

    wrapperElement.appendChild(button);

    function isFullscreen() {
      return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function requestFullscreen(el) {
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (req) req.call(el);
    }

    function exitFullscreen() {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exit) exit.call(document);
    }

    function updateButton() {
      const fs = isFullscreen();
      button.setAttribute('aria-pressed', fs ? 'true' : 'false');
      button.title = fs ? 'Salir de pantalla completa (F o Esc)' : 'Pantalla completa (F o Alt+Enter)';
      button.textContent = fs ? '×' : '⛶';
    }
  } catch (_) {
    // Silencio: si Fullscreen API no está disponible, no mostramos botón
  }
}


