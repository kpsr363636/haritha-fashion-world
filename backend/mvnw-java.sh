#!/usr/bin/env bash
# Use JDK 17–21 for Spring Boot 3.2 (Java 25 breaks Lombok annotation processing).
unset JAVA_HOME
for version in 21 20 17; do
  if JAVA_HOME="$(/usr/libexec/java_home -v "$version" 2>/dev/null)"; then
    export JAVA_HOME
    break
  fi
done
