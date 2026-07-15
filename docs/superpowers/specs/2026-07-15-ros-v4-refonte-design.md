# RoS v4 — Design de la refonte d'architecture

**Statut :** DESIGN — en attente de relecture Naouphel avant plan d'implémentation.
**Date :** 15 juillet 2026 · **Branche :** `v4-refonte`
**Sources of truth :** *Spécification RoS v4* (validée 15/07) + *Grille de codage OSINT RoS v4 v2* (15/07). En cas de doute, ces deux documents priment sur ce design.
**Remplace :** le moteur v3 (`ros-engine.js` v3.0), les métadonnées `DIMS` (Assessment.jsx) et le Guide v3.

---

## 0. Objet de ce document

La spec v4 (produit) est validée. Ce document conçoit **comment le code l'implémente** : architecture des modules, modèle de données, pipeline de calcul, restitution, migration. Il ne rejuge pas les décisions de la spec produit ; il les traduit en design logiciel testable.

**Ce que v4 change fondamentalement vs v3 :**
- v3 = 30 indicateurs jetés dans une **somme pondérée linéaire**. v4 = **3 familles jamais additionnées**, seule la famille *Voies* (11 indicateurs) produit le score.
- v3 = agrégation linéaire en dur. v4 = **3 règles publiées en parallèle** (linéaire / géométrique / pénalisée Mazziotta-Pareto), **non-compensatoires**, testées sous k∈{1,2,3}.
- v3 = poids sectoriels différenciés. v4 = **poids égaux**, les profils diffèrent par **applicabilité**.
- v3 = coefficient de gouvernance appliqué à la main hors outil. v4 = **implémenté**, multiplicateur 0,70–1,00.
- v3 = une valeur par cellule. v4 = **cellule = valeur + preuve {source, date, note}**.

---

## 1. Décisions de cadrage actées (session 15/07)

| # | Décision | Choix retenu |
|---|---|---|
| D-A | Découpage | **Une spec globale** (ce document) → plan d'implémentation **phasé** (A moteur → B saisie → C restitution → D annexes). |
| D-B | Niveau d'agrégation | **Deux niveaux, non-compensatoire à chaque maillon** : voies → dimension (règle choisie), puis dimensions → global (même règle + poids de profil). Justifié par §3 (la voie casse la chaîne), §7 (le « géométrique → 0 » n'est vrai que si le 0 est un facteur direct) et D2/D3 (poids + couverture par dimension). |
| D-C | Score titre | **Pénalisée Mazziotta-Pareto** en chiffre principal, **k challengé dans la restitution** (k∈{1,2,3} exposé en direct, pas seulement en annexe). Linéaire + géométrique affichées à côté pour la robustesse. |
| D-D | Profils sectoriels | **Applicabilité seule, poids égaux** entre dimensions applicables pour tous les profils. Élimine le jugement subjectif non calibré (Munda/D4). |
| D-E | Traçabilité | **Structuré {source, date, note} par cellule, tout optionnel** + badge *sourcé / non sourcé* + **taux de sourçage global**. |

---

## 2. Architecture des modules

**Principe backbone : une source unique de vérité.** Aujourd'hui le modèle est recopié 3 fois (`ros-engine.js` cibles en dur · `DIMS` dans `Assessment.jsx` · tout `Guide.jsx` à la main). v4 le centralise.

