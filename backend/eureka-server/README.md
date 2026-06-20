# 🔍 Eureka Server

## 📋 Description
Service Discovery pour l'enregistrement et la découverte de tous les microservices.

## 🚀 Fonctionnalités
- ✅ Enregistrement automatique des services
- ✅ Dashboard web pour visualiser les services
- ✅ Health checks des services enregistrés
- ✅ Load balancing côté client
- ✅ Failover automatique

## 🔌 Port
- **8761** - Eureka Server

## 📦 Technologies
- Spring Boot 3.2.0
- Spring Cloud Netflix Eureka Server
- Spring Boot Actuator
- Spring Security

## 🌐 Endpoints

### Dashboard
```
http://localhost:8761
```

### Eureka API
```bash
# Liste des services enregistrés
GET http://localhost:8761/eureka/apps

# Info d'un service spécifique
GET http://localhost:8761/eureka/apps/{SERVICE-NAME}
```

### Health Check
```bash
GET http://localhost:8761/actuator/health
```

## 🔧 Configuration

### application.yml
```yaml
server:
  port: 8761

eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
```

## 📊 Services Enregistrés
- config-server
- api-gateway
- courses-service
- student-service
- quiz-service

## 🐳 Docker
```bash
docker build -t eureka-server:latest .
docker run -p 8761:8761 eureka-server:latest
```

## 📊 Monitoring
- Health: http://localhost:8761/actuator/health
- Metrics: http://localhost:8761/actuator/metrics
