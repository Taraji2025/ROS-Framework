// RoS v4 — Source unique de vérité (données seules, aucune logique)

export const DIMENSIONS = ['SI', 'SD', 'SN', 'SO'];
export const RULES = ['linear', 'geometric', 'penalized'];
export const K_VALUES = [1, 2, 3];

// Famille VOIES — 11 indicateurs, produisent le score.
// kind 'cat' : cellule.band ∈ bands[].key. kind 'num' : cellule.value + steps.
//   dir 'lower'  → 1er step (thresholds ascendants) où value < threshold.
//   dir 'higher' → 1er step (thresholds descendants) où value >= threshold.
export const VOIES = [
  { id: 'si1', code: 'SI-1', dim: 'SI', label: 'Contrôle des données critiques', kind: 'cat',
    bands: [
      { key: 'souverain', score: 100, label: 'Souverain qualifié' },
      { key: 'ue', score: 60, label: 'Hébergeur UE hors qualification' },
      { key: 'us-eu', score: 30, label: 'US « région Europe »' },
      { key: 'us', score: 0, label: 'Full US' },
    ] },
  { id: 'si2', code: 'SI-2', dim: 'SI', label: 'Réversibilité cloud', kind: 'cat',
    bands: [
      { key: 'contractuelle', score: 100, label: 'Réversibilité contractuelle + multi-cloud' },
      { key: 'multi', score: 50, label: 'Multi-cloud sans clause' },
      { key: 'mono', score: 0, label: 'Mono-cloud' },
    ] },
  { id: 'si3', code: 'SI-3', dim: 'SI', label: 'Dépendance tech étrangère', kind: 'num', dir: 'lower',
    steps: [ { threshold: 20, score: 100 }, { threshold: 40, score: 60 }, { threshold: 70, score: 30 }, { threshold: Infinity, score: 0 } ] },

  { id: 'sd3', code: 'SD-3', dim: 'SD', label: 'Exposition capitalistique du conseil', kind: 'num', dir: 'lower',
    steps: [ { threshold: 10, score: 100 }, { threshold: 25, score: 70 }, { threshold: 50, score: 30 }, { threshold: Infinity, score: 0 } ] },
  { id: 'sd4', code: 'SD-4', dim: 'SD', label: 'Exposition aux clauses extraterritoriales', kind: 'cat',
    bands: [
      { key: 'aucune', score: 100, label: 'Aucune exposition + CA dollar < 10 %' },
      { key: 'citee', score: 50, label: 'Exposition citée comme risque' },
      { key: 'procedure', score: 10, label: 'Procédure en cours / monitorship' },
    ] },

  { id: 'sn2', code: 'SN-2', dim: 'SN', label: 'Normes subies vs influencées', kind: 'cat',
    bands: [
      { key: 'comites', score: 100, label: 'Présente aux comités des normes clés' },
      { key: 'federation', score: 50, label: 'Présente via fédération seulement' },
      { key: 'absente', score: 0, label: 'Absente partout' },
    ] },
  { id: 'sn5', code: 'SN-5', dim: 'SN', label: 'Sanctions extraterritoriales (% CA, 5 ans)', kind: 'num', dir: 'lower',
    steps: [ { threshold: 0.0001, score: 100 }, { threshold: 0.5, score: 70 }, { threshold: 5, score: 30 }, { threshold: Infinity, score: 0 } ] },

  { id: 'so1', code: 'SO-1', dim: 'SO', label: 'Diversification fournisseurs critiques', kind: 'cat',
    bands: [
      { key: 'diversifie', score: 100, label: 'Aucune dépendance > 30 %' },
      { key: 'concentre', score: 50, label: 'Une dépendance forte citée' },
      { key: 'monosource', score: 0, label: 'Mono-source sur un intrant critique' },
    ] },
  { id: 'so2', code: 'SO-2', dim: 'SO', label: 'Stocks stratégiques (jours de couverture)', kind: 'num', dir: 'higher',
    steps: [ { threshold: 60, score: 100 }, { threshold: 30, score: 60 }, { threshold: 15, score: 30 }, { threshold: 0, score: 0 } ] },
  { id: 'so4', code: 'SO-4', dim: 'SO', label: 'Autonomie énergétique / ressources', kind: 'cat',
    bands: [
      { key: 'documentee', score: 100, label: '> 72 h documenté' },
      { key: 'dispositif', score: 50, label: 'Dispositif cité sans durée' },
      { key: 'rien', score: 0, label: 'Rien' },
    ] },
  { id: 'so5', code: 'SO-5', dim: 'SO', label: 'Dispersion en zone souveraine', kind: 'cat',
    bands: [
      { key: 'disperse-souverain', score: 100, label: '≥ 3 sites indépendants, tous souverains' },
      { key: 'disperse-mixte', score: 60, label: '≥ 3 sites dont certains hors zone' },
      { key: 'concentre', score: 20, label: '1 seul site, même souverain' },
    ] },
];

