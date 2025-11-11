# ZARALHA SERVERS - Compatibilidade Windows

## ✅ Totalmente Compatível com Windows

Todo o sistema foi adaptado para funcionar perfeitamente no Windows!

## Arquivos Criados para Windows

### Scripts PowerShell
- **install-windows.ps1** - Instalação completa automatizada
- **setup-ssl-windows.ps1** - Configuração SSL
- **start-services.ps1** - Iniciar serviços
- **stop-services.ps1** - Parar serviços

### Configurações
- **nginx/zaralha-servers-windows.conf** - Nginx para Windows
- **iis/web.config** - Configuração IIS (alternativa)

### Documentação
- **WINDOWS-SETUP.md** - Guia completo Windows
- **WINDOWS-QUICKSTART.md** - Guia rápido Windows
- **IIS-SETUP.md** - Guia IIS (alternativa)

## Instalação Rápida Windows

### 1. PowerShell como Administrador

```powershell
# Navegar até a pasta do projeto
cd C:\caminho\para\zaralha-servers

# Executar instalação
powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Domain "seu-dominio.com" -Email "seu-email@exemplo.com" -ServerIP "IP_DO_SERVIDOR"
```

### 2. O Script Faz Tudo Automaticamente:
- ✅ Instala Chocolatey
- ✅ Instala Node.js
- ✅ Instala Nginx
- ✅ Instala Certbot
- ✅ Cria estrutura de diretórios
- ✅ Copia arquivos
- ✅ Instala dependências
- ✅ Configura variáveis de ambiente
- ✅ Configura Nginx
- ✅ Instala PM2
- ✅ Configura firewall
- ✅ Prepara para SSL

### 3. Configurar DNS e SSL

```powershell
# Configure DNS no seu provedor
# A → @ → IP_DO_SERVIDOR
# A → www → IP_DO_SERVIDOR

# Aguarde propagação (até 48h)

# Obter SSL
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## Diferenças Windows vs Linux

### Caminhos
- **Windows**: `C:\zaralha-servers\site`
- **Linux**: `/var/www/zaralha-servers/site`

### Comandos
- **Windows**: `.\nginx.exe`, `pm2`, PowerShell
- **Linux**: `sudo nginx`, `pm2`, bash

### Serviços
- **Windows**: PM2 + Nginx manual ou NSSM
- **Linux**: systemd + PM2

## Funcionalidades Idênticas

✅ Todas as funcionalidades funcionam igual no Windows:
- Site com design futurista
- Sistema de tradução
- Autenticação Steam/Email
- Loja com abas
- Painel admin
- Plugin Rust
- SSL/HTTPS
- Domínio próprio

## Suporte

Para problemas no Windows, consulte:
- **WINDOWS-SETUP.md** - Guia completo
- **WINDOWS-QUICKSTART.md** - Guia rápido
- Logs: `pm2 logs zaralha-api`
