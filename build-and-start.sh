#!/bin/bash

# Script de démarrage automatisé pour l'architecture microservices
# Ordre: Bases de données -> Keycloak -> Config Server -> Eureka -> API Gateway -> Services -> Frontend

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

wait_for_healthy() {
    local service=$1
    local max_attempts=${2:-30}
    log_info "Attente du service $service..."
    for ((i=0; i<max_attempts; i++)); do
        if docker-compose ps "$service" | grep -q "healthy\|Up"; then
            log_success "$service est prêt!"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    log_error "$service n'est pas devenu healthy"
    return 1
}

wait_for_log() {
    local service=$1
    local message=$2
    local max_attempts=${3:-60}
    log_info "Attente du message '$message' dans les logs de $service..."
    for ((i=0; i<max_attempts; i++)); do
        if docker-compose logs "$service" 2>&1 | grep -q "$message"; then
            log_success "$service a démarré!"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    log_error "$service n'a pas affiché le message attendu"
    return 1
}

# Nettoyage optionnel
if [ "$1" == "--clean" ]; then
    log_warning "Nettoyage complet..."
    docker-compose down -v
    log_success "Nettoyage terminé"
fi

log_info "=========================================="
log_info "DÉMARRAGE DE L'ARCHITECTURE MICROSERVICES"
log_info "=========================================="

# ÉTAPE 1: BASES DE DONNÉES
log_info "\n[ÉTAPE 1/8] Démarrage des bases de données..."
docker-compose up -d postgres
wait_for_healthy postgres 30

docker-compose up -d mysql
wait_for_healthy mysql 30

docker-compose up -d rabbitmq
wait_for_healthy rabbitmq 30

log_success "Toutes les bases de données sont prêtes!"

# ÉTAPE 2: KEYCLOAK
log_info "\n[ÉTAPE 2/8] Démarrage de Keycloak..."
docker-compose up -d keycloak

sleep 10
if docker-compose logs keycloak 2>&1 | grep -q "database.*does not exist"; then
    log_error "Keycloak: base de données manquante, redémarrage..."
    docker-compose restart postgres
    sleep 10
    docker-compose restart keycloak
fi

wait_for_log keycloak "Keycloak.*started" 120
log_success "Keycloak est prêt!"

# ÉTAPE 3: CONFIG SERVER
log_info "\n[ÉTAPE 3/8] Build et démarrage du Config Server..."
docker-compose up -d --build config-server
wait_for_log config-server "Started ConfigServerApplication" 90

# ÉTAPE 4: EUREKA SERVER
log_info "\n[ÉTAPE 4/8] Build et démarrage d'Eureka Server..."
docker-compose up -d --build eureka-server
wait_for_log eureka-server "Started EurekaServerApplication" 90

# ÉTAPE 5: API GATEWAY
log_info "\n[ÉTAPE 5/8] Build et démarrage de l'API Gateway..."
docker-compose up -d --build api-gateway
wait_for_log api-gateway "Started ApiGatewayApplication" 90

# ÉTAPE 6: SERVICES BUSINESS
log_info "\n[ÉTAPE 6/8] Build et démarrage des services business..."

docker-compose up -d --build student-service
wait_for_log student-service "Started StudentServiceApplication" 90

docker-compose up -d --build courses-service
wait_for_log courses-service "Started CoursesServiceApplication" 90


docker-compose up -d --build quiz-service
wait_for_log quiz-service "Started QuizServiceApplication" 90

log_success "Tous les services business sont prêts!"

# ÉTAPE 7: AUTH SERVICE NODE
log_info "\n[ÉTAPE 7/8] Build et démarrage du Auth Service Node..."
docker-compose up -d --build auth-service-node
wait_for_log auth-service-node "Server running on port" 60

log_info "Exécution des migrations Prisma..."
sleep 5
docker-compose exec -T auth-service-node npx prisma migrate deploy 2>/dev/null || true
log_success "Auth Service Node est prêt!"

# ÉTAPE 8: FRONTEND
log_info "\n[ÉTAPE 8/8] Build et démarrage du Frontend..."
docker-compose up -d --build frontend
wait_for_log frontend "start worker process" 120
log_success "Frontend est prêt!"

# RÉSUMÉ
log_info "\n=========================================="
log_success "TOUS LES SERVICES SONT DÉMARRÉS!"
log_info "=========================================="

echo ""
log_info "URLs d'accès:"
echo "  - Frontend:          http://localhost:4200"
echo "  - API Gateway:       http://localhost:8080"
echo "  - Eureka Dashboard:  http://localhost:8761"
echo "  - Keycloak Admin:    http://localhost:9090 (admin/admin)"
echo "  - RabbitMQ:          http://localhost:15672 (guest/guest)"
echo "  - Config Server:     http://localhost:8888"

echo ""
log_info "Vérification de l'état des services..."
docker-compose ps

echo ""
log_success "Démarrage terminé avec succès!"
