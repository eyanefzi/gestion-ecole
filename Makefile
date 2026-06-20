# Makefile pour l'architecture microservices

.PHONY: help start stop clean logs ps restart build status

# Couleurs pour l'affichage
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help: ## Afficher cette aide
	@echo "$(BLUE)=========================================$(NC)"
	@echo "$(GREEN)Commandes disponibles:$(NC)"
	@echo "$(BLUE)=========================================$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

start: ## Démarrer tous les services dans le bon ordre
	@echo "$(GREEN)Démarrage de tous les services...$(NC)"
	@chmod +x build-and-start.sh
	@./build-and-start.sh

start-clean: ## Démarrer avec nettoyage complet
	@echo "$(YELLOW)Démarrage avec nettoyage complet...$(NC)"
	@chmod +x build-and-start.sh
	@./build-and-start.sh --clean

stop: ## Arrêter tous les services
	@echo "$(YELLOW)Arrêt de tous les services...$(NC)"
	@chmod +x stop-all.sh
	@./stop-all.sh

clean: ## Arrêter et supprimer tous les conteneurs et volumes
	@echo "$(YELLOW)Nettoyage complet...$(NC)"
	@chmod +x stop-all.sh
	@./stop-all.sh --clean

logs: ## Afficher les logs de tous les services
	@docker-compose logs -f

ps: ## Afficher l'état de tous les services
	@docker-compose ps

status: ## Afficher l'état détaillé de tous les services
	@echo "$(BLUE)=========================================$(NC)"
	@echo "$(GREEN)État des services:$(NC)"
	@echo "$(BLUE)=========================================$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(GREEN)Services enregistrés dans Eureka:$(NC)"
	@echo "Visitez: http://localhost:8761"

restart: ## Redémarrer tous les services
	@echo "$(YELLOW)Redémarrage de tous les services...$(NC)"
	@docker-compose restart

build: ## Rebuild tous les services
	@echo "$(GREEN)Rebuild de tous les services...$(NC)"
	@docker-compose build

# Services individuels
start-db: ## Démarrer uniquement les bases de données
	@echo "$(GREEN)Démarrage des bases de données...$(NC)"
	@docker-compose up -d postgres mysql rabbitmq

start-infra: ## Démarrer l'infrastructure (DB + Keycloak + Config + Eureka)
	@echo "$(GREEN)Démarrage de l'infrastructure...$(NC)"
	@docker-compose up -d postgres mysql rabbitmq keycloak config-server eureka-server

start-gateway: ## Démarrer l'API Gateway
	@docker-compose up -d --build api-gateway

start-services: ## Démarrer tous les services business
	@echo "$(GREEN)Démarrage des services business...$(NC)"
	@docker-compose up -d --build student-service courses-service quiz-service

start-frontend: ## Démarrer le frontend
	@docker-compose up -d --build frontend

# Logs individuels
logs-gateway: ## Logs de l'API Gateway
	@docker-compose logs -f api-gateway

logs-eureka: ## Logs d'Eureka
	@docker-compose logs -f eureka-server

logs-config: ## Logs du Config Server
	@docker-compose logs -f config-server

logs-student: ## Logs du Student Service
	@docker-compose logs -f student-service

logs-courses: ## Logs du Courses Service
	@docker-compose logs -f courses-service

logs-quiz: ## Logs du Quiz Service
	@docker-compose logs -f quiz-service

logs-frontend: ## Logs du Frontend
	@docker-compose logs -f frontend

# Restart individuels
restart-gateway: ## Redémarrer l'API Gateway
	@docker-compose restart api-gateway

restart-eureka: ## Redémarrer Eureka
	@docker-compose restart eureka-server

restart-service: ## Redémarrer un service (usage: make restart-service SERVICE=student-service)
	@docker-compose restart $(SERVICE)

# Rebuild individuels
rebuild-gateway: ## Rebuild l'API Gateway
	@docker-compose up -d --build api-gateway

rebuild-service: ## Rebuild un service (usage: make rebuild-service SERVICE=student-service)
	@docker-compose up -d --build $(SERVICE)

# Utilitaires
health: ## Vérifier la santé de tous les services
	@echo "$(BLUE)=========================================$(NC)"
	@echo "$(GREEN)Vérification de la santé des services:$(NC)"
	@echo "$(BLUE)=========================================$(NC)"
	@echo ""
	@echo "$(YELLOW)API Gateway:$(NC)"
	@curl -s http://localhost:8080/actuator/health | jq . || echo "Non disponible"
	@echo ""
	@echo "$(YELLOW)Eureka Server:$(NC)"
	@curl -s http://localhost:8761/actuator/health | jq . || echo "Non disponible"
	@echo ""
	@echo "$(YELLOW)Config Server:$(NC)"
	@curl -s http://localhost:8888/actuator/health | jq . || echo "Non disponible"

urls: ## Afficher toutes les URLs d'accès
	@echo "$(BLUE)=========================================$(NC)"
	@echo "$(GREEN)URLs d'accès:$(NC)"
	@echo "$(BLUE)=========================================$(NC)"
	@echo "  Frontend:          http://localhost:4200"
	@echo "  API Gateway:       http://localhost:8080"
	@echo "  Eureka Dashboard:  http://localhost:8761"
	@echo "  Keycloak Admin:    http://localhost:8180 (admin/admin)"
	@echo "  RabbitMQ:          http://localhost:15672 (guest/guest)"
	@echo "  Config Server:     http://localhost:8888"
	@echo ""

prune: ## Nettoyer Docker (images, conteneurs, volumes non utilisés)
	@echo "$(YELLOW)Nettoyage de Docker...$(NC)"
	@docker system prune -a --volumes

stats: ## Afficher les statistiques des conteneurs
	@docker stats --no-stream

# Développement
check: ## Vérifier les prérequis
	@chmod +x check-prerequisites.sh
	@./check-prerequisites.sh

dev-setup: ## Configuration initiale pour le développement
	@echo "$(GREEN)Configuration de l'environnement de développement...$(NC)"
	@chmod +x build-and-start.sh
	@chmod +x stop-all.sh
	@chmod +x check-prerequisites.sh
	@echo "$(GREEN)Environnement prêt!$(NC)"
	@echo "$(YELLOW)Vérification des prérequis...$(NC)"
	@./check-prerequisites.sh

test-api: ## Tester l'API Gateway
	@echo "$(GREEN)Test de l'API Gateway...$(NC)"
	@curl -s http://localhost:8080/actuator/health || echo "API Gateway non disponible"

# Par défaut, afficher l'aide
.DEFAULT_GOAL := help
