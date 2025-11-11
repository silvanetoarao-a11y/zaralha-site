# PowerShell Script - Configuração SSL para Windows
# Execute como Administrador: powershell -ExecutionPolicy Bypass -File setup-ssl-windows.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    
    [Parameter(Mandatory=$true)]
    [string]$Email
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "ZARALHA SERVERS - Configuração SSL (Windows)" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Verificar se está executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Por favor, execute como Administrador!" -ForegroundColor Red
    exit 1
}

$SitePath = "C:\zaralha-servers"
$NginxConf = "C:\nginx\conf\zaralha-servers.conf"

Write-Host "Configurando domínio: $Domain" -ForegroundColor Yellow

# 1. Verificar Chocolatey
Write-Host "[1/6] Verificando Chocolatey..." -ForegroundColor Green
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# 2. Instalar dependências
Write-Host "[2/6] Instalando dependências..." -ForegroundColor Green
choco install nginx -y
choco install nodejs -y
choco install certbot -y

# 3. Criar diretórios
Write-Host "[3/6] Criando diretórios..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "$SitePath\site" | Out-Null
New-Item -ItemType Directory -Force -Path "$SitePath\backend" | Out-Null
New-Item -ItemType Directory -Force -Path "C:\nginx\logs" | Out-Null

# 4. Copiar arquivos do site
Write-Host "[4/6] Copiando arquivos do site..." -ForegroundColor Green
if (Test-Path "site") {
    Copy-Item -Path "site\*" -Destination "$SitePath\site\" -Recurse -Force
}

# 5. Configurar Nginx
Write-Host "[5/6] Configurando Nginx..." -ForegroundColor Green
if (Test-Path "nginx\zaralha-servers-windows.conf") {
    $confContent = Get-Content "nginx\zaralha-servers-windows.conf" -Raw
    $confContent = $confContent -replace "zaralha-servers.com", $Domain
    $confContent = $confContent -replace "www.zaralha-servers.com", "www.$Domain"
    
    # Criar diretório de configuração do Nginx se não existir
    if (-not (Test-Path "C:\nginx\conf")) {
        New-Item -ItemType Directory -Force -Path "C:\nginx\conf" | Out-Null
    }
    
    Set-Content -Path $NginxConf -Value $confContent
    
    # Adicionar include no nginx.conf principal
    $nginxMainConf = "C:\nginx\conf\nginx.conf"
    if (Test-Path $nginxMainConf) {
        $mainConf = Get-Content $nginxMainConf -Raw
        if ($mainConf -notmatch "zaralha-servers") {
            $includeLine = "    include zaralha-servers.conf;"
            $mainConf = $mainConf -replace "(http\s*\{)", "`$1`n$includeLine"
            Set-Content -Path $nginxMainConf -Value $mainConf
        }
    }
    
    # Testar configuração
    & "C:\nginx\nginx.exe" -t
    
    # Reiniciar Nginx
    Stop-Process -Name nginx -Force -ErrorAction SilentlyContinue
    Start-Process "C:\nginx\nginx.exe"
}

# 6. Obter certificado SSL
Write-Host "[6/6] Obtendo certificado SSL..." -ForegroundColor Green
Write-Host "Certifique-se de que o domínio $Domain aponta para este servidor!" -ForegroundColor Yellow
Read-Host "Pressione Enter para continuar"

& certbot --nginx -d $Domain -d "www.$Domain" --non-interactive --agree-tos --email $Email

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Configuração concluída com sucesso!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Seu site está disponível em:" -ForegroundColor Green
Write-Host "https://$Domain" -ForegroundColor Cyan
Write-Host ""
