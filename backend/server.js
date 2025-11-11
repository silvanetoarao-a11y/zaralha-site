// Backend API - Node.js/Express
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Database
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Inicializar banco de dados
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT,
    password TEXT,
    steamId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    price REAL,
    game TEXT,
    category TEXT,
    itemId TEXT,
    quantity INTEGER DEFAULT 1
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    steamId TEXT,
    productId TEXT,
    itemId TEXT,
    quantity INTEGER,
    price REAL,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    deliveredAt DATETIME,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);
  
  // Criar admin padrão (email: admin@admin.com, senha: admin123)
  db.get('SELECT id FROM users WHERE email = ?', ['admin@admin.com'], (err, user) => {
    if (!user) {
      bcrypt.hash('admin123', 10).then(hashedPassword => {
        db.run('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', 
          ['admin@admin.com', 'Admin', hashedPassword], function(err) {
            if (!err) {
              db.run('INSERT INTO admins (userId) VALUES (?)', [this.lastID]);
              console.log('Admin padrão criado: admin@admin.com / admin123');
            }
          });
      });
    }
  });
  
  // Produtos de exemplo
  db.run(`INSERT OR IGNORE INTO products (id, name, description, price, game, category, itemId, quantity) VALUES
    ('rust_ak47', 'AK-47', 'Rifle AK-47', 50.00, 'rust', 'weapons', 'rifle.ak', 1),
    ('rust_rocket', 'Rocket Launcher', 'Lançador de Foguetes', 100.00, 'rust', 'weapons', 'rocket.launcher', 1),
    ('rust_wood', 'Wood x1000', '1000 unidades de madeira', 10.00, 'rust', 'items', 'wood', 1000),
    ('rust_stone', 'Stone x1000', '1000 unidades de pedra', 10.00, 'rust', 'items', 'stone', 1000),
    ('rust_kit_starter', 'Kit Iniciante', 'Kit básico para iniciantes', 25.00, 'rust', 'kits', 'kit.starter', 1)
  `);
});

// Passport Steam Strategy
passport.use(new SteamStrategy({
  returnURL: 'http://localhost:5000/api/auth/steam/return',
  realm: 'http://localhost:5000/',
  apiKey: process.env.STEAM_API_KEY || 'YOUR_STEAM_API_KEY'
}, (identifier, profile, done) => {
  const steamId = identifier.split('/').pop();
  return done(null, { steamId, profile });
}));

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Rotas de autenticação
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username, steamId } = req.body;
  
  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, username, password, steamId) VALUES (?, ?, ?, ?)',
      [email, username, hashedPassword, steamId || null],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ message: 'Email já cadastrado' });
          }
          return res.status(500).json({ message: 'Erro ao criar usuário' });
        }
        
        const token = jwt.sign({ id: this.lastID, email, username, steamId }, JWT_SECRET);
        res.json({ token, user: { id: this.lastID, email, username, steamId } });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, steamId: user.steamId },
      JWT_SECRET
    );
    
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, steamId: user.steamId } });
  });
});

app.get('/api/auth/steam', passport.authenticate('steam', { session: false }));

app.get('/api/auth/steam/return', passport.authenticate('steam', { session: false }), (req, res) => {
  if (!req.user) {
    return res.redirect('http://localhost:8080/?error=steam_auth_failed');
  }
  
  const { steamId, profile } = req.user;
  
  db.get('SELECT * FROM users WHERE steamId = ?', [steamId], (err, user) => {
    if (err) {
      return res.redirect('http://localhost:8080/?error=database_error');
    }
    
    if (user) {
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username, steamId: user.steamId },
        JWT_SECRET
      );
      res.redirect(`http://localhost:8080/?token=${token}`);
    } else {
      // Criar novo usuário com Steam
      db.run(
        'INSERT INTO users (username, steamId) VALUES (?, ?)',
        [profile.displayName || `Steam_${steamId}`, steamId],
        function(err) {
          if (err) {
            return res.redirect('http://localhost:8080/?error=create_user_failed');
          }
          
          const token = jwt.sign(
            { id: this.lastID, username: profile.displayName || `Steam_${steamId}`, steamId },
            JWT_SECRET
          );
          res.redirect(`http://localhost:8080/?token=${token}`);
        }
      );
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, username, steamId FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  });
});

// Rotas da loja
app.get('/api/shop/products', (req, res) => {
  const game = req.query.game || 'rust';
  
  db.all('SELECT * FROM products WHERE game = ?', [game], (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
    res.json(products);
  });
});

app.post('/api/shop/purchase', authenticateToken, async (req, res) => {
  const { items, steamId } = req.body;
  const userId = req.user.id;
  const finalSteamId = steamId || req.user.steamId;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Carrinho vazio' });
  }
  
  // Verificar se algum item é de Rust e requer Steam ID
  const checkRustItems = items.map(item => {
    return new Promise((resolve) => {
      db.get('SELECT game FROM products WHERE id = ?', [item.id], (err, product) => {
        resolve(product && product.game === 'rust');
      });
    });
  });
  
  const rustItems = await Promise.all(checkRustItems);
  const hasRustItems = rustItems.some(isRust => isRust);
  
  if (hasRustItems && !finalSteamId) {
    return res.status(400).json({ message: 'Steam ID necessário para compras de Rust' });
  }
  
  // Criar compras pendentes
  const purchasePromises = items.map(item => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [item.id], (err, product) => {
        if (err) {
          reject(err);
          return;
        }
        if (product) {
          db.run(
            'INSERT INTO purchases (userId, steamId, productId, itemId, quantity, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, finalSteamId || null, item.id, product.itemId, product.quantity, item.price, 'pending'],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        } else {
          resolve(null);
        }
      });
    });
  });
  
  try {
    await Promise.all(purchasePromises);
    
    // Simular confirmação de pagamento (em produção, integrar com gateway de pagamento)
    setTimeout(() => {
      db.run('UPDATE purchases SET status = ? WHERE userId = ? AND status = ?', 
        ['confirmed', userId, 'pending'], (err) => {
          if (err) console.error('Erro ao confirmar pagamento:', err);
        });
    }, 2000);
    
    res.json({ message: 'Compra processada. Itens serão entregues após confirmação do pagamento.' });
  } catch (err) {
    console.error('Erro ao processar compra:', err);
    res.status(500).json({ message: 'Erro ao processar compra' });
  }
});

