#!/bin/bash
set -e

echo "═══════════════════════════════════════"
echo "  RoS — Build Electron"
echo "═══════════════════════════════════════"

# 1. Build frontend
echo ""
echo "▶ 1/3  Build frontend React..."
cd /var/www/ros/frontend
npm run build
echo "✓ Frontend buildé → ../dist/"

# 2. Dépendances Electron
echo ""
echo "▶ 2/3  Installation dépendances Electron..."
cd /var/www/ros/electron
npm install
echo "✓ Dépendances installées"

# 3. Package selon la plateforme demandée
PLATFORM=${1:-linux}
echo ""
echo "▶ 3/3  Packaging Electron ($PLATFORM)..."

case $PLATFORM in
  linux)  npm run build:linux ;;
  win)    npm run build:win ;;
  mac)    npm run build:mac ;;
  *)      echo "Usage: $0 [linux|win|mac]" ; exit 1 ;;
esac

echo ""
echo "═══════════════════════════════════════"
echo "✓ Build terminé !"
echo "  Fichier(s) dans : /var/www/ros/electron/dist-electron/"
ls /var/www/ros/electron/dist-electron/ 2>/dev/null || true
echo "═══════════════════════════════════════"
