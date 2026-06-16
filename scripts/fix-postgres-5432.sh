#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PG_BIN="/Applications/Postgres.app/Contents/Versions/17/bin"
DATA="${HOME}/Library/Application Support/Postgres/var-17-haritha"
PG15="/Library/PostgreSQL/15"
PORT=5432

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

if [[ ! -x "$PG_BIN/pg_ctl" ]]; then
  log "Install Postgres.app first: brew install --cask postgres-app"
  exit 1
fi

stop_pg15() {
  if [[ ! -x "$PG15/bin/pg_ctl" ]]; then
    return 0
  fi
  log "Stopping old PostgreSQL 15 on port 5432..."
  if [[ "$(id -u)" -eq 0 ]]; then
    "$PG15/bin/pg_ctl" stop -D "$PG15/data" -m fast 2>/dev/null || true
    launchctl unload /Library/LaunchDaemons/postgresql-15.plist 2>/dev/null || true
    launchctl unload /Library/LaunchDaemons/com.edb.launchd.postgresql-15.plist 2>/dev/null || true
  else
    osascript <<APPLESCRIPT
do shell script "$PG15/bin/pg_ctl stop -D $PG15/data -m fast 2>/dev/null || true; launchctl unload /Library/LaunchDaemons/postgresql-15.plist 2>/dev/null || true; launchctl unload /Library/LaunchDaemons/com.edb.launchd.postgresql-15.plist 2>/dev/null || true" with administrator privileges
APPLESCRIPT
  fi
}

if nc -z 127.0.0.1 "$PORT" 2>/dev/null && ! PGPASSWORD=postgres "$PG_BIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -d postgres -c "SELECT 1" >/dev/null 2>&1; then
  stop_pg15
  sleep 2
fi

if [[ ! -f "$DATA/PG_VERSION" ]]; then
  log "Initializing Haritha PostgreSQL cluster..."
  mkdir -p "$DATA"
  echo postgres > /tmp/haritha-pgpass.txt
  "$PG_BIN/initdb" -D "$DATA" -E UTF8 --locale=C -U postgres \
    --pwfile=/tmp/haritha-pgpass.txt --auth-host=scram-sha-256 --auth-local=scram-sha-256
  rm -f /tmp/haritha-pgpass.txt
  PGPASSWORD=postgres "$PG_BIN/psql" -h localhost -p "$PORT" -U postgres -d postgres \
    -c "CREATE DATABASE haritha_fashion;" 2>/dev/null || true
fi

"$PG_BIN/pg_ctl" -D "$DATA" stop -m fast 2>/dev/null || true
sleep 1

if nc -z 127.0.0.1 "$PORT" 2>/dev/null; then
  log "Port $PORT is still in use. Run manually in Terminal:"
  log "  sudo $PG15/bin/pg_ctl stop -D $PG15/data"
  exit 1
fi

log "Starting Haritha PostgreSQL on port $PORT..."
"$PG_BIN/pg_ctl" -D "$DATA" -l "$DATA/server.log" -o "-p $PORT -h localhost" start
sleep 2

PGPASSWORD=postgres "$PG_BIN/psql" -h localhost -p "$PORT" -U postgres -d postgres \
  -tc "SELECT 1 FROM pg_database WHERE datname='haritha_fashion'" | grep -q 1 \
  || PGPASSWORD=postgres "$PG_BIN/psql" -h localhost -p "$PORT" -U postgres -d postgres \
    -c "CREATE DATABASE haritha_fashion;"

PGPASSWORD=postgres "$PG_BIN/psql" -h localhost -p "$PORT" -U postgres -d haritha_fashion -c "SELECT 1;" >/dev/null

ENV_FILE="$ROOT/backend/.env"
if [[ -f "$ENV_FILE" ]]; then
  sed -i '' "s|jdbc:postgresql://localhost:[0-9]*/haritha_fashion|jdbc:postgresql://localhost:${PORT}/haritha_fashion|g" "$ENV_FILE"
fi

log "PostgreSQL fixed on port $PORT"
log "pgAdmin / JDBC: host=localhost port=$PORT user=postgres password=postgres db=haritha_fashion"
log "Restart backend: ./scripts/run-backend.sh"
