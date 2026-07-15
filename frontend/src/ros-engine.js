// RoS v4 — Moteur de calcul (fonctions pures, consomme ros-model.js)
import { VOIES, PROFILES, DIMENSIONS, RULES, K_VALUES } from './ros-model.js';

function isNum(x) {
  return x !== '' && x !== null && x !== undefined && !isNaN(parseFloat(x));
}

function clamp(x) { return Math.max(0, Math.min(100, x)); }

// Agrège un vecteur de scores 0-100 selon une règle non-compensatoire.
export function aggregate(values, rule, k = 1) {
  const v = values.filter(x => x !== null && x !== undefined);
  if (v.length === 0) return null;
  const n = v.length;
  const M = v.reduce((a, b) => a + b, 0) / n;

  if (rule === 'linear') return clamp(M);

  if (rule === 'geometric') {
    const prod = v.reduce((a, b) => a * b, 1);
    return clamp(Math.pow(prod, 1 / n));
  }

  if (rule === 'penalized') {
    if (M === 0) return 0;
    const variance = v.reduce((a, b) => a + (b - M) ** 2, 0) / n; // population
    return clamp(M - k * (variance / M));
  }

  throw new Error(`Unknown rule: ${rule}`);
}

// Cellule → score 0-100 via le barème de la voie. Vide/invalide → null.
export function scoreCell(voie, cell) {
  if (!voie || !cell) return null;
  if (voie.kind === 'cat') {
    if (!cell.band) return null;
    const band = voie.bands.find(b => b.key === cell.band);
    return band ? band.score : null;
  }
  // numeric
  if (!isNum(cell.value)) return null;
  const v = parseFloat(cell.value);
  if (voie.dir === 'lower') {
    for (const step of voie.steps) {          // thresholds ascendants
      if (v < step.threshold) return step.score;
    }
    return voie.steps[voie.steps.length - 1].score;
  }
  // dir 'higher' : thresholds descendants
  for (const step of voie.steps) {
    if (v >= step.threshold) return step.score;
  }
  return 0;
}
