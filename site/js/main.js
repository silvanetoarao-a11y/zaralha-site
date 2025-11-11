// Script principal
document.addEventListener('DOMContentLoaded', () => {
  // Ano dinâmico
  document.getElementById('year').textContent = new Date().getFullYear();
  
  // Idioma salvo
  const savedLang = localStorage.getItem('language') || 'pt-BR';
  document.getElementById('langSelect').value = savedLang;
  setLanguage(savedLang);
  
  // Menu mobile
  const hamb = document.getElementById('hamb');
  hamb?.addEventListener('click', () => {
    const nav = document.querySelector('nav.menu');
    if (!nav) return;
    if (getComputedStyle(nav).display === 'none') {
      nav.style.display = 'flex';
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.top = '64px';
      nav.style.right = '4vw';
      nav.style.background = 'linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.04))';
      nav.style.padding = '14px';
      nav.style.border = '1px solid var(--border)';
      nav.style.borderRadius = '14px';
      nav.style.backdropFilter = 'blur(8px)';
      nav.style.zIndex = '50';
    } else {
      nav.removeAttribute('style');
    }
  });
  
  // Scroll suave
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // Carregar produtos
  if (typeof loadProducts === 'function') {
    loadProducts('rust');
  }
  
  // Atualizar carrinho
  updateCartDisplay();
  
  // Listener para mudança de jogo
  const gameFilter = document.getElementById('gameFilter');
  if (gameFilter && typeof loadProducts === 'function') {
    gameFilter.addEventListener('change', (e) => {
      loadProducts(e.target.value);
    });
  }
  
  // Verificar token na URL (retorno do Steam)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    localStorage.setItem('authToken', token);
    window.location.href = window.location.pathname;
  }
});

// Modal de login
function showLoginModal() {
  document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('emailLoginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'none';
}

function showEmailLogin() {
  document.getElementById('emailLoginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('emailLoginForm').style.display = 'none';
}

async function handleEmailLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  const result = await loginWithEmail(email, password);
  if (result.success) {
    closeLoginModal();
    showNotification(t('auth.login') + ' realizado com sucesso!');
  } else {
    alert(result.error);
  }
}

async function handleRegister() {
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const steamId = document.getElementById('registerSteamId').value;
  
  const result = await registerWithEmail(email, password, username, steamId);
  if (result.success) {
    closeLoginModal();
    showNotification('Registro realizado com sucesso!');
  } else {
    alert(result.error);
  }
}

// Atualizar exibição do carrinho
function updateCartDisplay() {
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="muted">${t('shop.emptyCart')}</p>`;
    return;
  }
  
  cartItems.innerHTML = cart.map((item, index) => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border);">
      <div>
        <strong>${item.name}</strong>
        <p class="muted">${formatPrice(item.price)}</p>
      </div>
      <button class="btn btn-ghost" onclick="removeFromCart(${index})" style="padding:6px 12px;">×</button>
    </div>
  `).join('');
}

// Download de arquivos
function downloadFile(game) {
  // Implementar download real
  alert(`Download de ${game} iniciado`);
}

// Notificação
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
    box-shadow: 0 8px 24px rgba(124,58,237,.4);
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
  const modal = document.getElementById('loginModal');
  if (event.target == modal) {
    closeLoginModal();
  }
}
