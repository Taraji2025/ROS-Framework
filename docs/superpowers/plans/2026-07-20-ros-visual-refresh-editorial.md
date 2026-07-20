# ROS Visual Refresh · Direction C — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehausser visuellement ROS (Dashboard + `/rapport`) dans un langage « éditorial premium » (profondeur mesurée, typo forte, micro-motion, radar animé) + un disclaimer académique, sans toucher au moteur.

**Architecture:** Tout le langage visuel vit dans les tokens et classes partagés de `frontend/src/index.css` (héritage global). Deux pages consomment ces classes en direct (`Dashboard.jsx`, `Report.jsx`). Deux petits modules partagés DRY-ifient le texte (`disclaimer.js`) et la config du radar (`chart-theme.js`). 100 % présentationnel : `ros-engine.js`/`ros-model.js` inchangés, on réutilise leurs exports.

**Tech Stack:** React 18 + Vite, CSS (variables + keyframes), chart.js / react-chartjs-2 (déjà installés), Vitest.

## Global Constraints

- **Aucune dépendance nouvelle** (VPS 8 Go). Motion en CSS + animation native chart.js uniquement.
- **Moteur intact** : ne pas modifier `ros-engine.js` / `ros-model.js`. Réutiliser les exports existants (`rosLevel`, `interpretScore`, `computeActionPlan`, `computeAssessment`, `voieScores`, `DIMENSIONS`).
- **Parité thèmes** : chaque token/couleur a sa valeur sous `:root` (dark) **et** `[data-theme="light"]`.
- **Motion responsable** : toutes les animations/transitions neutralisées sous `@media (prefers-reduced-motion: reduce)`.
- **Impression** : `/rapport` doit rester net à l'impression (`@media print` : motion off, ombres simplifiées, disclaimer conservé).
- **Vrais noms d'entreprises conservés** (CS/Lafarge). Disclaimer discret partout + explicite sur `/rapport`.
- **Non-régression** : `npx vitest run` doit rester **57/57** (aucune logique touchée). `npm run build` vert à chaque tâche.
- **Palette dimensions** : SI=`--dim1`#58a6ff, SD=`--dim2`#bc8cff, SN=`--dim3`#f0883e, SO=`--dim4`#3fb950. **Retirer `--dim5`/`.dim-5`/`.fill-5`** (V4 = 4 dims ; utilisés uniquement dans `index.css`).

---

## File Structure

- **Modify** `frontend/src/index.css` — tokens (élévation, accent, motion), classes partagées (`.card` lift, `.accent-bar`, `.stat-num`, `.chip-level`, `.track`), keyframes, `prefers-reduced-motion`, base print ; retrait `--dim5`.
- **Create** `frontend/src/disclaimer.js` — constantes de texte du disclaimer (source unique).
- **Create** `frontend/src/chart-theme.js` — `radarData(scoresArray)` + `radarOptions({animate})` partagés par les 2 radars.
- **Modify** `frontend/src/App.jsx` — disclaimer discret dans le pied de sidebar.
- **Modify** `frontend/src/pages/Dashboard.jsx` — hero (accent-bar + stat-num + chip-level + verdict) ; 4 cartes dimension (`.track`) ; plan d'action ; radar via `chart-theme`.
- **Modify** `frontend/src/pages/Report.jsx` — classes éditoriales + encart disclaimer explicite (écran + print) ; radar via `chart-theme`.

**Nature de la vérification** : c'est une refonte présentationnelle. Les garde-fous automatiques sont (a) `vitest run` **57/57** inchangés (non-régression moteur), (b) `npm run build` vert, (c) greps d'invariants, (d) **captures puppeteer** inspectées (dark/light/print). Pas de tests unitaires de CSS (aucun ajout de dépendance de rendu).

---

### Task 1 : Tokens, classes partagées & motion (`index.css`)

**Files:**
- Modify: `frontend/src/index.css` (bloc `:root`, bloc `[data-theme="light"]`, section classes utilitaires, fin de fichier)

