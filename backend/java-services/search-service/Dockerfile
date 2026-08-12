# Path: Dockerfile
# Multi-stage build optimised for Spring Boot fat JAR

# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src

# Download dependencies first (layer caching)
RUN apk add --no-cache maven && \
    mvn dependency:go-offline -B

# Build the fat JAR
RUN mvn clean package -DskipTests -B

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /build/target/search-service-1.0.0.jar app.jar

RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 9407

ENTRYPOINT ["java", \
            "-Xmx512m", \
            "-Djava.security.egd=file:/dev/./urandom", \
            "-jar", "app.jar"]