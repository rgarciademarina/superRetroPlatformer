const STORAGE_KEY = 'mario_scores_v1';
export const MAX_SCORES = 10;

export function loadScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return normalize(arr).slice(0, MAX_SCORES);
  } catch { return []; }
}

export function saveScores(scores) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(scores))); } catch {}
}

export function recordScore(name, score) {
  const list = loadScores();
  list.push({ name: sanitizeName(name), score: Number(score) || 0 });
  const sorted = normalize(list)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SCORES);
  saveScores(sorted);
  return sorted;
}

export function getRankForScore(score, scores = loadScores()) {
  const arr = normalize(scores).sort((a, b) => b.score - a.score);
  const idx = arr.findIndex(s => score >= (Number(s.score) || 0));
  return idx === -1 ? arr.length : idx;
}

export function exportScoresJson(scores = loadScores()) {
  return JSON.stringify({ scores: normalize(scores) }, null, 2);
}

function sanitizeName(n) {
  if (!n) return '---';
  return String(n).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || '---';
}

function normalize(list) {
  return (Array.isArray(list) ? list : [])
    .map(s => ({ name: sanitizeName(s.name), score: Number(s.score) || 0 }));
}