**Interfaces:**
- Produces (classes CSS consommées par les tâches suivantes) : `.card` (lift au survol), `.accent-bar`, `.stat-num`, `.chip-level`, `.track` + `.track > i`, tokens `--elev-1/2/3`, `--accent-grad`, `--motion-fast`, `--motion-med`.

- [ ] **Step 1 : Grep de sûreté avant retrait `--dim5`**

Run: `grep -rn "dim-5\|fill-5\|--dim5" frontend/src/ --include=*.jsx`
Expected: **aucune sortie** (les classes/token dim5 ne sont utilisés dans aucun JSX → retrait sûr).

- [ ] **Step 2 : Retirer les résidus `--dim5` dans `index.css`**

Supprimer les 2 déclarations de token `--dim5:` (dans `:root` ~L31 et `[data-theme="light"]` ~L79) et les règles `.dim-5, .fill-5 { color: var(--dim5); }` (~L446) et `.fill-5 { background: var(--dim5); }` (~L451).

- [ ] **Step 3 : Ajouter les tokens d'élévation, d'accent et de motion**

Dans le bloc `:root` (dark), ajouter :
```css
  --elev-1: 0 1px 2px rgba(0,0,0,.4), 0 2px 8px -4px rgba(0,0,0,.5);
  --elev-2: 0 4px 16px -6px rgba(0,0,0,.55);
  --elev-3: 0 20px 50px -20px rgba(0,0,0,.7);
  --accent-grad: linear-gradient(180deg, var(--dim1), var(--dim4));
  --motion-fast: .2s;
  --motion-med: .6s;
```
Dans le bloc `[data-theme="light"]`, ajouter les pendants clairs :
```css
  --elev-1: 0 1px 2px rgba(16,24,40,.06), 0 2px 8px -4px rgba(16,24,40,.1);
  --elev-2: 0 6px 20px -8px rgba(16,24,40,.14);
  --elev-3: 0 20px 40px -18px rgba(16,24,40,.2);
```
(les tokens `--accent-grad`, `--motion-*` sont hérités, pas besoin de les redéclarer en clair.)

- [ ] **Step 4 : Ajouter les classes partagées + keyframes + garde reduced-motion**

À la section des utilitaires (près des autres classes de composant), ajouter :
```css
.card { box-shadow: var(--elev-1); transition: transform var(--motion-fast) ease, box-shadow var(--motion-fast) ease, border-color var(--motion-fast) ease; }
.card:hover { transform: translateY(-3px); box-shadow: var(--elev-2); }

.accent-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--accent-grad); border-radius: 4px 0 0 4px; }

.stat-num { font-size: 64px; font-weight: 800; letter-spacing: -.03em; line-height: 1; animation: rise var(--motion-med) cubic-bezier(.2,.7,.2,1) both; }
.stat-num small { font-size: 20px; color: var(--text2); font-weight: 500; }

.chip-level { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid currentColor; }

.track { height: 5px; border-radius: 99px; background: rgba(127,127,127,.14); overflow: hidden; }
.track > i { display: block; height: 100%; border-radius: 99px; animation: fill 1s ease both; }

@keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fill { from { width: 0 !important; } }

@media (prefers-reduced-motion: reduce) {
  *, .stat-num, .track > i, .card { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 5 : Vérifier build + non-régression + invariant dim5**

Run: `cd frontend && npm run build && npx vitest run 2>&1 | tail -3 && grep -rn "dim5\|dim-5\|fill-5" src/ || echo "DIM5_CLEAN"`
Expected: build ✓ ; **57 passed** ; sortie grep vide suivie de `DIM5_CLEAN`.

- [ ] **Step 6 : Commit**

```bash
git add frontend/src/index.css
git commit -m "style(ros): tokens élévation/accent/motion + classes partagées éditoriales, retrait dim5"
```

---

### Task 2 : Module disclaimer + mention discrète (sidebar)

**Files:**
- Create: `frontend/src/disclaimer.js`
- Modify: `frontend/src/App.jsx` (bloc `.sidebar-footer`)

**Interfaces:**
- Produces: `export const DISCLAIMER_SHORT` (string court), `export const DISCLAIMER_REPORT` (string long), consommés par App.jsx (Task 2) et Report.jsx (Task 5).

- [ ] **Step 1 : Créer le module de texte partagé**

Create `frontend/src/disclaimer.js` :
```js
// Source unique du texte de disclaimer (évite la double rédaction / dérive).
export const DISCLAIMER_SHORT = 'Prototype académique · Mémoire MBA EGE';
export const DISCLAIMER_REPORT =
  'Prototype académique (Mémoire MBA EGE). Les scores reposent sur un codage hypothétique non sourcé ' +
  'et ne constituent pas une évaluation réelle des entreprises citées.';
