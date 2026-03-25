# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ROS est un framework d'audit de souveraineté d'entreprise (Return on Sovereignty v3.0) — 5 dimensions, 30 indicateurs, mono-entreprise. Développé par Naouphel Ouakaoui, École de Guerre Économique 2025-2026, Mémoire CRO 3.0.

**URL** : `https://ros.taraji-conseil.fr`

## Commands

**Frontend**
```bash
cd /var/www/ros/frontend
npm run dev        # Vite dev server (proxy → port 3003)
npm run build      # Production build → /var/www/ros/dist/
```

**Backend**
```bash
cd /var/www/ros/backend
node server.js     # Express, port 3003
```

**PM2**
```bash
pm2 restart ros-backend   # Redémarrer le backend
pm2 logs ros-backend      # Logs backend
pm2 save                  # Sauvegarder l'état PM2
```

**Déploiement complet**
```bash
cd /var/www/ros/frontend && npm run build
pm2 restart ros-backend
```

**SSL (à exécuter une fois le DNS propagé)**
```bash
certbot --nginx -d ros.taraji-conseil.fr
```

## Architecture

**Stack** : React 18 + Vite (frontend) + Express (backend) — stockage JSON, pas de base de données.

**Structure**
```
/var/www/ros/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── App.jsx        # Routing, auth, layout
│   │   ├── api.js         # Toutes les calls API
│   │   ├── ros-engine.js  # Moteur de calcul RoS (WEIGHTS, computeScores, rosLevel)
│   │   ├── index.css      # Styles globaux (variables CSS, composants)
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Assessment.jsx   # Saisie des 30 indicateurs
│   │       ├── History.jsx
│   │       ├── Guide.jsx
│   │       └── Admin.jsx        # Profil entreprise + gestion utilisateurs
│   └── vite.config.js     # Build → ../dist/, proxy /api → :3003
├── backend/
│   ├── server.js          # API REST Express (port 3003)
│   └── data/
│       └── storage.json   # Données persistantes (users, company, assessments)
└── dist/                  # Build prod servi par Nginx
```

**Fichiers clés**
- `frontend/src/ros-engine.js` — moteur de calcul : WEIGHTS par secteur, computeScores(), rosLevel(), fmt()
- `frontend/src/api.js` — toutes les calls HTTP vers le backend
- `backend/server.js` — API REST + initDB()
- `backend/data/storage.json` — état persistant

## API Backend (port 3003)

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Non | Login → JWT |
| POST | `/api/auth/change-password` | Oui | Changer mot de passe |
| GET | `/api/users` | Admin | Liste utilisateurs |
| POST | `/api/users` | Admin | Créer utilisateur |
| DELETE | `/api/users/:id` | Admin | Supprimer utilisateur |
| GET | `/api/company` | Oui | Profil entreprise |
| PUT | `/api/company` | Admin | Modifier profil entreprise |
| GET | `/api/assessments` | Oui | Toutes les évaluations |
| POST | `/api/assessments` | Oui | Créer évaluation |
| DELETE | `/api/assessments/:id` | Oui | Supprimer évaluation |
| GET | `/api/stats` | Oui | Stats globales |

## Modèle de données (storage.json)

```json
{
  "users": [{ "id", "username", "password" (bcrypt), "role" ("admin"|"analyst"), "createdAt" }],
  "company": { "name", "sector", "description" },
  "assessments": [{
    "id", "period", "sector",
    "scores": { "SI", "SD", "SN", "SO", "CI", "ros" },
    "indicators": { "si1"..."ci6" },
    "createdAt", "createdBy"
  }]
}
```

## Moteur de calcul RoS

Les 5 dimensions et leurs indicateurs sont définis dans `ros-engine.js` et `Assessment.jsx` (DIMS).
Les pondérations sectorielles (WEIGHTS) sont dans `ros-engine.js`.

**Indicateurs inverses** (plus la valeur est haute, moins le score est bon) :
SI-3, SI-4, SD-4, SN-2, SN-5, SO-3, CI-3

**Indicateurs qualitatifs** (échelle 1-5) :
SI-Q1, SD-Q1, SN-Q1, SO-Q1, CI-Q1

## DÉMARRAGE DE SESSION
1. Lire `tasks/lessons.md` si existant — appliquer toutes les leçons
2. Lire `tasks/todo.md` si existant — comprendre l'état actuel
3. Vérifier que `ros-backend` est online : `pm2 list`

## WORKFLOW

### 1. Planifier d'abord
- Passer en mode plan pour toute tâche non triviale
- Écrire le plan dans `tasks/todo.md` avant d'implémenter
- Si quelque chose ne va pas, STOP et re-planifier

### 2. Après tout changement frontend
- Toujours rebuilder : `cd /var/www/ros/frontend && npm run build`
- Vérifier que le build réussit avant d'annoncer la fin

### 3. Boucle d'auto-amélioration
- Après toute correction : mettre à jour `tasks/lessons.md`
- Format : `[date] | ce qui a mal tourné | règle pour l'éviter`

### 4. Standard de vérification
- Ne jamais marquer comme terminé sans preuve que ça fonctionne
- Vérifier les logs PM2, tester l'API avec curl

## PRINCIPES FONDAMENTAUX
- **Mono-entreprise** — ne jamais réintroduire de gestion multi-clients, les données sont confidentielles
- **Moteur de calcul séparé** — toute logique de score dans `ros-engine.js`, jamais inline dans les composants
- Simplicité d'abord — toucher le minimum de code
- Ne jamais supposer — vérifier les chemins, APIs, variables avant utilisation
- Pas de déploiement prod sans validation explicite

## Rules

- Ne jamais déployer en prod sans validation explicite.
- Toujours rebuilder le frontend après toute modification React.
- Ne jamais toucher `backend/data/storage.json` manuellement sauf urgence.
- L'app est **mono-entreprise** par décision de confidentialité — ne pas modifier cette contrainte.
- Avant toute modification : lire les fichiers concernés, proposer le changement minimal.
- `ros-engine.js` est la source de vérité pour les calculs — toute modification des indicateurs ou pondérations passe par là.

## GESTION DES TÂCHES
1. Planifier → `tasks/todo.md`
2. Vérifier → confirmer avant d'implémenter
3. Suivre → marquer comme terminé au fur et à mesure
4. Apprendre → `tasks/lessons.md` après corrections

## APPRENTISSAGES
(Claude remplit cette section au fil du temps)
