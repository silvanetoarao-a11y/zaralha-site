# Solução: Erro "Cannot GET /"

Se você está vendo o erro "Cannot GET /" ao acessar o site, siga estes passos:

## Solução Rápida

### 1. Use o servidor Node.js (Recomendado)

```bash
cd site
npm install
npm start
```

Depois acesse: `http://localhost:8080`

### 2. Ou use Python

```bash
cd site
python -m http.server 8080
```

Depois acesse: `http://localhost:8080`

## Por que isso acontece?

O erro "Cannot GET /" ocorre quando:
- Você está tentando abrir o arquivo HTML diretamente no navegador (file://)
- O servidor HTTP não está configurado corretamente
- O servidor não está servindo arquivos estáticos

## Verificação

Certifique-se de que:
1. ✅ Você está na pasta `site/` ao executar o comando
2. ✅ O servidor está rodando (você verá uma mensagem no terminal)
3. ✅ Você está acessando `http://localhost:8080` (não `file://`)
4. ✅ A porta 8080 não está sendo usada por outro programa

## Teste Rápido

Execute este comando na pasta `site/`:

```bash
npm install && npm start
```

Você deve ver:
```
========================================
Site rodando em http://localhost:8080
Acesse: http://localhost:8080
========================================
```

Depois abra seu navegador e acesse: `http://localhost:8080`
