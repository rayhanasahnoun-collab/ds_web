# ==============================================================================
# DriveEasy — Script d'automatisation et de lancement complet
# Projet Universitaire LIM3 — Architecture Microservices Spring Boot & Angular
# ==============================================================================

param (
    [switch]$Build,
    [switch]$Stop,
    [switch]$NoFrontend,
    [switch]$NoDocker
)

$ErrorActionPreference = "Continue"
$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $RootPath "driveeasy-backend"
$FrontendPath = Join-Path $RootPath "driveeasy-frontend"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "       🚗 DriveEasy — Plateforme de Gestion de Location de Voitures" -ForegroundColor Yellow
Write-Host "                Architecture Microservices Spring Cloud & Angular" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

if ($Stop) {
    Write-Host "[*] Arrêt de tous les processus DriveEasy..." -ForegroundColor Yellow
    Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -match "driveeasy" -or $_.MainWindowTitle -match "DriveEasy"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -match "DriveEasy"
    } | Stop-Process -Force -ErrorAction SilentlyContinue

    Write-Host "[+] Tous les services ont été arrêtés." -ForegroundColor Green
    exit 0
}

if ($Build) {
    Write-Host "[*] Compilation globale du projet Maven (driveeasy-backend)..." -ForegroundColor Yellow
    Set-Location $BackendPath
    $env:MAVEN_OPTS = "-Daether.connector.https.securityMode=insecure"
    mvn clean package -DskipTests
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[-] Échec de la compilation Maven." -ForegroundColor Red
        exit 1
    }
    Write-Host "[+] Compilation réussie !" -ForegroundColor Green
}

# 1. Vérification et Démarrage optionnel de Zipkin via Docker
if (-not $NoDocker) {
    Write-Host "[1/7] Vérification de Docker pour Zipkin (port 9411)..." -ForegroundColor Yellow
    $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
    if ($dockerCmd) {
        Write-Host "      Lancement du conteneur Zipkin..." -ForegroundColor Gray
        Start-Process -FilePath "docker" -ArgumentList "compose -f `"$BackendPath\docker-compose.yml`" up -d" -NoNewWindow -Wait
        Write-Host "[+] Zipkin démarré sur http://localhost:9411" -ForegroundColor Green
    } else {
        Write-Host "      [INFO] Docker n'est pas détecté dans le PATH. Zipkin est ignoré." -ForegroundColor DarkYellow
        Write-Host "      (Les microservices fonctionneront normalement sans traçage actif)." -ForegroundColor DarkYellow
    }
}

# Fonction utilitaire pour lancer un microservice dans une nouvelle fenêtre
function Start-ServiceWindow {
    param (
        [string]$Title,
        [string]$ServiceFolder,
        [int]$Port,
        [int]$WaitSeconds = 10
    )
    Write-Host "[*] Démarrage de $Title sur le port $Port..." -ForegroundColor Yellow
    $cmd = "cd `"$BackendPath\$ServiceFolder`"; `$host.ui.RawUI.WindowTitle = '$Title (Port $Port)'; `$env:MAVEN_OPTS = '-Daether.connector.https.securityMode=insecure'; mvn spring-boot:run"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
    Write-Host "    Attente de $WaitSeconds secondes..." -ForegroundColor Gray
    Start-Sleep -Seconds $WaitSeconds
}

# 2. Service Registry — Eureka (Port 8761)
Start-ServiceWindow -Title "DriveEasy Eureka Server" -ServiceFolder "service-registry" -Port 8761 -WaitSeconds 15

# 3. Config Server (Port 8888)
Start-ServiceWindow -Title "DriveEasy Config Server" -ServiceFolder "config-server" -Port 8888 -WaitSeconds 12

# 4. Microservices Métier (8081, 8082, 8083)
Start-ServiceWindow -Title "DriveEasy Vehicule Service" -ServiceFolder "vehicule-service" -Port 8081 -WaitSeconds 5
Start-ServiceWindow -Title "DriveEasy Client Service" -ServiceFolder "client-service" -Port 8082 -WaitSeconds 5
Start-ServiceWindow -Title "DriveEasy Location Service" -ServiceFolder "location-service" -Port 8083 -WaitSeconds 10

# 5. API Gateway (Port 8080)
Start-ServiceWindow -Title "DriveEasy API Gateway" -ServiceFolder "api-gateway" -Port 8080 -WaitSeconds 8

# 6. Frontend Angular (Port 4200)
if (-not $NoFrontend) {
    Write-Host "[7/7] Démarrage du Frontend Angular (port 4200)..." -ForegroundColor Yellow
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
    if ($npmCmd) {
        $ngCmd = "cd `"$FrontendPath`"; `$host.ui.RawUI.WindowTitle = 'DriveEasy Frontend Angular (Port 4200)'; npm start"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $ngCmd
        Write-Host "[+] Frontend lancé dans un nouveau terminal !" -ForegroundColor Green
    } else {
        Write-Host "      [INFO] npm/Node.js n'a pas été détecté dans le PATH." -ForegroundColor DarkYellow
        Write-Host "      Pour lancer le frontend plus tard :" -ForegroundColor DarkYellow
        Write-Host "      cd driveeasy-frontend && npm install && npm start" -ForegroundColor DarkYellow
    }
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "       🚀 Plateforme DriveEasy démarrée avec succès !" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "Tableau récapitulatif des URLs :" -ForegroundColor Cyan
Write-Host "  • Frontend Angular :      http://localhost:4200" -ForegroundColor White
Write-Host "  • API Gateway (Entrée) :  http://localhost:8080" -ForegroundColor White
Write-Host "  • Eureka Dashboard :      http://localhost:8761" -ForegroundColor White
Write-Host "  • Config Server :         http://localhost:8888/vehicule-service/default" -ForegroundColor White
Write-Host "  • Zipkin Distributed UI : http://localhost:9411" -ForegroundColor White
Write-Host ""
Write-Host "Routes API Principales (via Gateway 8080) :" -ForegroundColor Cyan
Write-Host "  • http://localhost:8080/api/vehicules" -ForegroundColor Gray
Write-Host "  • http://localhost:8080/api/clients" -ForegroundColor Gray
Write-Host "  • http://localhost:8080/api/locations" -ForegroundColor Gray
Write-Host "  • http://localhost:8080/api/locations/statistiques" -ForegroundColor Gray
Write-Host ""
Write-Host "Pour tout arrêter : .\start-driveeasy.ps1 -Stop" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Green
