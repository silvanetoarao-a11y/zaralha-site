# Guia IIS para Windows - ZARALHA SERVERS

## Instalação do IIS

### Habilitar IIS no Windows

```powershell
# PowerShell como Administrador
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-ApplicationInit, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-HttpCompressionStatic, IIS-ManagementConsole, IIS-ASPNET45
```

### Instalar URL Rewrite Module

Baixe e instale: https://www.iis.net/downloads/microsoft/url-rewrite

### Instalar Application Request Routing (ARR)

Baixe e instale: https://www.iis.net/downloads/microsoft/application-request-routing

## Configuração do Site

### Criar Site no IIS

1. Abra IIS Manager (`inetmgr`)
2. Clique com botão direito em "Sites" → "Add Website"
3. Configure:
   - Site name: ZARALHA SERVERS
   - Physical path: `C:\zaralha-servers\site`
   - Binding: HTTP na porta 80
   - Host name: seu-dominio.com

### Adicionar Binding HTTPS

1. Selecione o site
2. Clique em "Bindings"
3. Adicione:
   - Type: https
   - Port: 443
   - SSL certificate: (será configurado pelo Certbot)

### Copiar web.config

Copie o arquivo `iis\web.config` para `C:\zaralha-servers\site\web.config`

### Configurar Proxy Reverso para API

No IIS Manager:
1. Selecione o site
2. Abra "URL Rewrite"
3. Adicione regra:
   - Pattern: `^api/(.*)`
   - Rewrite URL: `http://localhost:5000/api/{R:1}`
   - Action: Rewrite

## Obter Certificado SSL com Certbot

```powershell
certbot --installer iis -d seu-dominio.com -d www.seu-dominio.com
```

## Gerenciar Site

### IIS Manager
- Iniciar/Parar: Clique com botão direito no site → Start/Stop
- Recarregar: Clique com botão direito → Restart

### PowerShell
```powershell
# Iniciar site
Start-Website -Name "ZARALHA SERVERS"

# Parar site
Stop-Website -Name "ZARALHA SERVERS"

# Recarregar
Restart-WebAppPool -Name "ZARALHA SERVERS"
```

## Vantagens do IIS

- Integração nativa com Windows
- Gerenciamento visual fácil
- Suporte a .NET (se necessário no futuro)
- Logs integrados ao Event Viewer

## Desvantagens

- Mais pesado que Nginx
- Requer mais configuração manual
- Certbot funciona melhor com Nginx

## Recomendação

Para Windows, recomendamos usar **Nginx** (mais leve e fácil de configurar), mas IIS é uma alternativa válida.
