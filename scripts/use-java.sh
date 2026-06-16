#!/usr/bin/env bash
# Spring Boot 3.2 + Lombok: use JDK 18 or 20. Avoid java_home -v 21+ (resolves to JDK 25 on macOS).
unset JAVA_HOME
for version in 20 18; do
  if JAVA_HOME="$(/usr/libexec/java_home -v "$version" 2>/dev/null)"; then
    export JAVA_HOME
    export PATH="$JAVA_HOME/bin:$PATH"
    break
  fi
done
