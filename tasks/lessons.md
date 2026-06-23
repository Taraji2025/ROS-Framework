# ROS — leçons

Format : `[date] | ce qui a mal tourné | règle pour l'éviter`

[2026-06-23] | `git push origin main` échoue : le token `ghp_…` en clair dans le remote est mort (`could not read Password … No such device or address`) → GitHub jamais mis à jour. | Les 2 clones (dev `/home/Felfool/ros`, prod `/var/www/ros`) sont sur le **même VPS** : déployer sans GitHub en pullant prod directement depuis le clone dev local — `git -C /var/www/ros pull /home/Felfool/ros main`. Le token reste à révoquer + renouveler ; une fois fait, `git push` depuis dev réaligne `origin/main`.

[2026-06-23] | Au déploiement, prod `/var/www/ros` avait une modif **non commitée** de `index.css`, alors que dev l'avait committée → un `git pull` aurait été refusé. | Avant de paniquer (red-flag « deux clones sales »), **comparer les contenus** : `diff <(cat /var/www/ros/.../index.css) <(git -C /home/Felfool/ros show HEAD:.../index.css)`. Ici byte-identiques → écarter la version prod sans perte (`git checkout -- <fichier>`) puis pull. Ne discard QUE si prouvé identique à l'entrant.
