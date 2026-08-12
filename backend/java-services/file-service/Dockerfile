# ---------- Build ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace

COPY . .

RUN mvn clean package \
    -pl file-service \
    -am \
    -DskipTests

# ---------- Runtime ----------
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=build /workspace/file-service/target/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java","-jar","app.jar"]