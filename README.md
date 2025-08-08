# Super Retro Platformer

Juego de plataformas retro en JS/Canvas. Proyecto estático, sin backend.

## Ejecutar en local

```bash
npm install
npm run start
# o elegir otro puerto si 5173 está ocupado
npm run start:5174
npm run start:random
```

Abre `http://localhost:5173` (o el puerto que se muestre en consola).

## Despliegue en GitHub Pages

Este repo incluye un workflow de GitHub Actions (`.github/workflows/deploy.yml`) que publica automáticamente el sitio en GitHub Pages al hacer push en la rama `main`.

Pasos:

1. En GitHub, ve a Settings → Pages.
2. Source: “GitHub Actions”.
3. Haz un push a `main`. El workflow construye y despliega la carpeta del repo tal cual (sitio estático).

La URL será: `https://<tu_usuario>.github.io/<repo>/`.

## Modo desarrollo

- Añade `?dev=1` a la URL para habilitar atajos de nivel.
- En móviles aparecen controles táctiles (◀ ▶ y ⤒) y el mensaje de inicio cambia.

## Créditos

Desarrollado con JavaScript y Canvas API. Audio con Web Audio API. Fullscreen con Fullscreen API.

## Super Retro Platformer (Mario)

Juego de plataformas retro hecho en JavaScript y Canvas. Es un proyecto 100% estático: no requiere build ni dependencias; solo un navegador moderno.

### Requisitos
- **Navegador moderno**: Chrome, Edge o Firefox (recomendado: Chrome/Edge).
- **Sin dependencias**: son archivos estáticos. Por usar ES Modules, es preferible servir el sitio con un servidor local en lugar de abrir con `file://`.

### Arranque rápido
- **Opción 1 — Abrir el archivo directamente**: haz doble clic en `index.html`.
  - Si ves pantalla en blanco o errores de CORS/origin en la consola, usa una de las opciones con servidor local.

- **Opción 2 — Windows (PowerShell) + Python**:
  ```powershell
cd E:\Workspace\Mario
py -m http.server 5173
# luego abre http://localhost:5173
  ```
  Si `py` no está disponible, prueba:
  ```powershell
python -m http.server 5173
  ```

- **Opción 3 — Node.js con npx**:
  ```powershell
cd E:\Workspace\Mario
npx serve -l 5173
# o
npx http-server -p 5173
  ```
  Luego abre `http://localhost:5173`.

- **Opción 3b — npm script (recomendado)**:
  - Requiere Node.js instalado. Ya se incluye `package.json` con scripts.
  ```powershell
cd E:\Workspace\Mario
npm install
npm run start
# o, para abrir el navegador automáticamente
npm run start:open
# si el puerto 5173 está ocupado
npm run start:5174
# o coger un puerto libre aleatorio
npm run start:random
  ```

- **Opción 4 — VS Code (Live Server)**:
  - Abre la carpeta del proyecto en VS Code
  - Instala/usa la extensión "Live Server"
  - Clic en "Go Live" y navega a la URL que te indique

### Controles
- **Mover**: Flechas Izquierda/Derecha o teclas `A`/`D`
- **Saltar**: `Espacio`
- **Empezar/Reiniciar**: `Enter`

### Consejos y solución de problemas
- **Audio sin sonar**: el audio se activa tras una interacción del usuario; pulsa cualquier tecla o haz clic para desbloquear el audio del navegador.
- **Pantalla pequeña/grande**: el lienzo escala de forma pixel-perfect al tamaño de la ventana. Redimensiona la ventana para cambiar el tamaño del juego.
- **Errores tipo “Blocked by CORS” o “from origin 'null'”**: ejecuta un servidor local (ver opciones arriba).

### Estructura del proyecto
```
.
├── index.html
├── style.css
└── src/
    ├── main.js
    ├── game.js
    ├── audio.js
    └── levels.js
```

### Despliegue
Cualquier hosting de archivos estáticos (p. ej., GitHub Pages, Netlify, Vercel) funciona. Solo sirve el contenido de la carpeta del proyecto tal cual.
