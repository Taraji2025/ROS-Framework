# ROS V4 — Rapport de souveraineté défendable (spec de conception)

> Date : 2026-07-16 · Branche : `v4-refonte` · Auteur : Naouphel (assisté Claude)
> Statut : validé en brainstorming (Sections A/B/C), prêt pour `writing-plans`.
> Contexte : adossé au mémoire CRO 3.0 (EGE 2025-2026). ROS = framework d'audit de souveraineté d'entreprise, **mono-entreprise**, **déterministe**.

## 0. Résumé

Cette spec couvre **un bloc unique** (1 spec → 1 plan → 1 build) qui rend la branche `v4-refonte` de nouveau *mergeable* ET livre le **rapport de souveraineté défendable** : les 5 morceaux qui donnent du sens, une boussole d'action, de la traçabilité, une complétude honnête et un export PDF de soutenance.

Le **moteur V4 est déjà implémenté et vert** (bloc A, 36/36 tests Vitest) : `frontend/src/ros-model.js` (référentiel) + `frontend/src/ros-engine.js` (calcul pur). Cette spec **consomme** ce moteur, l'**enrichit** de 3 fonctions pures + de métadonnées de défendabilité, **répare** les 4 pages v3 cassées et **ajoute** la saisie V4 + la page rapport.

Critère de sortie objectif : `npm run build` repasse vert **et** les tests Vitest (36 existants + nouveaux) sont verts.

## 1. Périmètre (Section A validée)

**Dans le périmètre :**
1. Backbone `ros-model.js` (existe) — enrichi de `verdict` par palier + `{source, justification}` par indicateur.
2. Saisie V4 `Assessment.jsx` réécrite sur le contrat moteur figé + **preuve `{source, date, note}`** par cellule.
3. Réparation **sans shim** des 4 pages v3 cassées : `Dashboard.jsx`, `History.jsx`, `Admin.jsx`, `Companies.jsx`.
4. Les **5 morceaux** du rapport défendable (détaillés §4).
5. Page `/rapport` + export PDF via `window.print()` + CSS `@media print`.

**Hors périmètre (YAGNI / différé) :**
- Simulateur contrefactuel de bascule (« si je rapatrie ce SaaS US : +7 ») — candidat bonus, spec ultérieure.
- Archivage `mobile/` (différé, déjà acté).
- Validité externe (fidélité inter-évaluateur, corrélation au réel, trajectoire) — section du **mémoire**, pas de l'app.

## 2. État de départ (vérifié sur pièce le 2026-07-16)

**Contrat moteur public** (`ros-engine.js`, figé) :
`aggregate, scoreCell, computeDimension, governanceCoef, computeGlobal, rosLevel, computeAssessment, computeReadings`.

**Référentiel** (`ros-model.js`) :
`DIMENSIONS=['SI','SD','SN','SO']`, `RULES=['linear','geometric','penalized']`, `K_VALUES=[1,2,3]`, `VOIES` (11), `MATURITE` (8), `INFLUENCE` (5), `PROFILES` (standard/banque/industrie/tech/energie — applicabilité seule, poids égaux), `LEVELS` (5 paliers, `{max,label,color,cls}`).

**Familles** (jamais additionnées) : Voies 11 = **score** ; Maturité 8 + Influence 5 = **lectures** (`computeReadings`, hors score).

