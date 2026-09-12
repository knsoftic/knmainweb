#!/bin/sh
# Run this on the server after new code arrives from GitHub.
#
#   cd ~/domains/knsoftic.com/knsoftic && sh deploy.sh
#
# It installs dependencies, updates the database, rebuilds the website and restarts both apps.
# It never touches .env files or public/uploads, so your settings and images are safe.
set -e

ROOT=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT"

echo "==> Project: $ROOT"
node -v

# ---------------------------------------------------------------- API
echo "==> API: installing dependencies"
cd "$ROOT/backend"
npm ci --omit=dev

echo "==> API: updating the database"
npm run migrate

# ------------------------------------------------------------ Website
echo "==> Website: installing dependencies"
cd "$ROOT/frontend"
npm ci

echo "==> Website: building"
npm run build

# ---------------------------------------------------------- Restarting
cd "$ROOT"
if command -v pm2 >/dev/null 2>&1 && pm2 list >/dev/null 2>&1; then
  echo "==> Restarting with PM2"
  pm2 restart knsoftic-api knsoftic-web || echo "   (PM2 app names differ - restart them from the panel)"
  pm2 save || true
else
  # Hostinger's Node.js app manager restarts when this file's timestamp changes.
  mkdir -p tmp
  touch tmp/restart.txt
  echo "==> Asked the Node.js app manager to restart (tmp/restart.txt touched)."
  echo "    If the site does not update, press Restart in hPanel -> Node.js."
fi

echo "==> Done. Check https://knsoftic.com and https://knsoftic.com/admin/login"
