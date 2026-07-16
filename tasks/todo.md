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
- [ ] **Follow-up avant soutenance** (Important, hors périmètre) : `Guide.jsx` enseigne encore l'ancien modèle 5 dims/CI/30 indicateurs → aligner sur 4 dims/11 voies.
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
