# Configuração DNS - ZARALHA SERVERS

## Registros DNS Necessários

Configure os seguintes registros no seu provedor de DNS:

### Registros A (IPv4)

```
Tipo: A
Nome: @
Conteúdo: SEU_IP_DO_SERVIDOR
TTL: Auto (ou 3600)

Tipo: A
Nome: www
Conteúdo: SEU_IP_DO_SERVIDOR
TTL: Auto (ou 3600)
```

## Provedores Específicos

### Cloudflare
1. Acesse o painel do Cloudflare
2. Selecione seu domínio
3. Vá em "DNS" → "Records"
4. Adicione os registros A
5. **IMPORTANTE**: Desabilite o proxy (ícone laranja) para SSL funcionar

### Namecheap
1. Acesse "Domain List" → Seu domínio → "Advanced DNS"
2. Em "Host Records", adicione os registros A

## Verificar DNS

```bash
dig zaralha-servers.com
nslookup zaralha-servers.com
```

Aguarde a propagação do DNS (até 48 horas) antes de configurar SSL!