| Fichier | Statut | Rôle |
|---|---|---|
| `frontend/src/ros-model.js` | **NOUVEAU** | Source unique : les indicateurs avec métadonnées complètes, les profils (matrice d'applicabilité), les critères de gouvernance, les 5 paliers `rosLevel`. Aucune logique de calcul — que de la donnée. |
| `frontend/src/ros-engine.js` | **RÉÉCRIT** | Fonctions **pures** consommant `ros-model.js`. Aucune donnée en dur. Testable en isolation totale. |
| `frontend/src/pages/Assessment.jsx` | Réécrit | Formulaire de saisie dérivé de `ros-model.js` (par famille), saisie preuve + gouvernance + mode. |
| `frontend/src/pages/Dashboard.jsx` | Réécrit | Restitution v4 (3 lignes, robustesse, couverture). |
| `frontend/src/pages/History.jsx` | Adapté | Colonnes/tendance dérivées du nouveau snapshot. |
| `frontend/src/pages/Guide.jsx` | Réécrit | Dérive de `ros-model.js` — ne se périmera plus. |
| `frontend/src/pages/Companies.jsx` | **SUPPRIMÉ** | Code mort (non routé, contredit le mono-entreprise). |
| `frontend/src/api.js` | Inchangé | Passe-plat. |
| `backend/server.js` | Micro-patch | Seul `/api/stats` référence `scores.ros` → adapter au nouveau snapshot. Reste store-only. |

**Interface publique de `ros-engine.js` (contrat) :**
```
scoreCell(indicatorId, cell)      → 0-100 | null      // via barème
aggregate(values[], rule, k)      → 0-100 | null      // rule ∈ {linear, geometric, penalized}
computeAssessment(assessment)     → résultat complet (cf. §5)
governanceCoef(governance)        → 0.70-1.00
rosLevel(v)                       → { label, color, cls }
```

---

## 3. Les indicateurs (contenu de `ros-model.js`)

**Comptage** : 30 v3 − 4 sortis (SD-1, SI-4, SI-5, SO-3) = **26 codes hérités**. Après fusion des doublons Influence (§3.3), **24 mesures distinctes** = 11 voies + 8 maturité + 5 influence (contingent au point ouvert §9.1).

### 3.1 Famille VOIES — 11 indicateurs → produisent le score

Barèmes issus de la grille OSINT v4. Chaque voie porte : `{id, code, label, dimension, sens, barème[], sources[], codabilite, applicabilite}`.

| Code | Dim | Libellé | Barème (paliers → score) |
|---|---|---|---|
| SI-1 | SI | Contrôle des données critiques | souverain qualifié→100 · UE hors qualif→60 · US « région Europe »→30 · full US→0 |
| SI-2 | SI | Réversibilité cloud | réversibilité contractuelle + multi-cloud→100 · multi-cloud sans clause→50 · mono-cloud→0 |
| SI-3 | SI | Dépendance tech étrangère *(inv.)* | <20 %→100 · 20-40→60 · 40-70→30 · >70→0 |
| SD-3 | SD | Exposition capitalistique du conseil | <10 %→100 · 10-25→70 · 25-50→30 · >50→0 |
| SD-4 | SD | Exposition clauses extraterritoriales *(inv.)* | aucune + CA$ <10 %→100 · exposition citée→50 · procédure/monitorship→10 |
| SN-2 | SN | Normes subies vs influencées *(inv.)* | présente aux comités clés→100 · via fédération→50 · absente→0 |
| SN-5 | SN | Sanctions extraterritoriales *(inv.)* | 0 % CA→100 · <0,5 %→70 · 0,5-5 %→30 · >5 %→0 |
| SO-1 | SO | Diversification fournisseurs critiques | aucune dépendance >30 %→100 · une dépendance forte→50 · mono-source critique→0 |
| SO-2 | SO | Stocks stratégiques *(profil-dépendant)* | Industrie : >60 j→100 · 30-60→60 · <15→0. Tech/Conseil : **sans objet** |
| SO-4 | SO | Autonomie énergétique / ressources | >72 h documenté→100 · dispositif sans durée→50 · rien→0. Conseil : **sans objet** |
| SO-5 | SO | Dispersion en zone souveraine | ≥3 sites indép. tous souverains→100 · ≥3 dont hors zone→60 · 1 seul site→20 |

Répartition dimension : **SI 3 · SD 2 · SN 2 · SO 4 · CI 0**.

**Saisie :** on entre la valeur sous-jacente quand elle existe (le moteur mappe au palier) ; sinon on choisit le palier directement (radio). Fini le `norm(val, cible)` continu de v3.

### 3.2 Famille MATURITÉ — 8 indicateurs → lecture séparée « capacité à voir »

SD-2 *(réécrit : alternative qualifiée, pas slide)* · SD-5 · SN-4 · SI-Q1 · SD-Q1 · SN-Q1 · SO-Q1 *(condition de licéité)* · CI-Q1.

### 3.3 Famille INFLUENCE — → lecture séparée « capacité à peser »

**⚠️ Point ouvert (§9)** : la spec §5 liste 7 codes (SN-1, SN-3, CI-1, CI-2, CI-3, CI-4, CI-5) **mais** ordonne de fusionner les doublons SN-1≡CI-1 (sièges) et SN-3≡CI-5 (budget lobbying) « en deux indicateurs, pas quatre ». Après fusion il reste **5 mesures distinctes** : `INF-sièges` (ex SN-1/CI-1), `INF-lobbying` (ex SN-3/CI-5), CI-2 *(réécrit : part de voix + tonalité)*, CI-3, CI-4. Ce design retient **5 indicateurs Influence fusionnés**. À confirmer par Naouphel.

**Barèmes Maturité/Influence :** la grille OSINT ne couvre que les 11 voies. Pour ces deux familles (qui sont des *lectures*, hors score), ce design **réutilise la normalisation v3** (`norm(val,cible)` pour les cardinaux, `normQual` 1-5 pour les Q1) en attendant une grille dédiée « si besoin » (mention §9 de la grille). Marqué comme raffinable, non bloquant.

---

## 4. Modèle de données (assessment v4)

```jsonc
{
  "id": "...",
  "period": "T1 2026",
  "sector": "standard",              // profil : standard|banque|industrie|tech|energie
  "mode": "interne",                 // interne | osint  (§9 double usage)
  "refDate": "2021-02-28",           // R-temps : date de référence du cas
  "governance": {                    // §8 — 3 critères binaires
    "croReporting": true,            // ligne de reporting CRO au COMEX/conseil
    "vetoFormalized": true,          // veto formalisé par écrit
    "vetoExercised": false           // veto exercé et documenté
  },
  "cells": {                         // une entrée par indicateur (24 mesures)
    "si1": { "value": null, "band": "ue-hors-qualif", "source": "DEU 2020 p.114", "date": "2020-12-31", "note": "" }
    // ... value OU band ; source/date/note optionnels
  },
  "computed": { /* snapshot recalculable — cf. §5, pour l'historique */ },
  "createdAt": "...", "createdBy": "..."
}
```

Changement clé : on persiste **les cellules (valeur + preuve)**, source de vérité recalculable. Le `computed` n'est qu'un snapshot d'historique. Le backend reste **store-only** ; seul `/api/stats` (lecture `scores.ros`) est adapté au nouveau chemin `computed.score`.

---

## 5. Pipeline de calcul (`computeAssessment`)

Pour un assessment donné, profil `P` :

1. **Cellule → score de voie (0-100)** : `scoreCell()` mappe `value`/`band` au barème. Cellule vide/inapplicable → `null` (R-null : jamais 0).
2. **Filtrage d'applicabilité** : les voies « sans objet » pour `P` sont retirées (D2). Jamais notées 0.
3. **Voies → score de dimension** : pour chaque dimension, `aggregate(voies_applicables_renseignées, rule, k)`. **Couverture dim** = renseignées / applicables.
4. **Dimensions → score global** : `aggregate(scores_dimension, rule, k)` avec **poids égaux** (D-D).
5. **× gouvernance** : `× governanceCoef(governance)` (0,70–1,00) sur le global.
6. Étapes 3-5 calculées pour **chaque règle × chaque k∈{1,2,3}** → matrice de scores. **Titre = penalized, k=1.**
7. **Lectures séparées** : Maturité et Influence = **moyenne simple** des indicateurs renseignés (jamais dans le score), chacune avec sa couverture.

**Formules d'agrégation** (sur un vecteur de scores `x` déjà en 0-100) :
- **Linéaire** : `mean(x)`.
- **Géométrique** : `(∏ xᵢ)^(1/n)` — un `xᵢ=0` → 0.
- **Pénalisée (Mazziotta-Pareto)** : `M − k · (S²/M)` où `M = mean(x)`, `S = écart-type(x)`. k=1 = AMPI standard. Garde-fous : `M=0 → 0` ; borner `[0,100]`.

**Coefficient de gouvernance** : `1.00 − 0.10 × (nb critères absents)`, plancher `0.70`. 3 critères → {1.00, 0.90, 0.80, 0.70}.

---

## 6. Profils sectoriels — matrice d'applicabilité (DRAFT à valider)

Poids égaux partout (D-D). Seule l'applicabilité varie. `✓` applicable · `—` sans objet.

| Voie | Standard | Banque | Industrie | Tech | Énergie |
|---|:--:|:--:|:--:|:--:|:--:|
| SI-1, SI-2, SI-3 | ✓ | ✓ | ✓ | ✓ | ✓ |
| SD-3, SD-4 | ✓ | ✓ | ✓ | ✓ | ✓ |
| SN-2, SN-5 | ✓ | ✓ | ✓ | ✓ | ✓ |
| SO-1 | ✓ | ✓ | ✓ | ✓ | ✓ |
| **SO-2** (stocks) | ✓ | — | ✓ | **—** | ✓ |
| **SO-4** (énergie) | ✓ | — | ✓ | **—** | ✓ |
| SO-5 (dispersion) | ✓ | ✓ | ✓ | ✓ | ✓ |

**⚠️ À valider par Naouphel** : (a) la grille parle de « Conseil » (services) qui n'est pas un profil listé — faut-il un profil `services`/`conseil`, ou Standard le couvre-t-il ? (b) SO-2/SO-4 pour Banque = sans objet ? (proposé oui : une banque n'a ni stocks physiques ni autonomie énergétique critique). Le **mécanisme** est ce qui compte pour le build ; les cellules sont de la donnée corrigeable dans `ros-model.js`.

