import { COLORS } from './constants.js';

export function drawHud(ctx, canvas, score, currentLevelIndex, totalLevels, lives, boss, showLives = true) {
  ctx.save();
  ctx.fillStyle = COLORS.white;
  // Texto más nítido: fuentes más grandes y sin pixelado
  const scaleRef = Math.max(1, Math.floor(canvas.height / 180));
  const fontSmall = 12 * scaleRef; // antes 8
  const fontMedium = 14 * scaleRef;
  ctx.font = `${fontSmall}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
  ctx.textBaseline = 'top';
  // Margen seguro para evitar solaparse con el título centrado
  const pad = 8 * scaleRef;
  // SCORE a la izquierda
  ctx.fillText(`SCORE ${String(score).padStart(6, '0')}`, pad, pad);
  // LEVEL centrado
  const levelText = `LEVEL ${currentLevelIndex + 1}/${totalLevels}`;
  const levelW = ctx.measureText(levelText).width;
  ctx.fillText(levelText, Math.round((canvas.width - levelW) / 2), pad);
  // LIVES a la derecha con espacio para botón fullscreen
  if (showLives) {
    const text = `LIVES ${Math.max(0, lives)}`;
    const w = ctx.measureText(text).width;
    const fullscreenPad = 32; // constante en CSS px, no escalar
    ctx.fillText(text, canvas.width - w - pad - fullscreenPad, pad);
  }
  if (boss && boss.alive) {
    const maxW = 140 * scaleRef;
    const hpRatio = Math.max(0, Math.min(1, boss.hp / 5));
    ctx.fillStyle = '#2a374d';
    ctx.fillRect(Math.floor((canvas.width - maxW) / 2), 22 * scaleRef, maxW, 8 * scaleRef);
    ctx.fillStyle = COLORS.boss;
    ctx.fillRect(Math.floor((canvas.width - maxW) / 2), 22 * scaleRef, Math.floor(maxW * hpRatio), 8 * scaleRef);
    ctx.fillStyle = COLORS.white;
    ctx.font = `${fontSmall}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
    const label = 'BOSS';
    const lw = ctx.measureText(label).width;
    ctx.fillText(label, Math.floor((canvas.width - maxW) / 2) - lw - 8, 20 * scaleRef);
  }
  ctx.restore();
}

export function drawCenterText(ctx, canvas, text, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  const scaleRef = Math.max(1, Math.floor(canvas.height / 180));
  const font = 18 * scaleRef; // antes 12
  ctx.font = `${font}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
  const w = ctx.measureText(text).width;
  ctx.fillText(text, Math.round((canvas.width - w) / 2), Math.round(y));
  ctx.restore();
}

export function drawScoreboard(ctx, canvas, title, scores, topFrac = 0.5, maxRows = 5, columns = 1) {
  ctx.save();
  const scaleRef = Math.max(1, Math.floor(canvas.height / 180));
  const titleFont = 16 * scaleRef;
  const rowFont = (columns > 1 ? 9 : 12) * scaleRef;
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#f5f8ff';
  ctx.font = `${titleFont}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
  const titleW = ctx.measureText(title).width;
  const centerX = Math.round((canvas.width - titleW) / 2);
  const startY = Math.round(canvas.height * topFrac);

  // Panel de fondo
  const panelPadX = 12 * scaleRef;
  const panelPadY = 8 * scaleRef;
  const panelWidth = Math.round(canvas.width * (columns > 1 ? 0.86 : 0.64));
  const panelX = Math.round((canvas.width - panelWidth) / 2);
  const rowH = 11 * scaleRef;
  const maxEntries = maxRows * columns;
  const total = Math.min(maxEntries, scores.length);
  const rowsPerCol = maxRows; // reservar siempre maxRows por columna
  const panelH = panelPadY * 2 + (titleFont + panelPadY) + rowsPerCol * rowH + panelPadY;
  ctx.fillStyle = 'rgba(8, 12, 20, 0.6)';
  ctx.fillRect(panelX, startY - panelPadY, panelWidth, panelH);
  ctx.strokeStyle = 'rgba(60, 70, 100, 0.8)';
  ctx.strokeRect(panelX, startY - panelPadY, panelWidth, panelH);

  ctx.fillStyle = '#f5f8ff';
  ctx.fillText(title, centerX, startY);

  ctx.font = `${rowFont}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
  const cols = Math.max(1, columns);
  const colInnerPad = 10 * scaleRef;
  const usableW = panelWidth - panelPadX * 2;
  const colW = Math.floor((usableW - (cols - 1) * colInnerPad) / cols);
  const baseY = startY + 22 * scaleRef;
  for (let c = 0; c < cols; c += 1) {
    const colX = panelX + panelPadX + c * (colW + colInnerPad);
    for (let r = 0; r < rowsPerCol; r += 1) {
      const idx = c * rowsPerCol + r;
      if (idx >= total) break;
      const s = scores[idx];
      const rank = String(idx + 1).padStart(2, '0');
      const line = `${rank}. ${s.name.padEnd(3, ' ')}  ${String(s.score).padStart(6, '0')}`;
      ctx.fillStyle = idx === 0 ? '#fde68a' : '#c8d0ff';
      ctx.fillText(line, colX, baseY + r * rowH);
    }
  }
  ctx.restore();
}


