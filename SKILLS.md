# SKILLS.md — ROS Framework

Référentiel des compétences techniques construites et validées sur ce projet.

---

## Frontend (React + Vite)

| Skill | Description |
|---|---|
| `ros_engine` | Moteur de calcul RoS v3.0 — `computeScores()`, normalisation, indicateurs inverses/qualitatifs |
| `radar_chart` | Radar Chart.js des 5 dimensions (react-chartjs-2) |
| `trend_chart` | Graphe linéaire d'évolution temporelle (Line Chart.js) |
| `dim_cards` | Cartes de score par dimension avec barre de progression |
| `indicator_form` | Formulaire de saisie des 30 indicateurs avec score pill temps réel |
| `assessment_page` | Page d'évaluation complète : saisie + radar + score RoS en live |
| `history_page` | Historique des évaluations + graphe d'évolution |
| `dashboard_page` | Vue synthétique : stats, radar, trend, dernière évaluation |
| `admin_page` | Profil entreprise (mono) + gestion utilisateurs (CRUD) |
| `jwt_auth` | Authentification JWT — login, token localStorage, logout |
| `csv_export` | Export CSV des 30 indicateurs + scores calculés |
| `dark_theme` | Design system dark mode (variables CSS, glassmorphism léger) |

---

## Backend (Express.js)

| Skill | Description |
|---|---|
| `jwt_backend` | Auth JWT (jsonwebtoken + bcryptjs) — login, middleware `auth()`, rôles admin/analyst |
| `json_storage` | Persistance dans `data/storage.json` — readDB/writeDB |
| `single_company` | Mono-entreprise : `db.company` (objet unique, pas de tableau) |
| `assessments_api` | CRUD évaluations : GET/POST/DELETE `/api/assessments` |
| `users_api` | CRUD utilisateurs (admin) : GET/POST/DELETE `/api/users` |
| `company_api` | Lecture/écriture profil entreprise : GET/PUT `/api/company` (PUT: admin) |
| `stats_api` | `/api/stats` — dernière évaluation, nb évaluations, nb users, profil |
| `initdb` | `initDB()` — création automatique DB + admin par défaut (`admin/admin123`) |

---

## Calcul RoS

| Skill | Description |
|---|---|
| `weights_sectoriel` | Pondérations par secteur (standard, banque, industrie, tech, energie) |
| `norm_direct` | Normalisation directe : `(valeur / cible) * 100`, min 0 max 100 |
| `norm_inverse` | Normalisation inverse : `(cible / valeur) * 100` — SI-3, SI-4, SD-4, SN-2, SN-5, SO-3, CI-3 |
| `norm_qual` | Normalisation qualitatif 1-5 : `(v-1)/4 * 100` — SI-Q1, SD-Q1, SN-Q1, SO-Q1, CI-Q1 |
| `weighted_avg` | Moyenne pondérée partielle (ignore les indicateurs non renseignés) |
| `ros_level` | Interprétation du score : Critique (<30) / Faible (30-49) / Moyen (50-64) / Élevé (65-79) / Souverain (>=80) |

---

## Infrastructure

| Skill | Description |
|---|---|
| `pm2_backend` | PM2 `ros-backend` — port 3003, auto-restart |
| `nginx_static` | Nginx sert `/var/www/ros/dist/` + proxy `/api/` → port 3003 |
| `vite_proxy` | Dev : Vite proxifie `/api` → `localhost:3003` |
| `build_deploy` | Build : `cd frontend && npm run build` → `../dist/` |
| `certbot_ssl` | SSL via certbot — `certbot --nginx -d ros.taraji-conseil.fr` |

---

## Principes fondateurs

```
1. Mono-entreprise  → données confidentielles, jamais de multi-clients
2. Engine séparé    → toute logique de calcul dans ros-engine.js, jamais inline
3. Build-first      → toujours rebuilder après modification frontend
4. Prod-gate        → validation explicite obligatoire avant déploiement
5. Minimal          → changements chirurgicaux, pas de refactoring large
```
