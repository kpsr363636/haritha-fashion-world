#!/usr/bin/env bash
# Seed / refresh demo data in PostgreSQL for frontend manual testing.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PG_BIN="/Applications/Postgres.app/Contents/Versions/17/bin"
PORT=5432
DB=haritha_fashion
USER=postgres
export PGPASSWORD=postgres

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

# Start Postgres if available
if [[ -x "$PG_BIN/pg_ctl" ]]; then
  "$ROOT/scripts/start-postgres.sh" || true
elif command -v psql >/dev/null 2>&1; then
  PG_BIN=""
else
  log "ERROR: psql not found. Install Postgres.app or PostgreSQL."
  exit 1
fi

psql_cmd() {
  if [[ -n "$PG_BIN" && -x "$PG_BIN/psql" ]]; then
    "$PG_BIN/psql" -h localhost -p "$PORT" -U "$USER" "$@"
  else
    psql -h localhost -p "$PORT" -U "$USER" "$@"
  fi
}

log "Checking database connection..."
if ! psql_cmd -d postgres -c "SELECT 1" >/dev/null 2>&1; then
  log "ERROR: Cannot connect to PostgreSQL on port ${PORT}."
  log "Run: ./scripts/start-postgres.sh"
  exit 1
fi

log "Downloading demo images to frontend/public/images/..."
chmod +x "$ROOT/scripts/download-demo-images.sh"
"$ROOT/scripts/download-demo-images.sh" || log "WARN: Some images failed to download — placeholder SVG will be used"

psql_cmd -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='${DB}'" | grep -q 1 \
  || psql_cmd -d postgres -c "CREATE DATABASE ${DB};"

log "Applying demo seed migrations (V5 + V7)..."
for f in "$ROOT/backend/src/main/resources/db/migration/V5__demo_seed.sql" \
         "$ROOT/backend/src/main/resources/db/migration/V7__extended_demo_seed.sql"; do
  if [[ -f "$f" ]]; then
    log "Running $(basename "$f")..."
    psql_cmd -d "$DB" -v ON_ERROR_STOP=1 -f "$f"
  fi
done

log "Applying local image URL migration (V8)..."
if [[ -f "$ROOT/backend/src/main/resources/db/migration/V8__local_image_urls.sql" ]]; then
  psql_cmd -d "$DB" -v ON_ERROR_STOP=1 -f "$ROOT/backend/src/main/resources/db/migration/V8__local_image_urls.sql"
fi

log "Repairing Flyway checksums (after seed file edits)..."
(cd "$ROOT/backend" && ./mvnw -q flyway:repair \
  -Dflyway.url="jdbc:postgresql://localhost:${PORT}/${DB}" \
  -Dflyway.user="$USER" \
  -Dflyway.password="$PGPASSWORD") || log "WARN: Flyway repair skipped (run manually if backend fails to start)"

# Record V7/V8 in Flyway history if backend hasn't run them yet
psql_cmd -d "$DB" <<'SQL'
INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success)
SELECT (SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history), '7', 'extended demo seed', 'SQL', 'V7__extended_demo_seed.sql', 0, 'seed-script', NOW(), 0, true
WHERE NOT EXISTS (SELECT 1 FROM flyway_schema_history WHERE version = '7');
INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success)
SELECT (SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history), '8', 'local image urls', 'SQL', 'V8__local_image_urls.sql', 0, 'seed-script', NOW(), 0, true
WHERE NOT EXISTS (SELECT 1 FROM flyway_schema_history WHERE version = '8');
SQL

log "Data summary:"
psql_cmd -d "$DB" -c "
SELECT 'products' AS entity, COUNT(*)::text AS count FROM products
UNION ALL SELECT 'categories', COUNT(*)::text FROM categories
UNION ALL SELECT 'users', COUNT(*)::text FROM users
UNION ALL SELECT 'banners', COUNT(*)::text FROM banners
UNION ALL SELECT 'reviews', COUNT(*)::text FROM reviews
UNION ALL SELECT 'orders', COUNT(*)::text FROM orders
UNION ALL SELECT 'coupons', COUNT(*)::text FROM coupons WHERE is_active;
"

log "Done! Demo accounts (password: password):"
log "  Admin:    admin@harithafashion.com"
log "  Seller:   seller@harithafashion.com"
log "  Customer: customer@harithafashion.com"
log "Coupons: WELCOME10, FLAT200 | Gift card: HFDEMO500"
log "Start backend: ./scripts/run-backend.sh"
log "Start frontend: cd frontend && npm run dev"
