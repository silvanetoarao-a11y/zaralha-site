# ZARALHA SERVERS - Guia Windows Completo

## Instalação Rápida

### PowerShell como Administrador

```powershell
# 1. Navegar até a pasta do projeto
cd C:\caminho\para\zaralha-servers

# 2. Executar instalação
powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Domain "seu-dominio.com" -Email "seu-email@exemplo.com" -ServerIP "IP_DO_SERVIDOR"

# 3. Configurar DNS (no provedor de domínio)
# A → @ → IP_DO_SERVIDOR
# A → www → IP_DO_SERVIDOR

# 4. Aguardar propagação DNS (até 48h)

# 5. Obter SSL
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# 6. Acessar
# https://seu-dominio.com
```

## Estrutura Windows

```
C:\zaralha-servers\
├── site\              # Frontend
│   ├── index.html
│   ├── css\
│   └── js\
└── backend\           # API
    ├── server.js
    ├── package.json
    └── .env

C:\nginx\
├── conf\
│   ├── nginx.conf
│   └── zaralha-servers.conf
└── logs\
```

## Comandos Essenciais

### Nginx
```powershell
cd C:\nginx
.\nginx.exe              # Iniciar
.\nginx.exe -s reload    # Recarregar
.\nginx.exe -s stop      # Parar
.\nginx.exe -t          # Testar config
```

### Backend
```powershell
pm2 status              # Status
pm2 logs zaralha-api    # Logs
pm2 restart zaralha-api # Reiniciar
pm2 stop zaralha-api    # Parar
```

### SSL
```powershell
certbot renew           # Renovar
certbot certificates     # Listar
```

## Configuração

### .env (Backend)
```env
PORT=5000
JWT_SECRET=GERE_SECRET_AQUI
RUST_API_KEY=GERE_KEY_AQUI
STEAM_API_KEY=SUA_KEY
FRONTEND_URL=https://seu-dominio.com
NODE_ENV=production
```

### Gerar Secrets
```powershell
# JWT Secret
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# API Key
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16))
```

## Firewall

```powershell
New-NetFirewallRule -DisplayName "ZARALHA HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "ZARALHA HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

## Verificação

- Site: https://seu-dominio.com
- API: https://seu-dominio.com/api/rust/status
- Logs: `pm2 logs zaralha-api`
