#!/bin/bash
# Script de instalação e configuração SSL para ZARALHA SERVERS
# Execute como root: sudo bash setup-ssl.sh

set -e

echo "=========================================="
echo "ZARALHA SERVERS - Configuração SSL"
echo "=========================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Por favor, execute como root (sudo)${NC}"
    exit 1
fi

# Variáveis
DOMAIN="zaralha-servers.com"
EMAIL="admin@zaralha-servers.com"  # Altere para seu email
SITE_PATH="/var/www/zaralha-servers"
NGINX_CONF="/etc/nginx/sites-available/zaralha-servers"

echo -e "${YELLOW}Configurando domínio: $DOMAIN${NC}"

# 1. Instalar dependências
echo -e "${GREEN}[1/6] Instalando dependências...${NC}"
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# 2. Criar diretórios
echo -e "${GREEN}[2/6] Criando diretórios...${NC}"
mkdir -p $SITE_PATH/site
mkdir -p $SITE_PATH/backend
mkdir -p /var/log/zaralha-servers

# 3. Copiar arquivos do site
echo -e "${GREEN}[3/6] Copiando arquivos do site...${NC}"
# Assumindo que você está executando do diretório do projeto
if [ -d "site" ]; then
    cp -r site/* $SITE_PATH/site/
    chown -R www-data:www-data $SITE_PATH/site
    chmod -R 755 $SITE_PATH/site
else
    echo -e "${YELLOW}Diretório 'site' não encontrado. Certifique-se de copiar os arquivos manualmente.${NC}"
fi

# 4. Configurar Nginx
echo -e "${GREEN}[4/6] Configurando Nginx...${NC}"
if [ -f "nginx/zaralha-servers.conf" ]; then
    cp nginx/zaralha-servers.conf $NGINX_CONF
    # Substituir domínio no arquivo
    sed -i "s/zaralha-servers.com/$DOMAIN/g" $NGINX_CONF
    sed -i "s/www.zaralha-servers.com/www.$DOMAIN/g" $NGINX_CONF
    
    # Criar link simbólico
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/zaralha-servers
    
    # Testar configuração
    nginx -t
    
    # Recarregar Nginx
    systemctl reload nginx
else
    echo -e "${RED}Arquivo de configuração Nginx não encontrado!${NC}"
    exit 1
fi

# 5. Obter certificado SSL
echo -e "${GREEN}[5/6] Obtendo certificado SSL do Let's Encrypt...${NC}"
echo -e "${YELLOW}Certifique-se de que o domínio $DOMAIN aponta para este servidor!${NC}"
read -p "Pressione Enter para continuar..."

certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# 6. Configurar renovação automática
echo -e "${GREEN}[6/6] Configurando renovação automática...${NC}"
# Certbot já cria um cron job, mas vamos verificar
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo -e "${GREEN}=========================================="
echo "Configuração concluída com sucesso!"
echo "==========================================${NC}"
echo ""
echo "Seu site está disponível em:"
echo -e "${GREEN}https://$DOMAIN${NC}"
echo ""
echo "Próximos passos:"
echo "1. Configure o DNS do seu domínio para apontar para este servidor"
echo "2. Aguarde a propagação do DNS (pode levar até 48 horas)"
echo "3. Acesse https://$DOMAIN"
echo ""
echo "Para renovar o certificado manualmente:"
echo "  sudo certbot renew"
echo ""
