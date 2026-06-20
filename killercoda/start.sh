#!/bin/bash
# ============================================================
# Script de démarrage pour Killercoda
# Usage: bash start.sh
# ============================================================

echo "========================================"
  echo "  Microservices - Gestion d'école"
echo "  Déploiement Killercoda"
echo "========================================"

# Vérifier que docker compose est disponible
if ! command -v docker &> /dev/null; then
  echo "❌ Docker non trouvé. Installez Docker d'abord."
  exit 1
fi

echo ""
echo "📦 Pull des images depuis Docker Hub..."
docker compose pull

echo ""
echo "🚀 Démarrage des services (ordre: infra → discovery → services → monitoring)..."

# Étape 1 : Infra de base
echo "  [1/4] Démarrage bases de données + RabbitMQ + Keycloak..."
docker compose up -d postgres mysql rabbitmq keycloak
echo "  ⏳ Attente santé postgres et mysql (30s)..."
sleep 30

# Étape 2 : Discovery
echo "  [2/4] Démarrage config-server + eureka-server..."
docker compose up -d config-server eureka-server
echo "  ⏳ Attente eureka (30s)..."
sleep 30

# Étape 3 : Services métier
echo "  [3/4] Démarrage services métier..."
docker compose up -d api-gateway auth-service-node courses-service student-service quiz-service frontend
echo "  ⏳ Attente démarrage services (40s)..."
sleep 40

# Étape 4 : Monitoring
echo "  [4/4] Démarrage monitoring (Prometheus + Grafana + Zipkin)..."
docker compose up -d prometheus grafana zipkin

echo ""
echo "✅ Tous les services sont démarrés !"
echo ""
echo "========================================"
echo "  URLs d'accès"
echo "========================================"
echo "  Frontend       : http://localhost:4200"
echo "  API Gateway    : http://localhost:8080"
echo "  Eureka         : http://localhost:8761"
echo "  Keycloak       : http://localhost:9090  (admin/admin)"
echo "  RabbitMQ UI    : http://localhost:15672 (guest/guest)"
echo "  Prometheus     : http://localhost:9091"
echo "  Grafana        : http://localhost:3002  (admin/admin)"
echo "  Zipkin         : http://localhost:9411"
echo "========================================"
echo ""
echo "📊 Vérifier l'état des services:"
echo "  docker compose ps"
echo ""
