# ZARALHA SERVERS - Sistema Completo

Sistema completo para servidores de jogos com loja integrada, autenticação Steam/Email, plugin Rust e domínio próprio com SSL.

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
├── plugin/           # Plugin Rust (Oxide/uMod)
│   ├── ShopIntegration.cs
│   └── ShopIntegration.json
└── nginx/            # Configuração Nginx
    └── zaralha-servers.conf
```

## Funcionalidades

### Site
- ✅ Design futurista e profissional
- ✅ Sistema de tradução (PT-BR, EN, ES, RU)
- ✅ Autenticação Steam e Email
- ✅ Loja com abas separadas (Rust, Minecraft, DayZ)
- ✅ Carrinho de compras
- ✅ Painel administrativo
- ✅ Responsivo e otimizado

### Backend API
- ✅ Autenticação JWT
- ✅ Login Steam (OpenID)
- ✅ Login/Registro Email
- ✅ CRUD de produtos
- ✅ Sistema de compras
- ✅ Endpoints para plugin Rust
- ✅ Suporte a HTTPS

### Plugin Rust
- ✅ Verifica entregas pendentes automaticamente
- ✅ Entrega itens diretamente no inventário
- ✅ Validação por Steam ID
- ✅ Sistema de conexão robusto
- ✅ Comandos admin (/shopstatus, /shopreload)

## Instalação

### Desenvolvimento Local

**Windows:**
```powershell
# Backend
cd backend
npm install
npm start

# Site
cd site
npm install
npm start
```

**Linux/Mac:**
```bash
# Backend
cd backend
npm install
npm start

# Site
cd site
npm install
npm start
```

### Produção com Domínio e SSL

**Windows:**
Veja **WINDOWS-SETUP.md** para guia completo.

Instalação rápida:
```powershell
powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Domain "seu-dominio.com" -Email "seu-email@exemplo.com" -ServerIP "IP_DO_SERVIDOR"
```

**Linux:**
Veja **PRODUCTION-SETUP.md** para guia completo.

Instalação rápida:
```bash
sudo bash setup-ssl.sh
```

## Configuração

### Variáveis de Ambiente (Backend)

Crie um arquivo `.env`:

```
PORT=5000
JWT_SECRET=seu-secret-key-aqui
STEAM_API_KEY=sua-steam-api-key
RUST_API_KEY=RUST_PLUGIN_KEY
FRONTEND_URL=https://seu-dominio.com
NODE_ENV=production
```

### Plugin Rust

Edite `oxide/config/ShopIntegration.json`:

```json
{
  "ApiUrl": "https://seu-dominio.com/api",
  "ApiKey": "RUST_PLUGIN_KEY",
  "CheckInterval": 30.0
}
```

## Segurança

- ✅ HTTPS obrigatório
- ✅ Certificado SSL gratuito (Let's Encrypt)
- ✅ Headers de segurança configurados
- ✅ CORS configurado corretamente
- ✅ Tokens JWT para autenticação
- ✅ Senhas hash com bcrypt
- ✅ API Key para comunicação plugin-backend

## Documentação

- **README.md** - Este arquivo
- **INSTALL.md** - Instalação detalhada
- **PRODUCTION-SETUP.md** - Setup de produção
- **SSL-GUIDE.md** - Guia de SSL
- **DNS-SETUP.md** - Configuração DNS
- **QUICKSTART.md** - Guia rápido
- **CHANGELOG.md** - Histórico de mudanças

## Suporte

Para problemas ou dúvidas, verifique os logs:
- Backend: `pm2 logs zaralha-api`
- Nginx: `/var/log/nginx/zaralha-error.log`
- Plugin: `oxide/logs/ShopIntegration.log`
