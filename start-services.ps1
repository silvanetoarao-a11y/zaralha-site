# Script PowerShell - Iniciar Serviços Windows
# Execute: powershell -ExecutionPolicy Bypass -File start-services.ps1

Write-Host "Iniciando serviços ZARALHA SERVERS..." -ForegroundColor Green

# Verificar se Nginx está instalado
if (Test-Path "C:\nginx\nginx.exe") {
    Write-Host "Iniciando Nginx..." -ForegroundColor Yellow
    $nginxProcess = Get-Process -Name nginx -ErrorAction SilentlyContinue
    if (-not $nginxProcess) {
        Start-Process "C:\nginx\nginx.exe"
        Write-Host "Nginx iniciado" -ForegroundColor Green
    } else {
        Write-Host "Nginx já está rodando" -ForegroundColor Yellow
    }
}

# Verificar se PM2 está instalado
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    Write-Host "Verificando backend..." -ForegroundColor Yellow
    $pm2Status = pm2 list 2>&1
    if ($pm2Status -match "zaralha-api") {
        Write-Host "Backend já está rodando" -ForegroundColor Green
    } else {
        Write-Host "Iniciando backend..." -ForegroundColor Yellow
        Set-Location "C:\zaralha-servers\backend"
        pm2 start server.js --name zaralha-api
        pm2 save
        Write-Host "Backend iniciado" -ForegroundColor Green
    }
} else {
    Write-Host "PM2 não encontrado. Instale com: npm install -g pm2" -ForegroundColor Red
}

Write-Host ""
Write-Host "Serviços iniciados!" -ForegroundColor Green
Write-Host "Verificar status:" -ForegroundColor Yellow
Write-Host "  pm2 status" -ForegroundColor Cyan
Write-Host "  pm2 logs zaralha-api" -ForegroundColor Cyan
