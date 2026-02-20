/* ============================================
   MAHESH SWEETS & RESTAURANT - script.js
   ============================================ */

// ---- Navbar scroll effect ----
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ---- Hamburger Menu ----
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('mobile-open');
    hamburger.classList.toggle('open');
    // Animate spans
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '1';
      spans[2].style.transform = '';
    }
  });

  // Close menu on link click
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
    });
  });
}

// ---- Active nav link ----
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ============================================
// CART SYSTEM
// ============================================
let cart = JSON.parse(localStorage.getItem('mahesh-cart') || '[]');

function saveCart() {
  localStorage.setItem('mahesh-cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count === 0 ? 'none' : 'flex';
  });
  renderCartItems();
}

function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart();
  showToast(`🛒 ${name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

function getTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCartItems() {
  const container = document.querySelector('.cart-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty.<br>Add some delicious items!</p>
      </div>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&q=60'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${(item.price * item.qty).toFixed(0)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
        </div>
        <button class="cart-remove" onclick="removeFromCart('${item.id}')" title="Remove">✕</button>
      </div>`).join('');
  }

  const totalEl = document.querySelector('.cart-total strong');
  if (totalEl) totalEl.textContent = `₹${getTotal().toFixed(0)}`;
}

// Cart sidebar open/close
function openCart() {
  const overlay = document.querySelector('.cart-overlay');
  const sidebar = document.querySelector('.cart-sidebar');
  if (overlay) overlay.classList.add('open');
  if (sidebar) sidebar.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCart() {
  const overlay = document.querySelector('.cart-overlay');
  const sidebar = document.querySelector('.cart-sidebar');
  if (overlay) overlay.classList.remove('open');
  if (sidebar) sidebar.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelector('.cart-btn-nav')?.addEventListener('click', openCart);
document.querySelector('.cart-overlay')?.addEventListener('click', closeCart);
document.querySelector('.cart-close')?.addEventListener('click', closeCart);

// Checkout button
document.querySelector('.checkout-btn')?.addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('⚠️ Your cart is empty!');
    return;
  }
  showToast('✅ Order placed! We\'ll call you soon.');
  cart = [];
  saveCart();
  closeCart();
});

// ============================================
// MENU FILTER TABS
// ============================================
const filterBtns = document.querySelectorAll('.filter-btn');
const menuSections = document.querySelectorAll('.menu-section');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    
    menuSections.forEach(section => {
      if (filter === 'all' || section.dataset.category === filter) {
        section.style.display = 'block';
        section.style.animation = 'fadeIn 0.4s ease';
      } else {
        section.style.display = 'none';
      }
    });
  });
});

// ============================================
// ADD TO CART BUTTON ANIMATION
// ============================================
document.querySelectorAll('.add-cart-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const card = this.closest('.menu-card');
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const img = card.querySelector('img')?.src || '';
    
    addToCart(id, name, price, img);
    
    const original = this.innerHTML;
    this.innerHTML = '✓ Added!';
    this.classList.add('added');
    setTimeout(() => {
      this.innerHTML = original;
      this.classList.remove('added');
    }, 1800);
  });
});

// ============================================
// TOAST NOTIFICATION
// ============================================
let toastTimeout;
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('.form-submit');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      const success = this.querySelector('.form-success');
      if (success) success.style.display = 'block';
      this.reset();
      showToast('✅ Message sent successfully!');
      setTimeout(() => { if (success) success.style.display = 'none'; }, 5000);
    }, 1400);
  });
}

// ============================================
// SCROLL REVEAL (Intersection Observer)
// ============================================
const revealElements = document.querySelectorAll('.category-card, .menu-card, .mv-card, .testimonial-card, .why-feature, .contact-info-item, .stat-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ============================================
// COUNTER ANIMATION (stats)
// ============================================
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-number');
      nums.forEach(num => {
        const val = parseInt(num.dataset.value || num.textContent);
        const suf = num.dataset.suffix || '';
        animateCounter(num, val, suf);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stats-grid').forEach(el => statsObserver.observe(el));

// Init cart UI on page load
updateCartUI(); 