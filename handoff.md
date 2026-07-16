# Handoff — ROS (Return on Sovereignty)

> État de reprise rapide. Détail des tâches dans `tasks/todo.md`, leçons dans `tasks/lessons.md`.

## ✅ V4 EN PRODUCTION (2026-07-16) — https://ros.taraji-conseil.fr

**État vérifié le 2026-07-16 12:00** : prod `/var/www/ros` sur `e84bdfd` (dev `main` = `07f545d`, docs uniquement → prod à jour côté code). Site 200, `/rapport` 200, API 401 (auth normale). Backend pm2 **root** (`sudo pm2 restart ros-backend`).

**Livré et déployé depuis le merge V4 (`7e1f50a`) :**
- `8aaace4` déploiement V4 en prod + leçon cache nginx (`no-cache` sur `index.html`, cf. `tasks/lessons.md`).
- `dce733e` correction modèle : Banque = **SO-2 seul exclu** (10 voies, SO-4 réintégré) ; libellé SN-5 → « sanctions de juridictions tierces ». → **point ouvert §4 (matrice applicabilité Banque) TRANCHÉ.**
- Cas **Credit Suisse (ros 24, Critique)** et **Lafarge (ros 40, Faible)** saisis en prod — codage hypothétique, sources vides → **sourçage 0 %**.
- `e84bdfd` sélecteur d'évaluation sur `/rapport` (défaut = la + récente, masqué à l'impression) → CS et Lafarge consultables au choix.

