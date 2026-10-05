# OVHcloud — fiche de saisie RoS v4 (ros.taraji-conseil.fr)

Date de référence : 05/10/2026 · Statut : démo live, hors mémoire (le mémoire ne code pas OVHcloud, §3.3.6)

## En-tête

- **Période / libellé** : `OVHcloud · 05/10/2026 · v4 · démo hors mémoire`
- **Secteur** : `Tech` (SO-2 sans objet selon la justification du profil dans l'app)

## Voies — à saisir telles quelles

| Voie | Choix dans l'app | Source (champ « source ») | Note (champ « note ») |
|---|---|---|---|
| SI-1 | Hébergeur UE hors qualification | Décision ANSSI 2025-559 du 24/03/2025 (BAREMETAL POD, SecNumCloud 3.2) ; cyber.gouv.fr, prestations en cours de qualification, consultée le 05/10/2026 (SNC Cloud Platform encore en cours) ; DEU 2025 : CA 48 % France, 29 % reste Europe, 23 % reste du monde | Groupe codé, pas l'offre : la qualification couvre un périmètre (« plus de 80 clients » HPC en 01/2024). Périmètre qualifié seul = 100. |
| SI-2 | Réversibilité contractuelle + multi-cloud | OVHcloud Global Reversibility Policy (docs.ovhcloud.com, MAJ 05/05/2021), conformité SWIPO IaaS ; DEU 2025 §1.3.1.2 (OpenStack, Kubernetes ; pas de frais de sortie sauf stockage block/archive et Asie-Pacifique) | « Multi-cloud » lu comme capacité offerte au client. Exception : Data Processing Engine sans export. Conformité Data Act non documentée. |
| SI-3 | **laisser vide** | — | Aucun pourcentage sourcé. CPU AMD/Intel, GPU NVIDIA, virtualisation privée VMware/Nutanix étrangers ; cloud public sur briques open source. Vide par cohérence avec CS/Lafarge (cellules non sourcées supprimées). |
| SD-3 | valeur `20.2` | Tableau d'actionnariat OVH Groupe, 04/12/2025 (corporate.ovhcloud.com) : concert Klaba 79,0 % du capital / 79,6 % DDV ; flottant 18,4 % ; employés et administrateurs 1,8 % ; autodétention 0,8 % | Majorant (flottant + salariés) : la nationalité des porteurs n'est pas publiée. Moins de 10 % non démontrable. |
| SD-4 | Procédure en cours / monitorship | Ordonnance de production (C. crim. canadien, art. 487.014) du 19/04/2024 visant OVH Groupe SA et Hébergement OVH Inc. ; maintenue le 25/09/2025 (Ontario) ; blog OVHcloud du 31/07/2026 (poursuites, art. 487.0198 et 139(2)) | Extension hors FCPA assumée : injonction extraterritoriale en conflit avec la loi de blocage 68-678. Statut des poursuites ambigu (« filed » / « threatened »). |
| SN-2 | Présente aux comités des normes clés | Gaia-X, conseil d'administration 2025-2027 : Dominique Michiels, membre du COMEX d'OVHcloud (gaia-x.eu/board-of-directors, consulté le 05/10/2026) ; DEU 2025 §1.1 (membre fondateur Gaia-X, 2020) et §1.6.1.3 (co-rédaction des codes SWIPO) | Lecture de facto, conforme à la convention SN-2 du mémoire (§3.3.6) : siège direct dans l'instance qui écrit le cadre de confiance Gaia-X. Aucune présence directe trouvée à l'ISO/IEC JTC 1/SC 38, au CEN, à l'ETSI ni à l'AFNOR ; pas de siège au conseil du CISPE. En lecture de jure seule : 50. |
| SN-5 | **laisser vide** | — | Aucune sanction d'une juridiction tierce trouvée (2021-2026). Procédure canadienne sans sanction à date. Condamnations civiles françaises (incendie SBG) hors voie. |
| SO-1 | Une dépendance forte citée | DEU 2025 §1.4.1 (GPU exclusivement NVIDIA) ; Next, 02/12/2019 (pénurie de CPU Intel, O. Klaba) | CPU désormais double source (AMD, Intel). NVIDIA mono-source sur l'offre IA, pas sur le cœur d'activité. |
| SO-2 | sans objet (profil Tech) | — | — |
| SO-4 | Dispositif cité sans durée | DEU 2025 §3.2.1.6 (groupes électrogènes de secours, HVO à Roubaix, Gravelines, Strasbourg, Erith) ; rapport BEA-RI du 27/05/2022 (SBG : deux liaisons HTA 20 kV redondantes, groupes fioul) | Aucune durée d'autonomie publiée. |
| SO-5 | ≥ 3 sites dont certains hors zone | DEU 2025 §1.4.1 (44 datacenters au 31/08/2025) ; blog OVHcloud du 31/07/2026 (« more than 46 data centers across four continents ») | Sites hors UE : Canada, USA, Singapour, Australie, Inde. Périmètre SecNumCloud (Roubaix, Gravelines, Strasbourg) = 100. |

## Gouvernance — les trois cases restent décochées (codé NON sur pièce, pas par défaut)

- Reporting CRO au conseil : NON. Le COMEX publié ne compte aucun CRO ; le suivi des risques passe par le comité d'audit (corporate.ovhcloud.com/en/company/governance).
- Veto formalisé : NON. DEU 2025 p. 53-56 : direction de l'audit, du contrôle interne et des risques, aucun droit de veto documenté.
- Veto exercé : NON.

## Résultat attendu (moteur ros-engine.js du dépôt ROS-Framework, recalculé hors ligne)

- **Score final : 32 / 100, ↓ Faible** (règle pénalisée k=1). Brut 46, coefficient de gouvernance 0,70.
- SI 75 (2/3 voies), SD 17,5 (2/2), SN 100 (1/2 : repose sur la seule SN-2), SO 53 (3/3). Couverture 8/10, sourçage 100 % des cellules renseignées.
- Pour comparaison dans l'app : Credit Suisse 27, Lafarge 40.

| Variante (les deux cellules contestables) | Score final |
|---|---|
| SN-2 à 100, SD-4 à 10 (codage retenu) | **32 (Faible)** |
| SN-2 à 50 (lecture de jure seule), SD-4 à 10 | 28 (Critique) |
| SN-2 à 100, SD-4 à 50 (poursuites seulement menacées) | 47 (Faible) |
| SN-2 à 50, SD-4 à 50 | 40 (Faible) |

Si l'écran affiche autre chose que 32 après saisie, une cellule est mal saisie.

## Lectures hors score (Maturité 8, Influence 5) — aucune valeur chiffrée, faits saisis en source/note

Règle : une lecture notée exige un pourcentage rapporté à un dénominateur (liste d'instances, panel de pairs) que le référentiel ne fixe pas. Inventer ce dénominateur fabriquerait la précision que le mémoire dénonce (F11). Les valeurs restent vides, comme pour Credit Suisse et Lafarge (0/8, 0/5) ; les faits sourcés vont dans les champs source et note.

| Lecture | Valeur | Source / note à saisir |
|---|---|---|
| SD-2, SD-5, SN-4 (maturité notées) | vide | Données internes (options stratégiques, cartographie des dépendances, conformité proactive), non observables en source ouverte. |
| SI-Q1, SD-Q1, SN-Q1, SO-Q1, CI-Q1 (déclaratifs) | vide | Déclaratifs internes, jamais cotés par construction (arbitrage B.5). |
| INF-1 Sièges en instances | vide | Gaia-X : siège au conseil 2025-2027 (D. Michiels, COMEX OVHcloud, gaia-x.eu). CISPE : signataire du code, pas de siège au conseil (cispe.cloud/board-of-directors). Aucune présence directe trouvée à l'ISO/IEC JTC 1/SC 38, au CEN, à l'ETSI ni à l'AFNOR. |
| INF-2 Budget d'influence | vide | Registre de transparence UE (OVH Groupe, n° 281155638075-51) : 200 000 à 299 999 € sur l'exercice 09/2024-08/2025, 1,7 ETP, 45 réunions de haut niveau avec la Commission (lobbyfacts.eu). HATVP : 100 000 à 199 999 € sur 09/2024-08/2025, 2 ETP, 7 fiches d'activité (hatvp.fr). Panel de pairs non fixé par le référentiel. |
| CI-2 Part de voix et tonalité | vide | Mesure Europresse non réalisée. |
| CI-3 Contre-influence | vide | Contestation publique de l'ordonnance canadienne et plaidoyer pour l'entraide judiciaire (MLAT), communiqué OVHcloud du 31/07/2026. |
| CI-4 Réseau d'alliés | vide | Adhésions déclarées : Gaia-X, European Alliance for Industrial Data, Edge and Cloud, Bitkom, France Digitale, Numeum, ESTIA (registre UE) ; France Datacenter, Hexatrust (HATVP). |
