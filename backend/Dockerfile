# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r haritha && useradd -r -g haritha haritha
USER haritha

COPY --from=builder /app/target/haritha-fashion-1.0.0.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", \
  "-Xms512m", "-Xmx1024m", \
  "-XX:+UseG1GC", "-XX:MaxGCPauseMillis=200", \
  "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", \
  "-jar", "app.jar"]