// Paliers d'interprétation (repris de v3).
export const LEVELS = [
  { max: 30,  label: '⚠ Critique',  color: 'var(--red)',        cls: 'badge-red' },
  { max: 50,  label: '↓ Faible',    color: 'var(--orange)',     cls: 'badge-orange' },
  { max: 65,  label: '~ Moyen',     color: 'var(--gold-light)', cls: 'badge-yellow' },
  { max: 80,  label: '↑ Élevé',     color: 'var(--green)',      cls: 'badge-green' },
  { max: Infinity, label: '★ Souverain', color: 'var(--teal)',  cls: 'badge-teal' },
];

const ALL_VOIE_IDS = VOIES.map(v => v.id);

// Profils : applicabilité seule, poids égaux (D-D).
// Banque et Tech : SO-2 (stocks physiques) et SO-4 (autonomie énergétique) sans objet.
export const PROFILES = {
  standard:  { label: 'Standard',  applicable: ALL_VOIE_IDS },
  banque:    { label: 'Banque',    applicable: ALL_VOIE_IDS.filter(id => !['so2', 'so4'].includes(id)) },
  industrie: { label: 'Industrie', applicable: ALL_VOIE_IDS },
  tech:      { label: 'Tech',      applicable: ALL_VOIE_IDS.filter(id => !['so2', 'so4'].includes(id)) },
  energie:   { label: 'Énergie',   applicable: ALL_VOIE_IDS },
};

// Famille MATURITÉ — 8 indicateurs, lecture « capacité à voir ». Hors score.
export const MATURITE = [
  { id: 'sd2', code: 'SD-2', label: 'Diversification des options stratégiques', kind: 'num', target: 100 },
  { id: 'sd5', code: 'SD-5', label: 'Couverture cartographie des dépendances', kind: 'num', target: 80 },
  { id: 'sn4', code: 'SN-4', label: 'Conformité proactive vs réactive', kind: 'num', target: 70 },
  { id: 'siq1', code: 'SI-Q1', label: 'Maturité classification info', kind: 'qual' },
  { id: 'sdq1', code: 'SD-Q1', label: 'Maturité IE interne', kind: 'qual' },
  { id: 'snq1', code: 'SN-Q1', label: 'Maturité veille réglementaire', kind: 'qual' },
  { id: 'soq1', code: 'SO-Q1', label: 'Maturité PCA (condition de licéité)', kind: 'qual' },
  { id: 'ciq1', code: 'CI-Q1', label: 'Maturité guerre cognitive', kind: 'qual' },
];

// Famille INFLUENCE — 5 indicateurs (doublons SN/CI fusionnés). Lecture « capacité à peser ». Hors score.
export const INFLUENCE = [
  { id: 'inf_sieges', code: 'INF-1', label: 'Sièges en instances (ex SN-1/CI-1)', kind: 'num', target: 50 },
  { id: 'inf_lobbying', code: 'INF-2', label: 'Budget lobbying (ex SN-3/CI-5)', kind: 'num', target: 60 },
  { id: 'ci2', code: 'CI-2', label: 'Part de voix + tonalité', kind: 'num', target: 75 },
  { id: 'ci3', code: 'CI-3', label: 'Capacité de contre-influence', kind: 'num', target: 60 },
  { id: 'ci4', code: 'CI-4', label: 'Réseau d\'alliés activables', kind: 'num', target: 60 },
];
