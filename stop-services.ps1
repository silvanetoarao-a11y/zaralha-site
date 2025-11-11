# Script PowerShell - Parar Serviços Windows
# Execute: powershell -ExecutionPolicy Bypass -File stop-services.ps1

Write-Host "Parando serviços ZARALHA SERVERS..." -ForegroundColor Yellow

# Parar Nginx
$nginxProcess = Get-Process -Name nginx -ErrorAction SilentlyContinue
if ($nginxProcess) {
    Stop-Process -Name nginx -Force
    Write-Host "Nginx parado" -ForegroundColor Green
} else {
    Write-Host "Nginx não está rodando" -ForegroundColor Yellow
}

# Parar Backend
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 stop zaralha-api -ErrorAction SilentlyContinue
    Write-Host "Backend parado" -ForegroundColor Green
}

Write-Host "Serviços parados!" -ForegroundColor Green