**➡️ RESTE À FAIRE (par ordre d'enjeu soutenance) :**
1. **Passe de sourçage** (pièces 1-11 du doc de session) — transforme les badges 0 %, fige les notes citables, puis re-saisir les cellules avec `source`. *C'est le gros morceau restant.*
2. **`Guide.jsx` obsolète** : enseigne encore l'ancien modèle 5 dims/CI/30 indicateurs → aligner sur 4 dims/11 voies.
3. **Vérif visuelle manuelle** : `/rapport` (Ctrl+P) + saisie V4 — via `/run` ou côté Naouphel.
4. (option) Élargir le seed traçabilité (1/11 voies sourcées aujourd'hui).

---

## Historique — Refonte V4 (branche `v4-refonte`, mergée)

### 🔵 MISE À JOUR (2026-07-15 soir) — CADRAGE V4 DU BUNDLE 5-MORCEAUX BOUCLÉ (brainstorming en cours)

**Reprise du fil Q1/5 parké.** Brainstorming du bundle « rapport de souveraineté défendable ». **6 arbitrages tranchés** (à ce jour écrits SEULEMENT ici — pas encore de spec) :

1. **Justif « pourquoi la cible/le barème »** = propriété du **RÉFÉRENTIEL**, écrite 1× par les auteurs, versionnée dans `ros-model.js` comme métadonnée `{justification, source}` sur les **24 indicateurs** (Voies → documente le *barème* bands/steps ; Maturité/Influence → documente la *cible* `target`). Identique pour toutes les entreprises. Tue le doublon cible-en-dur / cible-en-prose.
2. **Preuve de la valeur saisie** (par l'évaluateur, par indicateur) = structuré léger **`{source, note}` + `date` auto-horodatée** à la saisie. À ajouter au schéma `storage.json` (aujourd'hui : valeurs seules).
3. **Complétude « publiable »** = ⟺ **toutes les Voies applicables remplies** (Standard/Industrie/Énergie : 11/11 ; Banque/Tech : 9/9). Maturité/Influence = bonus non bloquant. (Le seuil v3 « 4/6 par dim » est CADUC : V4 = 4 dims, score porté par les 11 Voies seules, réparties SI=3/SD=2/SN=2/SO=4.)
4. **Export PDF** = page React `/rapport` + CSS `@media print` + `window.print()`. Zéro dépendance serveur (VPS 8 Go, backend store-only). Prix = soigner pagination + impression radar.
5. **Livraison** = **1 spec → 1 plan → 1 gros build** (pas de livraison intermédiaire, choix Naouphel). ⇒ tranche la stratégie de merge : **A+B+C mergés ENSEMBLE** une fois build vert + tests verts.
6. **Correction structure V4 vérifiée sur `ros-model.js`** : 4 dims (SI/SD/SN/SO, CI fusionné) ; 3 familles jamais additionnées **Voies 11 (score) / Maturité 8 / Influence 5 (lectures hors score)** ; **poids ÉGAUX** (pas de pondération custom → morceau #2 = tri « écart au max », pas « poids×écart »).

**Périmètre du bloc unique (Section A du design, présentée, EN ATTENTE DE VALIDATION Naouphel) :** backbone `ros-model.js` + saisie V4 `Assessment.jsx` (ex-bloc B) + réparation des 4 pages v3 cassées (Dashboard/History/Admin/Companies, sans shim) + les 5 morceaux. Nouvelles fonctions pures visées dans `ros-engine.js` : `interpretScore()` (verdict + top3/flop3), `computeActionPlan()` (tri écart au max), `computeCompleteness()` (gate Voies).

**✅ FAIT (2026-07-16 matin) :** brainstorming repris, **Sections A/B/C validées** par Naouphel une à une → **spec écrite + self-review** : `docs/superpowers/specs/2026-07-16-ros-v4-rapport-defendable-design.md`. Contrat moteur & comptages re-vérifiés sur pièce (exports `ros-engine.js` ; VOIES 11 / MATURITE 8 / INFLUENCE 5 ; `justification`/`source`/`verdict` **absents** de `ros-model.js` → ajouts de cette spec). **Aucun fichier code touché.**

**✅ FAIT (2026-07-16) :** spec validée → plan 10 tâches → **BLOC UNIQUE IMPLÉMENTÉ de bout en bout** (subagent-driven : 9 tâches TDD chacune revue + revue finale de branche opus + polish). Livré : 4 fns pures (`voieScores`/`interpretScore`/`computeActionPlan`/`computeCompleteness`) + `verdict` par palier (`ros-model.js`) + seed traçabilité + compat `fmt`/`SECTORS` ; backend persiste `cells/readings/governance` ; `Assessment.jsx` réécrit V4 (voies cat/num + preuve + gouvernance + complétude) ; Dashboard/History passés à 4 dims ; `Companies.jsx` supprimé (code mort multi-entreprise) ; **nouvelle page `/rapport`** imprimable (5 morceaux + `window.print()` + `@media print`). **`npm run build` VERT + Vitest 51/51.** Ledger : `.superpowers/sdd/progress.md`. Commits `eb19081`→`e50bd74` sur `v4-refonte`. **Revue finale opus = READY TO MERGE** (0 Critical ; 2 Important non bloquants = Guide.jsx obsolète + Companies supprimé-vs-réparé ; 4 Minor déjà corrigés en `e50bd74`).

**✅ MERGÉ dans `main` (2026-07-16)** : `--no-ff` → commit de merge `7e1f50a` ; tests 51/51 + build verts sur `main` ; branche `v4-refonte` (tip `8915f80`) conservée. **→ Puis déployé en prod le même jour (`8aaace4`), cf. section du haut.**

---

**Où on en est :** Specs V4 validées → brainstorming (5 arbitrages) → **design** (`docs/superpowers/specs/2026-07-11...` → en fait `2026-07-15-ros-v4-refonte-design.md`) → **plan bloc A** (`docs/superpowers/plans/2026-07-15-ros-v4-bloc-a-moteur.md`) → **BLOC A IMPLÉMENTÉ** en subagent-driven (8 tâches TDD, chacune revue) + **revue finale de branche (opus)**. Résultat : moteur v4 pur = `frontend/src/ros-model.js` + `frontend/src/ros-engine.js`, **36/36 tests verts** (Vitest). Ledger : `.superpowers/sdd/progress.md`. Commits `98052a4`→`94d5a50` sur `v4-refonte`.

**⚠️ ÉTAT BRANCHE : `npm run build` est CASSÉ** (attendu) — les 5 pages v3 (Dashboard/Assessment/History/Admin/Companies) importent encore `computeScores`/`fmt`/`WEIGHTS`/`SECTORS` supprimés de `ros-engine.js`. **NE PAS déployer / merger vers `main` avant les blocs B/C.** Décision de stratégie de merge en suspens (garder la branche jusqu'à B+C / merger A+B+C ensemble / shims de compat).

**Garde-fou bloc B :** `computeAssessment` ne renvoie **PAS** les lectures Maturité/Influence — elles sont dans `computeReadings(cells)` (fonction sœur). Restitution complète = `computeAssessment` + `computeReadings`. Contrat public du moteur : `scoreCell, aggregate, computeDimension, governanceCoef, computeGlobal, computeAssessment, computeReadings, rosLevel` + données `VOIES, MATURITE, INFLUENCE, PROFILES, DIMENSIONS, RULES, K_VALUES, LEVELS`.

**Prochaine action à la reprise :** décider la stratégie de merge (ci-dessus) ; puis `writing-plans` pour le **bloc B (saisie `Assessment.jsx`)** sur le contrat moteur figé. Les 4 points ouverts §9 (Influence 5/7, matrice applicabilité, barèmes Maturité/Influence, PoC) restent amendables — tout est encodé comme défaut corrigeable dans `ros-model.js`.

**Résumé technique V4 :** 3 familles jamais additionnées (Voies 11=score / Maturité 8 / Influence 5 / −4 sortis) ; agrégation 2 niveaux non-compensatoire sous 3 règles (lin/géom/**pénalisée Mazziotta-Pareto**) × k∈{1,2,3} ; profils = applicabilité seule + poids égaux ; coef gouvernance ×0,70-1,00 ; cellule = valeur + preuve {source,date,note} ; nouveau module `ros-model.js` (source unique) + `ros-engine.js` réécrit pur. Backend quasi inchangé (store-only). Migration triviale (2+2 évals v3 archivées, non recalculables).

**La question en suspens (Q1/5) :** d'où vient le contenu des *sources/justifications* des cibles et pondérations (« pourquoi 80 ? »). Naouphel a voulu **clarifier la question** avant de répondre — reprendre par : « qu'est-ce que tu veux clarifier ? ». Les 4 questions de cadrage restantes prévues : (2) seuil de complétude « non publiable » ; (3) champ preuve par indicateur = texte libre ou structuré {source, date, note} ; (4) PDF via `window.print()`+CSS print vs Puppeteer ; (5) confirmer livraison incrémentale des 5 morceaux.

### Le bundle retenu (5 morceaux, à concevoir comme un ensemble cohérent)
1. **Sens du chiffre** : bandeau niveau RoS + verdict en mots + **top3/flop3 contributeurs**. (`rosLevel()` existe déjà ; manque la phrase d'interprétation.)
2. **Plan d'action priorisé** : `computeActionPlan()` = trier indicateurs par **poids × écart au max**.
3. **Traçabilité** : source + justification par cible/pondération + champ **preuve/commentaire par indicateur**.
4. **Indice de complétude** : score « partiel / non publiable » sous un seuil (X/30 remplis).
5. **Export PDF** rapport de soutenance (radar + score + verdict + top/flop).
+ **Méta (hors feature, chantier mémoire)** : la *validité externe* — angle mort raté par les 5 conseillers (le score corrèle-t-il à un fait réel ? fidélité inter-évaluateur ? trajectoire dans le temps ?). À traiter comme section du mémoire/rapport.

### Découvertes code (vérifiées sur pièce — à réutiliser pour la spec)
- **Cibles en double** : codées en dur dans `ros-engine.js` (`computeScores`, ex. `norm(g('si1'),80)`) **ET** en prose dans les `hint` de `DIMS` (`pages/Assessment.jsx`). Aucune source attachée. → **Backbone du design : créer une source unique de vérité par indicateur** (métadonnées {id, code, label, dimension, target, isReverse/qual, type, source, justification, scénario de risque}) consommée par le moteur + l'affichage. Tue le doublon, débloque #1/#2/#3.
- `avg()` (ros-engine.js) **ignore les nulls** → score complet possible avec 3/30 indicateurs (trou réel → #4 complétude).
- `rosLevel(v)` existe : 5 paliers (`<30 Critique`, `<50 Faible`, `<65 Moyen`, `<80 Élevé`, `≥80 Souverain`) avec label+couleur.
- `computeScores` renvoie déjà les **sous-scores par indicateur** (arrays si/sd/sn/so/ci) → top/flop et plan d'action s'appuient dessus.
- `DIMS` (Assessment.jsx) = métadonnées riches par indicateur (id, code, label, hint, min/max, qual).
- Schéma assessment (storage.json) : `{id, period, sector, scores:{SI,SD,SN,SO,CI,ros}, indicators:{si1..ci6}}` — **pas** de champ preuve/notes (à ajouter pour #3).
- **ROS reste déterministe** (décision actée) : tout ça est du calcul déterministe + frontend, pas d'IA.

### Verdict du conseil (résumé)
- **Accord** : donner du sens au chiffre ; boussole d'action (poids×écart) ; défendabilité (sources) ; artefact PDF.
- **Clash** : l'Expansionniste voulait **sortir du mono-entreprise** (benchmark/SaaS/baromètre) → **écarté** (contrainte de confidentialité non négociable), les 5 relecteurs l'ont signalé comme le plus gros angle mort. SEULE idée upside compatible retenue : **simulateur de bascule contrefactuel** (« si je rapatrie ce SaaS US : +7 ») — candidate bonus.
- **Raté collectif** : la validité externe (cf. méta ci-dessus).

## Le projet en une phrase
Framework d'audit de souveraineté d'entreprise (RoS v3.0) — 5 dimensions, 30 indicateurs, **mono-entreprise**. React+Vite / Express / stockage JSON. Adossé au mémoire CRO 3.0 (EGE 2025-2026).

## Déploiement (rappel)
- **2 clones** : dev `/home/Felfool/ros`, prod `/var/www/ros`.
- Prod servie sur `https://ros.taraji-conseil.fr`, backend pm2 `ros-backend` (port 3003).
- Déploiement via le skill **`/ros-ship`** — jamais sans feu vert explicite.

## État actuel (2026-06-23)
- ✅ **Refonte CSS web déployée en prod** : thème sombre + accent bleu, tokens spacing/radius, animations. Validée visuellement (`tasks/screenshots/`).
- ✅ **Mobile natif abandonné** → la PWA est la stratégie mobile officielle (parité moteur vérifiée). `mobile/` laissé en place (archivage différé).
- ✅ **ROS reste déterministe** : pas de framework d'agents (VoltAgent écarté, réservé à OBOXIA).
- ✅ **Auth GitHub** : token `ghp_` en clair retiré des remotes, git branché sur le credential helper de `gh` (token `gho_`, compte `Taraji2025`). `git push` fonctionne sans secret en clair. (Reste à révoquer l'ancien `ghp_` côté GitHub.)

## Comptes (storage.json prod, hash bcrypt)
- `admin` (admin) · `Naouphel` (admin) — **mots de passe inconnus/non récupérables** (changés du défaut `admin123`). Pour en retrouver l'accès → réinitialiser via script bcrypt + sauvegarde.
- `demo` / `demoros` (rôle **analyst**) — **compte de démo / pédagogique** créé le 2026-06-23. Voit Dashboard/Évaluation/Historique/Guide, **pas** l'Admin. **À SUPPRIMER après le cours** (via Admin > utilisateurs, ou script). Sauvegarde avant ajout : `backend/data/storage.json.bak.1782214256942`.

## Prochaines étapes ouvertes
1. **Révoquer** l'ancien token GitHub `ghp_XZtq…` sur https://github.com/settings/tokens (a fuité).
2. Supprimer le compte `demo` après le cours.
3. Tester l'install PWA sur iPhone + Android réels (manuel, côté Naouphel).
4. (Différé) Archiver `mobile/` sur branche `archive/expo` + le retirer de l'arbre.

## Pièges à NE PAS refaire
- Ne pas réintroduire le multi-entreprise (contrainte de confidentialité).
- Toute logique de score → `frontend/src/ros-engine.js` uniquement, jamais inline.
- Toujours rebuilder le frontend après modif React, avant d'annoncer la fin.
- Ne pas toucher `backend/data/storage.json` à la main.
