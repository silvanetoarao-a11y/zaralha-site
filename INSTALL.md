# Instruções de Instalação e Configuração

## Pré-requisitos

- Node.js 16+ instalado
- Servidor Rust com Oxide/uMod instalado
- Steam API Key (opcional, para login Steam)

## Instalação do Backend

1. Navegue até a pasta backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor:
```bash
npm start
```

O servidor estará rodando em `http://localhost:5000`

## Instalação do Site

### Opção 1: Usando Node.js (Recomendado)

1. Navegue até a pasta site:
```bash
cd site
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

4. Acesse `http://localhost:8080`

### Opção 2: Usando Python

1. Navegue até a pasta site:
```bash
cd site
```

2. Inicie o servidor:
```bash
python -m http.server 8080
```

3. Acesse `http://localhost:8080`

### Opção 3: Usando http-server (Node.js)

1. Navegue até a pasta site:
```bash
cd site
```

2. Instale globalmente (se necessário):
```bash
npm install -g http-server
```

3. Inicie o servidor:
```bash
http-server -p 8080
```

4. Acesse `http://localhost:8080`

**IMPORTANTE:** Atualize a URL da API no arquivo `site/index.html`:
```javascript
window.API_URL = 'http://localhost:5000/api';
```

## Instalação do Plugin Rust

1. Certifique-se de que o Oxide/uMod está instalado no seu servidor Rust

2. Copie o arquivo `ShopIntegration.cs` para:
```
servidor_rust/oxide/plugins/ShopIntegration.cs
```

3. Copie o arquivo `ShopIntegration.json` para:
```
servidor_rust/oxide/config/ShopIntegration.json
```

4. Edite o arquivo de configuração `ShopIntegration.json`:
```json
{
  "API_URL": "http://seu-servidor-backend:5000/api",
  "API_KEY": "RUST_PLUGIN_KEY",
  "CheckInterval": 30
}
```

5. Reinicie o servidor Rust ou recarregue o plugin:
```
oxide.reload ShopIntegration
```

## Configuração do Steam API

1. Acesse https://steamcommunity.com/dev/apikey
2. Faça login com sua conta Steam
3. Registre um novo domínio (pode usar localhost para testes)
4. Copie a API Key gerada
5. Adicione ao arquivo `.env` do backend:
```
STEAM_API_KEY=sua-api-key-aqui
```

## Testando o Sistema

1. Inicie o backend
2. Inicie o site
3. Acesse o site e faça login
4. Adicione produtos ao carrinho
5. Finalize uma compra
6. Entre no servidor Rust
7. O plugin deve entregar os itens automaticamente

## Troubleshooting

### Backend não inicia
- Verifique se a porta 5000 está livre
- Verifique se todas as dependências foram instaladas

### Plugin não funciona
- Verifique se o Oxide está instalado corretamente
- Verifique os logs em `oxide/logs/ShopIntegration.log`
- Certifique-se de que a URL da API está acessível do servidor Rust
- Verifique se a API Key está correta

### Login Steam não funciona
- Verifique se a Steam API Key está configurada
- Verifique se o domínio está registrado na Steam
- Verifique os logs do backend para erros

### Itens não são entregues
- Verifique se o jogador está online
- Verifique se o Steam ID está correto
- Verifique os logs do plugin
- Verifique se a compra está com status "confirmed" no banco de dados
