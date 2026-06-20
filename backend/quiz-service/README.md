# 📚 Quiz Service

## 📋 Description
Microservice de gestion des quiz et examens en ligne.

## 🚀 Fonctionnalités
- ✅ CRUD complet des quiz
- ✅ Gestion des questions et réponses
- ✅ Soumission et notation automatique
- ✅ Historique des tentatives
- ✅ Swagger/OpenAPI documentation
- ✅ Sécurité Spring Security
- ✅ Health checks
- ✅ Base H2 en mémoire

## 🔌 Port
- **8086** - Quiz Service

## 📦 Technologies
- Spring Boot 3.2.0
- Spring Data JPA
- H2 Database (in-memory)
- Spring Cloud Eureka Client
- SpringDoc OpenAPI 2.3.0

## 🗄️ Base de Données
- **Type**: H2 (in-memory)
- **Console**: http://localhost:8086/h2-console

## 🌐 Endpoints

### Swagger UI
```
http://localhost:8086/swagger-ui.html
```

### Quiz API
```bash
# Liste des quiz
GET http://localhost:8086/api/quiz

# Quiz par ID
GET http://localhost:8086/api/quiz/{id}

# Créer un quiz
POST http://localhost:8086/api/quiz
Content-Type: application/json
{
  "title": "Java Basics Quiz",
  "description": "Test your Java knowledge",
  "duration": 30,
  "passingScore": 70
}

# Soumettre un quiz
POST http://localhost:8086/api/quiz/{id}/submit
Content-Type: application/json
{
  "studentId": 1,
  "answers": [
    {"questionId": 1, "answer": "A"},
    {"questionId": 2, "answer": "B"}
  ]
}

# Résultats d'un étudiant
GET http://localhost:8086/api/quiz/student/{studentId}/results

# Mettre à jour
PUT http://localhost:8086/api/quiz/{id}

# Supprimer
DELETE http://localhost:8086/api/quiz/{id}
```

## 🐳 Docker
```bash
docker build -t quiz-service:latest .
docker run -p 8086:8086 quiz-service:latest
```

## 📊 Monitoring
- Health: http://localhost:8086/actuator/health
- Metrics: http://localhost:8086/actuator/metrics
