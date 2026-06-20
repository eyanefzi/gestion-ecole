# 👨‍🎓 Student Service

## 📋 Description
Microservice de gestion des étudiants avec communication OpenFeign vers le Courses Service.

## 🚀 Fonctionnalités
- ✅ CRUD complet des étudiants
- ✅ Communication OpenFeign avec Courses Service
- ✅ Récupération des cours d'un étudiant
- ✅ Swagger/OpenAPI documentation
- ✅ Sécurité avec Spring Security
- ✅ Health checks et monitoring
- ✅ Configuration centralisée

## 🔌 Port
- **8083** - Student Service

## 📦 Technologies
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL 8.0
- Spring Cloud OpenFeign
- Spring Cloud Eureka Client
- SpringDoc OpenAPI 2.3.0

## 🗄️ Base de Données
- **Type**: MySQL
- **Database**: students_db
- **Port**: 3306

## 🌐 Endpoints

### Swagger UI
```
http://localhost:8083/swagger-ui.html
```

### Students API
```bash
# Liste des étudiants
GET http://localhost:8083/api/students

# Étudiant par ID
GET http://localhost:8083/api/students/{id}

# Cours d'un étudiant (OpenFeign)
GET http://localhost:8083/api/students/{id}/courses

# Créer un étudiant
POST http://localhost:8083/api/students
Content-Type: application/json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "enrollmentDate": "2024-01-15"
}

# Mettre à jour
PUT http://localhost:8083/api/students/{id}

# Supprimer
DELETE http://localhost:8083/api/students/{id}
```

### Health Check
```bash
GET http://localhost:8083/actuator/health
```

## 🔗 OpenFeign
Communication avec Courses Service pour récupérer les cours d'un étudiant.

```java
@FeignClient(name = "courses-service")
public interface CoursesClient {
    @GetMapping("/api/courses")
    List<Course> getAllCourses();
}
```

## 🐳 Docker
```bash
docker build -t student-service:latest .
docker run -p 8083:8083 student-service:latest
```

## 📊 Monitoring
- Health: http://localhost:8083/actuator/health
- Metrics: http://localhost:8083/actuator/metrics
