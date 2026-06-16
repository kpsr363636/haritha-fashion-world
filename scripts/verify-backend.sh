#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/backend"

unset JAVA_HOME
for version in 20 18; do
  if candidate="$(/usr/libexec/java_home -v "$version" 2>/dev/null)"; then
    JAVA_HOME="$candidate"
    export JAVA_HOME
    break
  fi
done

if [ -z "${JAVA_HOME:-}" ]; then
  echo "No compatible JDK (18 or 20) found. Install one with:"
  echo "  brew install openjdk@17   # or use existing JDK 20"
  exit 1
fi

echo "Using JAVA_HOME=$JAVA_HOME"
"$JAVA_HOME/bin/java" -version

if [ ! -f .mvn/wrapper/maven-wrapper.jar ]; then
  echo "Maven wrapper jar missing. Run: ./scripts/setup-maven-wrapper.sh"
  exit 1
fi

chmod +x mvnw
env JAVA_HOME="$JAVA_HOME" PATH="$JAVA_HOME/bin:$PATH" ./mvnw -q -DskipTests compile
echo "Backend compile: OK"
