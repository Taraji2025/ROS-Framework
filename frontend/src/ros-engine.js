// RoS v4 — Moteur de calcul (fonctions pures, consomme ros-model.js)
import { VOIES, PROFILES, DIMENSIONS, RULES, K_VALUES, LEVELS, MATURITE, INFLUENCE } from './ros-model.js';

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

// Sous-scores par Voie applicable (ordre VOIES). score = 0-100 | null.
export function voieScores(cells = {}, profile = 'standard') {
  const applicableIds = new Set(PROFILES[profile]?.applicable ?? []);
  return VOIES
    .filter(v => applicableIds.has(v.id))
    .map(v => ({ id: v.id, code: v.code, label: v.label, dim: v.dim, score: scoreCell(v, cells[v.id]) }));
}

// Score + couverture d'une dimension pour un profil, sous une règle/k donnés.
export function computeDimension(dim, cells, profile, rule, k = 1) {
  const applicableIds = new Set(PROFILES[profile]?.applicable ?? []);
  const voies = VOIES.filter(v => v.dim === dim && applicableIds.has(v.id));
  const scores = [];
  let filled = 0;
  for (const v of voies) {
    const s = scoreCell(v, cells[v.id]);
    if (s !== null) { scores.push(s); filled++; }
  }
  const applicable = voies.length;
  return {
    score: aggregate(scores, rule, k),
    coverage: applicable > 0 ? filled / applicable : 0,
    applicable,
    filled,
  };
}

// Coefficient de gouvernance : 1 − 0.1 × (critères absents), plancher 0.7.
export function governanceCoef(g = {}) {
  const criteria = [g.croReporting, g.vetoFormalized, g.vetoExercised];
  const absent = criteria.filter(c => !c).length;
  return Math.max(0.7, 1 - 0.1 * absent);
}

// Score global : dimensions (poids égaux) → global, × coefficient de gouvernance.
export function computeGlobal(cells, profile, governance, rule, k = 1) {
  const dims = {};
  for (const d of DIMENSIONS) dims[d] = computeDimension(d, cells, profile, rule, k);
  const dimScores = DIMENSIONS.map(d => dims[d].score).filter(s => s !== null);
  const raw = aggregate(dimScores, rule, k); // poids égaux
  const coef = governanceCoef(governance);
  const final = raw === null ? null : clamp(raw * coef);
  return { raw, final, coef, dims };
}

export function rosLevel(v) {
  if (v === null || v === undefined) {
    return { label: 'Aucune donnée', color: 'var(--text3)', cls: '' };
  }
  return LEVELS.find(l => v < l.max) ?? LEVELS[LEVELS.length - 1];
}

// Pipeline complet : matrice règle×k + headline + couverture.
export function computeAssessment(assessment) {
  const { sector = 'standard', governance = {}, cells = {} } = assessment ?? {};
  const matrix = {};
  for (const rule of RULES) {
    matrix[rule] = {};
    for (const k of K_VALUES) {
      const g = computeGlobal(cells, sector, governance, rule, k);
      matrix[rule][k] = { raw: g.raw, final: g.final, dims: g.dims };
    }
  }
  const headline = matrix.penalized[1].final;
  const coef = governanceCoef(governance);
  const refDims = matrix.penalized[1].dims;
  const coverageByDim = {};
  for (const d of DIMENSIONS) coverageByDim[d] = refDims[d].coverage;
  return { headline, level: rosLevel(headline), coef, matrix, coverageByDim };
}

// Normalisation v3 des lectures : qual 1-5 -> 0-100 ; num -> value/target×100 borné.
function normReading(ind, cell) {
  if (!cell || !isNum(cell.value)) return null;
  const v = parseFloat(cell.value);
  if (ind.kind === 'qual') {
    const c = Math.max(1, Math.min(5, v));
    return ((c - 1) / 4) * 100;
  }
  return clamp((v / ind.target) * 100);
}

function readFamily(indicators, cells) {
  const scores = [];
  let filled = 0;
  for (const ind of indicators) {
    const s = normReading(ind, cells[ind.id]);
    if (s !== null) { scores.push(s); filled++; }
  }
  const applicable = indicators.length;
  return {
    score: aggregate(scores, 'linear', 1), // lecture = moyenne simple
    coverage: applicable > 0 ? filled / applicable : 0,
    filled,
    applicable,
  };
}

// Lectures Maturité + Influence (jamais dans le score global).
export function computeReadings(cells = {}) {
  return {
    maturite: readFamily(MATURITE, cells),
    influence: readFamily(INFLUENCE, cells),
  };
}

// Morceau #1 — sens du chiffre : niveau + verdict + top3/flop3.
export function interpretScore(assessment) {
  const { sector = 'standard', cells = {} } = assessment ?? {};
  const { headline } = computeAssessment(assessment ?? {});
  const level = rosLevel(headline);
  const filled = voieScores(cells, sector).filter(r => r.score !== null);
  const byDesc = [...filled].sort((a, b) => b.score - a.score);
  const pick = rows => rows.slice(0, 3).map(({ code, label, score }) => ({ code, label, score }));
  return { level, verdict: level.verdict ?? '', top3: pick(byDesc), flop3: pick([...byDesc].reverse()) };
}

// Morceau #2 — boussole : voies renseignées triées par écart au max (poids égaux).
export function computeActionPlan(assessment) {
  const { sector = 'standard', cells = {} } = assessment ?? {};
  return voieScores(cells, sector)
    .filter(r => r.score !== null)
    .map(r => ({ code: r.code, label: r.label, dim: r.dim, score: r.score, gap: 100 - r.score }))
    .sort((a, b) => b.gap - a.gap);
}
