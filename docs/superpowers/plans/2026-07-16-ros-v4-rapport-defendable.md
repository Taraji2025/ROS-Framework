# ROS V4 — Rapport de souveraineté défendable — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre la branche `v4-refonte` de nouveau *buildable* et livrer le rapport de souveraineté défendable (5 morceaux) en un seul bloc.

**Architecture:** Le moteur V4 pur (`ros-model.js` + `ros-engine.js`) existe et est vert (36 tests). Ce plan lui ajoute 4 fonctions pures (`voieScores`, `interpretScore`, `computeActionPlan`, `computeCompleteness`) + un champ `verdict` par palier, restaure 2 exports de compatibilité (`fmt`, `SECTORS`), persiste les nouvelles données côté backend, réécrit la saisie `Assessment.jsx` en V4 (cellules cat/num + preuve), répare/nettoie les pages d'affichage et ajoute une page `/rapport` imprimable.

**Tech Stack:** React 18 + Vite (frontend), Express (backend, stockage JSON), Vitest (tests), react-chartjs-2 (radar), CSS `@media print` + `window.print()` (PDF, zéro dépendance serveur).

## Global Constraints

- **Mono-entreprise** — ne jamais réintroduire de gestion multi-clients (confidentialité). Verbatim spec §8.
- **Déterministe** — aucun appel IA ; tout est calcul + frontend. Verbatim spec §8.
- **Toute logique de score dans `ros-engine.js`**, jamais inline dans un composant. Verbatim CLAUDE.md.
- **Ne jamais toucher `backend/data/storage.json` à la main.** Verbatim CLAUDE.md.
- **Les 36 tests Vitest existants restent verts** (contrat moteur figé) — non-régression obligatoire.
- **Rebuild frontend obligatoire** avant toute annonce de fin ; critère de sortie = `npm run build` vert **et** Vitest vert.
- **Ne pas déployer / merger** sans validation explicite de Naouphel.
- Répertoire frontend : `/home/Felfool/ros/frontend`. Tests : `frontend/src/__tests__/`. Commande test : `cd frontend && npx vitest run`. Build : `cd frontend && npm run build`.

## File Structure

**Modifiés :**
- `frontend/src/ros-model.js` — ajoute `verdict` sur les 5 `LEVELS` ; seed `source`/`justification` optionnels sur quelques indicateurs.
- `frontend/src/ros-engine.js` — ajoute `voieScores`, `interpretScore`, `computeActionPlan`, `computeCompleteness`, `fmt`, `SECTORS`.
- `backend/server.js:155-166` — persiste `cells`, `readings`, `governance`.
- `frontend/src/pages/Assessment.jsx` — réécriture V4 complète.
- `frontend/src/pages/Dashboard.jsx`, `frontend/src/pages/History.jsx` — 4 dimensions (drop CI).
- `frontend/src/pages/Admin.jsx` — `SECTORS` depuis les profils V4.
- `frontend/src/App.jsx` — onglet + route `/rapport`.
- `frontend/src/index.css` — bloc `@media print`.

**Créés :**
- `frontend/src/pages/Report.jsx` — page rapport imprimable.
- Tests : `frontend/src/__tests__/voie-scores.test.js`, `interpret-score.test.js`, `action-plan.test.js`, `completeness.test.js`.

**Supprimé :**
- `frontend/src/pages/Companies.jsx` — code mort (non importé dans `App.jsx`, vestige multi-entreprise).

---

### Task 1: `voieScores(cells, profile)` — sous-scores par Voie

Fonction pure intermédiaire : `computeAssessment` n'expose pas les scores par Voie, or `interpretScore` et `computeActionPlan` en ont besoin.

