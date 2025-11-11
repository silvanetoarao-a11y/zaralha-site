// Script principal
document.addEventListener('DOMContentLoaded', () => {
  // Ano dinâmico
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
  
  // Idioma salvo
  const savedLang = localStorage.getItem('language') || 'pt-BR';
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = savedLang;
    setLanguage(savedLang);
  }
  
  // Menu mobile
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('mobile-open');
      mobileMenuToggle.classList.toggle('active');
    });
  }
  
  // Scroll suave para links internos
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.length > 1 && id !== '#') {
        e.preventDefault();
        const target = document.querySelector(id);
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Atualizar link ativo
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
          });
          a.classList.add('active');
        }
      }
    });
  });
  
  // Atualizar link ativo ao scrollar
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
  
  // Atualizar carrinho
  if (typeof updateCartDisplay === 'function') {
    updateCartDisplay();
  } else {
    // Função fallback se não existir
    updateCartDisplayFallback();
  }
  
  // Verificar token na URL (retorno do Steam)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    localStorage.setItem('authToken', token);
    window.history.replaceState({}, document.title, window.location.pathname);
    if (typeof checkAuth === 'function') {
      checkAuth();
    }
  }
});

// Modal de login
function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'none';
  }
  const emailForm = document.getElementById('emailLoginForm');
  const registerForm = document.getElementById('registerForm');
  if (emailForm) emailForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'none';
}

function showEmailLogin() {
  const emailForm = document.getElementById('emailLoginForm');
  const registerForm = document.getElementById('registerForm');
  if (emailForm) emailForm.style.display = 'block';
  if (registerForm) registerForm.style.display = 'none';
  
  // Atualizar tabs
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
}

function showRegisterForm() {
  event.preventDefault();
  const emailForm = document.getElementById('emailLoginForm');
  const registerForm = document.getElementById('registerForm');
  if (emailForm) emailForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'block';
  
  // Atualizar tabs
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
}

async function handleEmailLogin() {
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  
  if (!email || !password) {
    alert('Preencha todos os campos');
    return;
  }
  
  if (typeof loginWithEmail === 'function') {
    const result = await loginWithEmail(email, password);
    if (result.success) {
      closeLoginModal();
      if (typeof showNotification === 'function') {
        showNotification('Login realizado com sucesso!');
      }
    } else {
      alert(result.error || 'Erro ao fazer login');
    }
  }
}

async function handleRegister() {
  const username = document.getElementById('registerUsername')?.value;
  const email = document.getElementById('registerEmail')?.value;
  const password = document.getElementById('registerPassword')?.value;
  const steamId = document.getElementById('registerSteamId')?.value;
  
  if (!username || !email || !password) {
    alert('Preencha todos os campos obrigatórios');
    return;
  }
  
  if (typeof registerWithEmail === 'function') {
    const result = await registerWithEmail(email, password, username, steamId);
    if (result.success) {
      closeLoginModal();
      if (typeof showNotification === 'function') {
        showNotification('Registro realizado com sucesso!');
      }
    } else {
      alert(result.error || 'Erro ao registrar');
    }
  }
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
    background: var(--primary);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
    font-weight: 600;
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Função fallback para atualizar carrinho
function updateCartDisplayFallback() {
  const cartItems = document.getElementById('cartItems');
  if (!cartItems || typeof cart === 'undefined') return;
  
  const currentCart = typeof cart !== 'undefined' ? cart : [];
  
  if (currentCart.length === 0) {
    cartItems.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding:20px;">Carrinho vazio</p>`;
    return;
  }
  
  cartItems.innerHTML = currentCart.map((item, index) => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:var(--bg-dark); border-radius:8px; margin-bottom:10px;">
      <div>
        <strong style="color:var(--text-primary);">${item.name}</strong>
        <p style="color:var(--text-secondary); margin-top:5px; font-size:14px;">R$ ${parseFloat(item.price).toFixed(2)}</p>
      </div>
      <button onclick="removeFromCart(${index})" style="background:transparent; border:none; color:var(--primary); font-size:24px; cursor:pointer; padding:5px 10px;">×</button>
    </div>
  `).join('');
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
  const modal = document.getElementById('loginModal');
  if (event.target == modal) {
    closeLoginModal();
  }
}
