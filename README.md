# GameServers - Sistema Completo

Sistema completo para servidores de jogos com loja integrada, autenticação Steam/Email e plugin Rust.

## Estrutura do Projeto

```
/
├── site/              # Frontend do site
│   ├── index.html    # Página principal
│   ├── css/          # Estilos
│   └── js/           # JavaScript (i18n, auth, shop)
├── backend/          # API Node.js/Express
│   ├── server.js     # Servidor principal
│   └── package.json  # Dependências
└── plugin/           # Plugin Rust (Oxide/uMod)
    ├── ShopIntegration.cs
    └── ShopIntegration.json
```

## Funcionalidades

### Site
- ✅ Sistema de tradução (PT-BR, EN, ES, RU)
- ✅ Autenticação Steam e Email
- ✅ Loja com produtos por jogo (Rust, Minecraft, DayZ)
- ✅ Carrinho de compras
- ✅ Páginas: Home, Loja, Downloads, Sobre
- ✅ Design moderno com tema neon/glassmorphism

### Backend API
- ✅ Autenticação JWT
- ✅ Login Steam (OpenID)
- ✅ Login/Registro Email
- ✅ CRUD de produtos
- ✅ Sistema de compras
- ✅ Endpoints para plugin Rust

### Plugin Rust
- ✅ Verifica entregas pendentes automaticamente
- ✅ Entrega itens diretamente no inventário
- ✅ Validação por Steam ID
- ✅ Marca entregas como concluídas na API

## Instalação

### Backend

```bash
cd backend
npm install
npm start
```

A API estará rodando em `http://localhost:5000`

### Site

Abra `site/index.html` em um servidor web ou use:

```bash
cd site
python -m http.server 8080
```

Acesse `http://localhost:8080`

### Plugin Rust

1. Copie `ShopIntegration.cs` para `oxide/plugins/`
2. Copie `ShopIntegration.json` para `oxide/config/`
3. Configure a URL da API e API Key no arquivo de configuração
4. Reinicie o servidor ou digite `oxide.reload ShopIntegration`

## Configuração

### Variáveis de Ambiente (Backend)

Crie um arquivo `.env`:

```
PORT=5000
JWT_SECRET=seu-secret-key-aqui
STEAM_API_KEY=sua-steam-api-key
RUST_API_KEY=RUST_PLUGIN_KEY
```

### Steam API Key

1. Acesse https://steamcommunity.com/dev/apikey
2. Registre uma nova API Key
3. Adicione ao `.env`

### Plugin Rust

Edite `oxide/config/ShopIntegration.json`:

```json
{
  "API_URL": "http://seu-servidor:5000/api",
  "API_KEY": "RUST_PLUGIN_KEY",
  "CheckInterval": 30
}
```

## Uso

### Como funciona o fluxo de compra:

1. Usuário faz login no site (Steam ou Email)
2. Adiciona produtos ao carrinho
3. Finaliza compra (requer Steam ID para Rust)
4. Backend processa pagamento (simulado)
5. Compra fica com status "confirmed"
6. Plugin Rust verifica entregas pendentes a cada 30s
7. Plugin entrega item ao jogador online
8. Plugin marca entrega como concluída

### Adicionar Produtos

Os produtos são armazenados no banco SQLite. Exemplo:

```sql
INSERT INTO products (id, name, description, price, game, category, itemId, quantity) 
VALUES ('rust_ak47', 'AK-47', 'Rifle AK-47', 50.00, 'rust', 'weapons', 'rifle.ak', 1);
```

### Item IDs do Rust

Use os nomes de item do Rust. Exemplos:
- `rifle.ak` - AK-47
- `rocket.launcher` - Lançador de Foguetes
- `wood` - Madeira
- `stone` - Pedra
- `scrap` - Sucata

## Segurança

- ✅ Tokens JWT para autenticação
- ✅ Senhas hash com bcrypt
- ✅ API Key para comunicação plugin-backend
- ✅ Validação de Steam ID antes de entregar

## Notas

- O sistema de pagamento está simulado. Integre com um gateway real (Mercado Pago, Stripe, etc.)
- O plugin precisa que o jogador esteja online para receber itens
- Steam ID é obrigatório para compras de Rust
- O banco de dados SQLite é criado automaticamente

## Suporte

Para problemas ou dúvidas, verifique os logs:
- Backend: console do Node.js
- Plugin: `oxide/logs/ShopIntegration.log`
