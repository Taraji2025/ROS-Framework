# Guide V4 — Design

> Réécriture complète du module Guide, aligné sur le modèle RoS V4 et **dérivé de `ros-model.js`**.
> Statut : spec validée en brainstorming (Naouphel, 16/07/2026) — sections A et B approuvées en dialogue, section C à relire ici.

## 1. Problème

`frontend/src/pages/Guide.jsx` (476 lignes, 32,8 Ko — la plus grosse page de l'app) enseigne **intégralement le modèle v3**, six mois après que le modèle a changé. Il est le dernier vestige v3 de l'application : `Assessment.jsx`, `Dashboard.jsx`, `History.jsx` et `Report.jsx` sont passés en V4 lors du bloc unique (commits `eb19081`→`e50bd74`), `Companies.jsx` a été supprimé.

**Cause racine :** le Guide n'importe **rien** de `ros-model.js`. Ses 476 lignes de contenu sont écrites en dur. Il ne peut donc pas suivre le modèle — il ne le lit pas.

### Ce qui est faux aujourd'hui (relevé sur pièce)

| Endroit | Affirmation du Guide | Réalité V4 |
|---|---|---|
| Sous-titre | « Return on Sovereignty v3.0 » | V4 |
| Nav + section Dimensions | « Les 5 dimensions », carte `CI` | 4 dimensions ; CI dissoute (fusionnée en famille Influence, hors score) |
| Workflow étape 3 | « remplissez les 30 indicateurs » | 11 Voies (score) + 8 Maturité + 5 Influence, **jamais additionnées** |
| Workflow étape 1 | « le secteur détermine les **pondérations** » | Profil = **applicabilité seule**, poids égaux |
| Méthodo | Table de pondérations sectorielles (25 %/20 %/15 %…) | **N'existe plus** (`WEIGHTS` supprimé du moteur) |
| Méthodo | « RoS = Σ (Poids_i × Score_i) » | Agrégation 2 niveaux non-compensatoire × coef. gouvernance |
| Méthodo | Normalisation « valeur/cible ×100 » | Voies = **bandes** (`cat`) ou **paliers** (`num`, dir `lower`/`higher`) |
| Méthodo | « Indicateurs inverses : SI-3, SI-4, SD-4, SN-2, SO-3, CI-3 » | SI-4, SO-3, CI-3 **n'existent plus** ; la notion d'« inverse » est remplacée par `dir` |
| Conseils pratiques | « si une donnée est inconnue, saisissez **0** » | **Contre-productif** : en V4 une cellule vide est *non couverte* ; saisir 0 fabrique un faux score |
| Règles de saisie | « un champ non renseigné vaut 0 par défaut » | Faux : `scoreCell` renvoie `null`, la cellule sort de l'agrégation |
| Absent | — | Règles lin/géom/**pénalisée**, k, coef. gouvernance, porte de complétude, traçabilité `{source,date,note}`, page `/rapport` |

### Constat aggravant (vérifié)

Sur les 11 Voies de `ros-model.js`, **3 seulement** portent une `justification` + `source` : SI-1, SI-3, SN-5. Les 8 autres (SI-2, SD-3, SD-4, SN-2, SO-1, SO-2, SO-4, SO-5) ont leur barème **en dur, sans aucun « pourquoi »**. Le build V4 en avait amorcé trois en exemple.

C'est exactement ce que la nouvelle section « référentiel » va rendre visible — d'où son traitement dans cette spec (§5).

## 2. Décisions actées (brainstorming du 16/07)

1. **Finalité** : le Guide sert **deux publics en sections séparées** — un tronc *mode d'emploi* (saisir, sourcer, publier) et un tronc *référentiel défendable* (barèmes justifiés, règles, gouvernance).
2. **Les 8 justifications manquantes sont rédigées dans ce chantier** (et non renvoyées à une passe ultérieure) : une section « référentiel » affichée à 3/11 justifié serait plus dommageable que pas de section.
3. **Deux registres explicites** — `source` quand un texte opposable existe (cité et **vérifié avant commit**) ; `convention` quand c'est un arbitrage du référentiel (affiché comme tel). *Un jury ne reproche pas une convention explicitée ; il démolit une convention déguisée en norme.*
4. **Maths** : principe en clair par défaut + exemple chiffré, formule Mazziotta-Pareto / k / variance dans un bloc repliable « Détail technique ».
5. **Architecture** : dérivation depuis `ros-model.js` + **verrou de test**, découpe en composants (approche A).

## 3. Architecture

Tout sous `/home/Felfool/ros/frontend/src/` (clone de dev ; la prod `/var/www/ros` ne bouge qu'au `/ros-ship`).

`Guide.jsx` redevient une **coquille** (~60 lignes) : navigation + aiguillage de section. Le contenu part dans `pages/guide/` :

| Fichier | Rôle | Nature |
|---|---|---|
| `guide/GuideIntro.jsx` | Ce que mesure le RoS, pour qui, ce que ce n'est pas | Prose |
| `guide/GuideWorkflow.jsx` | Parcours d'évaluation, la preuve, quand c'est publiable | Prose + complétude dérivée |
| `guide/GuideModele.jsx` | 4 dimensions, 3 familles jamais additionnées, applicabilité | **Dérivé** |
| `guide/GuideReferentiel.jsx` | Les 11 voies : barème + justification + source/convention | **Intégralement dérivé** |
| `guide/GuideCalcul.jsx` | Non-compensation, exemple chiffré, gouvernance, complétude | Prose + **dérivé** |
| `guide/GuideGlossaire.jsx` | Notions clés | Prose |
| `guide/guide-ui.jsx` | Primitives partagées (`Section`, `Term`, `Step`, `Band`…) | — |

### La ligne de partage (le cœur du design)

> Un **fait** — comptage, seuil, libellé, bande, palier, applicabilité, palier d'interprétation — n'est **jamais écrit** dans le Guide. Il est **lu** depuis `ros-model.js`.
> Seule la **prose conceptuelle** (ce qu'est le CLOUD Act, pourquoi on évalue) est écrite à la main : elle ne dérive de rien et ne périme pas quand un seuil bouge.

Conséquence : il devient **impossible** d'écrire « 30 indicateurs » ou une table de pondérations — ces chiffres ne s'écrivent plus.

Précédent à suivre : `pages/Report.jsx` (écrit au bloc V4) importe déjà `VOIES`/`DIMENSIONS` et dérive son affichage. Le Guide s'aligne sur lui.

### Imports attendus

- Depuis `ros-model.js` : `VOIES`, `MATURITE`, `INFLUENCE`, `PROFILES`, `DIMENSIONS`, `DIM_META` (nouveau, cf. §4bis), `LEVELS`, `RULES`, `K_VALUES`
- Depuis `ros-engine.js` : `aggregate`, `governanceCoef` (pour **calculer** l'exemple chiffré au lieu de le coder en dur)

## 4. Changement de schéma : `ros-model.js`

Le champ de justification passe à **deux registres** :

```js
{
  justification: string,   // OBLIGATOIRE — le raisonnement, toujours
  source?: string,         // si un texte opposable existe
  convention?: string,     // si c'est un arbitrage du référentiel
}
```

Règle : **au moins un** de `source` / `convention` doit être présent, en plus de `justification`. Les deux peuvent coexister (cas SD-3, SD-4 : une partie des seuils est légale, l'autre conventionnelle).

~~Les 3 justifications existantes (SI-1, SI-3, SN-5) portent déjà `justification` + `source` — conformes, non modifiées.~~

> **CORRECTION (17/07, découverte à l'implémentation par le verrou lui-même).** Cette affirmation était **fausse**. État réel constaté : **SI-1** portait `justification` + `source` ✅ ; **SI-3** et **SN-5** ne portaient qu'une `justification`, **sans aucun registre**. Cause racine : le chantier V4 précédent (commit `6711f0f`) n'avait ajouté de `source` qu'à SI-1. Les 2 registres manquants ont été rédigés et **validés par Naouphel le 17/07** (cf. §5bis) — ce sont des **conventions**, aucune norme ne fixant ces seuils. Le verrou est passé à **11/11**.
>
> *Leçon : le verrou a trouvé l'erreur de la spec qui l'a commandé. C'est précisément à ça qu'il sert.*

### 4bis. Libellés de dimension (trouvaille de la self-review)

`ros-model.js` n'expose que `DIMENSIONS = ['SI','SD','SN','SO']` — **aucun libellé**. Les libellés sont aujourd'hui écrits en dur dans **quatre** pages, sous deux formes :

| Fichier | Forme |
|---|---|
| `pages/Dashboard.jsx:32` | `['Informationnelle', 'Décisionnelle', …]` (courte, axes radar) |
| `pages/Report.jsx:13` | `DIM_LABELS = ['Informationnelle', …]` (courte) |
| `pages/Assessment.jsx:11` | `{ label: 'Souveraineté Informationnelle', color, cls, fill }` (longue + style) |
| `pages/Guide.jsx:190` | `label="Souveraineté Informationnelle"` (longue) |

Sans libellé dans le modèle, **le Guide serait contraint d'écrire un fait** — le principe du §3 serait mort-né. Le modèle gagne donc :

```js
export const DIM_META = {
  SI: { short: 'Informationnelle', long: 'Souveraineté Informationnelle', color: 'var(--dim1)' },
  SD: { short: 'Décisionnelle',    long: 'Souveraineté Décisionnelle',    color: 'var(--dim2)' },
  SN: { short: 'Normative',        long: 'Souveraineté Normative',        color: 'var(--dim3)' },
  SO: { short: 'Opérationnelle',   long: 'Souveraineté Opérationnelle',   color: 'var(--dim4)' },
};
```

**Portée volontairement limitée** : `GuideModele.jsx` consomme `DIM_META`. Dashboard, Report et Assessment **ne sont pas migrés** dans ce chantier — ils sont en production depuis ce matin, la migration est cosmétique (le rendu serait identique) et ferait courir un risque de régression pour zéro gain fonctionnel. Inscrit en follow-up §11, pas ici. *(Principe : toucher le minimum de code ; le fond avant la forme.)*

**Ligne de partage pour les dimensions :** le **libellé** est un fait → modèle. La **description** et les **exemples concrets** d'une dimension sont de la prose pédagogique → restent dans `GuideModele.jsx`.

Rendu dans `GuideReferentiel.jsx` : la `source` s'affiche en registre « norme », la `convention` en registre visuellement distinct (« Convention du référentiel »), pour que la différence de statut soit **lisible sans lire**.

## 5. Les 8 justifications (textes validés par Naouphel le 16/07)

Les trois sources citées ont été **ouvertes et vérifiées** le 16/07 (cf. §9) — aucune citation de mémoire.

### SI-2 · Réversibilité cloud — *norme*
- **justification** : « La réversibilité n'existe que si elle est écrite : un multi-cloud de fait, sans clause de sortie opposable, laisse le commanditaire dépendant du bon vouloir du prestataire. Le palier 100 exige donc les deux — la capacité technique (multi-cloud) et le droit (clause). Le mono-cloud vaut 0 : le verrouillage y est structurel, aucune clause ne le compense. »
- **source** : « ANSSI SecNumCloud v3.2, exigences 19.1.h (clause de réversibilité — récupération de l'ensemble des données) et 19.1.i (modalités techniques) ; Règlement (UE) 2023/2854 « Data Act », chap. VI, art. 25-27 (changement de fournisseur), applicable depuis le 12/09/2025. »

### SD-3 · Exposition capitalistique du conseil — *norme + convention*
- **justification** : « Les paliers se calent sur les seuils de contrôle du droit des sociétés : à 50 %, le contrôle est acquis — le conseil n'arbitre plus, il entérine. Les paliers 10 et 25 sont placés en deçà du seuil légal de blocage (33,34 %) pour capter l'approche du pouvoir avant qu'il ne soit constitué : à 25 %, un actionnaire n'a plus besoin de beaucoup d'alliés pour bloquer une modification statutaire. »
- **source** : « Code de commerce, art. L.225-96 (AGE à la majorité des deux tiers ⇒ minorité de blocage au-delà d'un tiers) ; art. L.233-3 (contrôle par la majorité des droits de vote). »
- **convention** : « Le placement des paliers 10 et 25 est un arbitrage du référentiel ; seuls 33,34 % et 50 % sont des seuils de droit. »

### SD-4 · Exposition aux clauses extraterritoriales — *norme + convention*
- **justification** : « Les paliers mesurent la matérialisation du risque, pas son existence théorique. Une exposition citée comme risque (50) signale que l'entreprise la reconnaît sans la subir encore. Une procédure en cours ou un monitorship (10, et non 0) traduit une souveraineté décisionnelle largement confisquée — un tiers agréé valide les décisions de conformité — sans être nulle : les autres leviers subsistent. »
- **source** : « Cas de référence : Alstom (DPA et monitorship, 2014), Airbus (CJIP, 2020) ; FCPA (1977) ; loi n° 68-678 dite « de blocage ». »
- **convention** : « Le critère « CA en dollars < 10 % » est une convention de matérialité, **pas un seuil juridique** : en droit américain, une seule transaction compensée en dollars peut suffire à fonder la compétence (cf. BNP Paribas, 2014). Le seuil distingue une exposition résiduelle d'une exposition structurelle. »

### SN-2 · Normes subies vs influencées — *convention (doctrine)*
- **justification** : « La gradation distingue la présence directe de la présence médiée. Siéger au comité où le texte s'écrit permet d'agir sur la rédaction ; passer par une fédération, c'est faire porter un intérêt collectif — négocié, moyenné — qui n'est plus exactement le sien : d'où le palier intermédiaire à 50. L'absence vaut 0 : la norme est alors intégralement subie. »
- **convention** : « Aucun texte ne gradue la participation normative. La hiérarchie s'appuie sur la doctrine française d'intelligence économique (rapport Martre, 1994 ; rapport Carayon, 2003) : « qui fait la norme fait le marché ». »

### SO-1 · Diversification fournisseurs critiques — *convention*
- **justification** : « Le seuil de 30 % marque le point où la perte d'un fournisseur cesse d'être absorbable par les autres : au-delà, il n'existe plus de capacité de report à court terme. Le palier 50 sanctionne l'entreprise qui identifie sa dépendance sans l'avoir traitée ; le mono-source vaut 0 — la continuité dépend entièrement d'un tiers. »
- **convention** : « Aucune norme ne fixe de seuil de concentration fournisseur hors secteur financier. Le 30 % est calé sur la capacité de report. »

### SO-2 · Stocks stratégiques — *convention*
- **justification** : « Les paliers traduisent des horizons de crise : 15 jours couvrent une rupture logistique ponctuelle, 30 jours une crise fournisseur avec réapprovisionnement alternatif, 60 jours une crise géopolitique le temps de reconfigurer une chaîne. La cible haute est placée à 60 et non 90 : au-delà, le coût d'immobilisation rend l'exigence irréaliste pour une entreprise. »
- **convention** : « Les 90 jours de la directive 2009/119/CE s'imposent aux **États** pour les stocks pétroliers, pas aux entreprises. Aucune obligation générale de stock stratégique ne pèse sur l'entreprise. »

### SO-4 · Autonomie énergétique / ressources — *convention (doctrine)*
- **justification** : « Le seuil de 72 h sépare l'autonomie qui permet d'attendre un rétablissement de celle qui ne fait que retarder l'arrêt. L'exigence porte surtout sur le caractère documenté : un dispositif cité sans durée mesurée (50) n'est pas une autonomie, c'est une intention. »
- **convention** : « Le 72 h est un usage de la doctrine de continuité d'activité, non une norme opposable. »

### SO-5 · Dispersion en zone souveraine — *convention*
- **justification** : « Trois sites est le minimum qui survit à la perte d'un site sans revenir à un point unique de défaillance (à deux sites, une perte laisse un site seul). La zone compte autant que le nombre : trois sites dont certains hors zone souveraine (60) dispersent le risque physique mais pas le risque juridique. Un site unique, même souverain, vaut 20 et non 0 — la souveraineté juridique y est acquise, seule la résilience manque. »
- **convention** : « Aucune norme ne fixe de nombre de sites. Le 3 dérive de la règle « survivre à une perte sans point unique restant ». »

## 5bis. Les 2 registres manquants (textes validés par Naouphel le 17/07)

Ajoutés après la découverte de l'écart §4. Aucune norme ne fixe ces seuils → registre **convention** dans les deux cas, jamais déguisé en norme.

### SI-3 · Dépendance tech étrangère — *convention*
- **convention** : « Aucun texte ne fixe de seuil de dépendance technologique étrangère. Les paliers 20/40/70 sont un arbitrage du référentiel, calé sur la capacité de substitution : sous 20 %, le remplacement d'un fournisseur reste absorbable ; entre 40 et 70 %, il engage une reconfiguration lourde ; au-delà de 70 %, la substitution devient structurellement impossible à court terme. »
- *(la `justification` existante est conservée telle quelle)*

### SN-5 · Sanctions de juridictions tierces — *convention*
- **convention** : « Aucun texte ne fixe de seuil de matérialité pour les sanctions. Les paliers 0,5 % et 5 % du CA sont un arbitrage du référentiel : en deçà de 0,5 %, la sanction relève de l'incident absorbable ; au-delà de 5 %, elle pèse sur la trajectoire stratégique de l'entreprise. La sentinelle à 0 traduit qu'une sanction non nulle, même infime, fait sortir du palier d'excellence. »
- *(la `justification` existante est conservée telle quelle)*

**État final du référentiel : 11 voies · 11 justifications · 4 sources · 9 conventions** (SD-3 et SD-4 portent les deux registres). Verrou vert.

## 6. Contenu des 6 sections (Section C — à relire)

### 🎯 Introduction — *prose*
Ce que mesure le RoS (autonomie réelle : décider, agir, protéger) ; à qui il s'adresse ; ce qu'il n'est pas (ni certification, ni mesure financière). **Reprise du v3, qui reste juste** — ce texte ne parle pas du modèle, il parle de l'objet. Deux corrections : la liste des publics perd la ligne « communication / affaires publiques → CI » (la dimension n'existe plus ; l'influence devient une *lecture*, pas un score), et l'intro annonce désormais que **le score est porté par les Voies seules**.

### 📋 Comment évaluer — *prose + dérivé*
Parcours : profil entreprise → réunir les porteurs de données → saisir les Voies → sourcer → vérifier la complétude → sauvegarder → `/rapport`.

**Trois corrections capitales par rapport au v3 :**
1. Le profil détermine **l'applicabilité**, pas des pondérations. (Tableau dérivé de `PROFILES` : quelles voies sont sans objet pour Banque/Tech.)
2. **Ne jamais saisir 0 pour « je ne sais pas ».** Une cellule vide est *non couverte* et la complétude la compte ; un 0 est une **affirmation** (« mono-source », « rien »). C'est l'inverse exact du conseil v3.
3. La **preuve** `{source, date, note}` : ce qui fait qu'une évaluation est opposable. La date est horodatée automatiquement à la saisie.

Encadré **« Quand l'évaluation est-elle publiable ? »** : quand **toutes les Voies applicables** sont remplies (compte dérivé de `PROFILES`). Maturité et Influence sont des bonus non bloquants.

### 🧭 Le modèle V4 — *dérivé*
Les 4 dimensions (SI/SD/SN/SO), et surtout les **3 familles jamais additionnées** :

| Famille | Rôle | Compte |
|---|---|---|
| **Voies** | Produisent le score | `VOIES.length` |
| **Maturité** | Lecture « capacité à voir » — hors score | `MATURITE.length` |
| **Influence** | Lecture « capacité à peser » — hors score | `INFLUENCE.length` |

Tous les comptages **dérivés**, jamais écrits. Explication de *pourquoi* elles ne s'additionnent pas : mesurer sa capacité à voir n'est pas être souverain ; les mélanger permettrait d'acheter du score avec de la maturité déclarative.

### 📊 Le référentiel — *intégralement dérivé*
Les 11 Voies groupées par dimension. Pour chacune : code, libellé, **barème complet** (bandes avec leur score, ou paliers avec seuil + direction), puis `justification`, puis `source` et/ou `convention` en registres visuellement distincts.

C'est la pièce de défense : elle répond à « pourquoi 30 jours et pas 45 » **pour les 11 voies**, sans exception.

### ⚙ Le calcul — *prose + dérivé*
1. **On ne compense pas.** Agrégation à 2 niveaux (voies → dimension → global), poids égaux.
2. **Exemple chiffré** — *calculé à l'exécution via `aggregate()`, jamais codé en dur* :
   - profil régulier `60/60/60/60` → **60**
   - profil irrégulier `90/90/20/40` → **44** (moyenne identique de 60, score effondré)
   - comparatif : linéaire 60 · géométrique 50,45 · pénalisée k=2 → 28,33 · k=3 → 12,5
3. **Gouvernance** : `coef = max(0,7 ; 1 − 0,1 × critères absents)` → 1 / 0,9 / 0,8 / 0,7. Dérivé via `governanceCoef()`.
4. **Complétude** : la porte du publiable.
5. **Paliers d'interprétation** : table dérivée de `LEVELS` (plus de table écrite à la main).
6. **▸ Détail technique (repliable)** : `pénalisée = M − k × (σ²/M)` ; k ∈ `K_VALUES`, titre = pénalisée k=1 ; `RULES` lin/géom servent de test de robustesse ; la moyenne et la variance sont calculées sur les voies **renseignées** (les `null` sortent de l'agrégation).

### 📖 Glossaire — *prose*
- **Conservés** (concepts, toujours justes) : CLOUD Act, Extraterritorialité, Réversibilité cloud, PCA, Guerre cognitive, Intelligence économique, Lobbying réglementaire, FCPA, Souveraineté numérique, Soft power.
- **Supprimé** : **MTTR** — adossé à SI-4, indicateur qui n'existe plus en V4.
- **Ajoutés** (vocabulaire V4) : Voie / Maturité / Influence ; Non-compensation ; Indice Mazziotta-Pareto ; Coefficient de gouvernance ; Complétude ; Applicabilité ; SecNumCloud ; Monitorship ; Minorité de blocage ; Data Act ; Convention du référentiel.

## 7. Le verrou (garantie mécanique)

Le Guide a dérivé parce que rien n'empêchait la dérive. Deux verrous, aucune dépendance nouvelle :

**Verrou 1 — `__tests__/guide-model.test.js`** *(le principal)*
- Toute voie de `VOIES` porte une `justification` non vide.
- Toute voie porte **au moins un** de `source` / `convention`, non vide.
- → **Échoue aujourd'hui (3/11), passe après §5, et rend impossible d'ajouter une voie sans son pourquoi.** C'est le verrou qui compte : il protège la défendabilité, pas la cosmétique.

**Verrou 2 — cohérence de rendu** (même fichier)
- Chaque voie `cat` a des `bands` non vides, chaque voie `num` a des `steps` non vides et un `dir` ∈ {`lower`,`higher`} → garantit que `GuideReferentiel` peut rendre un barème pour **chaque** voie sans cas particulier.

Note : pas de test de rendu React (imposerait `jsdom` + `@testing-library/react`). La dérivation rend le test de rendu largement redondant — un comptage faux devient impossible par construction, pas par vérification.

## 8. Hors périmètre (YAGNI)

- **Passe de sourçage des cellules** CS/Lafarge (`{source, date, note}` par cellule saisie) — chantier distinct, déjà au todo. Ici on documente le *référentiel*, pas les *évaluations*.
- Barèmes Maturité/Influence (point ouvert §9 de la spec V4) — le Guide les **affiche** tels qu'ils sont, il ne les redéfinit pas.
- Refonte visuelle : le Guide garde les primitives et le style existants.
- Traduction, export PDF du Guide, recherche plein texte.

## 9. Vérification (DoD objectif)

Aucun « à peu près ». Le chantier est fini quand :

1. `npm run test` vert, **incluant `guide-model.test.js`** (51 tests actuels + les nouveaux).
2. `npm run build` vert.
3. `grep -riE "30 indicateurs|5 dimensions|WEIGHTS|pondérations sectorielles|v3\.0|Σ ?\(Poids|saisissez 0|MTTR" src/pages/guide/ src/pages/Guide.jsx` → **0 résultat**.
4. `grep -rE "'(SI|SD|SN|SO)-[0-9]'|score: [0-9]+|threshold: |Souveraineté (Informationnelle|Décisionnelle|Normative|Opérationnelle)" src/pages/guide/` → **0 résultat** (aucun fait en dur : ni code de voie, ni barème, ni libellé de dimension).
5. Les 11 voies affichent une justification + un registre dans `/guide` (vérif visuelle).
6. L'exemple chiffré affiché est produit par `aggregate()` (modifier `ros-model.js` change l'exemple, il ne ment jamais).

### Sources vérifiées le 16/07/2026 (traçabilité de cette spec)

| Référence | Vérifié comment | Résultat |
|---|---|---|
| SecNumCloud v3.2 | PDF ANSSI téléchargé et extrait (55 p.) | § **19.1.h** (clause de réversibilité) et **19.1.i** (modalités techniques) confirmés p. 48 |
| Data Act (UE) 2023/2854 | Recherche web | Chap. VI, art. 25-27 (switching) ; applicable **12/09/2025** ; assistance export gratuite dès 01/2027 |
| C. com. L.225-96 / L.233-3 | Recherche web (Légifrance) | AGE = 2/3 ⇒ blocage > 1/3 ; contrôle = majorité des droits de vote |
| Exemple chiffré | Exécuté sur `ros-engine.js` (node) | 60/60/60/60 → 60 ; 90/90/20/40 → **44,17** (et non 47 comme estimé de tête) ; coef. gouv. 1/0,9/0,8/0,7 |

## 10. Risques

- **Le plus sérieux — contenu, pas code** : les 5 conventions (SO-1, SO-2, SO-4, SO-5, SN-2) engagent Naouphel devant le jury. Elles sont validées (16/07) mais restent des arbitrages : si le mémoire dit autre chose, c'est le mémoire qui fait foi et la spec s'aligne. Point d'attention nommé : SD-4 (assumer par écrit que le seuil de 10 % n'est pas juridique) et SO-2 (affirmer que 90 j serait irréaliste).
- **Régression de navigation** : `App.jsx` importe `Guide` par défaut depuis `./pages/Guide.jsx` — la coquille doit conserver cet export. Aucun changement de route.
- **Volume** : ~7 fichiers créés, `Guide.jsx` réduit de ~476 à ~60 lignes. Le risque est la perte de prose encore juste (intro, glossaire) — d'où la reprise explicite plutôt que la réécriture (§6).

## 11. Follow-ups (hors de ce chantier, inscrits pour ne pas être perdus)

1. **Migrer Dashboard / Report / Assessment vers `DIM_META`** — tue la duplication des libellés de dimension en 4 exemplaires (§4bis). Cosmétique, rendu identique, à faire quand ces pages seront rouvertes pour une autre raison. **Ne pas déployer seul.**
2. **Passe de sourçage des cellules** CS/Lafarge (`{source, date, note}`) — déjà au `tasks/todo.md`, c'est le gros morceau restant avant la soutenance.
3. **Élargir le seed de traçabilité** (1/11 voies sourcées côté *évaluations*).
