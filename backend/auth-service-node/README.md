# 🔐 Auth Service Node.js

## 📋 Description
Service d'authentification alternatif en Node.js avec Prisma et Keycloak.

## 🚀 Fonctionnalités
- ✅ Authentification avec Keycloak
- ✅ Gestion des utilisateurs avec Prisma
- ✅ JWT tokens
- ✅ Enregistrement sur Eureka
- ✅ Health checks
- ✅ TypeScript

## 🔌 Port
- **3001** - Auth Service Node

## 📦 Technologies
- Node.js 20
- Express.js
- Prisma ORM
- PostgreSQL
- TypeScript
- Keycloak Client

## 🗄️ Base de Données
- **Type**: PostgreSQL
- **Database**: auth_db
- **Port**: 5432

## 🌐 Endpoints

### Auth API
```bash
# Login
POST http://localhost:3001/api/auth/login
Content-Type: application/json
{
  "username": "demo",
  "password": "demo123"
}

# Register
POST http://localhost:3001/api/auth/register
Content-Type: application/json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}

# Health Check
GET http://localhost:3001/health
```

## 🔧 Configuration

### .env
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db
KEYCLOAK_URL=http://localhost:9090
KEYCLOAK_REALM=microservices
EUREKA_HOST=localhost
EUREKA_PORT=8761
NODE_ENV=development
```

## 🚀 Démarrage

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Prisma
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

## 🐳 Docker
```bash
docker build -t auth-service-node:latest .
docker run -p 3001:3001 auth-service-node:latest
```

## 📊 Monitoring
- Health: http://localhost:3001/health
