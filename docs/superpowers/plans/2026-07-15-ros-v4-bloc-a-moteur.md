# RoS v4 — Bloc A : Moteur + Modèle · Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire le cœur déterministe de RoS v4 — une source unique de vérité (`ros-model.js`) et un moteur de calcul pur (`ros-engine.js`) réécrit, entièrement testé, sans aucune surface UI.

**Architecture:** `ros-model.js` = données seules (24 mesures, barèmes, profils/applicabilité, gouvernance, paliers). `ros-engine.js` = fonctions pures consommant le modèle : `scoreCell`, `aggregate` (3 règles non-compensatoires), `computeDimension`, `governanceCoef`, `computeAssessment` (matrice règle×k + lectures Maturité/Influence), `rosLevel`. Agrégation à **deux niveaux non-compensatoires** : voies→dimension puis dimensions→global (poids égaux).

**Tech Stack:** JavaScript ESM, React/Vite (frontend existant), **Vitest** (nouveau, pour les tests unitaires).

## Global Constraints

- Toute la logique de score vit dans `frontend/src/ros-engine.js` — **jamais inline** dans un composant (règle projet CLAUDE.md).
- `ros-model.js` = **données uniquement**, aucune logique de calcul.
- **R-null** : une cellule vide/inapplicable → `null`, jamais `0`. Les `null` sont exclus des agrégations et comptés dans la couverture.
- **Poids égaux** entre dimensions applicables (décision D-D). Pas de table de poids sectoriels.
- Agrégation **non-compensatoire aux deux niveaux** (voies→dim, dim→global).
- Score titre = **pénalisée** `M − k·(S²/M)`, écart-type **population** (÷n), k=1 par défaut ; k∈{1,2,3} calculés.
- Toutes les valeurs de score bornées `[0, 100]`.
- Sortie de `computeAssessment` **recalculable** — pas d'état caché.
- ESM : `import`/`export`, jamais `require` dans le code source.

**Périmètre bloc A :** moteur + modèle + tests. **Pas** de composant React, pas de restitution, pas de saisie (blocs B/C/D, plans ultérieurs).

**Décisions par défaut (amendables) :** Influence = 5 indicateurs fusionnés · Banque sans SO-2/SO-4 · barèmes Maturité/Influence réutilisent la normalisation v3.

---

### Task 0: Installer Vitest

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/__tests__/smoke.test.js`

**Interfaces:**
- Consumes: rien.
- Produces: la commande `npm test` (vitest, run once), disponible pour toutes les tâches suivantes.

- [ ] **Step 1: Installer vitest**

Run: `cd /home/Felfool/ros/frontend && npm install -D vitest@^2`
Expected: ajoute `vitest` aux devDependencies, pas d'erreur.

- [ ] **Step 2: Ajouter le script test**

Modifier `frontend/package.json`, bloc `scripts`, ajouter :

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Écrire un smoke test**

Create `frontend/src/__tests__/smoke.test.js` :

```js
import { describe, it, expect } from 'vitest';

