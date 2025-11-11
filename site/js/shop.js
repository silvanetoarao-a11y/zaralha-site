// Sistema de loja
const API_URL = window.API_URL || 'http://localhost:5000/api';

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Carregar produtos
async function loadProducts(game = 'rust') {
  try {
    const response = await fetch(`${API_URL}/shop/products?game=${game}`);
    if (!response.ok) {
      throw new Error('Erro ao carregar produtos');
    }
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
    // Fallback para produtos mock se API não estiver disponível
    displayProducts(getMockProducts(game));
  }
}

// Produtos mock para desenvolvimento
function getMockProducts(game) {
  const mockProducts = {
    rust: [
      { id: 'rust_ak47', name: 'AK-47', description: 'Rifle AK-47', price: 50.00, category: 'weapons' },
      { id: 'rust_rocket', name: 'Rocket Launcher', description: 'Lançador de Foguetes', price: 100.00, category: 'weapons' },
      { id: 'rust_wood', name: 'Wood x1000', description: '1000 unidades de madeira', price: 10.00, category: 'items' },
      { id: 'rust_stone', name: 'Stone x1000', description: '1000 unidades de pedra', price: 10.00, category: 'items' },
      { id: 'rust_kit_starter', name: 'Kit Iniciante', description: 'Kit básico para iniciantes', price: 25.00, category: 'kits' }
    ],
    minecraft: [
      { id: 'mc_diamond', name: 'Diamante x64', description: '64 diamantes', price: 20.00, category: 'items' },
      { id: 'mc_iron', name: 'Ferro x64', description: '64 barras de ferro', price: 10.00, category: 'items' }
    ],
    dayz: [
      { id: 'dayz_akm', name: 'AKM', description: 'Rifle AKM', price: 60.00, category: 'weapons' },
      { id: 'dayz_food', name: 'Kit de Comida', description: 'Kit com comida e água', price: 15.00, category: 'items' }
    ]
  };
  return mockProducts[game] || [];
}

// Exibir produtos
function displayProducts(products) {
  const container = document.getElementById('productsContainer');
  if (!container) return;
  
  container.innerHTML = products.map(product => `
    <div class="card product-card">
      <h3>${product.name}</h3>
      <p class="muted">${product.description || ''}</p>
      <div class="price">${formatPrice(product.price)}</div>
      <div class="tag">${product.category}</div>
      <button class="btn btn-primary" onclick="addToCart('${product.id}')">
        ${t('shop.addToCart')}
      </button>
    </div>
  `).join('');
}

// Adicionar ao carrinho
function addToCart(productId) {
  if (!isAuthenticated()) {
    alert(t('auth.login') + ' necessário para comprar');
    if (typeof showLoginModal === 'function') {
      showLoginModal();
    }
    return;
  }
  
  const product = getProductById(productId);
  if (!product) {
    console.error('Produto não encontrado:', productId);
    return;
  }
  
  const gameFilter = document.getElementById('gameFilter');
  const currentGame = gameFilter ? gameFilter.value : 'rust';
  
  cart.push({
    id: productId,
    name: product.name,
    price: product.price,
    game: currentGame
  });
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  if (typeof showNotification === 'function') {
    showNotification(t('shop.addToCart') + ' - ' + product.name);
  }
}

// Remover do carrinho
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

// Atualizar UI do carrinho
function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  
  if (cartCount) {
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? 'inline-block' : 'none';
  }
  
  if (cartTotal) {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = formatPrice(total);
  }
  
  // Atualizar exibição do carrinho
  if (typeof updateCartDisplay === 'function') {
    updateCartDisplay();
  }
}

// Finalizar compra
async function checkout() {
  if (!isAuthenticated()) {
    alert(t('auth.login') + ' necessário');
    showLoginModal();
    return;
  }
  
  if (cart.length === 0) {
    alert(t('shop.emptyCart'));
    return;
  }
  
  const user = getCurrentUser();
  if (!user.steamId) {
    alert('Steam ID necessário para compras de Rust. Por favor, adicione seu Steam ID no perfil.');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/shop/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        items: cart,
        steamId: user.steamId
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      cart = [];
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartUI();
      alert(t('shop.purchaseSuccess'));
      loadUserPurchases();
    } else {
      alert(data.message || t('shop.purchaseError'));
    }
  } catch (error) {
    alert(t('shop.purchaseError'));
    console.error('Checkout error:', error);
  }
}

// Armazenar produtos carregados
let loadedProducts = {};

// Obter produto por ID
function getProductById(id) {
  // Buscar em todos os jogos
  for (const game in loadedProducts) {
    const product = loadedProducts[game].find(p => p.id === id);
    if (product) return product;
  }
  return null;
}

// Atualizar função displayProducts para armazenar produtos
function displayProducts(products) {
  const container = document.getElementById('productsContainer');
  if (!container) return;
  
  const gameFilter = document.getElementById('gameFilter');
  const currentGame = gameFilter ? gameFilter.value : 'rust';
  loadedProducts[currentGame] = products;
  
  container.innerHTML = products.map(product => `
    <div class="card product-card">
      <h3>${product.name}</h3>
      <p class="muted">${product.description || ''}</p>
      <div class="price">${formatPrice(product.price)}</div>
      <div class="tag">${product.category}</div>
      <button class="btn btn-primary" onclick="addToCart('${product.id}')">
        ${t('shop.addToCart')}
      </button>
    </div>
  `).join('');
}

// Formatar preço
function formatPrice(price) {
  return new Intl.NumberFormat(currentLang, {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

// Mostrar notificação
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--neon-1);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  const gameFilter = document.getElementById('gameFilter');
  if (gameFilter) {
    gameFilter.addEventListener('change', (e) => {
      loadProducts(e.target.value);
    });
  }
});
