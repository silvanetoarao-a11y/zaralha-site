# Guia Rápido de Inicialização

## Passo a Passo Completo

### 1. Iniciar o Backend (API)

Abra um terminal e execute:

```bash
cd backend
npm install
npm start
```

Você verá:
```
API rodando na porta 5000
Admin padrão: admin@admin.com / admin123
```

**Mantenha este terminal aberto!**

### 2. Iniciar o Site

Abra **OUTRO terminal** e execute:

```bash
cd site
npm install
npm start
```

Você verá:
```
========================================
Site rodando em http://localhost:8080
Acesse: http://localhost:8080
========================================
```

**Mantenha este terminal aberto também!**

### 3. Acessar o Site

Abra seu navegador e acesse:
- Site: `http://localhost:8080`
- Admin: `http://localhost:8080/admin/`

### 4. Fazer Login

- **Usuário normal**: Registre-se ou faça login
- **Admin**: Use `admin@admin.com` / `admin123`

## Estrutura de Portas

- **Backend API**: Porta `5000`
- **Site Frontend**: Porta `8080`

## Troubleshooting

### Erro "Cannot GET /"
- Certifique-se de estar usando `npm start` na pasta `site/`
- Não abra o arquivo HTML diretamente no navegador
- Use `http://localhost:8080` (não `file://`)

### Erro de conexão com API
- Verifique se o backend está rodando na porta 5000
- Verifique se a URL da API está correta em `site/index.html`

### Porta já em uso
- Feche outros programas usando as portas 5000 ou 8080
- Ou altere as portas nos arquivos de configuração
