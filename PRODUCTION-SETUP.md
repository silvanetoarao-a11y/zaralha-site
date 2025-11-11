# Guia de Produção - ZARALHA SERVERS

## Instalação Completa

### 1. Preparar Servidor
```bash
sudo apt-get update && sudo apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
```

### 2. Configurar DNS
- A → @ → IP_DO_SERVIDOR
- A → www → IP_DO_SERVIDOR
- Aguarde propagação (até 48h)

### 3. Instalar Site
```bash
sudo mkdir -p /var/www/zaralha-servers/{site,backend}
sudo cp -r site/* /var/www/zaralha-servers/site/
sudo cp -r backend/* /var/www/zaralha-servers/backend/
cd /var/www/zaralha-servers/backend && sudo npm install
```

### 4. Configurar Nginx
```bash
sudo cp nginx/zaralha-servers.conf /etc/nginx/sites-available/zaralha-servers
sudo nano /etc/nginx/sites-available/zaralha-servers  # Edite o domínio
sudo ln -s /etc/nginx/sites-available/zaralha-servers /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Obter SSL
```bash
sudo certbot --nginx -d zaralha-servers.com -d www.zaralha-servers.com
```

### 6. Configurar Backend
```bash
cd /var/www/zaralha-servers/backend
sudo nano .env  # Configure variáveis
sudo npm install -g pm2
pm2 start server.js --name zaralha-api
pm2 save && pm2 startup
```

### 7. Firewall
```bash
sudo ufw allow 22,80,443/tcp
sudo ufw enable
```

## Variáveis de Ambiente (.env)

```env
PORT=5000
JWT_SECRET=$(openssl rand -base64 32)
RUST_API_KEY=$(openssl rand -hex 32)
STEAM_API_KEY=SUA_STEAM_API_KEY
FRONTEND_URL=https://zaralha-servers.com
NODE_ENV=production
```

## Atualizar Frontend

Edite `/var/www/zaralha-servers/site/index.html`:
```javascript
window.API_URL = 'https://zaralha-servers.com/api';
```

## Verificação

- Acesse: https://zaralha-servers.com
- Verifique certificado SSL
- Teste API: https://zaralha-servers.com/api/rust/status
