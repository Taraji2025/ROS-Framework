# ROS — tâches en cours

## 🔴 CHANTIER ACTIF (2026-07-15) — Refonte V4 (branche `v4-refonte`)
Specs V4 validées par Naouphel (spec produit + grille OSINT) → refonte du cœur.
**Design écrit** : `docs/superpowers/specs/2026-07-15-ros-v4-refonte-design.md`.

### Décisions de cadrage actées (15/07)
- Une spec globale V4 → plan d'implémentation phasé (A moteur → B saisie → C restitution → D annexes).
- Agrégation : **2 niveaux non-compensatoires** (voies→dim, dim→global, poids égaux au niveau dim).
- Score titre : **pénalisée Mazziotta-Pareto**, k∈{1,2,3} challengé dans la restitution ; lin/géom à côté.
- Profils : **applicabilité seule, poids égaux** (plus de WEIGHTS sectoriels).
- Traçabilité : **{source, date, note} par cellule, tout optionnel** + taux de sourçage.

### Points ouverts (à trancher en relecture spec)
- [ ] Influence : 5 (fusion doublons) ou 7 indicateurs ?
- [ ] Matrice d'applicabilité : profil `conseil/services` ? SO-2/SO-4 pour Banque ?
- [ ] Barèmes Maturité/Influence : réutiliser v3 ou spécifier maintenant ?
- [ ] PoC re-codage : Credit Suisse (28/02/2021) vs Lafarge — arbitrage mémoire (hors app).

