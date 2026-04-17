# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
# Copy the parent pom and the service pom
COPY pom.xml .
COPY api-gateway/pom.xml api-gateway/
# Copy the source code
COPY api-gateway/src api-gateway/src
# Build the application
RUN mvn -f api-gateway/pom.xml clean package -DskipTests

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
