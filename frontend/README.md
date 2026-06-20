# 🎨 Frontend Angular

## 📋 Description
Application frontend Angular moderne avec Nginx pour l'architecture microservices.

## 🚀 Fonctionnalités
- ✅ Interface utilisateur moderne et responsive
- ✅ Authentification avec Keycloak
- ✅ Dashboard avec statistiques
- ✅ CRUD Courses
- ✅ CRUD Students
- ✅ CRUD Quiz
- ✅ Charts et graphiques (Chart.js)
- ✅ Routing Angular
- ✅ Standalone Components

## 🔌 Port
- **4200** (dev) - Angular Dev Server
- **80** (prod) - Nginx

## 📦 Technologies
- Angular 21
- TypeScript 5.9
- Chart.js 4.5
- RxJS 7.8
- Nginx 1.25 (production)

## 🌐 Pages

### Public
- `/login` - Authentification

### Protected
- `/dashboard` - Vue d'ensemble
- `/courses` - Gestion des cours
- `/students` - Gestion des étudiants
- `/quiz` - Gestion des quiz

## 🚀 Démarrage

### Development
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
# ou
ng serve

# Accéder à l'application
http://localhost:4200
```

### Build Production
```bash
# Build pour production
npm run build

# Les fichiers sont dans dist/frontend/browser/
```

### Tests
```bash
# Lancer les tests
npm test
```

## 🐳 Docker

### Build
```bash
docker build -t frontend:latest .
```

### Run
```bash
docker run -p 4200:80 frontend:latest
```

## 🔧 Configuration

### API Gateway URL
Par défaut, le frontend communique avec l'API Gateway sur:
```
http://localhost:8080
```

### Environment
Modifier `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## 📱 Design Features
- ✨ Gradients modernes
- 🎭 Animations fluides
- 📱 Design responsive
- 🎨 Palette de couleurs cohérente
- 💫 Effets hover et transitions
- 📊 Cartes statistiques animées

## 🔐 Authentification
- Login via Keycloak
- JWT tokens stockés en localStorage
- Auto-refresh des tokens
- Logout automatique si token expiré

## 📊 Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services Angular
│   │   └── models/         # Modèles TypeScript
│   ├── assets/             # Images, styles
│   └── environments/       # Configuration environnement
├── nginx.conf              # Configuration Nginx
└── Dockerfile              # Multi-stage build
```

## 🌐 API Endpoints Utilisés
```typescript
// Auth
POST /api/auth/login
POST /api/auth/register

// Courses
GET /api/courses
POST /api/courses
PUT /api/courses/{id}
DELETE /api/courses/{id}

// Students
GET /api/students
GET /api/students/{id}/courses
POST /api/students
PUT /api/students/{id}
DELETE /api/students/{id}

// Quiz
GET /api/quiz
POST /api/quiz
POST /api/quiz/{id}/submit
```

## 🐛 Troubleshooting

### CORS Errors
Vérifier que l'API Gateway autorise `http://localhost:4200`

### API Connection Failed
Vérifier que l'API Gateway est démarré sur le port 8080

### Build Errors
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```
