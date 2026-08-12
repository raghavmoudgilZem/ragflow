# Stage 1: Build the Spring Boot application
FROM maven:3.9.4-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY . .

RUN mvn clean package \
    -pl document-service \
    -am \
    -DskipTests

# Stage 2: Create the application image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN adduser -D -u 1000 appuser
# Copy the built jar from the specific module target directory
COPY --chown=appuser:appuser --from=build /workspace/document-service/target/*.jar app.jar
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]