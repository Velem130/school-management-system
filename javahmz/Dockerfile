# Use official Java 17 runtime (lightweight Alpine version)
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy Maven wrapper and config (no javahmz/ prefix - Render is already in javahmz folder)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable (important!)
RUN chmod +x mvnw

# Download dependencies (cache layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose Spring Boot default port
EXPOSE 8080

# Run the Spring Boot application
CMD ["java", "-jar", "target/*.jar"]