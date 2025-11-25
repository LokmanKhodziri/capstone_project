# Stage 1: Build the application using Maven
FROM maven:3.8.5-openjdk-17 AS build

# Set the working directory
WORKDIR /app

# Copy the Maven wrapper and pom.xml to leverage Docker layer caching
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Build the application, creating the executable JAR
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw package -DskipTests

# Stage 2: Create the final, smaller image
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Copy the JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port the application runs on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]