# Relevés de l'app pour le mémoire — 27 juillet 2026

Produit par l'application après application de la partie A de la notice (déclassement CS, critères de
gouvernance, marquage v4). **L'app fait foi pour ces chiffres.**
Source : production `https://ros.taraji-conseil.fr`, sauvegarde `storage.json.bak-2026-07-27-notice-A`.
Règle de titre = **pénalisée k=1**.

> Portée de ma lecture du mémoire : j'ai lu des **extraits ciblés** de
> `Official Memoire_CRO_3.0_EGE (8).md` (recherches sur « recalcul app », « B.6 », « 10-15 »,
> « dispersion », « quinze », « sept indicateurs »), **pas le document entier** (1 028 843 caractères).
> Les corrections ci-dessous portent donc sur les passages que j'ai effectivement vus.

---

## 1. Les huit « [recalcul app] » de 3.3.6 — valeurs à coller

### Credit Suisse · 28/02/2021 (profil banque)

| Emplacement | Valeur |
| :--- | :--- |
| SI-1 — cote | **60** |
| SN-5 — cote (≈ 4,8 % du CA) | **30** |
| Score global | **27** — zone critique ✓ *(le mot « critique » est juste)* |
| Lecture par dimension | **SI 60 · SD 18 · SN 30 · SO 60** |

Cotes complètes des voies codées : SI-1 **60** · SD-3 **70** · SD-4 **10** · SN-5 **30** · SO-5 **60**.
Vides : SI-2, SI-3, SN-2, SO-1, SO-4. Exclue par le profil : SO-2.
**Coefficient de gouvernance : 0,80** (reporting CRO au COMEX = oui ; veto formalisé = non ; veto
exercé = non). *C'était 0,70 avant cette session, par défaut et non par codage.*

### Lafarge · 30/06/2014 (profil industrie)

| Emplacement | Valeur |
| :--- | :--- |
| SN-5 — cote (≈ 0,1 % du CA) | **70** |
| Score global | **40** — ⚠️ **« zone favorable » est faux**, voir §2 |
| Lecture par dimension | **SD 46 · SN 82 · SO 55** (SI non codée) |

Cotes complètes : SD-3 **30** · SD-4 **100** · SN-2 **100** · SN-5 **70** · SO-4 **50** · SO-5 **60**.
Vides : SI-1, SI-2, SI-3, SO-1, SO-2. **Coefficient : 0,70** (aucun des trois critères documenté).

---

## 2. Corrections de texte — dont deux que la notice ne listait pas

| # | Passage | État | À écrire |
| :--- | :--- | :--- | :--- |
| a | 3.3.6, Lafarge | « Score global : [recalcul app] — **zone favorable** » | **40 — zone faible.** À 40, le niveau rendu par l'app est « ↓ Faible ». Formulation possible : « relativement plus favorable que Credit Suisse (27) », ce qui préserve la lecture croisée F11 sans dire « favorable ». |
| b | Annexe B.6 | « estimation de séance : **10-15 points** » | **3 points** (voir §3). |
| c | **3.3.6, prose** ⚠️ *non listé dans la notice* | « l'impact estimé, **dix à quinze points** sur le cas Lafarge, est documenté en annexe » | **trois points.** Le chiffre est écrit **deux fois** : en chiffres dans l'annexe B.6 et **en toutes lettres dans la prose**. Corriger B.6 seul laisserait la contradiction. |
| d | 3.3.3 | « La capacité d'influence — **sept indicateurs** » | **cinq indicateurs** (les fusions INF-1/INF-2 sont la réparation de F7). |
| e | 3.3.3 | « les **quinze** lectures de maturité et d'influence » | **treize** (8 maturité + 5 influence). |
| f | **3.3.3** ⚠️ *non listé dans la notice* | « un tiers ne code que ce que les sources ouvertes laissent voir — **sept à huit voies sur onze** dans les deux cas de la section 3.3.6 » | **cinq à six voies.** Mesuré : **CS 5 codées sur 10 applicables** (SO-2 exclue par le profil banque, donc « sur onze » est faux pour ce cas), **Lafarge 6 sur 11**. Le chiffre actuel surestime la couverture d'un tiers. |
| g | 3.3.3 | « Cinq des onze se codent sur registre opposable » | À aligner après la partie B.3 de la notice (renseignement des 7 sources manquantes). |
| h | 3.3.3 | « sanctions **extraterritoriales** » | « sanctions **de juridictions tierces** » (le libellé du modèle a déjà été changé). |

---

## 3. L'expérience F11 (annexe B.6)

Lafarge, SD-4 de « aucune » (100) à la bande médiane « citée » (50) — bascule **non persistée** :

| Règle | avant | après | écart |
| :--- | ---: | ---: | ---: |
| linéaire | 48 | 42 | 6 |
| géométrique | 44 | 39 | 5 |
| **pénalisée k=1 (titre)** | **40** | **37** | **3** |
| pénalisée k=2 | 26 | 31 | −5 |
| pénalisée k=3 | 0 | 25 | −25 |

**L'écart réel est de 3 points** sur la règle de titre — pas 10 à 15. L'ordre de grandeur de l'argument
change : ce que le silence rapporte à barème constant est **modeste**, ce qui n'affaiblit pas la
démonstration de F11 (le biais existe et est mesuré) mais interdit de le présenter comme massif.

---

## 4. 🔴 Non-monotonie de la règle pénalisée à k ≥ 2 — pour l'annexe B.5

Les deux dernières lignes du tableau ci-dessus **changent de signe** : à k=2 et k=3, **dégrader
l'entreprise fait monter son score** (26 → 31, et 0 → 25).

**Cause** : la pénalité de Mazziotta-Pareto porte sur la **dispersion**. Abaisser une valeur haute réduit
la variance ; à k ≥ 2, le gain de pénalité dépasse la perte de moyenne. **À k=1, la règle de titre, le
comportement reste correct et monotone** — le score baisse bien quand l'entreprise se dégrade.

**Pourquoi c'est un sujet de soutenance** : le mémoire présente k=1/k=2/k=3 comme un **comparatif de
robustesse**. Un jury qui refait le calcul trouvera qu'à k=2, une entreprise a intérêt à se dégrader.

**Où l'écrire** : l'annexe **B.5** appelle déjà exactement cette matière — son marqueur demande « la
formule MP telle qu'implémentée, **avec le signe de la pénalité** et le traitement des voies vides ».
Le slot existe ; il suffit d'y documenter la limite.

**Deux réparations possibles** (à trancher) : documenter comme limite connue et **restreindre le
comparatif à k=1**, ou **borner** la règle pour qu'elle ne puisse pas récompenser une dégradation.
Découvert par l'exécution, pas par la lecture du code.
