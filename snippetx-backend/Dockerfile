# 构建阶段
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 运行阶段
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# 默认启用生产环境配置
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 9999
ENTRYPOINT ["java", "-jar", "app.jar"]
