# Configuração do Backend com HTTPS
# Atualize o arquivo backend/server.js para usar HTTPS

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Configuração SSL (opcional - se quiser HTTPS direto no Node.js)
const SSL_ENABLED = process.env.SSL_ENABLED === 'true';
let sslOptions = null;

if (SSL_ENABLED) {
  try {
    sslOptions = {
      key: fs.readFileSync('/etc/letsencrypt/live/zaralha-servers.com/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/zaralha-servers.com/fullchain.pem')
    };
  } catch (error) {
    console.warn('Certificados SSL não encontrados. Usando HTTP.');
  }
}

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://zaralha-servers.com',
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Database
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// ... resto do código do servidor permanece igual ...

// Inicializar servidor
if (SSL_ENABLED && sslOptions) {
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`API HTTPS rodando na porta ${PORT}`);
    console.log(`Admin padrão: admin@admin.com / admin123`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
    console.log(`Admin padrão: admin@admin.com / admin123`);
    console.log(`Nota: Configure Nginx como proxy reverso para HTTPS`);
  });
}
