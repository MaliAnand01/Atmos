# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies layer separately (only re-downloads if pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build the app
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:17-jre-focal
WORKDIR /app
COPY --from=build /app/target/Atmos-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Xmx256m", "app.jar"]
