# Handoff — ROS (Return on Sovereignty)

> État de reprise rapide. Détail des tâches dans `tasks/todo.md`, leçons dans `tasks/lessons.md`.

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
