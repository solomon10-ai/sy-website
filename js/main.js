/* ═══════════════════════════════════════════════════════════════
   DR. SULEYMAN YILDIRIM — MAIN JAVASCRIPT
   Handles: Nav, Hero Canvas, Typed Text, Stats Counter, Scroll Animations
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── NAVIGATION ─────────────────────────────────────────────── */
(function initNav() {
  const header = document.getElementById('nav-header');
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');

  // Scroll-based header style
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile toggle
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    const spans = toggle.querySelectorAll('span');
    const isOpen = links.classList.contains('open');
    spans[0].style.transform = isOpen ? 'translateY(7px) rotate(45deg)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '1';
    spans[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
  });

  // Close menu on link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity = '1';
      });
    });
  });

  // Active nav highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ── HERO NEURAL NETWORK CANVAS ─────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animFrame;

  const CONFIG = {
    count:          60,
    maxDist:        180,
    speed:          0.35,
    particleRadius: 2,
    lineOpacity:    0.15,
    particleOpacity: 0.6,
    color:          '0, 212, 255',
    bgColor:        '5, 9, 26',
  };

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * (window.devicePixelRatio || 1);
    canvas.height = H * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  function createParticle() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * CONFIG.speed,
      vy: (Math.random() - 0.5) * CONFIG.speed,
      r:  CONFIG.particleRadius + Math.random() * 1.5,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  let mouse = { x: -9999, y: -9999 };
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update + wrap particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;

      // Mouse repel
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.x += (dx / dist) * 1.2;
        p.y += (dy / dist) * 1.2;
      }
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONFIG.maxDist) {
          const alpha = CONFIG.lineOpacity * (1 - d / CONFIG.maxDist);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${CONFIG.color}, ${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color}, ${CONFIG.particleOpacity})`;
      ctx.fill();
    }

    animFrame = requestAnimationFrame(draw);
  }

  init();
  draw();

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animFrame);
    init();
    draw();
  });
})();

/* ── TYPED TEXT ANIMATION ────────────────────────────────────── */
(function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = [
    'Manager of Data Science',
    'ML & Optimization Expert',
    'AI Strategy Consultant',
    'Enterprise AI Leader',
    'Ph.D. Researcher',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let pauseTimer;

  function type() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(type, 2400);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    const speed = deleting ? 45 : 85;
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(type, speed);
  }

  setTimeout(type, 800);
})();

/* ── SCROLL REVEAL ───────────────────────────────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal, .fade-up');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger cards in grids
        const parent = entry.target.closest('.expertise-grid, .projects-grid');
        if (parent) {
          const siblings = Array.from(parent.querySelectorAll('.reveal'));
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 80}ms`;
        }
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold:  0.08,
    rootMargin: '0px 0px -60px 0px',
  });

  targets.forEach(t => obs.observe(t));

  // Hero fade-ups: trigger immediately on load
  document.querySelectorAll('.hero-content .fade-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), 100 + i * 150);
  });
})();

/* ── STATS COUNTER ───────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));

  function animateCount(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
})();

/* ── SMOOTH ACTIVE NAV STYLE ─────────────────────────────────── */
(function injectActiveStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .nav-link.active {
      color: var(--text-primary) !important;
      background: rgba(255,255,255,0.05) !important;
    }
  `;
  document.head.appendChild(style);
})();

/* ── CURSOR GLOW EFFECT (subtle) ─────────────────────────────── */
(function initCursorGlow() {
  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.5s ease;
    top: 0; left: 0;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
})();

/* ── EXPERTISE CARD TILT EFFECT ──────────────────────────────── */
(function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('.expertise-card, .project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -5;
      const rotY = ((x - cx) / cx) *  5;
      card.style.transform = `translateY(-6px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
    });
  });
})();
