# PowerShell Script - Instalação Completa para Windows
# Execute como Administrador: powershell -ExecutionPolicy Bypass -File install-windows.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = ""
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "ZARALHA SERVERS - Instalação Windows" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Verificar Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Execute como Administrador!" -ForegroundColor Red
    exit 1
}

$SitePath = "C:\zaralha-servers"
$BackendPath = "$SitePath\backend"

Write-Host "Configurando para: $Domain" -ForegroundColor Yellow

# 1. Instalar Chocolatey (se necessário)
Write-Host "[1/8] Verificando Chocolatey..." -ForegroundColor Green
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    refreshenv
}

# 2. Instalar Node.js
Write-Host "[2/8] Instalando Node.js..." -ForegroundColor Green
choco install nodejs -y --force
refreshenv

# 3. Instalar Nginx
Write-Host "[3/8] Instalando Nginx..." -ForegroundColor Green
choco install nginx -y --force

# 4. Instalar Certbot
Write-Host "[4/8] Instalando Certbot..." -ForegroundColor Green
choco install certbot -y --force

# 5. Criar diretórios
Write-Host "[5/8] Criando diretórios..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "$SitePath\site" | Out-Null
New-Item -ItemType Directory -Force -Path $BackendPath | Out-Null
New-Item -ItemType Directory -Force -Path "C:\nginx\conf" | Out-Null
New-Item -ItemType Directory -Force -Path "C:\nginx\logs" | Out-Null

# 6. Copiar arquivos
Write-Host "[6/8] Copiando arquivos..." -ForegroundColor Green
if (Test-Path "site") {
    Copy-Item -Path "site\*" -Destination "$SitePath\site\" -Recurse -Force
}
if (Test-Path "backend") {
    Copy-Item -Path "backend\*" -Destination $BackendPath -Recurse -Force
}

# 7. Instalar dependências do backend
Write-Host "[7/8] Instalando dependências do backend..." -ForegroundColor Green
Set-Location $BackendPath
npm install --production

# 8. Configurar .env
Write-Host "[8/8] Configurando variáveis de ambiente..." -ForegroundColor Green
$envContent = @"
PORT=5000
JWT_SECRET=$([Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)))
RUST_API_KEY=$([System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16)))
STEAM_API_KEY=YOUR_STEAM_API_KEY_HERE
FRONTEND_URL=https://$Domain
NODE_ENV=production
"@
Set-Content -Path "$BackendPath\.env" -Value $envContent

# 9. Configurar Nginx
Write-Host "Configurando Nginx..." -ForegroundColor Green
if (Test-Path "nginx\zaralha-servers-windows.conf") {
    $confContent = Get-Content "nginx\zaralha-servers-windows.conf" -Raw
    $confContent = $confContent -replace "zaralha-servers.com", $Domain
    $confContent = $confContent -replace "www.zaralha-servers.com", "www.$Domain"
    
    Set-Content -Path "C:\nginx\conf\zaralha-servers.conf" -Value $confContent
    
    # Adicionar include no nginx.conf
    $nginxMainConf = "C:\nginx\conf\nginx.conf"
    if (Test-Path $nginxMainConf) {
        $mainConf = Get-Content $nginxMainConf -Raw
        if ($mainConf -notmatch "zaralha-servers") {
            $mainConf = $mainConf -replace "(http\s*\{)", "`$1`n    include zaralha-servers.conf;"
            Set-Content -Path $nginxMainConf -Value $mainConf
        }
    }
}

# 10. Atualizar URLs no frontend
Write-Host "Atualizando URLs no frontend..." -ForegroundColor Green
$indexHtml = "$SitePath\site\index.html"
if (Test-Path $indexHtml) {
    (Get-Content $indexHtml) -replace "http://localhost:5000/api", "https://$Domain/api" | Set-Content $indexHtml
}

# 11. Instalar PM2
Write-Host "Instalando PM2..." -ForegroundColor Green
npm install -g pm2
npm install -g pm2-windows-startup

# 12. Configurar PM2 para iniciar com Windows
Write-Host "Configurando PM2 para iniciar com Windows..." -ForegroundColor Green
pm2-startup install

# 13. Iniciar backend
Write-Host "Iniciando backend..." -ForegroundColor Green
Set-Location $BackendPath
pm2 start server.js --name zaralha-api
pm2 save

# 14. Configurar Firewall
Write-Host "Configurando Firewall..." -ForegroundColor Green
New-NetFirewallRule -DisplayName "ZARALHA HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "ZARALHA HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Instalação concluída!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Configure o DNS:" -ForegroundColor White
Write-Host "   A → @ → $ServerIP" -ForegroundColor Cyan
Write-Host "   A → www → $ServerIP" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Aguarde propagação do DNS (até 48h)" -ForegroundColor White
Write-Host ""
Write-Host "3. Obter certificado SSL:" -ForegroundColor White
Write-Host "   certbot --nginx -d $Domain -d www.$Domain --email $Email" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Acesse: https://$Domain" -ForegroundColor Green
Write-Host ""
