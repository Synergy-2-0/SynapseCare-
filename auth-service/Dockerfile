# Multi-stage build for Spring Boot application
# Stage 1: Build
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
# Copy entire project
COPY . .
# Make sure mvnw is executable and build
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/auth-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
