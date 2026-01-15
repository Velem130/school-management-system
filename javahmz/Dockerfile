# Use official Java 17 runtime
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml from javahmz
COPY javahmz/mvnw .
COPY javahmz/.mvn .mvn
COPY javahmz/pom.xml .

# Download dependencies (cache layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY javahmz/src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose Spring Boot port
EXPOSE 8080

# Run the Spring Boot application
CMD ["sh", "-c", "java -jar target/*.jar"]
