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

# Node 20.9 or newer is required. Older versions fail late, in the middle of the build,
# with confusing errors - so stop here instead, with a message that says what to do.
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
NODE_MINOR=$(node -p "process.versions.node.split('.')[1]")
if [ "$NODE_MAJOR" -lt 20 ] || { [ "$NODE_MAJOR" -eq 20 ] && [ "$NODE_MINOR" -lt 9 ]; }; then
  echo "!! This version of Node is too old. Node 20.9 or newer is required."
  echo "   Change it in hPanel -> Advanced -> Node.js, then run this script again."
  exit 1
fi

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

# The build uses Webpack on purpose (see "build" in frontend/package.json). Hostinger's
# servers are too old for Next.js's fast native compiler, so it falls back to WebAssembly -
# and the newer Turbopack builder cannot run that way. Webpack can, so it works everywhere.
# Expect this step to take several minutes on shared hosting.
echo "==> Website: building (this is the slow part)"
if ! npm run build; then
  echo "==> Build failed. Retrying with a smaller memory limit, in case the server ran out."
  NODE_OPTIONS=--max-old-space-size=1024 npm run build
fi

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
