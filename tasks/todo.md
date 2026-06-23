# ROS — tâches en cours

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
