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
- [ ] **EN COURS : exécuter le bloc A** (T0 Vitest → T7 lectures). Puis plans B/C/D.
- [ ] Blocs B (saisie), C (restitution), D (annexes) — plans à écrire après stabilisation des interfaces de A.

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
