/* ================================================
   SEBLAK GLEDEK – JAVASCRIPT
   ================================================ */

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  createParticles();
  initScrollReveal();
  initCounters();
  initMenuSection();
  initToppingsSection();
  initTestimonialSlider();
  initReservationForm();
  initContactForm();
  initBackToTop();
  initSmoothScrollNavLinks();
});

// ==================== NAVBAR ====================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  const allLinks = navLinks.querySelectorAll('a');

  // Scroll: add scrolled class + update active link
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveNavLink();
  });

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (navLinks.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Klik overlay = tutup menu
  overlay.addEventListener('click', closeMenu);

  // Klik link apapun di dalam nav = tutup menu
  allLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Tutup dengan tombol Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// ==================== PARTICLES ====================
function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const colors = [
    'rgba(255, 140, 0, 0.7)',
    'rgba(247, 201, 72, 0.8)',
    'rgba(225, 46, 46, 0.6)',
    'rgba(255, 82, 82, 0.5)',
    'rgba(255, 200, 0, 0.7)',
  ];

  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 10 + 3;
    const x = Math.random() * 100;
    const duration = Math.random() * 8 + 5;
    const delay = Math.random() * 10;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}%;
      bottom: -20px;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      filter: blur(${Math.random() > 0.5 ? '1px' : '0px'});
    `;
    container.appendChild(particle);
  }
}

// ==================== SCROLL REVEAL ====================
function initScrollReveal() {
  const selectors = [
    '.about-image-col', '.about-text-col',
    '.menu-card', '.topping-card', '.step-item',
    '.testimonial-card', '.feature-item', '.contact-item',
    '.contact-form-wrapper', '.footer-brand', '.footer-links-col',
    '.footer-contact-col', '.reservation-card'
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, index) => {
      if (!el.classList.contains('reveal') &&
          !el.classList.contains('reveal-left') &&
          !el.classList.contains('reveal-right')) {
        el.classList.add('reveal');
        el.style.transitionDelay = `${index * 0.07}s`;
      }
      observer.observe(el);
    });
  });

  // Also observe existing reveal classes
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

// ==================== COUNTER ANIMATION ====================
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  let animated = false;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.target);
          animateCounter(counter, target);
        });
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el, target) {
  let current = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString();
  }, 20);
}

// ==================== MENU SECTION ====================
async function initMenuSection() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/menu');
    const data = await res.json();

    if (!data.success) throw new Error('API failed');

    grid.innerHTML = '';
    data.data.forEach((item, index) => {
      const chilis = generateChili(item.spicyLevel);
      const card = document.createElement('div');
      card.classList.add('menu-card', 'reveal');
      card.style.transitionDelay = `${index * 0.12}s`;
      card.innerHTML = `
        <div class="menu-img-wrapper">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="menu-body">
          <div class="menu-category">${item.category}</div>
          <h3 class="menu-name">${item.name}</h3>
          <p class="menu-desc">${item.description}</p>
          <div class="menu-footer">
            <span class="menu-price">Rp ${item.price.toLocaleString('id-ID')}</span>
            <div class="menu-spicy">${chilis}</div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Re-observe newly added elements
    initScrollReveal();
  } catch (e) {
    grid.innerHTML = `<div class="menu-loading"><p style="color:rgba(255,255,255,0.6)">Gagal memuat menu. Silahkan refresh halaman.</p></div>`;
  }
}

function generateChili(level) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="chili-icon ${i <= level ? 'chili-active' : 'chili-inactive'}">🌶️</span>`;
  }
  return html;
}

// ==================== TOPPINGS SECTION ====================
async function initToppingsSection() {
  const grid = document.getElementById('toppingsGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/toppings');
    const data = await res.json();

    if (!data.success) throw new Error('API failed');

    grid.innerHTML = '';
    data.data.forEach((topping, index) => {
      const card = document.createElement('div');
      card.classList.add('topping-card', 'reveal');
      card.style.transitionDelay = `${index * 0.05}s`;
      card.innerHTML = `
        <span class="topping-emoji">${topping.icon}</span>
        <div class="topping-name">${topping.name}</div>
        <div class="topping-price">+Rp ${topping.price.toLocaleString('id-ID')}</div>
      `;

      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        const name = topping.name;
        if (card.classList.contains('selected')) {
          showToast(`✅ ${name} ditambahkan!`);
        } else {
          showToast(`❌ ${name} dihapus`);
        }
      });

      grid.appendChild(card);
    });

    initScrollReveal();
  } catch (e) {
    grid.innerHTML = `<p style="text-align:center;color:var(--text-gray)">Gagal memuat topping.</p>`;
  }
}

// ==================== TESTIMONIAL SLIDER ====================
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const dotsContainer = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');

  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoSlide;

  // Create dots
  cards.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.classList.add('testi-dot');
    if (idx === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(idx));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    const cardWidth = cards[0].offsetWidth + 24; // gap = 24px
    track.style.transform = `translateX(-${current * cardWidth}px)`;

    dotsContainer.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function startAuto() {
    autoSlide = setInterval(() => goTo(current + 1), 4000);
  }

  function stopAuto() { clearInterval(autoSlide); }

  prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // Touch support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopAuto(); });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    startAuto();
  });

  startAuto();
}

// ==================== RESERVATION FORM ====================
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  if (!form) return;

  // Set min date to today
  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('reserveBtn');
    const msgEl = document.getElementById('reserveMessage');

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:3px"></div> Memproses...';
    msgEl.className = 'form-message';
    msgEl.style.display = 'none';

    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        msgEl.className = 'form-message success';
        msgEl.textContent = data.message;
        msgEl.style.display = 'block';
        form.reset();
        showToast('🎉 Reservasi berhasil dibuat!');
      } else {
        throw new Error(data.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      msgEl.className = 'form-message error';
      msgEl.textContent = err.message || 'Gagal membuat reservasi. Coba lagi.';
      msgEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-calendar-check"></i> Buat Reservasi';
    }
  });
}

// ==================== CONTACT FORM ====================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitContact');
    const msgEl = document.getElementById('contactMessage');

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:3px"></div> Mengirim...';
    msgEl.className = 'form-message';
    msgEl.style.display = 'none';

    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        msgEl.className = 'form-message success';
        msgEl.textContent = data.message;
        msgEl.style.display = 'block';
        form.reset();
        showToast('📨 Pesan berhasil dikirim!');
      } else {
        throw new Error(data.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      msgEl.className = 'form-message error';
      msgEl.textContent = err.message || 'Gagal mengirim pesan. Coba lagi.';
      msgEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Pesan';
    }
  });
}

// ==================== BACK TO TOP ====================
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==================== SMOOTH SCROLL NAV ====================
function initSmoothScrollNavLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show', 'fire');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.remove('fire'), 400);
  }, 2800);
}