describe('vitest', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Lancer et vérifier le vert**

Run: `cd /home/Felfool/ros/frontend && npm test`
Expected: PASS — 1 test passé.

- [ ] **Step 5: Commit**

```bash
cd /home/Felfool/ros && git add frontend/package.json frontend/package-lock.json frontend/src/__tests__/smoke.test.js && git commit -m "test(ros): setup vitest for v4 engine"
```

---

### Task 1: `ros-model.js` — les VOIES et les PROFILS

**Files:**
- Create: `frontend/src/ros-model.js`
- Test: `frontend/src/__tests__/ros-model.test.js`

**Interfaces:**
- Consumes: rien.
- Produces:
  - `export const DIMENSIONS = ['SI','SD','SN','SO']` (dimensions porteuses de voies ; CI a 0 voie).
  - `export const RULES = ['linear','geometric','penalized']`
  - `export const K_VALUES = [1,2,3]`
  - `export const VOIES` : tableau de 11 objets `{ id, code, dim, label, kind, ...bareme }`.
    - `kind:'cat'` → `bands: [{key, score, label}]`.
    - `kind:'num'` → `dir:'lower'|'higher'`, `steps: [{threshold, score}]` (ascendant pour `lower`, descendant pour `higher`).
    - `profileSteps` optionnel : `{ industrie:[...], energie:[...] }` pour les voies dont le barème dépend du profil (SO-2).
  - `export const PROFILES` : `{ standard:{applicable:[...ids]}, banque:{...}, industrie:{...}, tech:{...}, energie:{...} }`.

- [ ] **Step 1: Écrire le test de structure (échec attendu)**

Create `frontend/src/__tests__/ros-model.test.js` :

```js
import { describe, it, expect } from 'vitest';
import { VOIES, DIMENSIONS, PROFILES, RULES, K_VALUES } from '../ros-model.js';

describe('ros-model VOIES', () => {
  it('has exactly 11 voies', () => {
    expect(VOIES).toHaveLength(11);
  });

  it('dimension repartition is SI3 SD2 SN2 SO4', () => {
    const count = d => VOIES.filter(v => v.dim === d).length;
    expect(count('SI')).toBe(3);
    expect(count('SD')).toBe(2);
    expect(count('SN')).toBe(2);
    expect(count('SO')).toBe(4);
  });

  it('every voie has a valid scoring definition', () => {
    for (const v of VOIES) {
      expect(typeof v.id).toBe('string');
      expect(['cat', 'num']).toContain(v.kind);
      if (v.kind === 'cat') {
        expect(Array.isArray(v.bands)).toBe(true);
        expect(v.bands.length).toBeGreaterThan(1);
        for (const b of v.bands) expect(b.score).toBeGreaterThanOrEqual(0);
      } else {
        expect(['lower', 'higher']).toContain(v.dir);
        expect(Array.isArray(v.steps)).toBe(true);
      }
    }
  });
});

describe('ros-model PROFILES', () => {
  it('has the 5 profiles, each listing applicable voie ids', () => {
    for (const p of ['standard', 'banque', 'industrie', 'tech', 'energie']) {
      expect(PROFILES[p]).toBeDefined();
      expect(Array.isArray(PROFILES[p].applicable)).toBe(true);
    }
  });

  it('tech excludes SO-2 and SO-4; banque excludes them too', () => {
    expect(PROFILES.tech.applicable).not.toContain('so2');
    expect(PROFILES.tech.applicable).not.toContain('so4');
    expect(PROFILES.banque.applicable).not.toContain('so2');
    expect(PROFILES.banque.applicable).not.toContain('so4');
  });

  it('standard applies all 11 voies', () => {
    expect(PROFILES.standard.applicable).toHaveLength(11);
  });

  it('exposes RULES and K_VALUES', () => {
    expect(RULES).toEqual(['linear', 'geometric', 'penalized']);
    expect(K_VALUES).toEqual([1, 2, 3]);
  });
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `cd /home/Felfool/ros/frontend && npm test -- ros-model`
Expected: FAIL — `Cannot find module '../ros-model.js'`.

- [ ] **Step 3: Écrire `ros-model.js`**

Create `frontend/src/ros-model.js` :

```js
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
```

> **Note barème SO-2 :** la grille laisse le palier 15-30 j implicite. Rempli ici de façon monotone (15-30 → 30). À confirmer avec la grille définitive.

- [ ] **Step 4: Lancer, vérifier le vert**

Run: `cd /home/Felfool/ros/frontend && npm test -- ros-model`
Expected: PASS — tous les tests de structure passent.

- [ ] **Step 5: Commit**

```bash
cd /home/Felfool/ros && git add frontend/src/ros-model.js frontend/src/__tests__/ros-model.test.js && git commit -m "feat(ros): ros-model.js — 11 voies + profils (source unique v4)"
```

---

### Task 2: `scoreCell` — barème cellule → 0-100

**Files:**
- Create: `frontend/src/ros-engine.js`
- Test: `frontend/src/__tests__/score-cell.test.js`

**Interfaces:**
- Consumes: `VOIES` de `ros-model.js`.
- Produces: `export function scoreCell(voie, cell)` → `number (0-100)` | `null`.
  - `cell` = `{ value, band, source, date, note }` (tous optionnels).
  - Cellule vide (ni `value` numérique ni `band`) → `null`.
  - `kind:'cat'` : `band` inconnu → `null`.
  - `kind:'num'` : `value` non numérique → `null`.

- [ ] **Step 1: Écrire les tests (échec attendu)**

Create `frontend/src/__tests__/score-cell.test.js` :

```js
import { describe, it, expect } from 'vitest';
import { scoreCell } from '../ros-engine.js';
import { VOIES } from '../ros-model.js';

const voie = id => VOIES.find(v => v.id === id);

describe('scoreCell — categorical', () => {
  it('maps a band key to its score', () => {
    expect(scoreCell(voie('si1'), { band: 'souverain' })).toBe(100);
    expect(scoreCell(voie('si1'), { band: 'us' })).toBe(0);
    expect(scoreCell(voie('so5'), { band: 'concentre' })).toBe(20);
  });
  it('returns null for an unknown or missing band', () => {
    expect(scoreCell(voie('si1'), { band: 'xxx' })).toBeNull();
    expect(scoreCell(voie('si1'), {})).toBeNull();
  });
});

describe('scoreCell — numeric lower-is-better', () => {
  it('si3: <20 -> 100, boundary 20 -> 60, >70 -> 0', () => {
    expect(scoreCell(voie('si3'), { value: 10 })).toBe(100);
    expect(scoreCell(voie('si3'), { value: 20 })).toBe(60); // 20 is NOT < 20
    expect(scoreCell(voie('si3'), { value: 55 })).toBe(30);
    expect(scoreCell(voie('si3'), { value: 90 })).toBe(0);
  });
  it('returns null for non-numeric value', () => {
    expect(scoreCell(voie('si3'), { value: '' })).toBeNull();
    expect(scoreCell(voie('si3'), {})).toBeNull();
  });
});

describe('scoreCell — numeric higher-is-better', () => {
  it('so2: >=60 -> 100, 30-59 -> 60, 15-29 -> 30, <15 -> 0', () => {
    expect(scoreCell(voie('so2'), { value: 90 })).toBe(100);
    expect(scoreCell(voie('so2'), { value: 60 })).toBe(100);
    expect(scoreCell(voie('so2'), { value: 45 })).toBe(60);
    expect(scoreCell(voie('so2'), { value: 20 })).toBe(30);
    expect(scoreCell(voie('so2'), { value: 5 })).toBe(0);
  });
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `cd /home/Felfool/ros/frontend && npm test -- score-cell`
Expected: FAIL — `Cannot find module '../ros-engine.js'`.

- [ ] **Step 3: Écrire `scoreCell` dans `ros-engine.js`**

Create `frontend/src/ros-engine.js` :

```js
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
```

- [ ] **Step 4: Lancer, vérifier le vert**

Run: `cd /home/Felfool/ros/frontend && npm test -- score-cell`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/Felfool/ros && git add frontend/src/ros-engine.js frontend/src/__tests__/score-cell.test.js && git commit -m "feat(ros): scoreCell — bareme cellule -> 0-100"
```

---

### Task 3: `aggregate` — les 3 règles non-compensatoires

**Files:**
- Modify: `frontend/src/ros-engine.js`
- Test: `frontend/src/__tests__/aggregate.test.js`

**Interfaces:**
- Consumes: rien (fonction autonome).
- Produces: `export function aggregate(values, rule, k = 1)` → `number (0-100)` | `null`.
  - `values` : tableau pouvant contenir des `null` (exclus). Tous null / vide → `null`.
  - `rule ∈ {'linear','geometric','penalized'}`.
  - `penalized` = `M − k·(S²/M)`, écart-type population, borné `[0,100]`, `M=0 → 0`.

- [ ] **Step 1: Écrire les tests (échec attendu)**

Create `frontend/src/__tests__/aggregate.test.js` :

```js
import { describe, it, expect } from 'vitest';
import { aggregate } from '../ros-engine.js';

describe('aggregate — null handling', () => {
  it('ignores nulls, returns null when nothing valid', () => {
    expect(aggregate([null, 80, null], 'linear')).toBe(80);
    expect(aggregate([null, null], 'linear')).toBeNull();
    expect(aggregate([], 'penalized')).toBeNull();
  });
});

describe('aggregate — linear', () => {
  it('is the mean', () => {
    expect(aggregate([0, 80, 80, 80], 'linear')).toBe(60);
  });
});

describe('aggregate — geometric (annihilates)', () => {
  it('a single 0 drives the result to 0', () => {
    expect(aggregate([0, 80, 80], 'geometric')).toBe(0);
    expect(aggregate([0, 80, 80, 80], 'geometric')).toBe(0);
  });
  it('geometric mean of positives', () => {
    expect(aggregate([40, 90], 'geometric')).toBeCloseTo(60, 5); // sqrt(3600)
  });
});

describe('aggregate — penalized Mazziotta-Pareto', () => {
  it('[0,80,80,80] k=1 -> 40 (population std)', () => {
    // M=60, var=1200, S^2/M=20, 60-20=40
    expect(aggregate([0, 80, 80, 80], 'penalized', 1)).toBeCloseTo(40, 5);
  });
  it('k scales the penalty: k=2 -> 20, k=3 -> 0', () => {
    expect(aggregate([0, 80, 80, 80], 'penalized', 2)).toBeCloseTo(20, 5);
    expect(aggregate([0, 80, 80, 80], 'penalized', 3)).toBeCloseTo(0, 5);
  });
  it('equal values -> no penalty (mean)', () => {
    expect(aggregate([70, 70, 70], 'penalized', 1)).toBeCloseTo(70, 5);
  });
  it('clamps to [0,100] and handles M=0', () => {
    expect(aggregate([0, 0, 0], 'penalized', 1)).toBe(0);
  });
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `cd /home/Felfool/ros/frontend && npm test -- aggregate`
Expected: FAIL — `aggregate is not a function`.

- [ ] **Step 3: Ajouter `aggregate` à `ros-engine.js`**

Ajouter à `frontend/src/ros-engine.js` :

```js
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
```

- [ ] **Step 4: Lancer, vérifier le vert**

Run: `cd /home/Felfool/ros/frontend && npm test -- aggregate`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/Felfool/ros && git add frontend/src/ros-engine.js frontend/src/__tests__/aggregate.test.js && git commit -m "feat(ros): aggregate — 3 regles non-compensatoires (lin/geom/penalisee)"
```

---

### Task 4: `computeDimension` — applicabilité, score de dimension, couverture

**Files:**
- Modify: `frontend/src/ros-engine.js`
- Test: `frontend/src/__tests__/compute-dimension.test.js`

**Interfaces:**
- Consumes: `scoreCell`, `aggregate`, `VOIES`, `PROFILES`.
- Produces: `export function computeDimension(dim, cells, profile, rule, k)` →
  `{ score: number|null, coverage: number, applicable: number, filled: number }`.
  - Filtre les voies de `dim` applicables au `profile`.
  - `coverage` = `filled / applicable` (0 si applicable=0).
  - `score` = `aggregate` des scores de voies renseignées.

- [ ] **Step 1: Écrire les tests (échec attendu)**

Create `frontend/src/__tests__/compute-dimension.test.js` :

```js
import { describe, it, expect } from 'vitest';
import { computeDimension } from '../ros-engine.js';

describe('computeDimension', () => {
  it('SI with one voie at 0 (penalized) drops the dimension below the mean', () => {
    // SI = si1, si2, si3 ; scores 0, 80, 80 (si1=us->0, si2=multi->50? use bands)
    const cells = { si1: { band: 'us' }, si2: { band: 'contractuelle' }, si3: { value: 10 } };
    // si1=0, si2=100, si3=100 -> mean 66.67 ; penalized < mean
    const r = computeDimension('SI', cells, 'standard', 'penalized', 1);
    expect(r.applicable).toBe(3);
    expect(r.filled).toBe(3);
    expect(r.coverage).toBeCloseTo(1, 5);
    expect(r.score).toBeLessThan(66.67);
    expect(r.score).toBeGreaterThan(0);
  });

  it('counts coverage from filled/applicable', () => {
    const cells = { si1: { band: 'souverain' } }; // 1 of 3 filled
    const r = computeDimension('SI', cells, 'standard', 'linear', 1);
    expect(r.applicable).toBe(3);
    expect(r.filled).toBe(1);
    expect(r.coverage).toBeCloseTo(1 / 3, 5);
    expect(r.score).toBe(100); // only si1 valid
  });

  it('excludes inapplicable voies (banque has no so2/so4)', () => {
    const r = computeDimension('SO', {}, 'banque', 'linear', 1);
    expect(r.applicable).toBe(2); // so1, so5 only
    expect(r.filled).toBe(0);
    expect(r.score).toBeNull();
  });
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `cd /home/Felfool/ros/frontend && npm test -- compute-dimension`
Expected: FAIL — `computeDimension is not a function`.

- [ ] **Step 3: Ajouter `computeDimension`**

Ajouter à `frontend/src/ros-engine.js` :

```js
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
```

- [ ] **Step 4: Lancer, vérifier le vert**

Run: `cd /home/Felfool/ros/frontend && npm test -- compute-dimension`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/Felfool/ros && git add frontend/src/ros-engine.js frontend/src/__tests__/compute-dimension.test.js && git commit -m "feat(ros): computeDimension — applicabilite + score + couverture"
```

---

### Task 5: `governanceCoef` + score global (poids égaux, 2e niveau)

**Files:**
- Modify: `frontend/src/ros-engine.js`
- Test: `frontend/src/__tests__/global-score.test.js`

**Interfaces:**
- Consumes: `computeDimension`, `aggregate`, `DIMENSIONS`.
- Produces:
  - `export function governanceCoef(g)` → `number ∈ {1.0,0.9,0.8,0.7}`.
    `g = { croReporting, vetoFormalized, vetoExercised }` (booléens). `1 − 0.1×absents`, plancher `0.7`.
  - `export function computeGlobal(cells, profile, governance, rule, k)` →
    `{ raw: number|null, final: number|null, coef: number, dims: {SI,SD,SN,SO} }`.
    `raw` = agrégation (poids égaux) des scores de dimension non-null ; `final = raw × coef`.

- [ ] **Step 1: Écrire les tests (échec attendu)**

Create `frontend/src/__tests__/global-score.test.js` :

```js
import { describe, it, expect } from 'vitest';
import { governanceCoef, computeGlobal } from '../ros-engine.js';

describe('governanceCoef', () => {
  it('all present -> 1.0', () => {
    expect(governanceCoef({ croReporting: true, vetoFormalized: true, vetoExercised: true })).toBe(1.0);
  });
  it('one absent -> 0.9, two -> 0.8, three -> 0.7 floor', () => {
    expect(governanceCoef({ croReporting: true, vetoFormalized: true, vetoExercised: false })).toBeCloseTo(0.9, 5);
    expect(governanceCoef({ croReporting: true, vetoFormalized: false, vetoExercised: false })).toBeCloseTo(0.8, 5);
    expect(governanceCoef({ croReporting: false, vetoFormalized: false, vetoExercised: false })).toBeCloseTo(0.7, 5);
  });
});

describe('computeGlobal — equal weights + governance multiplier', () => {
  it('applies the governance coefficient to the raw score', () => {
    // All dims present and equal -> raw ~ that value ; coef 0.9 -> final = raw*0.9
    const cells = {
      si1: { band: 'souverain' }, si2: { band: 'contractuelle' }, si3: { value: 10 },
      sd3: { value: 5 }, sd4: { band: 'aucune' },
      sn2: { band: 'comites' }, sn5: { value: 0 },
      so1: { band: 'diversifie' }, so2: { value: 90 }, so4: { band: 'documentee' }, so5: { band: 'disperse-souverain' },
    };
    const gov = { croReporting: true, vetoFormalized: true, vetoExercised: false }; // 0.9
    const r = computeGlobal(cells, 'standard', gov, 'penalized', 1);
    expect(r.coef).toBeCloseTo(0.9, 5);
    expect(r.raw).toBeGreaterThan(90); // all voies near 100
    expect(r.final).toBeCloseTo(r.raw * 0.9, 5);
    expect(r.dims.SI.score).not.toBeNull();
  });

  it('returns null raw/final when no dimension has data', () => {
    const r = computeGlobal({}, 'standard', {}, 'linear', 1);
    expect(r.raw).toBeNull();
    expect(r.final).toBeNull();
  });
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `cd /home/Felfool/ros/frontend && npm test -- global-score`
Expected: FAIL — `governanceCoef is not a function`.

- [ ] **Step 3: Ajouter `governanceCoef` et `computeGlobal`**

Ajouter à `frontend/src/ros-engine.js` :

```js
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
```

- [ ] **Step 4: Lancer, vérifier le vert**

Run: `cd /home/Felfool/ros/frontend && npm test -- global-score`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/Felfool/ros && git add frontend/src/ros-engine.js frontend/src/__tests__/global-score.test.js && git commit -m "feat(ros): governanceCoef + computeGlobal (poids egaux + coef gouvernance)"
```

---

### Task 6: `rosLevel` + `computeAssessment` (matrice règle×k)

**Files:**
- Modify: `frontend/src/ros-engine.js`
- Modify: `frontend/src/ros-model.js` (ajout `LEVELS`)
- Test: `frontend/src/__tests__/compute-assessment.test.js`

**Interfaces:**
- Consumes: `computeGlobal`, `RULES`, `K_VALUES`, `LEVELS`.
- Produces:
  - `export const LEVELS` dans `ros-model.js` (5 paliers, repris de v3).
  - `export function rosLevel(v)` → `{ label, color, cls }`.
  - `export function computeAssessment(assessment)` →
    ```
    {
      headline: number|null,          // penalized, k=1, final (× gouvernance)
      level: {label,color,cls},
      coef: number,
      matrix: { [rule]: { [k]: { raw, final, dims } } },   // 3×3
      coverageByDim: { SI, SD, SN, SO },                   // 0-1
    }
    ```
    `assessment = { sector, governance, cells }`.

- [ ] **Step 1: Écrire les tests (échec attendu)**

Create `frontend/src/__tests__/compute-assessment.test.js` :

```js
import { describe, it, expect } from 'vitest';
import { computeAssessment, rosLevel } from '../ros-engine.js';

const FULL = {
  sector: 'standard',
  governance: { croReporting: true, vetoFormalized: true, vetoExercised: true },
  cells: {
    si1: { band: 'souverain' }, si2: { band: 'contractuelle' }, si3: { value: 10 },
    sd3: { value: 5 }, sd4: { band: 'aucune' },
    sn2: { band: 'comites' }, sn5: { value: 0 },
    so1: { band: 'diversifie' }, so2: { value: 90 }, so4: { band: 'documentee' }, so5: { band: 'disperse-souverain' },
  },
};

describe('rosLevel', () => {
  it('bands the score', () => {
    expect(rosLevel(20).label).toMatch(/Critique/);
    expect(rosLevel(90).label).toMatch(/Souverain/);
    expect(rosLevel(null).label).toMatch(/Aucune/);
  });
});

describe('computeAssessment', () => {
  it('headline is penalized k=1 final and is high for a strong profile', () => {
    const r = computeAssessment(FULL);
    expect(r.headline).toBeCloseTo(r.matrix.penalized[1].final, 5);
    expect(r.headline).toBeGreaterThan(90);
    expect(r.coef).toBe(1.0);
  });

  it('produces a full 3x3 rule×k matrix', () => {
    const r = computeAssessment(FULL);
    for (const rule of ['linear', 'geometric', 'penalized']) {
      for (const k of [1, 2, 3]) {
        expect(typeof r.matrix[rule][k].final).toBe('number');
      }
    }
  });

  it('a single open voie collapses the geometric score to 0', () => {
    const holed = { ...FULL, cells: { ...FULL.cells, si1: { band: 'us' } } }; // si1 -> 0
    const r = computeAssessment(holed);
    expect(r.matrix.geometric[1].final).toBe(0);      // annihilation
    expect(r.matrix.penalized[1].final).toBeGreaterThan(0); // degrade par degres
    expect(r.matrix.penalized[1].final).toBeLessThan(r.headline + 1);
  });

  it('reports coverage per dimension', () => {
    const partial = { ...FULL, cells: { si1: { band: 'souverain' } } };
    const r = computeAssessment(partial);
    expect(r.coverageByDim.SI).toBeCloseTo(1 / 3, 5);
    expect(r.coverageByDim.SD).toBe(0);
  });
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `cd /home/Felfool/ros/frontend && npm test -- compute-assessment`
Expected: FAIL — `computeAssessment is not a function`.

- [ ] **Step 3: Ajouter `LEVELS` au modèle**

Ajouter à `frontend/src/ros-model.js` :

```js
// Paliers d'interprétation (repris de v3).
export const LEVELS = [
  { max: 30,  label: '⚠ Critique',  color: 'var(--red)',        cls: 'badge-red' },
  { max: 50,  label: '↓ Faible',    color: 'var(--orange)',     cls: 'badge-orange' },
  { max: 65,  label: '~ Moyen',     color: 'var(--gold-light)', cls: 'badge-yellow' },
  { max: 80,  label: '↑ Élevé',     color: 'var(--green)',      cls: 'badge-green' },
  { max: Infinity, label: '★ Souverain', color: 'var(--teal)',  cls: 'badge-teal' },
];
```

- [ ] **Step 4: Ajouter `rosLevel` et `computeAssessment`**

Ajouter à `frontend/src/ros-engine.js` (mettre à jour l'import pour inclure `LEVELS`) :

```js
// (import mis à jour)
// import { VOIES, PROFILES, DIMENSIONS, RULES, K_VALUES, LEVELS } from './ros-model.js';

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
```

- [ ] **Step 5: Lancer, vérifier le vert**

Run: `cd /home/Felfool/ros/frontend && npm test -- compute-assessment`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd /home/Felfool/ros && git add frontend/src/ros-engine.js frontend/src/ros-model.js frontend/src/__tests__/compute-assessment.test.js && git commit -m "feat(ros): computeAssessment — matrice regle×k + rosLevel + couverture"
```

---

### Task 7: Familles Maturité & Influence (lectures séparées)

**Files:**
- Modify: `frontend/src/ros-model.js` (ajout `MATURITE`, `INFLUENCE`)
- Modify: `frontend/src/ros-engine.js` (ajout `computeReadings`)
- Test: `frontend/src/__tests__/readings.test.js`

**Interfaces:**
- Consumes: `MATURITE`, `INFLUENCE` (métadonnées + normalisation v3).
- Produces:
  - `export const MATURITE` (8 indicateurs) et `export const INFLUENCE` (5 indicateurs fusionnés) dans `ros-model.js`. Chaque indicateur : `{ id, code, label, kind:'num'|'qual', target? }`.
  - `export function computeReadings(cells)` →
    `{ maturite: {score, coverage, filled, applicable}, influence: {...} }`.
    Moyenne simple des indicateurs renseignés ; `qual` normalisé 1-5 → 0-100 ; `num` via `value/target×100` borné.
    **Jamais** dans le score global.

- [ ] **Step 1: Écrire les tests (échec attendu)**

Create `frontend/src/__tests__/readings.test.js` :

```js
import { describe, it, expect } from 'vitest';
import { computeReadings } from '../ros-engine.js';
import { MATURITE, INFLUENCE } from '../ros-model.js';

describe('reading families model', () => {
  it('maturite has 8, influence has 5 (doublons fusionnes)', () => {
    expect(MATURITE).toHaveLength(8);
    expect(INFLUENCE).toHaveLength(5);
  });
});

describe('computeReadings', () => {
  it('averages qualitative (1-5 -> 0-100) and numeric readings', () => {
    // one qual at 5 -> 100, one qual at 3 -> 50 : mean 75
    const q = MATURITE.filter(i => i.kind === 'qual').slice(0, 2);
    const cells = { [q[0].id]: { value: 5 }, [q[1].id]: { value: 3 } };
    const r = computeReadings(cells);
    expect(r.maturite.filled).toBe(2);
    expect(r.maturite.score).toBeCloseTo(75, 5);
  });

  it('empty -> null score, 0 coverage', () => {
    const r = computeReadings({});
    expect(r.maturite.score).toBeNull();
    expect(r.maturite.coverage).toBe(0);
    expect(r.influence.score).toBeNull();
  });
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `cd /home/Felfool/ros/frontend && npm test -- readings`
Expected: FAIL — `Cannot find ... MATURITE` / `computeReadings is not a function`.

- [ ] **Step 3: Ajouter `MATURITE` et `INFLUENCE` au modèle**

Ajouter à `frontend/src/ros-model.js` :

```js
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
```

- [ ] **Step 4: Ajouter `computeReadings` au moteur**

Ajouter à `frontend/src/ros-engine.js` (mettre à jour l'import pour inclure `MATURITE, INFLUENCE`) :

```js
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
```

- [ ] **Step 5: Lancer, vérifier le vert**

Run: `cd /home/Felfool/ros/frontend && npm test -- readings`
Expected: PASS.

- [ ] **Step 6: Lancer TOUTE la suite (non-régression)**

Run: `cd /home/Felfool/ros/frontend && npm test`
Expected: PASS — tous les fichiers de test verts.

- [ ] **Step 7: Commit**

```bash
cd /home/Felfool/ros && git add frontend/src/ros-engine.js frontend/src/ros-model.js frontend/src/__tests__/readings.test.js && git commit -m "feat(ros): familles Maturite + Influence (lectures separees, hors score)"
```

---

## Fin du bloc A

À l'issue : `ros-model.js` + `ros-engine.js` complets, testés, purs. Contrat public stabilisé pour le bloc B (saisie) :
`scoreCell`, `aggregate`, `computeDimension`, `governanceCoef`, `computeGlobal`, `computeAssessment`, `computeReadings`, `rosLevel` + les données `VOIES, MATURITE, INFLUENCE, PROFILES, DIMENSIONS, RULES, K_VALUES, LEVELS`.

**Prochains plans :** Bloc B (Assessment.jsx), Bloc C (Dashboard/History/Guide), Bloc D (PDF + annexes de sensibilité). Chacun rédigé une fois les interfaces du bloc précédent stabilisées.

---

## Self-review (couverture spec ↔ plan)

- ✅ 3 familles jamais additionnées → VOIES scorent (T1-6), MATURITE/INFLUENCE en lecture séparée (T7).
- ✅ Agrégation 2 niveaux non-compensatoire → `computeDimension` (T4) + `computeGlobal` (T5), testé qu'une voie à 0 plombe (T4, T6 geometric→0).
- ✅ 3 règles + k∈{1,2,3} → `aggregate` (T3) + matrice (T6).
- ✅ Score titre pénalisée k=1 → `computeAssessment.headline` (T6).
- ✅ Profils applicabilité + poids égaux → `PROFILES` (T1) + `computeGlobal` poids égaux (T5).
- ✅ Coef gouvernance 0.7-1.0 → `governanceCoef` (T5).
- ✅ Couverture par dimension → `computeDimension.coverage` (T4), `coverageByDim` (T6).
- ✅ R-null → filtrage null partout, testé (T3, T4).
- ✅ Barèmes voies → `scoreCell` (T2), tous les paliers dans le modèle (T1).
- ✅ Source unique de vérité → `ros-model.js` (T1, T6, T7).
- ⚠️ Traçabilité {source,date,note} : le modèle de cellule les accepte (ignorés au calcul, consommés par le bloc B). Pas de logique moteur → hors bloc A, OK.
- ⚠️ Mode interne/OSINT : n'affecte pas le calcul (moteur identique) → traité au bloc B (étiquetage/couverture attendue). Hors bloc A, OK.
- Points ouverts spec (§9) : Influence=5, Banque sans SO-2/SO-4, barèmes Maturité/Influence v3, palier SO-2 15-30 — tous encodés comme défauts amendables, notés dans le plan.
