# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies (caches them for faster subsequent builds)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the actual source code and build the JAR
COPY src ./src
# We skip tests here to speed up the cloud deployment
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy only the built JAR from the previous stage to keep the final server image tiny
COPY --from=build /app/target/*.jar app.jar

# Render assigns a dynamic port via the $PORT environment variable
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]