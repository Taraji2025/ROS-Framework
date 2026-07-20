# Spec — ROS Visual Refresh · Direction C « Éditorial premium »

- **Date** : 2026-07-20
- **Auteur** : Naouphel (+ Claude)
- **Statut** : design validé en brainstorming (direction + périmètre tranchés en compagnon visuel), en attente de relecture spec.
- **Contexte** : ROS v4 est en prod (`ros.taraji-conseil.fr`), outil d'audit adossé au mémoire MBA EGE / soutenance. Naouphel veut un rendu « plus beau, plus dynamique ». Après maquettes comparatives (3 directions), **Direction C — Éditorial premium** retenue (sobre, profondeur mesurée, typo forte, micro-motion), écartant la 3D volumétrique (risque gadget devant un jury) et le néon (idem).

## 1. Objectif

Rehausser la qualité visuelle de ROS avec un langage **« éditorial premium »** (vibe Linear/Vercel) : profondeur en couches, typographie affirmée, barres d'accent dégradées, micro-animations **au chargement**, radar animé. Le tout **défendable en soutenance** (aucun effet gadget), **léger** (VPS 8 Go, aucune dépendance ajoutée), et **sans toucher au moteur** (présentationnel pur).

## 2. Décisions verrouillées (brainstorming)

1. **Langage = Direction C** (éditorial premium). Pas de 3D (three.js), pas de néon permanent.
2. **Périmètre direct = 2 surfaces de soutenance** : `Dashboard.jsx` + `Report.jsx` (`/rapport`).
3. **Héritage** : le reste (Guide, Évaluation, Historique, Admin, Login) hérite du nouveau langage **via les tokens + classes partagés de `index.css`**, sans refonte page-à-page dans cette passe.
4. **Zéro dépendance nouvelle** : motion en CSS pur + animations natives de chart.js (déjà installé : `chart.js` + `react-chartjs-2`).
5. **Moteur intact** : `ros-engine.js` / `ros-model.js` non modifiés. Les fonctions déjà exportées sont réutilisées, pas réécrites.
6. **Parité thèmes** : light **et** dark (l'app a déjà `[data-theme]`).
7. **Motion responsable** : `@media (prefers-reduced-motion: reduce)` coupe toutes les animations.
8. **Disclaimer académique** (ajout 2026-07-20) : mention permanente **discrète partout** + **explicite sur `/rapport`**. **Vrais noms d'entreprises conservés** (CS/Lafarge) — le disclaimer + l'auth suffisent (arbitrage de risque tranché).

## 3. Non-objectifs (hors périmètre de cette passe)

- Refonte fonctionnelle ou de contenu (aucune donnée, aucun calcul modifié).
- Migration `DIM_META` de Dashboard/Report/Assessment (§11 de la spec Guide — chantier distinct, cosmétique).
- Passe de sourçage (chantier parké séparément).
- Ajout de pages ou de graphes nouveaux ; refonte individuelle de Guide/Éval/Historique.

## 4. Architecture — pilotée par les tokens

Fichier épicentre : **`frontend/src/index.css`**. Tout le langage visuel y vit sous forme de tokens `:root` (+ overrides `[data-theme="light"]`) et de **classes réutilisables**. Dashboard.jsx et Report.jsx ne font que consommer ces classes ; les autres pages en héritent mécaniquement.

Fichiers touchés :
- `frontend/src/index.css` — tokens + classes partagées (cœur).
- `frontend/src/pages/Dashboard.jsx` — markup/classes (hero, radar, dims, plan d'action).
- `frontend/src/pages/Report.jsx` — markup/classes + garde `@media print`.
- (radar) options chart.js re-thémées, in-place dans ces 2 pages.

## 5. Unités

### 5.1 Tokens & fondations (`index.css`)
- **Élévation** : jeu d'ombres en couches (`--elev-1/2/3`) remplaçant les ombres plates actuelles ; profondeur mesurée (pas de drop-shadow criard).
- **Accent** : `--accent-grad: linear-gradient(180deg, var(--dim1), var(--dim4))` (SI→SO) pour les barres d'accent.
- **Typo** : échelle de titres plus affirmée (poids 700-800, `letter-spacing` négatif léger sur les gros titres).
- **Motion** : `--motion-fast/med` (durées) + easings partagés.
- **Nettoyage** : retrait du token résiduel `--dim5` (V4 = 4 dimensions ; `--dim1..4` seuls conservés). Vérifier qu'aucune classe `dim-5` n'est référencée avant retrait.
- **Parité light** : chaque nouveau token a sa valeur sous `[data-theme="light"]`.

### 5.2 Classes partagées (héritage global)
- `.card` : version éditoriale (bord `--border` + `--elev-1` + léger *lift* `translateY(-3px)` au survol via `--motion-fast`).
- `.accent-bar` : rail vertical gauche en `--accent-grad`.
- `.stat-num` : grand chiffre, animation `rise` (fade + translate) au montage.
- `.chip-level` : pastille de palier (couleur dérivée de `rosLevel().color`).
- `.track` / `.track > i` : barre de progression dont le remplissage s'anime (`@keyframes fill` de 0 → largeur).
- Toutes ces classes vivant dans `index.css`, les pages non retouchées en bénéficient dès qu'elles utilisent `.card` etc. (déjà le cas).

### 5.3 `Dashboard.jsx`
- **Panneau héro** : `.accent-bar` + `.stat-num` (score `Math.round(last.scores.ros)`) + `.chip-level` (palier via `rosLevel`) + **phrase de verdict** via `interpretScore(last)` (fonction moteur existante, aujourd'hui non utilisée ici → on la branche).
- **Radar** : re-thématisé (grille, points, remplissage tirés des tokens), **animation native chart.js** activée (durée depuis `--motion-med`).
- **4 cartes dimension** : `.card` + `.track` animée (SI/SD/SN/SO, couleurs `dim-1..4`).
- **Plan d'action prioritaire** : liste via `computeActionPlan(last)` (fonction moteur existante, déjà utilisée dans Report → on la branche aussi ici), top 3 « écart au max ».
- **État vide** (aucune évaluation) : stylé dans le même langage (pas d'écran nu).

### 5.4 `Report.jsx` (`/rapport`)
- Même langage à l'écran (hero, radar thématisé, dims, plan).
- **Garde impression** : `@media print` — motion coupé, ombres simplifiées/retirées, fonds forcés lisibles sur papier, `.no-print` conservé sur les contrôles. Le rendu papier reste net (le rapport est l'artefact jury).

### 5.5bis Disclaimer académique
- **Partout (discret)** : mention permanente sobre, ex. pied de sidebar ou footer — « Prototype académique · Mémoire MBA EGE ». Stylée dans le langage C (ne casse pas le rendu premium).
- **`/rapport` (explicite)** : encart visible à l'écran **et à l'impression** (`@media print` le conserve) — « Les scores reposent sur un codage hypothétique non sourcé et ne constituent pas une évaluation réelle des entreprises citées. »
- **Source unique** : texte du disclaimer factorisé (constante partagée) pour éviter la double rédaction / dérive.
- **Vrais noms conservés** (décision de risque). Pas d'anonymisation en base.

### 5.6 Motion responsable
- Animations **au chargement** (rise, draw, fill) + transitions **au survol** uniquement. Aucun effet en boucle permanente.
- Bloc `@media (prefers-reduced-motion: reduce)` neutralisant toutes les animations/transitions.

## 6. Flux de données

Inchangé. 100 % présentationnel. Les scores/lectures viennent déjà de l'API + du moteur. Aucune nouvelle route, aucun champ de données, aucun recalcul.

## 7. Cas limites

- **Aucune évaluation** : état vide stylé (Dashboard + Report).
- **Score partiel / complétude < 100 %** : le badge de complétude existant reste ; pas de régression.
- **Thème light** : tous les tokens ont leur pendant clair.
- **Impression** : couvert par `@media print`.
- **Reduced motion** : couvert par le media query dédié.

## 8. Test & DoD

- [ ] `npm run build` **vert**.
- [ ] **Vitest 57/57 inchangés** (aucune logique touchée → non-régression).
- [ ] **Preuve visuelle puppeteer** (headless, auth-bypass localStorage comme pour le Guide) : captures **Dashboard** et **/rapport**, en **dark + light**, plus une capture **rendu impression** de `/rapport` (media print). Avant/après archivées dans `tasks/screenshots/`.
- [ ] Grep : **aucune référence `--dim5` / `dim-5`** restante.
- [ ] **Disclaimer présent** : discret sur l'app (dark + light) **et** encart explicite sur `/rapport` **visible à l'impression** (capture print le prouve).
- [ ] Vérif manuelle possible via `/run` (Dashboard + Ctrl+P sur /rapport).

## 9. Risques

- **Régression d'impression `/rapport`** (motion/ombres sur papier) → mitigé par `@media print` testé en capture.
- **Contraste light theme** insuffisant sur les nouveaux dégradés → vérifié en capture light.
- **Perf VPS** : négligeable (CSS + animations natives, aucune lib).

## 10. Livraison

Une passe cadrée (cohérente avec « travail de forme plafonné, un passage ») : 1 spec → 1 plan → 1 build → déploiement via `/ros-ship` après preuve visuelle + DoD vert. Branche dédiée `visual-refresh`.