```

- [ ] **Step 2 : Importer + afficher la mention discrète dans la sidebar**

Dans `frontend/src/App.jsx`, ajouter l'import en tête :
```jsx
import { DISCLAIMER_SHORT } from './disclaimer.js';
```
Dans le bloc `<div className="sidebar-footer">`, ajouter en dernière ligne (après le bouton Déconnexion) :
```jsx
<div className="disclaimer-mini">{DISCLAIMER_SHORT}</div>
```

- [ ] **Step 3 : Style discret de la mention (`index.css`)**

Ajouter dans `frontend/src/index.css` :
```css
.disclaimer-mini { margin-top: 10px; font-size: 10.5px; line-height: 1.3; color: var(--text3); letter-spacing: .02em; }
```

- [ ] **Step 4 : Vérifier build + tests**

Run: `cd frontend && npm run build && npx vitest run 2>&1 | tail -2`
Expected: build ✓ ; **57 passed**.

- [ ] **Step 5 : Commit**

```bash
git add frontend/src/disclaimer.js frontend/src/App.jsx frontend/src/index.css
git commit -m "feat(ros): disclaimer académique discret (sidebar) + module texte partagé"
```

---

### Task 3 : Module de thème radar partagé (`chart-theme.js`)

**Files:**
- Create: `frontend/src/chart-theme.js`

**Interfaces:**
- Consumes: rien (data passée en argument).
- Produces: `export function radarData(values)` (values = `[SI,SD,SN,SO]` numériques) → objet `data` chart.js ; `export function radarOptions({ animate = true } = {})` → objet `options` chart.js avec animation native.

- [ ] **Step 1 : Créer le module**

Create `frontend/src/chart-theme.js` :
```js
// Config radar partagée (Dashboard + Report). Couleurs par dimension SI/SD/SN/SO.
const DIM_COLORS = ['#58a6ff', '#bc8cff', '#f0883e', '#3fb950'];

