# ---------- Build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY . .

RUN mvn clean package \
    -pl llm-gateway-service \
    -am \
    -DskipTests

# ---------- Runtime ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN adduser -D -u 1000 appuser
COPY --chown=appuser:appuser --from=build /workspace/llm-gateway-service/target/*.jar app.jar
USER appuser

EXPOSE 8085

HEALTHCHECK --interval=10s --timeout=5s --retries=12 \
  CMD wget -qO- http://localhost:8085/actuator/health | grep -q '"UP"' || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
