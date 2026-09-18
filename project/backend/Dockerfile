# ── Stage 1: Build Java Spring Boot Application with Maven ──
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and dependency files first for efficient caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and build executable JAR
COPY src ./src
RUN mvn package -DskipTests

# ── Stage 2: Create Lightweight Production Runtime Image ──
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/habit-hacker-backend-1.0.0.jar app.jar

# Render exposes PORT via environment variable automatically (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Execute Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