export function radarData(values) {
  return {
    labels: ['Informationnelle', 'Décisionnelle', 'Normative', 'Opérationnelle'],
    datasets: [{
      data: values ?? [0, 0, 0, 0],
      backgroundColor: 'rgba(88,166,255,.14)',
      borderColor: 'rgba(88,166,255,.85)',
      borderWidth: 2,
      pointBackgroundColor: DIM_COLORS,
      pointBorderColor: 'rgba(0,0,0,.35)',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };
}

export function radarOptions({ animate = true } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: animate ? { duration: 600, easing: 'easeOutQuart' } : false,
    scales: {
      r: {
        min: 0, max: 100,
        angleLines: { color: 'rgba(127,127,127,.18)' },
        grid: { color: 'rgba(127,127,127,.14)' },
        pointLabels: { color: 'var(--text2)', font: { size: 12 } },
        ticks: { display: false, stepSize: 20 },
      },
    },
    plugins: { legend: { display: false } },
  };
}
```

- [ ] **Step 2 : Vérifier build (le module doit s'importer sans casser le bundle)**

Run: `cd frontend && node -e "import('./src/chart-theme.js').then(m=>console.log('exports:', Object.keys(m).join(',')))"`
Expected: `exports: radarData,radarOptions`

- [ ] **Step 3 : Commit**

```bash
git add frontend/src/chart-theme.js
git commit -m "refactor(ros): module chart-theme radar partagé (data + options animées)"
```

---

### Task 4 : Dashboard éditorial (hero + dims + plan d'action + radar animé)

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`

**Interfaces:**
- Consumes: `rosLevel`, `interpretScore`, `computeActionPlan` (`ros-engine.js`) ; `radarData`, `radarOptions` (`chart-theme.js`) ; classes `.accent-bar`, `.stat-num`, `.chip-level`, `.track` (Task 1).

- [ ] **Step 1 : Adapter les imports**

En tête de `frontend/src/pages/Dashboard.jsx`, remplacer la ligne d'import moteur par :
```jsx
import { rosLevel, fmt, interpretScore, computeActionPlan } from '../ros-engine.js';
import { radarData, radarOptions } from '../chart-theme.js';
```

- [ ] **Step 2 : Dériver verdict + plan depuis `last`**

Juste après `const lvl = rosLevel(last?.scores?.ros ?? null);`, ajouter :
```jsx
const assessment = last ? { sector: last.sector, governance: last.governance ?? {}, cells: last.cells ?? {} } : null;
const interp = assessment ? interpretScore(assessment) : null;
const plan = assessment ? computeActionPlan(assessment).slice(0, 3) : [];
const dims = [
  ['SI', 'Informationnelle', last?.scores?.SI, 'dim-1'],
  ['SD', 'Décisionnelle',    last?.scores?.SD, 'dim-2'],
  ['SN', 'Normative',        last?.scores?.SN, 'dim-3'],
  ['SO', 'Opérationnelle',   last?.scores?.SO, 'dim-4'],
];
```

- [ ] **Step 3 : Remplacer le radar local par le module partagé**

Supprimer le bloc `const radarData = { ... };` local et remplacer l'usage `<Radar data={radarData} options={{...}} />` par :
```jsx
<Radar
  data={radarData([last?.scores?.SI ?? 0, last?.scores?.SD ?? 0, last?.scores?.SN ?? 0, last?.scores?.SO ?? 0])}
  options={radarOptions({ animate: true })}
/>
```

- [ ] **Step 4 : Remplacer le panneau score par le hero éditorial**

Remplacer le bloc de la carte « RoS + Radar » (partie score, avant le radar) par un hero :
```jsx
<div className="card hero-card" style={{ position: 'relative' }}>
  <div className="accent-bar" />
  <div className="label">Score RoS global</div>
  <div className="stat-num">{last ? Math.round(last.scores?.ros) : '—'}<small>/100</small></div>
  {last && (
    <span className="chip-level" style={{ color: lvl.color, marginTop: 12 }}>{lvl.label}</span>
  )}
  {interp?.verdict && <div className="hero-verdict">{interp.verdict}</div>}
  {!last && <div className="empty-hint">Aucune évaluation — lance une évaluation pour voir le score.</div>}
</div>
```

- [ ] **Step 5 : Cartes dimension avec barre animée**

Remplacer la liste des dimensions existante (les `['SI', ...]` → `dim-1`…) par :
```jsx
<div className="dim-row">
  {dims.map(([k, labelTxt, v, cls]) => (
    <div className="card dim-card" key={k}>
      <div className="label">{k} · {labelTxt}</div>
      <div className={`dim-val ${cls}`}>{v != null ? Math.round(v) : '—'}</div>
      <div className="track"><i className={`fill-${cls.slice(-1)}`} style={{ width: `${v ?? 0}%` }} /></div>
    </div>
  ))}
</div>
```

- [ ] **Step 6 : Bloc plan d'action prioritaire**

Sous le radar/dimensions, ajouter :
```jsx
{plan.length > 0 && (
  <div className="card action-card">
    <div className="label">Plan d'action prioritaire — écart au max</div>
    {plan.map((p, i) => (
      <div className="action-row" key={p.code}>
        <span className="action-rank">{i + 1}</span>
        <span className="action-txt">{p.code} · {p.label}</span>
        <span className="action-gap">+{Math.round(p.gap)} pts</span>
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 7 : Styles Dashboard éditoriaux (`index.css`)**

Ajouter :
```css
.hero-card { padding: 22px; }
.hero-card .label { text-transform: uppercase; letter-spacing: .06em; font-size: 11px; color: var(--text3); }
.hero-verdict { margin-top: 14px; color: var(--text2); font-size: 12.5px; line-height: 1.5; max-width: 42ch; }
.empty-hint { margin-top: 14px; color: var(--text2); font-size: 13px; }
.dim-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
@media (max-width: 860px) { .dim-row { grid-template-columns: repeat(2, 1fr); } }
.dim-card { padding: 14px; }
.dim-card .label { font-size: 11px; color: var(--text2); text-transform: uppercase; letter-spacing: .04em; }
.dim-val { font-size: 24px; font-weight: 700; margin: 4px 0 8px; }
.action-card { margin-top: 16px; padding: 16px; }
.action-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.action-row:last-child { border-bottom: 0; }
.action-rank { width: 22px; height: 22px; border-radius: 6px; background: rgba(88,166,255,.12); color: var(--blue); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.action-txt { flex: 1; }
.action-gap { font-size: 12px; color: var(--dim3); font-weight: 600; }
```

- [ ] **Step 8 : Vérifier build + tests + preuve visuelle**

Run: `cd frontend && npm run build && npx vitest run 2>&1 | tail -2`
Expected: build ✓ ; **57 passed**.
Puis capture puppeteer du Dashboard (dark) — voir Task 6 pour le driver ; inspecter : hero avec accent-bar, radar, 4 cartes dim, plan d'action. Aucun chevauchement.

- [ ] **Step 9 : Commit**

```bash
git add frontend/src/pages/Dashboard.jsx frontend/src/index.css
git commit -m "feat(ros): Dashboard éditorial — hero+verdict, cartes dimension, plan d'action, radar animé partagé"
```

---

### Task 5 : Report `/rapport` éditorial + disclaimer explicite + garde print

**Files:**
- Modify: `frontend/src/pages/Report.jsx`
- Modify: `frontend/src/index.css` (bloc `@media print` + style encart)

**Interfaces:**
- Consumes: `DISCLAIMER_REPORT` (Task 2) ; `radarData`, `radarOptions` (Task 3) ; classes éditoriales (Task 1).

- [ ] **Step 1 : Importer le disclaimer + le thème radar**

En tête de `frontend/src/pages/Report.jsx`, ajouter :
```jsx
import { DISCLAIMER_REPORT } from '../disclaimer.js';
import { radarData as radarDataShared, radarOptions } from '../chart-theme.js';
```

- [ ] **Step 2 : Basculer le radar sur le module partagé**

Remplacer le `const radarData = { ... }` local et son usage par :
```jsx
<Radar
  data={radarDataShared(DIMENSIONS.map(d => assess.matrix.penalized[1].dims[d].score ?? 0))}
  options={radarOptions({ animate: false })}
/>
```
(`animate:false` — le rapport est un artefact figé/imprimable.)

- [ ] **Step 3 : Ajouter l'encart disclaimer explicite (écran + print)**

Juste après le `<div className="page-header">…</div>`, insérer :
```jsx
<div className="report-disclaimer">{DISCLAIMER_REPORT}</div>
```

- [ ] **Step 4 : Styles encart + garde impression (`index.css`)**

Ajouter :
```css
.report-disclaimer { margin: 12px 0 20px; padding: 10px 14px; border-left: 3px solid var(--orange); background: rgba(227,179,65,.08); color: var(--text2); font-size: 12px; line-height: 1.5; border-radius: 0 8px 8px 0; }
@media print {
  * { animation: none !important; transition: none !important; }
  .card { box-shadow: none !important; border: 1px solid #ccc !important; }
  .report-disclaimer { background: #f7f1e0 !important; color: #333 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

- [ ] **Step 5 : Vérifier build + tests**

Run: `cd frontend && npm run build && npx vitest run 2>&1 | tail -2`
Expected: build ✓ ; **57 passed**.

- [ ] **Step 6 : Commit**

```bash
git add frontend/src/pages/Report.jsx frontend/src/index.css
git commit -m "feat(ros): /rapport éditorial + encart disclaimer explicite conservé à l'impression"
```

---

### Task 6 : Preuve visuelle finale (dark / light / print) + DoD

**Files:**
- Create: `/tmp/claude-1001/.../scratchpad/drive-visual.js` (driver jetable, hors repo)
- Screenshots → `frontend/../tasks/screenshots/`

- [ ] **Step 1 : Lancer Vite en fond**

Run: `cd frontend && npm run dev -- --port 5199 &` puis `sleep 4 && curl -s -o /dev/null -w "%{http_code}" http://localhost:5199/`
Expected: `200`

- [ ] **Step 2 : Driver puppeteer — Dashboard + /rapport en dark, light, print**

Écrire un script (modèle : le driver du Guide, `scratchpad/drive-guide.js`) qui, via `/home/Felfool/les-secrets-de-linda/node_modules/puppeteer`, injecte `localStorage ros_token/ros_user` (role admin), navigue vers l'onglet Dashboard puis Rapport, et capture :
- `07-dashboard-dark.png`, `07-dashboard-light.png` (bascule via `localStorage.ros_theme='light'` + reload),
- `07-rapport-dark.png`, `07-rapport-light.png`,
- `07-rapport-print.png` avec `await page.emulateMediaType('print')`.

- [ ] **Step 3 : Inspecter les 5 captures**

Vérifier de visu : hero + accent-bar + radar animé + cartes dim + plan (Dashboard) ; encart disclaimer visible sur /rapport **y compris en print** ; sidebar porte la mention discrète ; light theme lisible (contraste ok) ; rien ne déborde.

- [ ] **Step 4 : DoD final — invariants automatiques**

Run:
```bash
cd frontend && npm run build && npx vitest run 2>&1 | tail -2
grep -rn "dim5\|dim-5\|fill-5" src/ || echo "DIM5_CLEAN"
grep -rn "DISCLAIMER_REPORT\|DISCLAIMER_SHORT" src/ | wc -l
```
Expected: build ✓ ; **57 passed** ; `DIM5_CLEAN` ; compteur disclaimer ≥ 3 (module + App + Report).

- [ ] **Step 5 : Arrêter Vite**

Run: `pkill -f "vite --port 5199"`

- [ ] **Step 6 : Commit de la preuve**

```bash
git add tasks/screenshots/07-*.png
git commit -m "test(ros): preuve visuelle refonte éditoriale — dashboard+rapport, dark/light/print"
```

---

## Self-Review

**Spec coverage** :
- §2.1 Direction C → Tasks 1,4,5 (tokens + pages). ✓
- §2.2 périmètre Dashboard+/rapport → Tasks 4,5. ✓
- §2.3 héritage via tokens → Task 1 (classes partagées). ✓
- §2.4 zéro dépendance → contrainte globale respectée (CSS + chart.js). ✓
- §2.5 moteur intact → aucune tâche ne touche ros-engine/ros-model. ✓
- §2.6 parité light/dark → Task 1 Step 3 + Task 6 captures light. ✓
- §2.7 reduced-motion → Task 1 Step 4. ✓
- §2.8 disclaimer discret+/rapport → Tasks 2,5 ; noms conservés. ✓
- §5.1 tokens+retrait dim5 → Task 1. ✓ §5.2 classes → Task 1. ✓ §5.3 Dashboard → Task 4. ✓ §5.4 Report+print → Task 5. ✓ §5.5bis disclaimer source unique → Task 2 (module). ✓
- §8 DoD (build, 57/57, captures dark/light/print, grep dim5, disclaimer) → Task 6. ✓

**Placeholder scan** : aucun TBD ; tout code fourni en clair. ✓
**Type consistency** : `radarData(values)`/`radarOptions({animate})` identiques entre Task 3 (définition), Task 4 et Task 5 (usage) ; `DISCLAIMER_SHORT`/`DISCLAIMER_REPORT` cohérents entre Task 2 et Task 5 ; `interpretScore(assessment).verdict` et `computeActionPlan(assessment)[].{code,label,gap}` conformes aux signatures moteur vérifiées sur pièce. ✓
