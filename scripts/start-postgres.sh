#!/usr/bin/env bash
set -euo pipefail

PG_BIN="/Applications/Postgres.app/Contents/Versions/17/bin"
DATA="${HOME}/Library/Application Support/Postgres/var-17-haritha"
PORT=5432

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

if [[ ! -x "$PG_BIN/pg_ctl" ]]; then
  log "Postgres.app not found. Install: brew install --cask postgres-app"
  exit 1
fi

if [[ ! -f "$DATA/PG_VERSION" ]]; then
  log "Initializing PostgreSQL cluster on port ${PORT}..."
  mkdir -p "$DATA"
  echo postgres > /tmp/haritha-pgpass.txt
  "$PG_BIN/initdb" -D "$DATA" -E UTF8 --locale=C -U postgres \
    --pwfile=/tmp/haritha-pgpass.txt --auth-host=scram-sha-256 --auth-local=scram-sha-256
  rm -f /tmp/haritha-pgpass.txt
fi

if "$PG_BIN/pg_ctl" -D "$DATA" status >/dev/null 2>&1; then
  log "PostgreSQL already running on port ${PORT}."
else
  log "Starting PostgreSQL on port ${PORT}..."
  "$PG_BIN/pg_ctl" -D "$DATA" -l "$DATA/server.log" -o "-p ${PORT} -h localhost" start
fi

PGPASSWORD=postgres "$PG_BIN/psql" -h localhost -p "$PORT" -U postgres -d postgres \
  -tc "SELECT 1 FROM pg_database WHERE datname='haritha_fashion'" | grep -q 1 \
  || PGPASSWORD=postgres "$PG_BIN/psql" -h localhost -p "$PORT" -U postgres -d postgres \
    -c "CREATE DATABASE haritha_fashion;"

log "PostgreSQL ready: jdbc:postgresql://localhost:${PORT}/haritha_fashion (user: postgres / password: postgres)"
log "Open UI: Postgres.app (menu bar) or pgAdmin 4"
