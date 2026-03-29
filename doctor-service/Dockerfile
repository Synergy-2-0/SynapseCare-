FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/doctor-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
