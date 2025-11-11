// Script do painel admin
const API_URL = window.API_URL || 'http://localhost:3000/api';

let currentTab = 'stats';
let editingProductId = null;

// Verificar autenticação ao carregar
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '../index.html';
    return;
  }
  
  // Verificar se é admin
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      window.location.href = '../index.html';
      return;
    }
    
    // Tentar acessar rota admin para verificar permissão
    const adminCheck = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!adminCheck.ok) {
      alert('Você não tem permissão de administrador!');
      window.location.href = '../index.html';
      return;
    }
    
    // Carregar dados iniciais
    loadStats();
    loadProducts();
    loadPurchases();
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    window.location.href = '../index.html';
  }
});

// Trocar aba
function switchTab(tab) {
  currentTab = tab;
  
  // Atualizar tabs
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(`${tab}Tab`).classList.add('active');
  
  // Recarregar dados da aba
  if (tab === 'stats') loadStats();
  else if (tab === 'products') loadProducts();
  else if (tab === 'purchases') loadPurchases();
}

// Carregar estatísticas
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });
    
    const stats = await response.json();
    
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card">
        <div class="muted">Total de Produtos</div>
        <div class="stat-value">${stats.totalProducts || 0}</div>
      </div>
      <div class="stat-card">
        <div class="muted">Total de Compras</div>
        <div class="stat-value">${stats.totalPurchases || 0}</div>
      </div>
      <div class="stat-card">
        <div class="muted">Compras Confirmadas</div>
        <div class="stat-value">${stats.confirmedPurchases || 0}</div>
      </div>
      <div class="stat-card">
        <div class="muted">Entregues</div>
        <div class="stat-value">${stats.deliveredPurchases || 0}</div>
      </div>
      <div class="stat-card">
        <div class="muted">Receita Total</div>
        <div class="stat-value">R$ ${(stats.totalRevenue || 0).toFixed(2)}</div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

// Carregar produtos
async function loadProducts() {
  try {
    const gameFilter = document.getElementById('productGameFilter').value;
    const url = gameFilter 
      ? `${API_URL}/admin/products?game=${gameFilter}`
      : `${API_URL}/admin/products`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });
    
    const products = await response.json();
    
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = products.map(product => `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.game}</td>
        <td>${product.category}</td>
        <td>R$ ${parseFloat(product.price).toFixed(2)}</td>
        <td>${product.itemId}</td>
        <td>${product.quantity}</td>
        <td>
          <button class="btn btn-ghost" onclick="editProduct('${product.id}')" style="padding: 6px 12px; margin-right: 5px;">Editar</button>
          <button class="btn btn-danger" onclick="deleteProduct('${product.id}')" style="padding: 6px 12px;">Deletar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}

// Carregar compras
async function loadPurchases() {
  try {
    const response = await fetch(`${API_URL}/admin/purchases`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });
    
    const purchases = await response.json();
    
    const tbody = document.getElementById('purchasesTable');
    tbody.innerHTML = purchases.map(purchase => `
      <tr>
        <td>${purchase.id}</td>
        <td>${purchase.username || purchase.email || 'N/A'}</td>
        <td>${purchase.productName || purchase.productId}</td>
        <td>${purchase.steamId || 'N/A'}</td>
        <td>R$ ${parseFloat(purchase.price).toFixed(2)}</td>
        <td>
          <span style="padding: 4px 8px; border-radius: 4px; background: ${getStatusColor(purchase.status)};">
            ${purchase.status}
          </span>
        </td>
        <td>${new Date(purchase.createdAt).toLocaleString('pt-BR')}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar compras:', error);
  }
}

function getStatusColor(status) {
  switch(status) {
    case 'confirmed': return 'rgba(34,211,238,.3)';
    case 'pending': return 'rgba(255,255,255,.1)';
    default: return 'rgba(124,58,237,.3)';
  }
}

// Mostrar formulário de produto
function showProductForm(productId = null) {
  editingProductId = productId;
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  
  if (productId) {
    document.getElementById('productModalTitle').textContent = 'Editar Produto';
    // Carregar dados do produto
    loadProductData(productId);
  } else {
    document.getElementById('productModalTitle').textContent = 'Novo Produto';
    form.reset();
    document.getElementById('productId').value = '';
  }
  
  modal.style.display = 'block';
}

// Carregar dados do produto para edição
async function loadProductData(productId) {
  try {
    const response = await fetch(`${API_URL}/admin/products`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });
    
    const products = await response.json();
    const product = products.find(p => p.id === productId);
    
    if (product) {
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name;
      document.getElementById('productDescription').value = product.description || '';
      document.getElementById('productGame').value = product.game;
      document.getElementById('productCategory').value = product.category;
      document.getElementById('productPrice').value = product.price;
      document.getElementById('productItemId').value = product.itemId;
      document.getElementById('productQuantity').value = product.quantity;
    }
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
  }
}

// Editar produto
function editProduct(productId) {
  showProductForm(productId);
}

// Salvar produto
async function saveProduct(event) {
  event.preventDefault();
  
  const productData = {
    id: document.getElementById('productId').value || generateProductId(),
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    game: document.getElementById('productGame').value,
    category: document.getElementById('productCategory').value,
    price: parseFloat(document.getElementById('productPrice').value),
    itemId: document.getElementById('productItemId').value,
    quantity: parseInt(document.getElementById('productQuantity').value)
  };
  
  try {
    const url = editingProductId 
      ? `${API_URL}/admin/products/${editingProductId}`
      : `${API_URL}/admin/products`;
    
    const method = editingProductId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(productData)
    });
    
    if (response.ok) {
      alert('Produto salvo com sucesso!');
      closeProductModal();
      loadProducts();
    } else {
      const error = await response.json();
      alert(error.message || 'Erro ao salvar produto');
    }
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao salvar produto');
  }
}

// Gerar ID de produto
function generateProductId() {
  const game = document.getElementById('productGame').value;
  const name = document.getElementById('productName').value.toLowerCase().replace(/\s+/g, '_');
  return `${game}_${name}_${Date.now()}`;
}

// Deletar produto
async function deleteProduct(productId) {
  if (!confirm('Tem certeza que deseja deletar este produto?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/admin/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });
    
    if (response.ok) {
      alert('Produto deletado com sucesso!');
      loadProducts();
    } else {
      const error = await response.json();
      alert(error.message || 'Erro ao deletar produto');
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    alert('Erro ao deletar produto');
  }
}

// Fechar modal
function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
  editingProductId = null;
}

// Logout
function logout() {
  localStorage.removeItem('authToken');
  window.location.href = '../index.html';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
  const modal = document.getElementById('productModal');
  if (event.target == modal) {
    closeProductModal();
  }
}
