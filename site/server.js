// Servidor simples para servir o site
const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Servir arquivos estáticos da pasta atual
app.use(express.static(__dirname));

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Rota para admin com barra
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`Site rodando em http://localhost:${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  console.log(`========================================`);
});