// Rota para o plugin Rust buscar compras pendentes
app.get('/api/rust/pending-deliveries', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.RUST_API_KEY || 'RUST_PLUGIN_KEY';
  
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ message: 'API Key inválida' });
  }
  
  db.all(
    `SELECT p.*, pr.itemId, pr.quantity as itemQuantity 
     FROM purchases p 
     JOIN products pr ON p.productId = pr.id 
     WHERE p.status = 'confirmed' AND pr.game = 'rust' AND p.deliveredAt IS NULL`,
    [],
    (err, purchases) => {
      if (err) {
        console.error('Erro ao buscar entregas:', err);
        return res.status(500).json({ message: 'Erro ao buscar entregas' });
      }
      res.json(purchases || []);
    }
  );
});

// Rota de status para o plugin Rust
app.get('/api/rust/status', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.RUST_API_KEY || 'RUST_PLUGIN_KEY';
  
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ message: 'API Key inválida' });
  }
  
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// Marcar entrega como concluída
app.post('/api/rust/mark-delivered', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.RUST_API_KEY || 'RUST_PLUGIN_KEY';
  const { purchaseId, error } = req.body;
  
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ message: 'API Key inválida' });
  }
  
  if (!purchaseId) {
    return res.status(400).json({ message: 'ID da compra não fornecido' });
  }
  
  db.run(
    'UPDATE purchases SET deliveredAt = CURRENT_TIMESTAMP WHERE id = ?',
    [purchaseId],
    function(err) {
      if (err) {
        console.error('Erro ao marcar como entregue:', err);
        return res.status(500).json({ message: 'Erro ao marcar como entregue' });
      }
      res.json({ message: 'Entrega marcada como concluída', purchaseId });
    }
  );
});

// Middleware para verificar se é admin
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado' });
  }
  
  db.get('SELECT * FROM admins WHERE userId = ?', [req.user.id], (err, admin) => {
    if (err || !admin) {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
    }
    next();
  });
}

// Rotas Admin - Produtos
app.get('/api/admin/products', authenticateToken, isAdmin, (req, res) => {
  const game = req.query.game;
  
  let query = 'SELECT * FROM products';
  const params = [];
  
  if (game) {
    query += ' WHERE game = ?';
    params.push(game);
  }
  
  query += ' ORDER BY game, name';
  
  db.all(query, params, (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
    res.json(products);
  });
});

app.post('/api/admin/products', authenticateToken, isAdmin, (req, res) => {
  const { id, name, description, price, game, category, itemId, quantity } = req.body;
  
  if (!id || !name || !price || !game || !itemId) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }
  
  db.run(
    'INSERT INTO products (id, name, description, price, game, category, itemId, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, description || '', price, game, category || 'items', itemId, quantity || 1],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ message: 'ID do produto já existe' });
        }
        return res.status(500).json({ message: 'Erro ao criar produto' });
      }
      res.json({ message: 'Produto criado com sucesso', id });
    }
  );
});

app.put('/api/admin/products/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, price, game, category, itemId, quantity } = req.body;
  
  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, game = ?, category = ?, itemId = ?, quantity = ? WHERE id = ?',
    [name, description, price, game, category, itemId, quantity, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao atualizar produto' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      res.json({ message: 'Produto atualizado com sucesso' });
    }
  );
});

app.delete('/api/admin/products/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao deletar produto' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto deletado com sucesso' });
  });
});

// Rotas Admin - Compras
app.get('/api/admin/purchases', authenticateToken, isAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  db.all(
    `SELECT p.*, u.username, u.email, pr.name as productName 
     FROM purchases p 
     LEFT JOIN users u ON p.userId = u.id 
     LEFT JOIN products pr ON p.productId = pr.id 
     ORDER BY p.createdAt DESC 
     LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, purchases) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao buscar compras' });
      }
      res.json(purchases);
    }
  );
});

// Rotas Admin - Estatísticas
app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
  db.all(`
    SELECT 
      (SELECT COUNT(*) FROM products) as totalProducts,
      (SELECT COUNT(*) FROM purchases) as totalPurchases,
      (SELECT COUNT(*) FROM purchases WHERE status = 'confirmed') as confirmedPurchases,
      (SELECT COUNT(*) FROM purchases WHERE deliveredAt IS NOT NULL) as deliveredPurchases,
      (SELECT SUM(price) FROM purchases WHERE status = 'confirmed') as totalRevenue
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
    res.json(rows[0] || {});
  });
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
  console.log(`Admin padrão: admin@admin.com / admin123`);
});
