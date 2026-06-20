# 🌐 API Gateway

## 📋 Description
Point d'entrée unique pour tous les microservices avec routage intelligent.

## 🚀 Fonctionnalités
- ✅ Routage vers les microservices
- ✅ Load balancing
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security filters
- ✅ Health checks
- ✅ Service Discovery integration

## 🔌 Port
- **8080** - API Gateway

## 📦 Technologies
- Spring Boot 3.2.0
- Spring Cloud Gateway
- Spring Cloud Eureka Client
- Spring Security
- Spring Boot Actuator

## 🌐 Routes

### Services Routes
```bash
# Auth Service
http://localhost:8080/api/auth/**

# Courses Service
http://localhost:8080/api/courses/**

# Students Service
http://localhost:8080/api/students/**

# Quiz Service
http://localhost:8080/api/quiz/**
```

### Health Check
```bash
GET http://localhost:8080/actuator/health
```

## 🔧 Configuration

### Routes Configuration
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: courses-service
          uri: lb://courses-service
          predicates:
            - Path=/api/courses/**
```

## 🔐 Sécurité
- CORS configuré pour frontend
- Rate limiting par IP
- Security headers
- JWT validation

## 🐳 Docker
```bash
docker build -t api-gateway:latest .
docker run -p 8080:8080 api-gateway:latest
```

## 📊 Monitoring
- Health: http://localhost:8080/actuator/health
- Metrics: http://localhost:8080/actuator/metrics
- Gateway Routes: http://localhost:8080/actuator/gateway/routes
