# Handoff — ROS (Return on Sovereignty)

> État de reprise rapide. Détail des tâches dans `tasks/todo.md`, leçons dans `tasks/lessons.md`.

## ⏸️ REPRISE EN COURS (2026-06-23) — Brainstorming « diagnostic défendable »

**Où on en est :** en plein skill `superpowers:brainstorming` pour concevoir une nouvelle feature ROS. On a fait passer les idées par le **conseil LLM** (5 conseillers + revue croisée). Naouphel a **choisi le bundle « diagnostic défendable »** (reco du conseil). On commençait les questions de cadrage (1 à la fois) quand il a dû partir.

**Prochaine action à la reprise :** finir les questions de cadrage → présenter le design par sections → écrire la spec dans `docs/superpowers/specs/2026-06-23-ros-diagnostic-defendable-design.md` → self-review → validation user → `superpowers:writing-plans`. **HARD-GATE brainstorming : aucun code avant design validé.**

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
