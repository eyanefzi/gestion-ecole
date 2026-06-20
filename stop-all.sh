#!/bin/bash

# Script d'arrêt propre de tous les services

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_info "=========================================="
log_info "ARRÊT DE L'ARCHITECTURE MICROSERVICES"
log_info "=========================================="

if [ "$1" == "--clean" ]; then
    log_warning "Arrêt et suppression de tous les conteneurs, réseaux et volumes..."
    docker-compose down -v
    log_success "Nettoyage complet terminé!"
else
    log_info "Arrêt de tous les services..."
    docker-compose down
    log_success "Tous les services sont arrêtés!"
    log_info "Les volumes sont conservés. Utilisez --clean pour tout supprimer."
fi

log_info "=========================================="
log_success "ARRÊT TERMINÉ"
log_info "=========================================="
