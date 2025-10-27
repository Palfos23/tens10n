# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -DskipTests clean package

# ---- Run stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app
# Kopier den bygde jar-en (tilpass gjerne mønsteret om du vil)
COPY --from=build /app/target/*.jar app.jar
# Render setter PORT env-var; videreformidle til Spring Boot
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