**Ce qui manque et que cette spec ajoute :**
- `LEVELS[].verdict` : absent (aujourd'hui `label/color/cls` seulement).
- `source` / `justification` par indicateur : **absents** (`grep` = 0).
- Schéma cellule de preuve dans le stockage : absent (v3 = valeur nue).

**Build cassé (attendu)** : `Dashboard/Assessment/History/Admin/Companies` importent encore `computeScores`/`fmt`/`WEIGHTS`/`SECTORS` supprimés du moteur v4.

**Stockage v3** : `assessments[] = {id, period, sector, scores:{SI,SD,SN,SO,CI,ros}, indicators:{si1..ci6}, createdAt, createdBy}`. 2 évals v3 présentes, **non recalculables** (indicateurs V4 ≠ v3).

## 3. Architecture & data flow (Section B validée)

Flux **unidirectionnel, déterministe** :

```
Assessment.jsx (saisie)
  └─ cells = { <code> : { value | band, source?, date?, note? } }   (preuve embarquée)
       │
       ▼
ros-engine.js (pur, sans I/O)
  ├─ computeAssessment(assessment) → score global + dims + niveau
  ├─ computeReadings(cells)        → Maturité + Influence (hors score)
  ├─ interpretScore(result)        → { level, verdict, top3, flop3 }        [#1]
  ├─ computeActionPlan(result)     → indicateurs triés par écart au max     [#2]
  └─ computeCompleteness(cells, profile) → { filled, required, isPublishable, tauxSourcage }  [#4]
       │
       ▼
Pages restitution (React, lecture seule)
  ├─ Dashboard / History → consomment les sorties
  └─ /rapport (nouvelle)  → même data, layout @media print → window.print()  [#5]
```

**Backend** : inchangé (store-only). Seule évolution = forme du payload d'une cellule (`value` → `{value|band, source?, date?, note?}`). Aucune nouvelle route.

**Isolation** : chaque nouvelle fonction est **pure**, testable seule en Vitest, sans dépendance React ni réseau. Le PDF est une **vue** qui lit les sorties — zéro logique de calcul dedans (règle CLAUDE.md : toute logique de score dans `ros-engine.js`).

**Verdict textuel** : les phrases vivent dans `ros-model.js` (`LEVELS[].verdict`), versionnées et défendables — pas de template libre dans la vue (décision actée).

## 4. Les 5 morceaux

### #1 — Sens du chiffre
- **Fonction** : `interpretScore(result)` → `{ level, verdict:string, top3:[{code,label,score}], flop3:[{code,label,score}] }`.
- `level` via `rosLevel()` (existe). `verdict` = `LEVELS[i].verdict` (nouveau champ). `top3`/`flop3` = 3 meilleurs / 3 pires sous-scores de Voies.
- **Rendu** : bandeau « niveau RoS + phrase » en tête de Dashboard et de `/rapport`, avec les 3 forces / 3 faiblesses.

### #2 — Plan d'action priorisé
- **Fonction** : `computeActionPlan(result)` → liste d'indicateurs de Voies triés par **écart au max** (`100 − score`), **poids égaux** (pas de pondération : profils = applicabilité seule). Départage stable en cas d'égalité (ordre du référentiel).
- **Rendu** : « boussole » — top N leviers, avec l'écart et la cible du référentiel.

### #3 — Traçabilité
- **Référentiel** : `{source?, justification?}` par indicateur (24) dans `ros-model.js` — *pourquoi ce barème / cette cible*. Affiché à la saisie et dans le rapport ; « non documenté » si vide.
- **Preuve saisie** : `{source?, date, note?}` par cellule (voir #Schéma). `date` auto-horodatée. Restitution complète = valeur + preuve + justification du référentiel.

### #4 — Indice de complétude
- **Fonction** : `computeCompleteness(cells, profile)` → `{ filled, required, isPublishable, tauxSourcage }`.
- **Gate publiable** ⟺ **toutes les Voies applicables** du profil sont remplies (Standard/Industrie/Énergie : 11/11 ; Banque/Tech : 9/9). Maturité/Influence = bonus **non bloquant**.
- `tauxSourcage` = part des cellules remplies ayant une `source`.
- **Rendu** : bandeau « partiel / non publiable » tant que le gate n'est pas franchi ; jamais de score « complet » sur 3 cellules remplies (bug v3 `avg()` ignore les nulls → corrigé par le gate).

### #5 — Export PDF (rapport de soutenance)
- **Page** `/rapport` (nouvelle route React) : radar + score + verdict (#1) + top/flop + plan d'action (#2) + complétude (#4) + traçabilité (#3).
- **Impression** : CSS `@media print` (pagination soignée, radar imprimable) + bouton `window.print()`. **Zéro dépendance serveur** (VPS 8 Go, backend store-only) — pas de Puppeteer.

## 5. Schéma données & migration (Section C validée)

### Enrichissements `ros-model.js`
- `LEVELS[].verdict:string` — 5 phrases versionnées.
- `{source?, justification?}` sur les 24 indicateurs (`VOIES`/`MATURITE`/`INFLUENCE`). **Tout optionnel**, vide → « non documenté ».

### Schéma cellule de preuve (stockage)
- **v3** : `indicators: { si1: 42, ... }` (nombre nu).
- **V4** : `cells: { <code>: { value | band, source?, date?, note? } }`. `date` auto-horodatée à la saisie ; `source`/`note` optionnels ; `computeCompleteness` en tire le `tauxSourcage`.
- **Rétro-compat lecture** : un ancien `indicators:{...}` sans `cells` reste **lisible** ; affiché en lecture seule avec badge « v3, non recalculable ».

### Migration
- **Pas de recalcul** des 2 évals v3 (indicateurs V4 ≠ v3). Archivées telles quelles, lecture seule, badge « v3 ».
- Backend : `POST /api/assessments` accepte le corps `cells`. Aucune route modifiée. `storage.json` jamais touché à la main (règle CLAUDE.md).

## 6. Tests (Vitest)

- **Purs moteur (nouveaux, cible +12-15)** :
  - `interpretScore` : top3/flop3 corrects ; `verdict` = palier attendu ; robustesse cellules manquantes.
  - `computeActionPlan` : tri écart au max ; départage stable à égalité ; n'inclut que les Voies applicables.
  - `computeCompleteness` : `isPublishable` selon profil (11/11 vs 9/9) ; `tauxSourcage` ; bonus Maturité/Influence non bloquant.
- **Non-régression** : les **36 tests bloc A restent verts** (contrat moteur figé).
- **Critère de sortie** : `npm run build` vert (4 pages migrées ne cassent plus) — signal objectif de fin.
- **PDF** : vérification **manuelle** (impression `/rapport`), pas de test automatisé — assumé.

## 7. Décisions par défaut (points ouverts, révisables — non bloquants)

Encodés comme **défauts corrigeables** dans `ros-model.js` :
- **Influence** : 5 indicateurs (fusion des doublons SN-1/CI-1, SN-3/CI-5). 7 reste possible ultérieurement.
- **Matrice d'applicabilité** : profil `conseil/services` non ajouté pour l'instant ; Banque/Tech excluent SO-2 (stocks physiques) et SO-4 (autonomie énergétique).
- **Barèmes Maturité/Influence** : cibles `target` déjà posées en bloc A ; affinables.
- **PoC re-codage mémoire** (Credit Suisse vs Lafarge) : hors app.

## 8. Contraintes & garde-fous

- **Mono-entreprise** — ne jamais réintroduire de multi-clients (confidentialité).
- **Déterministe** — aucun appel IA ; tout est calcul + frontend.
- Toute logique de score → `ros-engine.js` uniquement, jamais inline.
- **Ne pas déployer / merger** avant build vert + tests verts + validation explicite.
- Rebuild frontend obligatoire avant toute annonce de fin.

## 9. Livrables

1. `ros-model.js` enrichi (verdicts + source/justification).
2. `ros-engine.js` + 3 fonctions pures (`interpretScore`, `computeActionPlan`, `computeCompleteness`).
3. `Assessment.jsx` V4 (saisie + preuve).
4. 4 pages réparées (`Dashboard/History/Admin/Companies`).
5. Page `/rapport` + CSS `@media print`.
6. Suite Vitest étendue (verte) + `npm run build` vert.