### État
- [x] Blast radius mesuré (épicentre ros-engine.js + Assessment.jsx ; backend store-only ; Companies.jsx = mort).
- [x] Design complet écrit + self-review (comptage 24 mesures / 26 codes hérités).
- [x] Spec validée par Naouphel (« on y va » sur défauts, amendables après).
- [x] **Plan bloc A écrit** : `docs/superpowers/plans/2026-07-15-ros-v4-bloc-a-moteur.md` (8 tâches TDD, Vitest).
- [x] **BLOC A IMPLÉMENTÉ** (subagent-driven, 8/8 tâches TDD + revue finale opus) : `ros-model.js` + `ros-engine.js` purs, **36/36 tests verts**. Commits `98052a4`→`94d5a50`.
- [x] **Stratégie de merge tranchée** (arbitrage #5) : **1 spec → 1 plan → 1 build**, A+B+C mergés ENSEMBLE une fois build+tests verts. Plus de bloc B/C/D séparés.
- [x] **Brainstorming « rapport défendable » bouclé** (2026-07-16) : Sections A/B/C validées → **spec écrite** `docs/superpowers/specs/2026-07-16-ros-v4-rapport-defendable-design.md` (5 morceaux + migration UI V4 + preuve saisie, dans un bloc unique).
- [x] **Spec validée + plan écrit** (2026-07-16) : `docs/superpowers/plans/2026-07-16-ros-v4-rapport-defendable.md` (10 tâches TDD).
- [x] **BLOC UNIQUE IMPLÉMENTÉ** (subagent-driven, 9 tâches + revue finale opus + polish) : 4 fns pures (`voieScores`/`interpretScore`/`computeActionPlan`/`computeCompleteness`) + `verdict` par palier + traçabilité + compat `fmt`/`SECTORS` ; backend persiste `cells/readings/governance` ; `Assessment.jsx` V4 réécrit ; Dashboard/History 4 dims ; `Companies.jsx` supprimé (code mort) ; page `/rapport` imprimable (`window.print()`+`@media print`). **`npm run build` vert + Vitest 51/51.** Commits `eb19081`→`e50bd74` sur `v4-refonte`. Revue finale opus = **READY TO MERGE**.
- [x] **MERGÉ dans `main`** (2026-07-16) : `--no-ff` → `7e1f50a` ; 51/51 + build verts ; branche `v4-refonte` conservée.
- [x] **DÉPLOYÉ EN PROD** (2026-07-16, `/ros-ship`) : prod `/var/www/ros` pull local FF → `1b587f3`, build vert, `sudo pm2 restart ros-backend` (↺4 online). Vérif : site 200, api 401, /rapport 200, dist à jour, bundle `index-00b82b3f.js`. **Live : https://ros.taraji-conseil.fr**
- [x] **Correction modèle (décisions session 16/07)** appliquée + déployée (`dce733e`) : Banque = SO-2 seul exclu (10 voies, SO-4 réintégré) ; libellé SN-5 → « sanctions de juridictions tierces ». 51/51. → **point ouvert §4 (matrice applicabilité Banque) TRANCHÉ.**
- [x] **Cas CS & Lafarge saisis en prod** (codage hypothétique 16/07, sources vides → sourçage 0 %) : CS ros **24 (Critique)**, Lafarge ros **40 (Faible)** → valide la lecture croisée F11. `/rapport` affiche Credit Suisse (le + récent).
- [x] **Sélecteur d'éval sur `/rapport`** (commit `e84bdfd`, déployé) : menu déroulant listant les évals V4 (défaut = + récente), masqué à l'impression. → CS **et** Lafarge consultables au choix.
- [ ] **Passe de sourçage** (pièces 1-11 du doc session) : transforme les badges, fige les notes citables. Puis re-saisir/mettre à jour les cellules avec `source`.
## 🔵 CHANTIER EN COURS (2026-07-16 midi) — Refonte du module Guide (V4)
Signalé par Naouphel (« le guide n'est pas à jour », « il y a tout à refaire »). **Brainstorming bouclé → spec écrite** : `docs/superpowers/specs/2026-07-16-ros-guide-v4-design.md`.

### Diagnostic (sur pièce)
`Guide.jsx` (476 l., 32,8 Ko) n'importe **rien** de `ros-model.js` → contenu en dur → dérive. Enseigne encore : 5 dims + carte CI, « 30 indicateurs », pondérations sectorielles (`WEIGHTS` supprimé du moteur), `RoS = Σ(Poids×Score)`, normalisation valeur/cible, « si inconnu saisissez 0 » (contre-productif en V4). Absents : règles lin/géom/pénalisée + k, coef gouvernance, complétude, traçabilité, `/rapport`.

### Arbitrages tranchés (16/07)
1. **Deux publics, sections séparées** : mode d'emploi + référentiel défendable (6 sections).
2. **Les 8 justifications manquantes rédigées dans ce chantier** (constat : 3/11 voies seulement portent `justification`+`source` — SI-1, SI-3, SN-5).
3. **Deux registres** : `source` (texte opposable, cité et vérifié) vs `convention` (arbitrage du référentiel, affiché comme tel). Tranché après avoir détecté que le « CA dollar < 10 % » de SD-4 **n'est pas un seuil juridique**.
4. **Maths** : principe + exemple chiffré en clair, formule Mazziotta-Pareto/k/variance dans un bloc repliable.
5. **Architecture A** : dérivation depuis `ros-model.js` + verrou de test + découpe en composants `pages/guide/`.

### État
- [x] Diagnostic complet + cause racine identifiée (contenu en dur, zéro import du modèle).
- [x] Brainstorming : 3 questions de cadrage + 2 sections de design validées par Naouphel.
- [x] **Sources vérifiées sur pièce** (pas de citation de mémoire) : SecNumCloud v3.2 **§19.1.h/19.1.i** (PDF ANSSI ouvert, p. 48) ; Data Act (UE) 2023/2854 chap. VI art. 25-27 ; C. com. L.225-96/L.233-3. Exemple chiffré **exécuté** sur `ros-engine.js` (90/90/20/40 → **44,17**, et non 47 estimé de tête).
- [x] **Les 8 justifications rédigées et validées** par Naouphel (SI-2, SD-3, SD-4, SN-2, SO-1, SO-2, SO-4, SO-5).
- [x] **Spec écrite + self-review** → trouvaille : `ros-model.js` n'a **aucun libellé de dimension** (dupliqués en dur dans 4 pages) → ajout `DIM_META` au modèle, sinon le principe « aucun fait dans le Guide » est mort-né.
- [x] **Spec validée par Naouphel** (17/07) — gate franchi.
- [x] **Plan d'implémentation écrit** : `docs/superpowers/plans/2026-07-17-ros-guide-v4.md` (**9 tâches TDD**, tranches verticales → build vert à chaque tâche). Verrou d'abord (T1 : échoue 3/11 → 8 justifications → vert), `DIM_META` (T2), puis 1 section par tâche (T3-T8), DoD final (T9).
- [x] **GUIDE V4 IMPLÉMENTÉ** (17/07, branche `guide-v4`, 9 tâches subagent-driven) : verrou `guide-model.test.js` **11/11 voies justifiées** ; `DIM_META` ; `Guide.jsx` 476 l. → **coquille 39 l.** ; 6 sections dérivées dans `pages/guide/`. **DoD 6/6 vert** : 57/57 tests, build ✓, greps anti-v3 et anti-fait-en-dur à **0**. Commits `57b49ed`→`6dfdc74`.
  - 2 écarts trouvés **par l'exécution** : (a) spec §4 affirmait à tort que SI-3/SN-5 avaient une `source` → 2 conventions rédigées + validées Naouphel 17/07 ; (b) grep DoD bannissait `threshold` nu → rendait la dérivation invalidable, corrigé en `threshold: `.
- [x] **Vérif visuelle `/guide`** (18/07, puppeteer headless + auth-bypass localStorage) : 6 sections rendues, **0 erreur JS**, **0 fait v3** (grep vide), exemple chiffré **90/90/20/40 → 44.17** = moteur. Screenshots `tasks/screenshots/05-guide-*.png`.
- [x] **MERGÉ `guide-v4` → `main`** (18/07, `--no-ff` → `a3673fe`, 2 parents) + **DÉPLOYÉ EN PROD** (pull local FF `e84bdfd`→`a3673fe`, build bundle `index-f4c4a4ab.js`, pas de restart backend). Preuve : site 200, api 401, dist à jour, pm2 online. **Guide V4 live.** → **point 2 « Guide.jsx obsolète » CLOS.**
- [x] **Sidebar V4** (20/07, `81b44fc`, déployé prod bundle `index-5f214fda.js`) : badge `5 DIM`→`4 DIM` et `v3.0`→`v4.0` **dérivés du modèle** (`DIMENSIONS.length` + nouvelle const `MODEL_VERSION`). Fin du leftover v3 signalé par Naouphel. Preuve visuelle `tasks/screenshots/06-sidebar-v4.png` + prod 200. 57/57.
- [ ] (follow-up cosmétique, distinct) Migration `DIM_META` de Dashboard/Report/Assessment (§11) — libellés de dimension encore en dur dans ces 3 pages (la sidebar, elle, est faite).
- [ ] Follow-ups spec §11 : migrer Dashboard/Report/Assessment vers `DIM_META` (cosmétique, ne pas déployer seul) ; passe de sourçage des cellules CS/Lafarge.
- [ ] **Vérif visuelle manuelle** : page `/rapport` (Ctrl+P) + saisie V4 — via `/run` ou côté Naouphel.
- [ ] (option) Seed traçabilité plus large (aujourd'hui 1/11 voies sourcées) avant soutenance.

## Décision (2026-06-23) — App mobile native : ABANDONNÉE
Conseil LLM (5 advisors + revue croisée) → verdict unanime : **pas de natif, garder la PWA.**
Raisons : usage de bureau périodique (pas nomade), moteur en double = risque de divergence sur un
outil d'audit adossé au mémoire MBA, coût de maintenance store/EAS pour un dev solo.
Choix utilisateur : le natif visait un **usage outil de travail** (pas une démo de soutenance) → le verdict s'applique.

Contrôle de parité fait : `ros-engine.js` (web) et `mobile/src/scoring.ts` sont **logiquement identiques**
(mêmes WEIGHTS, cibles, indicateurs inverses, computeScores). Rien à rapatrier.

### Plan d'archivage (DIFFÉRÉ — choix user : laisser mobile/ en place pour l'instant)
- [ ] (différé) Archiver `mobile/` sur branche `archive/expo`
- [ ] (différé) Retirer `mobile/` de l'arbre de travail
- [x] `ros-engine.js` = moteur unique officiel (parité vérifiée, scoring.ts identique)
- [ ] Vérifier l'install PWA sur iPhone + Android réels (test manuel utilisateur)

## Refonte CSS web — FAIT (commit a64aa20, 2026-06-23)
`frontend/src/index.css` (+238/-83) : thème sombre + accent bleu, tokens spacing/radius,
ombres, animations (fadeIn/slideUp/scoreGlow/modalIn…). 1 base → web + PWA + Electron.
Validé visuellement (screenshots login/dashboard/assessment/mobile dans tasks/screenshots/).
- [ ] Déployer en prod (/var/www/ros via /ros-ship) — en attente feu vert user.

## Décision tech (2026-06-23) — ROS reste DÉTERMINISTE
Pas de framework d'agents IA (VoltAgent évalué et écarté pour ROS) : ROS = moteur de calcul
déterministe + CRUD + viz, aucune surface agentique. Si un jour une couche IA est voulue
(diagnostic rédigé, saisie assistée), ce sera un **appel Claude direct** (SDK Anthropic), pas un
framework multi-agents. VoltAgent est réservé à OBOXIA (10 agents coordonnés).

## Notes
- PWA = stratégie mobile officielle (manifest.json présent dans frontend/public + dist)
- Electron charge la build web (electron/main.js) → desktop = web, pas de code séparé
