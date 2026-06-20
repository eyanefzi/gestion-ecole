# 📚 Courses Service

## 📋 Description
Microservice de gestion des cours. Permet de créer, lire, mettre à jour et supprimer des cours.

## 🚀 Fonctionnalités
- ✅ CRUD complet des cours
- ✅ Validation des données
- ✅ Swagger/OpenAPI documentation
- ✅ Sécurité avec Spring Security
- ✅ Health checks et monitoring
- ✅ Configuration centralisée via Config Server
- ✅ Service Discovery avec Eureka

## 🔌 Port
- **8082** - Courses Service

## 📦 Technologies
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL 8.0
- Spring Cloud Eureka Client
- Spring Cloud Config Client
- SpringDoc OpenAPI 2.3.0
- Lombok

## 🗄️ Base de Données
- **Type**: MySQL
- **Database**: courses_db
- **Port**: 3306

## 🌐 Endpoints

### Swagger UI
```
http://localhost:8082/swagger-ui.html
```

### API Documentation
```
http://localhost:8082/v3/api-docs
```

### Courses API
```bash
# Liste des cours
GET http://localhost:8082/api/courses

# Cours par ID
GET http://localhost:8082/api/courses/{id}

# Créer un cours
POST http://localhost:8082/api/courses
Content-Type: application/json
{
  "title": "Spring Boot Advanced",
  "description": "Advanced Spring Boot concepts",
  "instructor": "John Doe",
  "durationHours": 40,
  "level": "ADVANCED"
}

# Mettre à jour un cours
PUT http://localhost:8082/api/courses/{id}

# Supprimer un cours
DELETE http://localhost:8082/api/courses/{id}
```

### Health Check
```bash
GET http://localhost:8082/actuator/health
```

## 🐳 Docker

### Build
```bash
docker build -t courses-service:latest .
```

### Run
```bash
docker run -p 8082:8082 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/courses_db \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/ \
  courses-service:latest
```

## 🔧 Configuration

### Variables d'environnement
- `SPRING_DATASOURCE_URL` - URL de la base de données
- `SPRING_DATASOURCE_USERNAME` - Utilisateur MySQL
- `SPRING_DATASOURCE_PASSWORD` - Mot de passe MySQL
- `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` - URL Eureka
- `SPRING_CLOUD_CONFIG_URI` - URL Config Server

## 📝 Modèle de Données

### Course
```java
{
  "id": Long,
  "title": String,
  "description": String,
  "instructor": String,
  "durationHours": Integer,
  "level": String (BEGINNER, INTERMEDIATE, ADVANCED)
}
```

## 🔐 Sécurité
- CORS configuré pour localhost:4200 et localhost:8080
- Session stateless
- Endpoints Swagger et Actuator publics
- Autres endpoints nécessitent authentification

## 📊 Monitoring
- Health: http://localhost:8082/actuator/health
- Metrics: http://localhost:8082/actuator/metrics
- Info: http://localhost:8082/actuator/info

## 🧪 Tests

### Démarrage local
```bash
mvn spring-boot:run
```

### Tests unitaires
```bash
mvn test
```

### Build
```bash
mvn clean package
```
