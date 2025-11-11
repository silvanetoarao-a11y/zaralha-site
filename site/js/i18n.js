// Sistema de tradução multi-idioma
const translations = {
  'pt-BR': {
    nav: {
      home: 'Início',
      shop: 'Loja',
      downloads: 'Downloads',
      about: 'Sobre',
      login: 'Entrar',
      logout: 'Sair',
      profile: 'Perfil'
    },
    home: {
      title: 'Bem-vindo aos Nossos Servidores',
      subtitle: 'Rust, Minecraft e DayZ',
      description: 'Junte-se à nossa comunidade e aproveite a melhor experiência de jogo'
    },
    shop: {
      title: 'Loja',
      buy: 'Comprar',
      price: 'Preço',
      description: 'Descrição',
      category: 'Categoria',
      rust: 'Rust',
      minecraft: 'Minecraft',
      dayz: 'DayZ',
      weapons: 'Armas',
      items: 'Itens',
      kits: 'Kits',
      vip: 'VIP',
      addToCart: 'Adicionar ao Carrinho',
      checkout: 'Finalizar Compra',
      cart: 'Carrinho',
      emptyCart: 'Carrinho vazio',
      total: 'Total',
      paymentMethod: 'Método de Pagamento',
      steamId: 'Steam ID',
      confirmPurchase: 'Confirmar Compra',
      purchaseSuccess: 'Compra realizada com sucesso! O item será entregue em breve.',
      purchaseError: 'Erro ao processar compra. Tente novamente.'
    },
    downloads: {
      title: 'Downloads',
      rust: 'Rust',
      minecraft: 'Minecraft',
      dayz: 'DayZ',
      description: 'Baixe os arquivos necessários para jogar em nossos servidores'
    },
    about: {
      title: 'Sobre Nossos Servidores',
      description: 'Informações sobre nossos servidores de Rust, Minecraft e DayZ'
    },
    auth: {
      login: 'Entrar',
      register: 'Registrar',
      email: 'Email',
      password: 'Senha',
      confirmPassword: 'Confirmar Senha',
      loginWithSteam: 'Entrar com Steam',
      loginWithEmail: 'Entrar com Email',
      forgotPassword: 'Esqueceu a senha?',
      noAccount: 'Não tem conta?',
      hasAccount: 'Já tem conta?',
      steamId: 'Steam ID',
      username: 'Nome de usuário'
    },
    profile: {
      title: 'Meu Perfil',
      steamId: 'Steam ID',
      email: 'Email',
      purchases: 'Compras',
      noPurchases: 'Nenhuma compra realizada'
    }
  },
  'en': {
    nav: {
      home: 'Home',
      shop: 'Shop',
      downloads: 'Downloads',
      about: 'About',
      login: 'Login',
      logout: 'Logout',
      profile: 'Profile'
    },
    home: {
      title: 'Welcome to Our Servers',
      subtitle: 'Rust, Minecraft and DayZ',
      description: 'Join our community and enjoy the best gaming experience'
    },
    shop: {
      title: 'Shop',
      buy: 'Buy',
      price: 'Price',
      description: 'Description',
      category: 'Category',
      rust: 'Rust',
      minecraft: 'Minecraft',
      dayz: 'DayZ',
      weapons: 'Weapons',
      items: 'Items',
      kits: 'Kits',
      vip: 'VIP',
      addToCart: 'Add to Cart',
      checkout: 'Checkout',
      cart: 'Cart',
      emptyCart: 'Cart is empty',
      total: 'Total',
      paymentMethod: 'Payment Method',
      steamId: 'Steam ID',
      confirmPurchase: 'Confirm Purchase',
      purchaseSuccess: 'Purchase successful! Item will be delivered shortly.',
      purchaseError: 'Error processing purchase. Please try again.'
    },
    downloads: {
      title: 'Downloads',
      rust: 'Rust',
      minecraft: 'Minecraft',
      dayz: 'DayZ',
      description: 'Download the necessary files to play on our servers'
    },
    about: {
      title: 'About Our Servers',
      description: 'Information about our Rust, Minecraft and DayZ servers'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      loginWithSteam: 'Login with Steam',
      loginWithEmail: 'Login with Email',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      steamId: 'Steam ID',
      username: 'Username'
    },
    profile: {
      title: 'My Profile',
      steamId: 'Steam ID',
      email: 'Email',
      purchases: 'Purchases',
      noPurchases: 'No purchases made'
    }
  },
  'es': {
    nav: {
      home: 'Inicio',
      shop: 'Tienda',
      downloads: 'Descargas',
      about: 'Acerca de',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      profile: 'Perfil'
    },
    home: {
      title: 'Bienvenido a Nuestros Servidores',
      subtitle: 'Rust, Minecraft y DayZ',
      description: 'Únete a nuestra comunidad y disfruta de la mejor experiencia de juego'
    },
    shop: {
      title: 'Tienda',
      buy: 'Comprar',
      price: 'Precio',
      description: 'Descripción',
      category: 'Categoría',
      rust: 'Rust',
      minecraft: 'Minecraft',
      dayz: 'DayZ',
      weapons: 'Armas',
      items: 'Artículos',
      kits: 'Kits',
      vip: 'VIP',
      addToCart: 'Añadir al Carrito',
      checkout: 'Finalizar Compra',
      cart: 'Carrito',
      emptyCart: 'Carrito vacío',
      total: 'Total',
      paymentMethod: 'Método de Pago',
      steamId: 'Steam ID',
      confirmPurchase: 'Confirmar Compra',
      purchaseSuccess: '¡Compra realizada con éxito! El artículo será entregado pronto.',
      purchaseError: 'Error al procesar la compra. Inténtalo de nuevo.'
    },
    downloads: {
      title: 'Descargas',
      rust: 'Rust',
      minecraft: 'Minecraft',
      dayz: 'DayZ',
      description: 'Descarga los archivos necesarios para jugar en nuestros servidores'
    },
    about: {
      title: 'Acerca de Nuestros Servidores',
      description: 'Información sobre nuestros servidores de Rust, Minecraft y DayZ'
    },
    auth: {
      login: 'Iniciar sesión',
      register: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      loginWithSteam: 'Iniciar sesión con Steam',
      loginWithEmail: 'Iniciar sesión con Email',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      steamId: 'Steam ID',
      username: 'Nombre de usuario'
    },
    profile: {
      title: 'Mi Perfil',
      steamId: 'Steam ID',
      email: 'Correo electrónico',
      purchases: 'Compras',
      noPurchases: 'No se han realizado compras'
    }
  },
  'ru': {
    nav: {
      home: 'Главная',
      shop: 'Магазин',
      downloads: 'Загрузки',
      about: 'О нас',
      login: 'Войти',
      logout: 'Выйти',
      profile: 'Профиль'
    },
    home: {
      title: 'Добро пожаловать на наши серверы',
      subtitle: 'Rust, Minecraft и DayZ',
      description: 'Присоединяйтесь к нашему сообществу и наслаждайтесь лучшим игровым опытом'
    },
    shop: {
      title: 'Магазин',
      buy: 'Купить',
      price: 'Цена',
      description: 'Описание',
      category: 'Категория',
      rust: 'Rust',
      minecraft: 'Minecraft',
      dayz: 'DayZ',
      weapons: 'Оружие',
      items: 'Предметы',
      kits: 'Наборы',
      vip: 'VIP',
      addToCart: 'Добавить в корзину',
      checkout: 'Оформить заказ',
      cart: 'Корзина',
      emptyCart: 'Корзина пуста',
      total: 'Итого',
      paymentMethod: 'Способ оплаты',
      steamId: 'Steam ID',
      confirmPurchase: 'Подтвердить покупку',
      purchaseSuccess: 'Покупка успешна! Предмет будет доставлен в ближайшее время.',
      purchaseError: 'Ошибка при обработке покупки. Попробуйте снова.'
    },
    downloads: {
      title: 'Загрузки',
      rust: 'Rust',
      minecraft: 'Minecraft',
      dayz: 'DayZ',
      description: 'Скачайте необходимые файлы для игры на наших серверах'
    },
    about: {
      title: 'О наших серверах',
      description: 'Информация о наших серверах Rust, Minecraft и DayZ'
    },
    auth: {
      login: 'Войти',
      register: 'Регистрация',
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Подтвердить пароль',
      loginWithSteam: 'Войти через Steam',
      loginWithEmail: 'Войти через Email',
      forgotPassword: 'Забыли пароль?',
      noAccount: 'Нет аккаунта?',
      hasAccount: 'Уже есть аккаунт?',
      steamId: 'Steam ID',
      username: 'Имя пользователя'
    },
    profile: {
      title: 'Мой профиль',
      steamId: 'Steam ID',
      email: 'Email',
      purchases: 'Покупки',
      noPurchases: 'Покупок не совершено'
    }
  }
};

let currentLang = localStorage.getItem('language') || 'pt-BR';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  translatePage();
}

function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });
}

// Inicializar tradução ao carregar
document.addEventListener('DOMContentLoaded', translatePage);
