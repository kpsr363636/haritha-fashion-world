#!/usr/bin/env bash
# Deploy (or redeploy) the whole site to the VPS.
#   VPS_HOST=1.2.3.4 ./scripts/deploy-vps.sh
# Requires .env.prod in the repo root (copy from .env.prod.example).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VPS_HOST="${VPS_HOST:?Set VPS_HOST to the server IP}"
VPS_USER="${VPS_USER:-root}"
REMOTE_DIR="${REMOTE_DIR:-/opt/haritha}"
TARGET="$VPS_USER@$VPS_HOST"

[[ -f "$ROOT/.env.prod" ]] || { echo "Missing .env.prod — cp .env.prod.example .env.prod and fill it in"; exit 1; }

echo ">>> Syncing code to $TARGET:$REMOTE_DIR"
rsync -az --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude 'frontend/dist/' \
  --exclude 'backend/target/' \
  --exclude '*.pem' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude 'frontend/.env' \
  --exclude 'backend/.env' \
  --exclude '.DS_Store' \
  "$ROOT/" "$TARGET:$REMOTE_DIR/"

ssh "$TARGET" "chmod 600 $REMOTE_DIR/.env.prod"

echo ">>> Building and starting containers (first build takes several minutes)"
ssh "$TARGET" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build --remove-orphans && docker image prune -f >/dev/null"

echo ">>> Waiting for backend health"
for i in $(seq 1 40); do
  if ssh "$TARGET" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T backend wget -qO- http://localhost:8080/api/actuator/health" 2>/dev/null | grep -q UP; then
    echo "Backend is UP"
    break
  fi
  [[ $i -eq 40 ]] && { echo "Backend did not become healthy. Logs:"; ssh "$TARGET" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml --env-file .env.prod logs --tail=80 backend"; exit 1; }
  sleep 6
done

ssh "$TARGET" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml --env-file .env.prod ps"
echo ">>> Done. Site: https://$(grep '^DOMAIN=' "$ROOT/.env.prod" | cut -d= -f2)"
