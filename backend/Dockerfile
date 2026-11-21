# =====================================================
# Multi-stage build for production-ready Docker image
# =====================================================

# -----------------------------------------------------
# Stage 1: Build (WORKS ON ARM & INTEL)
# -----------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application
COPY src ./src
RUN mvn clean package -DskipTests -B

# -----------------------------------------------------
# Stage 2: Runtime
# -----------------------------------------------------
FROM eclipse-temurin:17-jre

WORKDIR /app

# Non-root user
RUN groupadd -r spring && useradd -r -g spring spring
USER spring

# Copy JAR
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-XX:InitialRAMPercentage=50.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