**Files:**
- Modify: `frontend/src/ros-engine.js` (ajout d'un export)
- Test: `frontend/src/__tests__/voie-scores.test.js` (créer)

**Interfaces:**
- Consumes: `VOIES`, `PROFILES` (déjà importés dans `ros-engine.js`), `scoreCell` (déjà défini).
- Produces: `voieScores(cells, profile) → Array<{ id, code, label, dim, score }>` — une entrée par Voie **applicable** au profil, dans l'ordre de `VOIES` ; `score` est un nombre 0-100 ou `null` si la cellule est vide.

- [ ] **Step 1: Write the failing test**

```javascript
// frontend/src/__tests__/voie-scores.test.js
import { describe, it, expect } from 'vitest';
import { voieScores } from '../ros-engine.js';

describe('voieScores', () => {
  it('retourne une entrée par voie applicable, avec score et métadonnées', () => {
    const cells = { si1: { band: 'souverain' }, si3: { value: '10' } };
    const rows = voieScores(cells, 'standard');
    expect(rows.length).toBe(11); // profil standard = 11 voies
    const si1 = rows.find(r => r.id === 'si1');
    expect(si1).toMatchObject({ code: 'SI-1', dim: 'SI', score: 100 });
    expect(si1.label).toBeTypeOf('string');
  });

  it('score null pour une voie non renseignée', () => {
    const rows = voieScores({}, 'standard');
    expect(rows.every(r => r.score === null)).toBe(true);
  });

  it('exclut les voies non applicables au profil (banque: pas so2/so4)', () => {
    const ids = voieScores({}, 'banque').map(r => r.id);
    expect(ids).not.toContain('so2');
    expect(ids).not.toContain('so4');
    expect(ids.length).toBe(9);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/__tests__/voie-scores.test.js`
Expected: FAIL — `voieScores is not a function`.

- [ ] **Step 3: Write minimal implementation**

Ajouter dans `frontend/src/ros-engine.js` (après `scoreCell`) :

```javascript
// Sous-scores par Voie applicable (ordre VOIES). score = 0-100 | null.
export function voieScores(cells = {}, profile = 'standard') {
  const applicableIds = new Set(PROFILES[profile]?.applicable ?? []);
  return VOIES
    .filter(v => applicableIds.has(v.id))
    .map(v => ({ id: v.id, code: v.code, label: v.label, dim: v.dim, score: scoreCell(v, cells[v.id]) }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/__tests__/voie-scores.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ros-engine.js frontend/src/__tests__/voie-scores.test.js
git commit -m "feat(ros): voieScores — sous-scores par voie applicable"
```

---

### Task 2: `verdict` par palier + `interpretScore(assessment)` — Morceau #1

**Files:**
- Modify: `frontend/src/ros-model.js` (LEVELS)
- Modify: `frontend/src/ros-engine.js` (nouvel export)
- Test: `frontend/src/__tests__/interpret-score.test.js` (créer)

**Interfaces:**
- Consumes: `voieScores` (Task 1), `computeAssessment` (existant, renvoie `{ headline, level, ... }`), `rosLevel` (existant, renvoie une entrée `LEVELS`).
- Produces: `interpretScore(assessment) → { level, verdict, top3, flop3 }` où `assessment = { sector, governance, cells }` ; `level` = entrée `LEVELS` ; `verdict` = `level.verdict` (string) ; `top3`/`flop3` = `Array<{ code, label, score }>` (jusqu'à 3, uniquement voies renseignées), top = scores décroissants, flop = croissants.

- [ ] **Step 1: Write the failing test**

```javascript
// frontend/src/__tests__/interpret-score.test.js
import { describe, it, expect } from 'vitest';
import { interpretScore } from '../ros-engine.js';
import { LEVELS } from '../ros-model.js';

describe('LEVELS.verdict', () => {
  it('chaque palier porte une phrase de verdict non vide', () => {
    expect(LEVELS.every(l => typeof l.verdict === 'string' && l.verdict.length > 0)).toBe(true);
  });
});

describe('interpretScore', () => {
  const cells = {
    si1: { band: 'souverain' },  // 100
    si2: { band: 'mono' },       // 0
    si3: { value: '10' },        // 100
    sn2: { band: 'absente' },    // 0
  };
  it('renvoie le verdict du palier du headline', () => {
    const r = interpretScore({ sector: 'standard', governance: {}, cells });
    expect(r.verdict).toBe(r.level.verdict);
    expect(typeof r.verdict).toBe('string');
  });
  it('top3 = meilleures voies, flop3 = pires (voies renseignées seulement)', () => {
    const r = interpretScore({ sector: 'standard', governance: {}, cells });
    expect(r.top3[0].score).toBe(100);
    expect(r.flop3[0].score).toBe(0);
    expect(r.top3.length).toBeLessThanOrEqual(3);
    expect(r.flop3.length).toBeLessThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/__tests__/interpret-score.test.js`
Expected: FAIL — `verdict` undefined / `interpretScore is not a function`.

- [ ] **Step 3a: Add `verdict` to LEVELS**

Remplacer le bloc `LEVELS` dans `frontend/src/ros-model.js` par (ajoute la clé `verdict`, garde `map(Object.freeze)`) :

```javascript
export const LEVELS = [
  { max: 30,  label: '⚠ Critique',  color: 'var(--red)',        cls: 'badge-red',
    verdict: 'Souveraineté critique : dépendances majeures non maîtrisées, exposition directe à des leviers externes.' },
  { max: 50,  label: '↓ Faible',    color: 'var(--orange)',     cls: 'badge-orange',
    verdict: 'Souveraineté faible : plusieurs angles morts structurels, marge de manœuvre réduite face aux pressions extérieures.' },
  { max: 65,  label: '~ Moyen',     color: 'var(--gold-light)', cls: 'badge-yellow',
    verdict: 'Souveraineté moyenne : socle partiel, des dépendances subsistent sur des fonctions sensibles.' },
  { max: 80,  label: '↑ Élevé',     color: 'var(--green)',      cls: 'badge-green',
    verdict: 'Souveraineté élevée : maîtrise solide, quelques leviers restent à sécuriser.' },
  { max: Infinity, label: '★ Souverain', color: 'var(--teal)',  cls: 'badge-teal',
    verdict: "Souveraineté maîtrisée : l'entreprise contrôle ses dépendances critiques et pèse sur son environnement." },
].map(Object.freeze);
```

- [ ] **Step 3b: Add `interpretScore`**

Ajouter dans `frontend/src/ros-engine.js` :

```javascript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/__tests__/interpret-score.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ros-model.js frontend/src/ros-engine.js frontend/src/__tests__/interpret-score.test.js
git commit -m "feat(ros): interpretScore + verdict par palier (morceau #1)"
```

---

### Task 3: `computeActionPlan(assessment)` — Morceau #2

**Files:**
- Modify: `frontend/src/ros-engine.js`
- Test: `frontend/src/__tests__/action-plan.test.js` (créer)

**Interfaces:**
- Consumes: `voieScores` (Task 1).
- Produces: `computeActionPlan(assessment) → Array<{ code, label, dim, score, gap }>` — voies **renseignées** applicables, triées par `gap = 100 - score` décroissant ; départage stable par ordre de `VOIES` (tri stable JS). Poids égaux (pas de pondération).

- [ ] **Step 1: Write the failing test**

```javascript
// frontend/src/__tests__/action-plan.test.js
import { describe, it, expect } from 'vitest';
import { computeActionPlan } from '../ros-engine.js';

describe('computeActionPlan', () => {
  const cells = {
    si1: { band: 'souverain' }, // 100 -> gap 0
    si2: { band: 'mono' },      // 0   -> gap 100
    si3: { value: '30' },       // 60  -> gap 40
  };
  it('trie par écart au max décroissant', () => {
    const plan = computeActionPlan({ sector: 'standard', cells });
    expect(plan.map(p => p.code)).toEqual(['SI-2', 'SI-3', 'SI-1']);
    expect(plan[0].gap).toBe(100);
  });
  it('ignore les voies non renseignées', () => {
    const plan = computeActionPlan({ sector: 'standard', cells });
    expect(plan.length).toBe(3);
    expect(plan.every(p => Number.isFinite(p.score))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/__tests__/action-plan.test.js`
Expected: FAIL — `computeActionPlan is not a function`.

- [ ] **Step 3: Write minimal implementation**

```javascript
// Morceau #2 — boussole : voies renseignées triées par écart au max (poids égaux).
export function computeActionPlan(assessment) {
  const { sector = 'standard', cells = {} } = assessment ?? {};
  return voieScores(cells, sector)
    .filter(r => r.score !== null)
    .map(r => ({ code: r.code, label: r.label, dim: r.dim, score: r.score, gap: 100 - r.score }))
    .sort((a, b) => b.gap - a.gap);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/__tests__/action-plan.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ros-engine.js frontend/src/__tests__/action-plan.test.js
git commit -m "feat(ros): computeActionPlan — boussole par écart au max (morceau #2)"
```

---

### Task 4: `computeCompleteness(cells, profile)` — Morceau #4

**Files:**
- Modify: `frontend/src/ros-engine.js`
- Test: `frontend/src/__tests__/completeness.test.js` (créer)

**Interfaces:**
- Consumes: `voieScores` (Task 1).
- Produces: `computeCompleteness(cells, profile) → { filled, required, isPublishable, tauxSourcage }` — `required` = nb voies applicables ; `filled` = voies applicables renseignées (score non null) ; `isPublishable = filled === required` ; `tauxSourcage` = part des voies renseignées ayant `cells[id].source` non vide (0 si `filled === 0`).

- [ ] **Step 1: Write the failing test**

```javascript
// frontend/src/__tests__/completeness.test.js
import { describe, it, expect } from 'vitest';
import { computeCompleteness } from '../ros-engine.js';

describe('computeCompleteness', () => {
  it('non publiable tant que toutes les voies applicables ne sont pas remplies', () => {
    const c = computeCompleteness({ si1: { band: 'souverain' } }, 'standard');
    expect(c.required).toBe(11);
    expect(c.filled).toBe(1);
    expect(c.isPublishable).toBe(false);
  });
  it('publiable quand les 9 voies applicables (banque) sont remplies', () => {
    const cells = {
      si1: { band: 'ue' }, si2: { band: 'mono' }, si3: { value: '5' },
      sd3: { value: '5' }, sd4: { band: 'aucune' }, sn2: { band: 'comites' },
      sn5: { value: '0' }, so1: { band: 'diversifie' }, so5: { band: 'concentre' },
    };
    const c = computeCompleteness(cells, 'banque');
    expect(c.required).toBe(9);
    expect(c.filled).toBe(9);
    expect(c.isPublishable).toBe(true);
  });
  it('taux de sourçage = part des cellules remplies avec source', () => {
    const cells = { si1: { band: 'ue', source: 'DPA 2025' }, si2: { band: 'mono' } };
    const c = computeCompleteness(cells, 'standard');
    expect(c.filled).toBe(2);
    expect(c.tauxSourcage).toBeCloseTo(0.5);
  });
  it('taux de sourçage 0 si rien de rempli', () => {
    expect(computeCompleteness({}, 'standard').tauxSourcage).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/__tests__/completeness.test.js`
Expected: FAIL — `computeCompleteness is not a function`.

- [ ] **Step 3: Write minimal implementation**

```javascript
// Morceau #4 — complétude : gate "publiable" (toutes voies applicables) + taux de sourçage.
export function computeCompleteness(cells = {}, profile = 'standard') {
  const rows = voieScores(cells, profile);
  const required = rows.length;
  const filledRows = rows.filter(r => r.score !== null);
  const filled = filledRows.length;
  const sourced = filledRows.filter(r => {
    const s = cells[r.id]?.source;
    return typeof s === 'string' && s.trim() !== '';
  }).length;
  return {
    filled,
    required,
    isPublishable: required > 0 && filled === required,
    tauxSourcage: filled > 0 ? sourced / filled : 0,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/__tests__/completeness.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ros-engine.js frontend/src/__tests__/completeness.test.js
git commit -m "feat(ros): computeCompleteness — gate publiable + taux de sourçage (morceau #4)"
```

---

### Task 5: Exports de compatibilité (`fmt`, `SECTORS`) + seed traçabilité

Restaure les 2 exports que les pages d'affichage importent encore, et amorce la métadonnée de traçabilité (morceau #3, mécanisme) sur quelques Voies.

**Files:**
- Modify: `frontend/src/ros-engine.js` (ajout `fmt`, `SECTORS`)
- Modify: `frontend/src/ros-model.js` (seed `source`/`justification` sur 3 voies)
- Test: `frontend/src/__tests__/compat-exports.test.js` (créer)

**Interfaces:**
- Consumes: `PROFILES` (déjà importé dans `ros-engine.js`).
- Produces: `fmt(v) → string` (arrondi ou `'—'`) ; `SECTORS → string[]` (clés de `PROFILES`, ordre d'insertion). Champs optionnels `source?`/`justification?` sur les entrées de `VOIES`.

- [ ] **Step 1: Write the failing test**

```javascript
// frontend/src/__tests__/compat-exports.test.js
import { describe, it, expect } from 'vitest';
import { fmt, SECTORS } from '../ros-engine.js';
import { VOIES } from '../ros-model.js';

describe('compat exports', () => {
  it('fmt arrondit ou rend un tiret', () => {
    expect(fmt(42.6)).toBe(43);
    expect(fmt(null)).toBe('—');
    expect(fmt(undefined)).toBe('—');
  });
  it('SECTORS liste les profils', () => {
    expect(SECTORS).toEqual(['standard', 'banque', 'industrie', 'tech', 'energie']);
  });
  it('la justification est optionnelle et documentée sur si1', () => {
    const si1 = VOIES.find(v => v.id === 'si1');
    expect(typeof si1.justification).toBe('string');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/__tests__/compat-exports.test.js`
Expected: FAIL — `fmt`/`SECTORS` non exportés, `si1.justification` undefined.

- [ ] **Step 3a: Add `fmt` + `SECTORS` to ros-engine.js**

Ajouter à la fin de `frontend/src/ros-engine.js` :

```javascript
// Helpers d'affichage (compat pages v3 — présentation, pas de logique de score).
export function fmt(v) {
  return v !== null && v !== undefined ? Math.round(v) : '—';
}
export const SECTORS = Object.keys(PROFILES);
```

- [ ] **Step 3b: Seed `source`/`justification` sur 3 Voies (mécanisme morceau #3)**

Dans `frontend/src/ros-model.js`, ajouter `justification` (et `source` si connu) aux entrées `si1`, `si3`, `sn5` — exemples réels ; les autres restent sans (affichées « non documenté »). Exemple pour `si1` :

```javascript
  { id: 'si1', code: 'SI-1', dim: 'SI', label: 'Contrôle des données critiques', kind: 'cat',
    justification: 'Le palier « souverain qualifié » exige une qualification SecNumCloud : seule garantie contre l\'extraterritorialité (CLOUD Act). L\'hébergement UE sans qualification (60) reste exposé via maisons-mères US.',
    source: 'ANSSI SecNumCloud v3.2 ; CLOUD Act (2018)',
    bands: [
      { key: 'souverain', score: 100, label: 'Souverain qualifié' },
      { key: 'ue', score: 60, label: 'Hébergeur UE hors qualification' },
      { key: 'us-eu', score: 30, label: 'US « région Europe »' },
      { key: 'us', score: 0, label: 'Full US' },
    ] },
```

Faire de même (1 phrase `justification` chacun) pour `si3` (seuil de dépendance tech étrangère) et `sn5` (sentinelle sanctions). Ne pas modifier les scores/bands/steps.

- [ ] **Step 4: Run tests (nouveau + non-régression modèle)**

Run: `cd frontend && npx vitest run src/__tests__/compat-exports.test.js src/__tests__/ros-model.test.js`
Expected: PASS (compat 3 tests + ros-model inchangé vert).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ros-engine.js frontend/src/ros-model.js frontend/src/__tests__/compat-exports.test.js
git commit -m "feat(ros): exports compat fmt/SECTORS + seed traçabilité (morceau #3)"
```

---

### Task 6: Backend — persister `cells`, `readings`, `governance`

Le handler POST ne garde que `period/sector/scores/indicators` → il jette les données V4. On les ajoute (rétro-compatible : champs simplement stockés).

**Files:**
- Modify: `backend/server.js:155-166`

**Interfaces:**
- Produces: `POST /api/assessments` stocke aussi `cells` (objet), `readings` (objet), `governance` (objet) quand présents dans le corps.

- [ ] **Step 1: Lire le handler actuel**

Run: `sed -n '155,169p' backend/server.js`
Expected: voir l'objet `assessment` construit à partir de `req.body.period/sector/scores/indicators`.

- [ ] **Step 2: Ajouter les 3 champs V4**

Dans `backend/server.js`, dans le handler `app.post('/api/assessments', ...)`, ajouter au littéral `assessment` (après `indicators: req.body.indicators,`) :

```javascript
    cells: req.body.cells ?? null,
    readings: req.body.readings ?? null,
    governance: req.body.governance ?? null,
```

- [ ] **Step 3: Vérifier — le backend redémarre et stocke le nouveau corps**

Run (dev local, ne PAS toucher storage.json prod à la main) :
```bash
cd backend && node -e "require('./server.js')" >/dev/null 2>&1 & sleep 1; echo 'server import OK'; kill %1 2>/dev/null
```
Expected: pas d'erreur de syntaxe (`server import OK`). Le stockage réel des champs sera validé end-to-end en Task 7 (saisie → sauvegarde).

- [ ] **Step 4: Commit**

```bash
git add backend/server.js
git commit -m "feat(ros): persiste cells/readings/governance a la sauvegarde d'evaluation"
```

---

### Task 7: Réécriture `Assessment.jsx` V4 (saisie + preuve + gouvernance + complétude)

Le composant v3 (30 indicateurs en number inputs, `computeScores`/`WEIGHTS`) est incompatible V4. Réécriture complète : saisie des 11 Voies (cat = `<select>` de bands, num = input), des 8 Maturité + 5 Influence (num/qual), preuve `{source, note}` par cellule (date auto), 3 cases gouvernance, bandeau complétude, sauvegarde du payload V4. **Suit les classes CSS existantes** (`ind-row`, `dim-card`, `form-select`, `ros-main`, etc.).

**Files:**
- Modify (rewrite): `frontend/src/pages/Assessment.jsx`

**Interfaces:**
- Consumes (depuis `../ros-engine.js`): `computeAssessment`, `computeReadings`, `computeCompleteness`, `rosLevel`, `fmt` ; (depuis `../ros-model.js`): `VOIES`, `MATURITE`, `INFLUENCE`, `DIMENSIONS`, `SECTORS`.
- Consumes (API): `api.createAssessment(payload)`, `api.getCompany()`.
- Produces (payload sauvegardé) :

```javascript
{
  period, sector,
  cells,                 // { [id]: { value|band, source?, note?, date } }
  governance,            // { croReporting, vetoFormalized, vetoExercised }  (bool)
  scores: {              // snapshot pour Dashboard/History (règle penalized, k=1)
    SI, SD, SN, SO,      // = round(assess.matrix.penalized[1].dims[d].score)  (null si non calculable)
    ros                  // = round(assess.headline)
  },
  readings               // computeReadings(cells) → { maturite, influence }
}
```

- [ ] **Step 1: État & helpers de saisie**

Remplacer l'entête et l'état du composant :
- `const [cells, setCells] = useState({})` — clé = id d'indicateur, valeur = `{ value|band, source, note, date }`.
- `const [governance, setGovernance] = useState({ croReporting: false, vetoFormalized: false, vetoExercised: false })`.
- `const [period, setPeriod] = useState('T1 2026')`, `PERIODS` inchangé, `const [sector, setSector] = useState('standard')`, `saving`, `openTip`.
- `setCell(id, patch)` : `setCells(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch, date: new Date().toISOString() } }))` — la date s'horodate à chaque modif. (NB : `new Date()` est autorisé dans le navigateur ; interdiction limitée aux scripts Workflow.)
- `useEffect` : `api.getCompany().then(c => c.sector && setSector(c.sector))` (inchangé).

- [ ] **Step 2: Calcul live**

```javascript
const assess = computeAssessment({ sector, governance, cells });
const readings = computeReadings(cells);
const completeness = computeCompleteness(cells, sector);
const lvl = rosLevel(assess.headline);
const dimScore = d => assess.matrix.penalized[1].dims[d].score;
```

- [ ] **Step 3: Rendu saisie des Voies (cat vs num)**

Grouper `VOIES` par `dim` (`DIMENSIONS`). Pour chaque Voie, une `ind-row` avec `code`, `label`, bouton ⓘ (affiche `voie.justification ?? 'Barème non documenté'` + `voie.source`), puis :
- si `voie.kind === 'cat'` : `<select className="form-select">` listant `voie.bands` (`<option value={b.key}>{b.label}</option>`), valeur `cells[voie.id]?.band ?? ''`, `onChange` → `setCell(voie.id, { band: e.target.value })`.
- si `voie.kind === 'num'` : `<input type="number" className="ind-input">`, valeur `cells[voie.id]?.value ?? ''`, `onChange` → `setCell(voie.id, { value: e.target.value })`.
- Deux champs preuve optionnels sous la ligne : `source` (`<input placeholder="Source (URL, doc, page)">`) et `note` (`<input placeholder="Commentaire">`), liés à `setCell(voie.id, { source })` / `{ note }`.
- Pastille score : `fmt(scoreCell-via-voieScores)` — réutiliser `assess` n'expose pas la voie ; afficher via une map locale `Object.fromEntries(voieScores(cells, sector).map(r => [r.id, r.score]))` importée de l'engine.

- [ ] **Step 4: Rendu lectures (Maturité + Influence) + gouvernance**

- Section « Lectures (hors score) » : pour chaque indicateur de `MATURITE` puis `INFLUENCE`, un `ind-row` avec input `number` (qual : min 1 max 5) lié à `cells[id].value`, + preuve optionnelle. Afficher `readings.maturite.score` / `readings.influence.score` en tête de sous-section (`fmt`).
- Bloc gouvernance : 3 `<label><input type="checkbox">` pour `croReporting`, `vetoFormalized`, `vetoExercised` → `setGovernance`. Afficher le coefficient courant `assess.coef`.

- [ ] **Step 5: Bandeau complétude + score**

Dans `ros-main`, afficher `fmt(assess.headline)` en couleur `lvl.color`, `lvl.label`. Sous le score, un bandeau complétude :
```javascript
completeness.isPublishable
  ? <div className="badge badge-teal">Publiable — {completeness.required}/{completeness.required} voies · sourçage {Math.round(completeness.tauxSourcage*100)}%</div>
  : <div className="badge badge-orange">Partiel — {completeness.filled}/{completeness.required} voies renseignées (non publiable)</div>
```

- [ ] **Step 6: Sauvegarde**

```javascript
const handleSave = async () => {
  if (assess.headline === null) { showToast('Renseignez au moins une voie par dimension.'); return; }
  setSaving(true);
  try {
    const round = s => s !== null && s !== undefined ? Math.round(s) : null;
    await api.createAssessment({
      period, sector, cells, governance, readings,
      scores: {
        SI: round(dimScore('SI')), SD: round(dimScore('SD')),
        SN: round(dimScore('SN')), SO: round(dimScore('SO')),
        ros: round(assess.headline),
      },
    });
    showToast('Évaluation V4 sauvegardée ✓');
    onSaved();
  } catch (err) { showToast(err.message); }
  finally { setSaving(false); }
};
```

- [ ] **Step 7: Radar 4 dimensions**

`labels: ['Informationnelle','Décisionnelle','Normative','Opérationnelle']`, `data: DIMENSIONS.map(d => dimScore(d) ?? 0)`. Retirer toute référence à CI / 5e point.

- [ ] **Step 8: Vérifier le build (jalon BUILD VERT)**

Run: `cd frontend && npm run build`
Expected: **build réussit** (plus aucune référence à `computeScores`/`WEIGHTS`). Si erreur, lire le message, corriger l'import/symbole fautif, relancer.

- [ ] **Step 9: Vérifier la non-régression moteur**

Run: `cd frontend && npx vitest run`
Expected: **tous** les tests verts (36 existants + nouveaux Tasks 1-5).

- [ ] **Step 10: Commit**

```bash
git add frontend/src/pages/Assessment.jsx
git commit -m "feat(ros): saisie V4 Assessment — voies cat/num + preuve + gouvernance + completude"
```

---

### Task 8: Pages d'affichage — 4 dimensions, nettoyage code mort

Le build est vert ; on aligne l'affichage sur V4 (4 dims, pas de CI) et on supprime le vestige multi-entreprise.

**Files:**
- Delete: `frontend/src/pages/Companies.jsx`
- Modify: `frontend/src/pages/Dashboard.jsx`, `frontend/src/pages/History.jsx`
- Modify: `frontend/src/pages/Admin.jsx` (déjà importé `SECTORS`, désormais résolu — vérifier)

**Interfaces:**
- Consumes: `rosLevel`, `fmt`, `SECTORS` (tous exportés). Lit `assessment.scores.{SI,SD,SN,SO,ros}` (les évals v3 gardent aussi `CI`, ignoré).

- [ ] **Step 1: Supprimer le code mort**

Run: `git rm frontend/src/pages/Companies.jsx`
(Non importé dans `App.jsx` — aucune référence à casser. Vérifier : `grep -rn "Companies" frontend/src` ne renvoie rien.)

- [ ] **Step 2: Dashboard — retirer CI**

Dans `frontend/src/pages/Dashboard.jsx` : dans `radarData` (labels + data ligne 34) retirer le 5e point CI → 4 labels / 4 valeurs `[SI,SD,SN,SO]`. Dans le trend chart, retirer la série `CI` (ligne 53). Dans la grille des dimensions (lignes 104-105), retirer l'entrée `['CI', ...]`. Garder RoS + SI/SD/SN/SO.

- [ ] **Step 3: History — retirer CI**

Dans `frontend/src/pages/History.jsx` : retirer la série `CI` du chart (ligne 45) et la colonne `CI` du tableau (en-tête + `<td>` ligne 108). 4 dimensions.

- [ ] **Step 4: Admin — vérifier SECTORS**

`Admin.jsx` importe déjà `SECTORS` (désormais résolu par Task 5). Vérifier que le `<select>` du profil entreprise liste bien les 5 profils. Aucune autre modif.

- [ ] **Step 5: Vérifier build + rendu**

Run: `cd frontend && npm run build`
Expected: build vert, aucun warning d'import non résolu ; `grep -rn "Companies\|scores?.CI\|\.CI\b" frontend/src/pages` ne renvoie plus de référence CI active.

- [ ] **Step 6: Commit**

```bash
git add -A frontend/src/pages
git commit -m "refactor(ros): affichage 4 dimensions V4 + suppression Companies (code mort)"
```

---

### Task 9: Page `/rapport` imprimable (Report.jsx) — Morceaux #1/#2/#3/#4/#5

Nouvelle page consommant les fonctions pures + radar, imprimable via `window.print()` + CSS `@media print`.

**Files:**
- Create: `frontend/src/pages/Report.jsx`
- Modify: `frontend/src/App.jsx` (onglet + rendu)
- Modify: `frontend/src/index.css` (bloc `@media print`)

**Interfaces:**
- Consumes: `interpretScore`, `computeActionPlan`, `computeCompleteness`, `computeReadings`, `computeAssessment`, `fmt`, `rosLevel` (engine) ; `VOIES` (pour justification/source, morceau #3) ; `api.getAssessments()`.
- Produces: onglet `rapport` dans `App.jsx`.

- [ ] **Step 1: Report.jsx — charger la dernière évaluation V4**

Créer `frontend/src/pages/Report.jsx` : `useEffect` → `api.getAssessments()`, prendre la 1ʳᵉ ayant un champ `cells` (évaluation V4). Reconstituer `assessment = { sector: a.sector, governance: a.governance ?? {}, cells: a.cells }`. Si aucune éval V4 : message « Aucune évaluation V4 — créez-en une dans Évaluation ».

- [ ] **Step 2: Rendu des 5 morceaux**

```javascript
const interp = interpretScore(assessment);
const plan = computeActionPlan(assessment);
const comp = computeCompleteness(assessment.cells, assessment.sector);
const readings = computeReadings(assessment.cells);
const assess = computeAssessment(assessment);
```
Sections (classes CSS existantes) :
1. **En-tête** : nom entreprise, période, `fmt(assess.headline)` en `interp.level.color`, `interp.level.label`, **`interp.verdict`** (morceau #1).
2. **Top/flop** : `interp.top3` (forces) et `interp.flop3` (faiblesses) en listes.
3. **Radar 4 dims** (comme Dashboard).
4. **Plan d'action** (morceau #2) : table `plan` → colonnes Code / Levier / Score / Écart (`p.gap`).
5. **Complétude** (morceau #4) : `comp.filled/comp.required`, badge publiable/partiel, `Math.round(comp.tauxSourcage*100)}%`.
6. **Traçabilité** (morceau #3) : pour chaque Voie renseignée, afficher `voie.justification ?? 'Barème non documenté'`, `voie.source ?? '—'`, et la preuve saisie `cells[id].source` / `cells[id].note`.
7. Bouton `<button onClick={() => window.print()}>Imprimer / PDF</button>` (classe `no-print`).

- [ ] **Step 3: CSS impression**

Ajouter à la fin de `frontend/src/index.css` :

```css
@media print {
  body { background: #fff !important; color: #000 !important; }
  .sidebar, .topbar, .no-print, .btn { display: none !important; }
  .card, .ros-main { break-inside: avoid; box-shadow: none !important; border: 1px solid #ccc; }
  .page-content { margin: 0 !important; padding: 0 !important; }
  @page { margin: 1.5cm; }
}
```
(Vérifier les noms de classes réels du layout dans `App.jsx` et adapter `.sidebar/.topbar/.page-content`.)

- [ ] **Step 4: Câbler l'onglet dans App.jsx**

Dans `frontend/src/App.jsx` : ajouter `import Report from './pages/Report.jsx';`, un bouton de navigation « Rapport » (près de History), et `{tab === 'rapport' && <Report showToast={showToast} />}` dans la zone de rendu (motif lignes 89-93).

- [ ] **Step 5: Vérifier build + rendu imprimable**

Run: `cd frontend && npm run build`
Expected: build vert.
Vérif manuelle (à faire par Naouphel ou via /run) : onglet Rapport affiche verdict + top/flop + plan + complétude + traçabilité ; `Ctrl+P` montre une mise en page propre sans sidebar.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Report.jsx frontend/src/App.jsx frontend/src/index.css
git commit -m "feat(ros): page /rapport imprimable — 5 morceaux + @media print (morceau #5)"
```

---

### Task 10: Vérification finale + jalon de sortie

**Files:** aucun (vérification).

- [ ] **Step 1: Suite de tests complète**

Run: `cd frontend && npx vitest run`
Expected: **tous verts** (36 existants + voie-scores + interpret-score + action-plan + completeness + compat-exports).

- [ ] **Step 2: Build de production**

Run: `cd frontend && npm run build`
Expected: **build réussit**, aucun import non résolu.

- [ ] **Step 3: Vérifier l'absence de vestiges v3**

Run: `grep -rn "computeScores\|WEIGHTS\|SECTORS\b.*sector\|scores?.CI" frontend/src/pages frontend/src/*.js`
Expected: plus aucune référence à `computeScores`/`WEIGHTS` ; `SECTORS` uniquement là où légitime (Admin).

- [ ] **Step 4: Mettre à jour handoff + todo**

Marquer dans `handoff.md` et `tasks/todo.md` : bloc unique implémenté, build vert, tests verts ; prochaine étape = revue de branche + décision de merge vers `main` (avec validation Naouphel).

- [ ] **Step 5: Commit final de synchronisation**

```bash
git add handoff.md tasks/todo.md
git commit -m "docs(ros): V4 rapport defendable implemente — build + tests verts, pret pour revue de merge"
```

---

## Self-Review (rempli à l'écriture du plan)

**1. Couverture spec :**
- §4 #1 Sens du chiffre → Task 2 (verdict + interpretScore) + Task 9 §2.
- §4 #2 Plan d'action → Task 3 + Task 9 §2.4.
- §4 #3 Traçabilité → Task 5 (seed + fallback) + Task 7 (preuve saisie) + Task 9 §2.6.
- §4 #4 Complétude → Task 4 + Task 7 §5 + Task 9 §2.5.
- §4 #5 Export PDF → Task 9 (Report + @media print + window.print).
- §5 schéma cellule preuve → Task 6 (backend) + Task 7 (saisie).
- §5 migration v3 lisible → Task 8 (affichage lit `scores.*`, évals v3 conservent leurs champs).
- §1 réparation 4 pages sans shim → Tasks 7 (Assessment) + 8 (Dashboard/History/Admin) ; Companies supprimé.
- §6 tests → Tasks 1-5 (unitaires) + Task 10 (build + suite complète).

**2. Placeholders :** aucun « TBD/TODO ». Les champs `source`/`justification` non seedés sont **optionnels par conception** (spec §5 : vide → « non documenté »), pas des placeholders de code.

**3. Cohérence des types :** `voieScores → {id,code,label,dim,score}` réutilisé identiquement par `interpretScore`/`computeActionPlan`/`computeCompleteness`. `interpretScore` renvoie `{level,verdict,top3,flop3}` (top3/flop3 = `{code,label,score}`), `computeActionPlan` renvoie `{code,label,dim,score,gap}`, `computeCompleteness` renvoie `{filled,required,isPublishable,tauxSourcage}` — noms constants entre définition et consommation (Task 9). Payload sauvegarde (Task 7) ↔ champs persistés (Task 6) ↔ lecture (Task 8/9) alignés sur `cells/readings/governance/scores`.

**Note d'ordonnancement :** le build redevient vert à la **Task 7** (dernier fichier cassé = `Assessment.jsx`) puis le reste. Tasks 1-6 se vérifient par tests unitaires / import, sans build complet.
