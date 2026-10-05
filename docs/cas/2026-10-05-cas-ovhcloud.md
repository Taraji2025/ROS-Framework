# Démo OVHcloud · 09/03/2021 (veille de l'incendie de SBG) — hors mémoire

> **Statut (arbitrage Naouphel, 05/10/2026) : démo live, hors mémoire.** Le mémoire ne code pas
> OVHcloud (§3.3.6 : deux cas). Les constats sur le modèle ci-dessous servent à la soutenance orale,
> pas au texte. Version 2026 et comparaison : `docs/cas/2026-10-05-ovhcloud-2026.md`.

> Fiche de codage rédigée le 05/10/2026. **Non saisie en production** : la saisie passe par l'API
> (le sélecteur de période de l'interface ne propose que des trimestres, « T1 2026 », etc.).
> Charge utile prête à envoyer : `docs/cas/ovhcloud-2021-03-09.payload.json`.
> Recherche complète, avec citations et pages : `docs/cas/ovhcloud-recherche-sourcee.md`.
> Chiffres calculés par `ros-engine.js` lui-même, pas de tête.

## Pourquoi ce cas, et pourquoi cette date

Même logique que Credit Suisse (28/02/2021) et Lafarge (30/06/2014) : on code l'entreprise **juste
avant sa crise**. Le 10/03/2021, l'incendie de SBG2 a détruit un datacenter et coupé les quatre
datacenters de Strasbourg, qui formaient un seul site électrique. La question posée au modèle :
**aurait-il vu la fragilité ?**

**Premier cas sourcé dès la saisie** : 8 cellules sur 8 portent une source (taux de sourçage
**100 %**, contre 0 % pour CS et Lafarge). Une cellule sans source vérifiée est restée vide.

## Résultat

| | Valeur |
|---|---|
| Profil | Tech — 10 voies applicables (SO-2 exclue) |
| Complétude | **8 / 10** (SI-2 et SI-3 vides : rien de publié) |
| Sourçage | **100 %** (8 / 8) |
| Coefficient de gouvernance | **0,70** (0 critère sur 3 documenté) |
| **Score titre (pénalisée k=1)** | **45,3 — ↓ Faible** |
| Par dimension | SI **100** (1 voie sur 3) · SD **58** · SN **67** · SO **53** |

| Règle | k=1 | k=2 | k=3 |
|---|---:|---:|---:|
| Linéaire | 50,5 | 50,5 | 50,5 |
| Géométrique | 48,1 | 48,1 | 48,1 |
| Pénalisée | **45,3** | 39,1 | 31,0 |

**À côté des deux cas du mémoire** (titre) : Credit Suisse **27** < Lafarge **40** < OVHcloud **45**.

## Cellules

Les sources sont abrégées. **[DE21]** désigne le document d'enregistrement de l'IPO d'OVH Groupe
(17/09/2021). **[BEA]** désigne le rapport BEA-RI n° MTE-BEARI-2022-005 (24/05/2022).
Les citations décisives de [DE21] ont été **revérifiées dans le PDF** le 05/10/2026.

| Voie | Codage | Score | Source | Réserve |
|---|---|---:|---|---|
| SI-1 | `souverain` | 100 | [DE21] p. 114, visa SecNumCloud du Hosted Private Cloud en janvier 2021 | **Arbitrage, voir plus bas** |
| SI-2 | — | — | Rien de publié sur le SI propre | Le multi-cloud n'a pas de sens pour un fournisseur de cloud |
| SI-3 | — | — | Aucun pourcentage publié | Indices : Intel, AMD, VMware, capex en USD |
| SD-3 | `16.76` (% des droits de vote) | 70 | [DE21] p. 160-161 : TowerBrook 8,38 % + KKR 8,38 % des droits de vote | En capital : 19,84 %, même palier |
| SD-4 | `citee` | 50 | [DE21] p. 21-22 : le CLOUD Act cité comme facteur de risque ; p. 12 : entités US = 5,7 % du CA | Aucune procédure avant mars 2021 |
| SN-2 | `federation` | 50 | [DE21] p. 59, 61, 118 : CISPE (conseil), Gaia-X (fondateur), SWIPO | **Arbitrage, voir plus bas** |
| SN-5 | `0` | 100 | [DE21] ch. 3 et 18.5 : aucune sanction étrangère | **Preuve par absence** |
| SO-1 | `concentre` | 50 | [DE21] p. 19 (processeurs) et p. 25 (AixMétal, fournisseur difficile à remplacer) | Aucune part d'achat chiffrée |
| SO-4 | `dispositif` | 50 | [BEA] p. 14-15 (groupes électrogènes) ; [DE21] p. 20 (panne du secours en 2017) | Autonomie en heures non publiée |
| SO-5 | `disperse-mixte` | 60 | [DE21] p. 33 (33 datacenters, 12 implantations) ; p. 17 (Strasbourg = 1 site) | ~35 avant l'incendie : déduit, non publié |
| Gouvernance | 0 / 3 | ×0,70 | [DE21] p. 26-28 : pas de CRO ; la cartographie des risques est présentée par le directeur financier | Veto : jamais publié dans un document d'enregistrement |

## Arbitrages de Naouphel (05/10/2026) — et ce qu'ils coûtent

**SI-1 = 100 (on code les offres).** C'est le point le plus attaquable de la fiche :
- L'activité SecNumCloud pèse environ **2 % du CA** (24 M€ d'ARR en 2025, URD 2025 p. 231). Ce
  ratio est calculé ici, il compare un ARR à un CA et doit être lu avec prudence.
