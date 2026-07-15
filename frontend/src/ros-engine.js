// RoS v4 — Moteur de calcul (fonctions pures, consomme ros-model.js)
import { VOIES, PROFILES, DIMENSIONS, RULES, K_VALUES } from './ros-model.js';

function isNum(x) {
  return x !== '' && x !== null && x !== undefined && !isNaN(parseFloat(x));
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
