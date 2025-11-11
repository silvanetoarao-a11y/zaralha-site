# Guia Completo: Domínio Próprio e SSL

## Visão Geral

Este guia explica como configurar um domínio próprio com certificado SSL gratuito usando Let's Encrypt para o ZARALHA SERVERS.

## Pré-requisitos

- Servidor VPS/Dedicated com Ubuntu 20.04+ ou Debian 11+
- Domínio registrado
- Acesso root ou sudo
- Portas 80 e 443 abertas

## Passo 1: Configurar DNS

No seu provedor de DNS, adicione:
- A → @ → IP_DO_SERVIDOR
- A → www → IP_DO_SERVIDOR

Aguarde propagação (até 48h)

## Passo 2: Instalar Dependências

```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx nodejs npm
```

## Passo 3: Configurar Nginx

Copie `nginx/zaralha-servers.conf` para `/etc/nginx/sites-available/`
Edite o domínio e ative o site.

## Passo 4: Obter SSL

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## Passo 5: Configurar Backend

Crie `.env` com variáveis de ambiente e inicie com PM2.

## Passo 6: Atualizar URLs

Atualize URLs no frontend e plugin para usar HTTPS.

## Verificação

Acesse https://seu-dominio.com e verifique o certificado SSL.

## Renovação Automática

O Certbot configura renovação automática automaticamente.
