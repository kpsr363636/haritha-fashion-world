#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/backend"

mkdir -p .mvn/wrapper

if [ ! -f .mvn/wrapper/maven-wrapper.jar ]; then
  echo "Downloading maven-wrapper.jar..."
  curl -fsSL -o .mvn/wrapper/maven-wrapper.jar \
    "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
fi

chmod +x mvnw 2>/dev/null || true
echo "Maven wrapper ready. Use: cd backend && ./mvnw compile"
