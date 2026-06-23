# Handoff — ROS (Return on Sovereignty)

> État de reprise rapide. Détail des tâches dans `tasks/todo.md`, leçons dans `tasks/lessons.md`.

## Le projet en une phrase
Framework d'audit de souveraineté d'entreprise (RoS v3.0) — 5 dimensions, 30 indicateurs, **mono-entreprise**. React+Vite / Express / stockage JSON. Adossé au mémoire CRO 3.0 (EGE 2025-2026).

## Déploiement (rappel)
- **2 clones** : dev `/home/Felfool/ros`, prod `/var/www/ros`.
- Prod servie sur `https://ros.taraji-conseil.fr`, backend pm2 `ros-backend` (port 3003).
- Déploiement via le skill **`/ros-ship`** — jamais sans feu vert explicite.

## État actuel (2026-06-23)
- ✅ **Refonte CSS web committée** (`a64aa20`) : thème sombre + accent bleu, tokens spacing/radius, animations. Validée visuellement (`tasks/screenshots/`). **Pas encore déployée en prod.**
- ✅ **Mobile natif abandonné** → la PWA est la stratégie mobile officielle (parité moteur vérifiée). `mobile/` laissé en place (archivage différé).
- ✅ **ROS reste déterministe** : pas de framework d'agents (VoltAgent écarté, réservé à OBOXIA).

## Prochaines étapes ouvertes
1. Déployer la refonte CSS en prod (`/ros-ship`) — en attente feu vert.
2. Tester l'install PWA sur iPhone + Android réels (manuel, côté Naouphel).
3. (Différé) Archiver `mobile/` sur branche `archive/expo` + le retirer de l'arbre.

## Pièges à NE PAS refaire
- Ne pas réintroduire le multi-entreprise (contrainte de confidentialité).
- Toute logique de score → `frontend/src/ros-engine.js` uniquement, jamais inline.
- Toujours rebuilder le frontend après modif React, avant d'annoncer la fin.
- Ne pas toucher `backend/data/storage.json` à la main.
