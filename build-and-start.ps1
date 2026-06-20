# Script de démarrage automatisé pour l'architecture microservices (PowerShell)
# Ordre: Bases de données -> Keycloak -> Config Server -> Eureka -> API Gateway -> Services -> Frontend

param(
    [switch]$Clean
)

# Fonction pour afficher les logs colorés
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Fonction pour attendre qu'un service soit healthy
function Wait-ForHealthy {
    param(
        [string]$Service,
        [int]$MaxAttempts = 30
    )

    Write-Info "Attente du service $Service..."

    for ($i = 0; $i -lt $MaxAttempts; $i++) {
        $status = docker-compose ps $Service 2>&1 | Out-String
        if ($status -match "healthy|Up") {
            Write-Success "$Service est prêt!"
            return $true
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }

    Write-Err "$Service n'est pas devenu healthy après $MaxAttempts tentatives"
    return $false
}

# Fonction pour attendre qu'un log contienne un message
function Wait-ForLog {
    param(
        [string]$Service,
        [string]$Message,
        [int]$MaxAttempts = 60
    )

    Write-Info "Attente du message '$Message' dans les logs de $Service..."

    for ($i = 0; $i -lt $MaxAttempts; $i++) {
        $logs = docker-compose logs $Service 2>&1 | Out-String
        if ($logs -match $Message) {
            Write-Success "$Service a démarré avec succès!"
            return $true
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }

    Write-Err "$Service n'a pas affiché le message attendu après $MaxAttempts tentatives"
    return $false
}

# Nettoyage optionnel
if ($Clean) {
    Write-Warning "Nettoyage de tous les conteneurs et volumes..."
    docker-compose down -v
    Write-Success "Nettoyage terminé"
}

Write-Info "=========================================="
Write-Info "DÉMARRAGE DE L'ARCHITECTURE MICROSERVICES"
Write-Info "=========================================="

# ÉTAPE 1: BASES DE DONNÉES
Write-Info "`n[ÉTAPE 1/8] Démarrage des bases de données..."
Write-Info "Démarrage de PostgreSQL..."
docker-compose up -d postgres
Wait-ForHealthy -Service "postgres" -MaxAttempts 30

Write-Info "Démarrage de MySQL..."
docker-compose up -d mysql
Wait-ForHealthy -Service "mysql" -MaxAttempts 30

Write-Info "Démarrage de RabbitMQ..."
docker-compose up -d rabbitmq
Wait-ForHealthy -Service "rabbitmq" -MaxAttempts 30

Write-Success "Toutes les bases de données sont prêtes!"

# ÉTAPE 2: KEYCLOAK
Write-Info "`n[ÉTAPE 2/8] Démarrage de Keycloak..."
docker-compose up -d keycloak

# Vérifier les logs pour détecter les erreurs de base de données
Start-Sleep -Seconds 10
$keycloakLogs = docker-compose logs keycloak 2>&1 | Out-String
if ($keycloakLogs -match "database.*does not exist") {
    Write-Err "Keycloak ne peut pas se connecter à la base de données"
    Write-Info "Recréation de la base de données PostgreSQL..."
    docker-compose restart postgres
    Start-Sleep -Seconds 10
    docker-compose restart keycloak
}

Wait-ForLog -Service "keycloak" -Message "Keycloak.*started" -MaxAttempts 120
Write-Success "Keycloak est prêt!"

# ÉTAPE 3: CONFIG SERVER
Write-Info "`n[ÉTAPE 3/8] Build et démarrage du Config Server..."
docker-compose up -d --build config-server
Wait-ForLog -Service "config-server" -Message "Started ConfigServerApplication" -MaxAttempts 90
Write-Success "Config Server est prêt!"

# ÉTAPE 4: EUREKA SERVER
Write-Info "`n[ÉTAPE 4/8] Build et démarrage d'Eureka Server..."
docker-compose up -d --build eureka-server
Wait-ForLog -Service "eureka-server" -Message "Started EurekaServerApplication" -MaxAttempts 90
Write-Success "Eureka Server est prêt!"

# ÉTAPE 5: API GATEWAY
Write-Info "`n[ÉTAPE 5/8] Build et démarrage de l'API Gateway..."
docker-compose up -d --build api-gateway
Wait-ForLog -Service "api-gateway" -Message "Started ApiGatewayApplication" -MaxAttempts 90
Write-Success "API Gateway est prêt!"

# ÉTAPE 6: SERVICES BUSINESS
Write-Info "`n[ÉTAPE 6/8] Build et démarrage des services business..."

Write-Info "Démarrage du Student Service..."
docker-compose up -d --build student-service
Wait-ForLog -Service "student-service" -Message "Started StudentServiceApplication" -MaxAttempts 90

Write-Info "Démarrage du Courses Service..."
docker-compose up -d --build courses-service
Wait-ForLog -Service "courses-service" -Message "Started CoursesServiceApplication" -MaxAttempts 90

Write-Info "Démarrage du Quiz Service..."
docker-compose up -d --build quiz-service
Wait-ForLog -Service "quiz-service" -Message "Started QuizServiceApplication" -MaxAttempts 90

Write-Success "Tous les services business sont prêts!"

# ÉTAPE 7: AUTH SERVICE NODE
Write-Info "`n[ÉTAPE 7/8] Build et démarrage du Auth Service Node..."
docker-compose up -d --build auth-service-node
Wait-ForLog -Service "auth-service-node" -Message "Server running on port" -MaxAttempts 60

# Exécuter les migrations Prisma
Write-Info "Exécution des migrations Prisma..."
Start-Sleep -Seconds 5
docker-compose exec -T auth-service-node npx prisma migrate deploy 2>&1 | Out-Null
Write-Success "Auth Service Node est prêt!"

# ÉTAPE 8: FRONTEND
Write-Info "`n[ÉTAPE 8/8] Build et démarrage du Frontend..."
docker-compose up -d --build frontend
Wait-ForLog -Service "frontend" -Message "start worker process" -MaxAttempts 120
Write-Success "Frontend est prêt!"

# RÉSUMÉ FINAL
Write-Info "`n=========================================="
Write-Success "TOUS LES SERVICES SONT DÉMARRÉS!"
Write-Info "=========================================="

Write-Host ""
Write-Info "URLs d'accès:"
Write-Host "  - Frontend:          http://localhost:4200"
Write-Host "  - API Gateway:       http://localhost:8080"
Write-Host "  - Eureka Dashboard:  http://localhost:8761"
Write-Host "  - Keycloak Admin:    http://localhost:9090 (admin/admin)"
Write-Host "  - RabbitMQ:          http://localhost:15672 (guest/guest)"
Write-Host "  - Config Server:     http://localhost:8888"

Write-Host ""
Write-Info "Commandes utiles:"
Write-Host "  - Voir tous les services:     docker-compose ps"
Write-Host "  - Voir les logs d'un service: docker-compose logs -f <service>"
Write-Host "  - Arrêter tous les services:  docker-compose down"
Write-Host "  - Redémarrer un service:      docker-compose restart <service>"

Write-Host ""
Write-Info "Vérification de l'état des services..."
docker-compose ps

Write-Host ""
Write-Success "Démarrage terminé avec succès!"
