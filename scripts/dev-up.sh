#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

have_cmd() { command -v "$1" >/dev/null 2>&1; }

port_open() {
  nc -z 127.0.0.1 "$1" 2>/dev/null
}

if port_open 5432 && port_open 6379; then
  log "PostgreSQL (5432) and Redis (6379) already reachable on localhost — skipping startup."
  log "Next: ./scripts/run-backend.sh"
  exit 0
fi

start_with_docker() {
  log "Starting PostgreSQL and Redis with Docker Compose..."
  docker compose up -d
  docker compose ps
}

start_with_brew() {
  log "Docker not found — using Homebrew services for PostgreSQL and Redis."

  if ! have_cmd brew; then
    cat <<'EOF'
Homebrew is not installed.

Install one of:
  1. Docker Desktop: https://www.docker.com/products/docker-desktop/
  2. Homebrew: https://brew.sh/ then run:
       brew install postgresql@15 redis
       brew services start postgresql@15
       brew services start redis
       createdb haritha_fashion || true
EOF
    exit 1
  fi

  brew list postgresql@15 >/dev/null 2>&1 || brew install postgresql@15
  brew list redis >/dev/null 2>&1 || brew install redis

  brew services start postgresql@15
  brew services start redis

  export PATH="$(brew --prefix postgresql@15)/bin:$PATH"
  sleep 2

  # Match docker-compose credentials (postgres/postgres)
  psql postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='postgres'" | grep -q 1 \
    || psql postgres -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';" 2>/dev/null || true
  psql postgres -tc "SELECT 1 FROM pg_database WHERE datname='haritha_fashion'" | grep -q 1 \
    || psql postgres -c "CREATE DATABASE haritha_fashion OWNER postgres;" 2>/dev/null || true
  createdb haritha_fashion 2>/dev/null || true

  log "PostgreSQL and Redis started via Homebrew."
  log "DB: jdbc:postgresql://localhost:5432/haritha_fashion (user: $(whoami) or postgres)"
}

if have_cmd docker && docker info >/dev/null 2>&1; then
  start_with_docker
elif have_cmd docker; then
  log "Docker is installed but not running. Start Docker Desktop, then re-run: ./scripts/dev-up.sh"
  exit 1
else
  start_with_brew
fi

log "Dev infrastructure is ready."
log "Next: cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev"
