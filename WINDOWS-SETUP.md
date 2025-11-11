# Guia Completo Windows - ZARALHA SERVERS

## Instalação para Windows

### Método Rápido (Recomendado)

1. **Abra PowerShell como Administrador**
   - Pressione `Win + X`
   - Selecione "Windows PowerShell (Admin)"

2. **Execute o script de instalação:**
   ```powershell
   cd C:\caminho\para\zaralha-servers
   powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Domain "seu-dominio.com" -Email "seu-email@exemplo.com" -ServerIP "IP_DO_SERVIDOR"
   ```

3. **Configure DNS** (no seu provedor de domínio)
   - A → @ → IP_DO_SERVIDOR
   - A → www → IP_DO_SERVIDOR

4. **Aguarde propagação DNS** (até 48 horas)

5. **Obter certificado SSL:**
   ```powershell
   certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
   ```

6. **Acesse:** https://seu-dominio.com

## Estrutura de Diretórios no Windows

```
C:\zaralha-servers\
├── site\              # Frontend
│   ├── index.html
│   ├── css\
│   └── js\
└── backend\           # API Node.js
    ├── server.js
    ├── package.json
    └── .env
```

## Gerenciar Serviços

### Nginx

```powershell
# Iniciar
cd C:\nginx
.\nginx.exe

# Parar
taskkill /F /IM nginx.exe

# Recarregar configuração
.\nginx.exe -s reload

# Testar configuração
.\nginx.exe -t
```

### Backend (PM2)

```powershell
# Ver status
pm2 status

# Ver logs
pm2 logs zaralha-api

# Reiniciar
pm2 restart zaralha-api

# Parar
pm2 stop zaralha-api

# Iniciar com Windows (já configurado)
pm2-startup install
```

### Scripts Auxiliares

```powershell
# Iniciar todos os serviços
.\start-services.ps1

# Parar todos os serviços
.\stop-services.ps1
```

## Configuração SSL

### Obter Certificado

```powershell
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com --email seu-email@exemplo.com
```

### Renovar Certificado

```powershell
certbot renew
```

### Configurar Renovação Automática

Criar tarefa agendada:
```powershell
$action = New-ScheduledTaskAction -Execute "certbot" -Argument "renew --quiet"
$trigger = New-ScheduledTaskTrigger -Daily -At 3AM
Register-ScheduledTask -TaskName "Renovar SSL ZARALHA" -Action $action -Trigger $trigger -RunLevel Highest
```

## Configuração de Firewall

```powershell
# Permitir HTTP
New-NetFirewallRule -DisplayName "ZARALHA HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Permitir HTTPS
New-NetFirewallRule -DisplayName "ZARALHA HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# Verificar regras
Get-NetFirewallRule | Where-Object DisplayName -like "*ZARALHA*"
```

## Variáveis de Ambiente

Crie `C:\zaralha-servers\backend\.env`:

```env
PORT=5000
JWT_SECRET=GERE_UM_SECRET_SEGURO_AQUI
RUST_API_KEY=GERE_UMA_API_KEY_AQUI
STEAM_API_KEY=SUA_STEAM_API_KEY
FRONTEND_URL=https://seu-dominio.com
NODE_ENV=production
```

### Gerar Secrets no PowerShell

```powershell
# JWT Secret (Base64)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# API Key (Hex)
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16))
```

## Atualizar URLs

### Frontend
Edite `C:\zaralha-servers\site\index.html`:
```javascript
window.API_URL = 'https://seu-dominio.com/api';
```

### Plugin Rust
Edite `ShopIntegration.json`:
```json
{
  "ApiUrl": "https://seu-dominio.com/api"
}
```

## Verificação

1. **Verificar Nginx:**
   ```powershell
   Get-Process -Name nginx
   ```

2. **Verificar Backend:**
   ```powershell
   pm2 status
   ```

3. **Testar Site:**
   - Acesse: https://seu-dominio.com
   - Verifique certificado SSL (cadeado verde)

4. **Testar API:**
   ```powershell
   Invoke-WebRequest -Uri "https://seu-dominio.com/api/rust/status" -Headers @{"X-API-Key"="RUST_PLUGIN_KEY"}
   ```

## Troubleshooting Windows

### Nginx não inicia
```powershell
# Verificar se porta está em uso
netstat -ano | findstr :80
netstat -ano | findstr :443

# Verificar configuração
C:\nginx\nginx.exe -t

# Ver logs
Get-Content C:\nginx\logs\error.log -Tail 50
```

### Backend não inicia
```powershell
# Verificar Node.js
node --version
npm --version

# Verificar dependências
cd C:\zaralha-servers\backend
npm install

# Ver logs PM2
pm2 logs zaralha-api --lines 100
```

### SSL não funciona
```powershell
# Verificar DNS
nslookup seu-dominio.com

# Verificar certificado
certbot certificates

# Renovar manualmente
certbot renew --force-renewal
```

### Firewall bloqueando
```powershell
# Verificar regras
Get-NetFirewallRule | Where-Object DisplayName -like "*ZARALHA*"

# Adicionar regra manualmente
New-NetFirewallRule -DisplayName "ZARALHA HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```

## Serviços Windows

### Nginx como Serviço (Opcional)

Usar NSSM:
```powershell
choco install nssm -y
nssm install Nginx "C:\nginx\nginx.exe"
nssm start Nginx
```

### PM2 já configura automaticamente

O comando `pm2-startup install` configura para iniciar com Windows.

## Logs

### Nginx
- Access: `C:\nginx\logs\zaralha-access.log`
- Error: `C:\nginx\logs\zaralha-error.log`

### Backend
```powershell
pm2 logs zaralha-api
```

### Windows Event Viewer
- Abra Event Viewer
- Navegue até: Windows Logs → Application

## Backup

### Script de Backup PowerShell

Crie `backup-zaralha.ps1`:

```powershell
$BackupDir = "C:\backups\zaralha-servers"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

# Backup do banco de dados
Copy-Item "C:\zaralha-servers\backend\database.db" "$BackupDir\db_$Date.db"

# Backup dos arquivos
Compress-Archive -Path "C:\zaralha-servers" -DestinationPath "$BackupDir\files_$Date.zip" -Force

# Manter apenas últimos 7 dias
Get-ChildItem $BackupDir | Where-Object LastWriteTime -LT (Get-Date).AddDays(-7) | Remove-Item
```

Agendar backup:
```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\scripts\backup-zaralha.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2AM
Register-ScheduledTask -TaskName "Backup ZARALHA" -Action $action -Trigger $trigger
```

## Próximos Passos

1. Configure DNS e aguarde propagação
2. Obtenha certificado SSL
3. Configure variáveis de ambiente
4. Inicie serviços
5. Acesse o site

Para mais detalhes, consulte:
- **WINDOWS-QUICKSTART.md** - Guia rápido
- **SSL-GUIDE.md** - Configuração SSL
- **DNS-SETUP.md** - Configuração DNS
