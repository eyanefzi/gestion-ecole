# 🔧 Config Server

## 📋 Description
Serveur de configuration centralisé pour tous les microservices. Utilise Spring Cloud Config pour gérer les configurations de manière centralisée.

## 🚀 Fonctionnalités
- ✅ Configuration centralisée
- ✅ Support Git et système de fichiers local
- ✅ Sécurité avec authentification basique
- ✅ Enregistrement sur Eureka
- ✅ Health checks et monitoring

## 🔌 Port
- **8888** - Config Server

## 📦 Dépendances
- Spring Cloud Config Server
- Spring Cloud Eureka Client
- Spring Boot Actuator
- Spring Security

## 🔐 Sécurité
- **Username**: configuser
- **Password**: configpass

## 🌐 Endpoints

### Configuration
```bash
# Récupérer la configuration d'un service
GET http://localhost:8888/{service-name}/{profile}

# Exemple
GET http://localhost:8888/courses-service/docker
```

### Health Check
```bash
GET http://localhost:8888/actuator/health
```

### Metrics
```bash
GET http://localhost:8888/actuator/metrics
```

## 🐳 Docker

### Build
```bash
docker build -t config-server:latest .
```

### Run
```bash
docker run -p 8888:8888 config-server:latest
```

## 🔧 Configuration

### application.yml
```yaml
server:
  port: 8888

spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        git:
          uri: file://${user.home}/config-repo
```

## 📝 Utilisation

### 1. Démarrer le service
```bash
mvn spring-boot:run
```

### 2. Vérifier le statut
```bash
curl http://localhost:8888/actuator/health
```

### 3. Récupérer une configuration
```bash
curl -u configuser:configpass http://localhost:8888/courses-service/docker
```

## 🔗 Intégration avec les autres services

Les services clients doivent ajouter dans leur `application.yml` :
```yaml
spring:
  cloud:
    config:
      uri: http://localhost:8888
      username: configuser
      password: configpass
```

## 📊 Monitoring
- Health: http://localhost:8888/actuator/health
- Info: http://localhost:8888/actuator/info
- Metrics: http://localhost:8888/actuator/metrics
