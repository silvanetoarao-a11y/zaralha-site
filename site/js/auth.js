// Sistema de autenticação (Steam + Email)
const API_URL = window.API_URL || 'http://localhost:3000/api';

let currentUser = null;

// Verificar autenticação ao carregar
async function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      currentUser = await response.json();
      updateAuthUI();
      return currentUser;
    } else {
      localStorage.removeItem('authToken');
      return null;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}

// Login com Steam
function loginWithSteam() {
  // Redirecionar para Steam OpenID
  window.location.href = `${API_URL}/auth/steam`;
}

// Login com Email
async function loginWithEmail(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      currentUser = data.user;
      updateAuthUI();
      return { success: true };
    } else {
      return { success: false, error: data.message || 'Erro ao fazer login' };
    }
  } catch (error) {
    return { success: false, error: 'Erro de conexão' };
  }
}

// Registro com Email
async function registerWithEmail(email, password, username, steamId) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username, steamId })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      currentUser = data.user;
      updateAuthUI();
      return { success: true };
    } else {
      return { success: false, error: data.message || 'Erro ao registrar' };
    }
  } catch (error) {
    return { success: false, error: 'Erro de conexão' };
  }
}

// Logout
function logout() {
  localStorage.removeItem('authToken');
  currentUser = null;
  updateAuthUI();
  window.location.href = '/';
}

// Atualizar UI de autenticação
function updateAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const profileBtn = document.getElementById('profileBtn');
  const userInfo = document.getElementById('userInfo');
  
  if (currentUser) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (profileBtn) profileBtn.style.display = 'inline-block';
    if (userInfo) {
      userInfo.textContent = currentUser.username || currentUser.email;
      userInfo.style.display = 'inline-block';
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (profileBtn) profileBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
  }
}

// Obter token de autenticação
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Verificar se está autenticado
function isAuthenticated() {
  return !!currentUser && !!getAuthToken();
}

// Obter usuário atual
function getCurrentUser() {
  return currentUser;
}

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});