---

## 7. Restitution (Dashboard)

**§10-D5 — les 3 lignes :**
> **Exposition : `score` (`couverture %`)** — l'état des voies (chiffre titre = pénalisée k=1)
> **Capacité à voir : `maturité`** — l'entreprise voit-elle ses trous ?
> **Capacité à peser : `influence`** — peut-elle agir sur la norme ?

**Bandeau robustesse** (sous le score titre) : les 3 règles côte à côte (lin / géom / pén) + la bande k∈{1,2,3} de la pénalisée. Message auto : *convergent* → « l'instrument tient » ; *divergent* → « angle mort localisé à [endroit] ».

**Radar** : 4 axes des dimensions-voies (SI / SD / SN / SO). CI disparaît du radar (0 voie). Maturité/Influence affichées comme deux jauges séparées, hors radar.

**Couverture (D3)** : score de dimension sous 66 % de couverture → **grisé + « indicatif »**. Taux de sourçage global affiché (D-E).

---

## 8. Modes interne / OSINT (§9)

Un flag `mode` par assessment. Le moteur est **identique** dans les deux modes (les 11 voies sont toutes codables OSINT). Différences :
- **`interne`** : les 24 mesures saisissables (dont Maturité/Influence non-observables de l'extérieur).
- **`osint`** : les indicateurs non-codables de l'extérieur (données internes par nature, ex. CI-5/lobbying interne) sont marqués *attendu-null* → comptés dans la couverture, pas dans le score. Un bandeau rappelle « vision adversaire » (argument double-usage).

Pas de flux séparé : même formulaire, le mode change l'étiquetage + la couverture attendue. Léger.

---

## 9. Points ouverts (à trancher par Naouphel en relecture)

1. **Influence : 5 ou 7 indicateurs ?** Ce design fusionne les doublons → 5 (cf. §3.3). Confirmer.
2. **Matrice d'applicabilité** (§6) : profil `conseil/services` ? SO-2/SO-4 pour Banque ?
3. **Barèmes Maturité/Influence** : réutilisation v3 en attendant une grille dédiée — OK ou à spécifier maintenant ?
4. **PoC de re-codage** : Credit Suisse (28/02/2021) vs Lafarge (PoC verrouillé Axe 3) — arbitrage mémoire, **hors périmètre app** mais noté.

---

## 10. Migration & périmètre

- **Données v3** (2 évals dev + 2 prod) : **non recalculables** en v4 (indicateurs changés). Décision : **archivées en lecture seule**, étiquetées « v3 — non comparable ». Pas de script de migration.
- **Hors périmètre de la première livraison** (mais dans la spec, phasés au plan) : export PDF de soutenance + annexes de sensibilité imprimables (tableaux k et divergence des règles). Bloc D.
- **Companies.jsx** supprimé.

---

## 11. Stratégie de test (TDD)

Le moteur `ros-engine.js` étant **pur**, il est testable à 100 % en isolation :
- **Golden tests d'agrégation** : vérifier les 3 règles sur des vecteurs connus (dont le cas §7 : « une voie à 0 → géom≈0, pén≈45 »).
- **Non-compensation** : prouver qu'une voie béante plombe sa dimension puis le global (les deux niveaux).
- **Applicabilité** : une voie « sans objet » sort du calcul (jamais 0), la couverture le reflète.
- **R-null** : cellule vide → null → hors calcul, comptée en couverture.
- **Gouvernance** : les 4 paliers {1.00, 0.90, 0.80, 0.70}.
- **Barèmes** : chaque palier de chaque voie mappe au bon score.
- **Cas complet** : Credit Suisse 28/02/2021 comme test d'intégration (une fois codé, §9.4).

---

## 12. Découpage d'implémentation (pour le plan)

- **Bloc A — Moteur + modèle** : `ros-model.js` + `ros-engine.js` réécrits, tests TDD. Fondation, testable seule.
- **Bloc B — Saisie** : `Assessment.jsx` (familles, barèmes, preuve, gouvernance, mode).
- **Bloc C — Restitution** : `Dashboard.jsx` + `History.jsx` + `Guide.jsx` dérivés du modèle.
- **Bloc D — Annexes mémoire** : export PDF + tableaux de sensibilité.

Le plan (`writing-plans`) détaillera chaque bloc en tâches TDD.
