# Stage 1: Build the application using Maven
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the JAR file while skipping tests for speed
RUN mvn clean package -DskipTests

# Stage 2: Run the application using a modern, lightweight JRE
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copy the JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8081

# Run the jar file 
ENTRYPOINT ["java", "-jar", "app.jar"]
