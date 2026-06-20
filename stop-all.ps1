# Script d'arrêt propre de tous les services (PowerShell)

param(
    [switch]$Clean
)

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

Write-Info "=========================================="
Write-Info "ARRÊT DE L'ARCHITECTURE MICROSERVICES"
Write-Info "=========================================="

if ($Clean) {
    Write-Warning "Arrêt et suppression de tous les conteneurs, réseaux et volumes..."
    docker-compose down -v
    Write-Success "Nettoyage complet terminé!"
} else {
    Write-Info "Arrêt de tous les services..."
    docker-compose down
    Write-Success "Tous les services sont arrêtés!"
    Write-Info "Les volumes sont conservés. Utilisez -Clean pour tout supprimer."
}

Write-Info "=========================================="
Write-Success "ARRÊT TERMINÉ"
Write-Info "=========================================="
