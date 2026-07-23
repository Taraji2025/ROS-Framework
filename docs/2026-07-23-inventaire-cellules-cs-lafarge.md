# Inventaire des cellules — cas Credit Suisse & Lafarge (V4)

> Export généré le 2026-07-23 depuis la donnée **de production** (`/var/www/ros/backend/data/storage.json`).
> Source de vérité = le store prod, pas les specs. Scores par cellule recalculés par le moteur (`scoreCell`).

## ⚠️ État de traçabilité

Le codage des deux cas est **hypothétique** (validation de la lecture croisée du modèle), saisi sans champ `source` ni `note`.
**Aucune cellule n'est sourcée** : toutes les cellules remplies portent le badge `saisi-non-sourcé`, les voies applicables non remplies portent `vide`. Aucune cellule `sourcé-daté`.
La colonne « Source exacte » est donc vide partout — c'est précisément ce que la *passe de sourçage* doit remplir.
Les lectures Tier 2 (Maturité / Influence) et le coefficient de gouvernance **ne sont pas codés** (voir sections dédiées).

---

## Lafarge · 30/06/2014

- **Date de référence** : 30/06/2014
- **Profil / secteur** : Industrie (`industrie`) — 11 voies applicables
- **Score RoS global** : **40** — ↓ Faible
- **Scores par dimension** : SI — (non scorable) · SD 46 · SN 82 · SO 55
- **Complétude Voies** : 8/11 remplies · **Sourçage : 0 %** (0/8 sourcées)

### Voies (Tier 1 — score)

| Voie | Libellé | Fait retenu | Score | Source exacte | Badge |
|---|---|---|---|---|---|
| SI-1 | Contrôle des données critiques | — | — | — (non sourcé) | `vide` |
| SI-2 | Réversibilité cloud | — | — | — (non sourcé) | `vide` |
| SI-3 | Dépendance tech étrangère | — | — | — (non sourcé) | `vide` |
| SD-3 | Exposition capitalistique du conseil | valeur saisie **35** (`lower`, cible palier haut 10) | 30 | — (non sourcé) | `saisi-non-sourcé` |
| SD-4 | Exposition aux clauses extraterritoriales | « Aucune exposition + CA dollar < 10 % » (bande `aucune`) | 100 | — (non sourcé) | `saisi-non-sourcé` |
| SN-2 | Normes subies vs influencées | « Présente aux comités des normes clés » (bande `comites`) | 100 | — (non sourcé) | `saisi-non-sourcé` |
| SN-5 | Sanctions de juridictions tierces (% CA, 5 ans) | valeur saisie **0.2** (`lower`, cible palier haut 0.0001) | 70 | — (non sourcé) | `saisi-non-sourcé` |
| SO-1 | Diversification fournisseurs critiques | « Une dépendance forte citée » (bande `concentre`) | 50 | — (non sourcé) | `saisi-non-sourcé` |
| SO-2 | Stocks stratégiques (jours de couverture) | valeur saisie **47** (`higher`, cible palier haut 60) | 60 | — (non sourcé) | `saisi-non-sourcé` |
| SO-4 | Autonomie énergétique / ressources | « Dispositif cité sans durée » (bande `dispositif`) | 50 | — (non sourcé) | `saisi-non-sourcé` |
| SO-5 | Dispersion en zone souveraine | « ≥ 3 sites dont certains hors zone » (bande `disperse-mixte`) | 60 | — (non sourcé) | `saisi-non-sourcé` |

### Lectures Tier 2 (hors score) — Maturité & Influence

- **Maturité** : score **non codé** · rempli 0/8
- **Influence** : score **non codé** · rempli 0/5
> Aucune cellule Maturité/Influence saisie → rien à sourcer ici.

### Coefficient de gouvernance

- **Gouvernance saisie** : **non codée** (objet vide)
- **Coefficient appliqué** : ×1 (valeur par défaut, aucune réponse gouvernance saisie)

---

## Credit Suisse · 28/02/2021

- **Date de référence** : 28/02/2021
- **Profil / secteur** : Banque (`banque`) — 10 voies applicables
- **Score RoS global** : **24** — ⚠ Critique
- **Scores par dimension** : SI 100 · SD 18 · SN 38 · SO 55
- **Complétude Voies** : 7/10 remplies · **Sourçage : 0 %** (0/7 sourcées)

### Voies (Tier 1 — score)

| Voie | Libellé | Fait retenu | Score | Source exacte | Badge |
|---|---|---|---|---|---|
| SI-1 | Contrôle des données critiques | « Souverain qualifié » (bande `souverain`) | 100 | — (non sourcé) | `saisi-non-sourcé` |
| SI-2 | Réversibilité cloud | — | — | — (non sourcé) | `vide` |
| SI-3 | Dépendance tech étrangère | — | — | — (non sourcé) | `vide` |
| SD-3 | Exposition capitalistique du conseil | valeur saisie **20** (`lower`, cible palier haut 10) | 70 | — (non sourcé) | `saisi-non-sourcé` |
| SD-4 | Exposition aux clauses extraterritoriales | « Procédure en cours / monitorship » (bande `procedure`) | 10 | — (non sourcé) | `saisi-non-sourcé` |
| SN-2 | Normes subies vs influencées | « Présente via fédération seulement » (bande `federation`) | 50 | — (non sourcé) | `saisi-non-sourcé` |
| SN-5 | Sanctions de juridictions tierces (% CA, 5 ans) | valeur saisie **2** (`lower`, cible palier haut 0.0001) | 30 | — (non sourcé) | `saisi-non-sourcé` |
| SO-1 | Diversification fournisseurs critiques | « Une dépendance forte citée » (bande `concentre`) | 50 | — (non sourcé) | `saisi-non-sourcé` |
| SO-4 | Autonomie énergétique / ressources | — | — | — (non sourcé) | `vide` |
| SO-5 | Dispersion en zone souveraine | « ≥ 3 sites dont certains hors zone » (bande `disperse-mixte`) | 60 | — (non sourcé) | `saisi-non-sourcé` |

### Lectures Tier 2 (hors score) — Maturité & Influence

- **Maturité** : score **non codé** · rempli 0/8
- **Influence** : score **non codé** · rempli 0/5
> Aucune cellule Maturité/Influence saisie → rien à sourcer ici.

### Coefficient de gouvernance

- **Gouvernance saisie** : **non codée** (objet vide)
- **Coefficient appliqué** : ×1 (valeur par défaut, aucune réponse gouvernance saisie)

