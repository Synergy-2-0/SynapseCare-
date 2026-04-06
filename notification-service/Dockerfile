# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
# Copy the parent pom and the service pom
COPY pom.xml .
COPY notification-service/pom.xml notification-service/
# Copy the source code
COPY notification-service/src notification-service/src
# Build the application
RUN mvn -f notification-service/pom.xml clean package -DskipTests

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/notification-service/target/notification-service-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8089
ENTRYPOINT ["java", "-jar", "app.jar"]