- La voie mesure le « contrôle des **données critiques** » de l'entreprise. Or le lieu
  d'hébergement des données propres d'OVH n'est publié nulle part.
- **Sensibilité** : sans SI-1, le titre passe de 45,3 à **41,1**. Le niveau reste Faible.

**SN-2 = 50 (lecture stricte).** CISPE et Gaia-X sont des associations professionnelles, et OVH
n'a de siège dans aucun organisme de normalisation formel (ISO, CEN, ETSI, AFNOR). En lecture
large (100, puisqu'il co-rédige SWIPO et siège au conseil de CISPE), le titre serait de **50,007,
soit « Moyen » à 0,007 point du seuil**.

**⚠️ Incohérence à assumer ou à corriger.** Le même cas applique la lecture **large** à SI-1 et la
lecture **stricte** à SN-2. Un jury qui le remarque y verra un codage orienté vers le résultat. Il
faut l'une de ces deux issues :
- **une règle écrite** au référentiel : comment coder SI-1 pour un fournisseur de cloud, et ce qui
  compte comme « comité » pour SN-2 ;
- **un alignement** des deux voies sur la même sévérité.

## Ce que le cas apprend sur le modèle (pour la soutenance orale)

1. **Le modèle n'a pas vu le risque qui s'est réalisé.** L'incendie relève de SO-5 (concentration
   physique d'un site) et de SO-4 (continuité électrique). Le modèle les cote **60** et **50**, des
   notes moyennes. SO-5 compte des datacenters et des implantations, pas des **sites électriquement
   indépendants**. Or les quatre datacenters de Strasbourg formaient un seul site, coupé en entier.
   C'est une faille de définition de la voie.
2. **Le coefficient de gouvernance punit le silence, pas l'absence de gouvernance.** Aucun document
   d'enregistrement ne publie l'existence d'un droit de veto de la fonction risque. Le coefficient
   est donc structurellement de 0,70 pour toute société non bancaire codée en sources ouvertes.
   C'est le **même biais que F11**, transposé à la gouvernance. Ici il coûte 19,4 points : on passe
   d'un score brut de 64,7 à 45,3.
3. **Non-monotonie à k ≥ 2, retrouvée sur un troisième cas, mais dans une seule configuration.**
   Quand SI-1 est vide, à k=3, coder SN-2 en `federation` (50) donne **36,5**, plus que `comites`
   (100), qui donne **33,7** : dégrader une voie fait monter le score. Quand SI-1 vaut 100 (la
   configuration retenue), l'ordre redevient normal (31,0 contre 39,0). Le défaut de l'annexe B.5
   apparaît donc aussi ici, mais il dépend de la configuration. C'est en soi un argument contre
   k ≥ 2.
4. **La dimension SI vaut 100 sur une seule voie remplie sur trois.** Le score SI n'est porté que
   par la cotation la plus discutable. La couverture par dimension, affichée sur `/rapport`, le
   montre, et il faut la citer à côté du score.
5. **Applicabilité du profil tech.** La justification du profil tech cite déjà OVHcloud (décision
   B.2 du 27/07, réintégration de SO-4). Le profil a été ajusté **sur ce cas même**, avant qu'il ne
   soit codé. Ce n'est pas faux, mais c'est circulaire : il faut le dire dans le mémoire.

## Saisie en production (à faire par Naouphel, sur le VPS)

```bash
# 1. sauvegarde
cp /var/www/ros/backend/data/storage.json /var/www/ros/backend/data/storage.json.bak-$(date +%F)-ovh
# 2. jeton
TOKEN=$(curl -s -X POST http://localhost:3003/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"<admin>","password":"<mdp>"}' | jq -r .token)
# 3. création
curl -s -X POST http://localhost:3003/api/assessments -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d @/var/www/ros/docs/cas/ovhcloud-2021-03-09.payload.json
```

Vérification attendue sur `/rapport` après saisie : **45**, niveau ↓ Faible, sourçage 100 %, 8/10.

## Trous non comblés (voir la recherche, section NON TROUVÉ)

SI-2 et SI-3 vides ; part exacte du CA en USD ; autonomie des groupes électrogènes en heures ;
administrateurs de KKR et TowerBrook avant l'IPO ; prospectus AMF du 04/10/2021 non exploité.
