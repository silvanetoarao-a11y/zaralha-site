#!/bin/bash
# Script de Instalação Automatizada
# Execute: sudo bash install-production.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=========================================="
echo "ZARALHA SERVERS - Instalação de Produção"
echo "==========================================${NC}"

if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Execute como root (sudo)${NC}"
    exit 1
fi

read -p "Digite seu domínio (ex: zaralha-servers.com): " DOMAIN
read -p "Digite seu email: " EMAIL

SITE_PATH="/var/www/zaralha-servers"
NGINX_CONF="/etc/nginx/sites-available/zaralha-servers"

echo -e "${YELLOW}Configurando para: $DOMAIN${NC}"

# Instalar dependências
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx nodejs npm

# Criar diretórios
mkdir -p $SITE_PATH/{site,backend}
if [ -d "site" ]; then
    cp -r site/* $SITE_PATH/site/
fi
if [ -d "backend" ]; then
    cp -r backend/* $SITE_PATH/backend/
fi

# Instalar dependências backend
cd $SITE_PATH/backend
npm install --production

# Configurar Nginx
if [ -f "nginx/zaralha-servers.conf" ]; then
    cp nginx/zaralha-servers.conf $NGINX_CONF
    sed -i "s/zaralha-servers.com/$DOMAIN/g" $NGINX_CONF
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    nginx -t
    systemctl reload nginx
fi

# Configurar permissões
chown -R www-data:www-data $SITE_PATH

# Obter SSL
echo -e "${YELLOW}Aguarde a propagação do DNS antes de continuar!${NC}"
read -p "DNS configurado? (s/n): " DNS_OK
if [ "$DNS_OK" = "s" ]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
fi

echo -e "${GREEN}Instalação concluída!${NC}"
