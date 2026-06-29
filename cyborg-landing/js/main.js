/**
 * CYBORG X — main.js (Fixed ES6 Version)
 * No optional chaining, no nullish coalescing — pure ES6.
 */

(function () {
  'use strict';

  /* ============================================================
     HELPERS
     ============================================================ */
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $$(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  function clamp(n, lo, hi) {
    return Math.min(Math.max(n, lo), hi);
  }

  /* ============================================================
     1. PARTICLE SYSTEM
     ============================================================ */
  function ParticleSystem(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.W = 0;
    this.H = 0;
    this.particles = [];
    this.mouse = { x: -999, y: -999 };
    this.running = false;
    this._raf = null;

    this._setup();
    this._bindEvents();
    this._start();
  }

  ParticleSystem.prototype._count = function () {
    return window.innerWidth < 600 ? 28 : 60;
  };

  ParticleSystem.prototype._setup = function () {
    this._resize();
    this._build();
  };

  ParticleSystem.prototype._resize = function () {
    this.W = this.canvas.width = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;
  };

  ParticleSystem.prototype._build = function () {
    var palettes = ['rgba(0,240,255,', 'rgba(255,0,229,', 'rgba(0,128,255,'];
    var count = this._count();
    this.particles = [];
    for (var i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        r: Math.random() * 1.8 + 0.4,
        a: Math.random() * 0.45 + 0.15,
        col: palettes[Math.floor(Math.random() * palettes.length)]
      });
    }
  };

  ParticleSystem.prototype._bindEvents = function () {
    var self = this;
    var resizeTimer;

    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        self._resize();
        self._build();
      }, 220);
    });

    window.addEventListener('mousemove', function (e) {
      self.mouse.x = e.clientX;
      self.mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      self.mouse.x = -999;
      self.mouse.y = -999;
    });
  };

  ParticleSystem.prototype._start = function () {
    if (this.running) return;
    this.running = true;
    this._loop();
  };

  ParticleSystem.prototype._loop = function () {
    if (!this.running) return;
    var ctx = this.ctx;
    var W = this.W;
    var H = this.H;

    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];

      // Move
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Mouse repel
      var dx = this.mouse.x - p.x;
      var dy = this.mouse.y - p.y;
      var d2 = dx * dx + dy * dy;
      if (d2 < 18000) {
        var f = (18000 - d2) / 18000 * 0.025;
        p.x -= dx * f;
        p.y -= dy * f;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.col + p.a + ')';
      ctx.fill();

      // Connections
      for (var j = i + 1; j < this.particles.length; j++) {
        var q = this.particles[j];
        var cx = p.x - q.x;
        var cy = p.y - q.y;
        var cd = Math.sqrt(cx * cx + cy * cy);
        if (cd < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(0,240,255,' + ((1 - cd / 130) * 0.12) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    var self = this;
    this._raf = requestAnimationFrame(function () { self._loop(); });
  };

  ParticleSystem.prototype.destroy = function () {
    this.running = false;
    cancelAnimationFrame(this._raf);
  };

  /* ============================================================
     2. CUSTOM CURSOR
     ============================================================ */
  function CustomCursor() {
    if (!window.matchMedia('(hover: hover)').matches) return;

    this.ring = document.getElementById('cursorRing');
    this.dot = document.getElementById('cursorDot');
    if (!this.ring || !this.dot) return;

    this.rx = 0;
    this.ry = 0;
    this.mx = 0;
    this.my = 0;
    this.active = false;

    this._bind();
    this._loop();
  }

  CustomCursor.prototype._bind = function () {
    var self = this;

    document.addEventListener('mousemove', function (e) {
      self.mx = e.clientX;
      self.my = e.clientY;
      self.dot.style.transform = 'translate(' + (e.clientX - 3) + 'px, ' + (e.clientY - 3) + 'px)';

      if (!self.active) {
        self.active = true;
        document.body.classList.add('cursor-active');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      self.active = false;
      document.body.classList.remove('cursor-active');
    });

    var hoverSel = 'a, button, .glass-card, .feat-card, .testi-card, .field-input, label';
    $$(hoverSel).forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', function () {
        document.body.classList.remove('cursor-hover');
      });
    });
  };

  CustomCursor.prototype._loop = function () {
    this.rx += (this.mx - this.rx) * 0.14;
    this.ry += (this.my - this.ry) * 0.14;
    this.ring.style.transform = 'translate(' + (this.rx - 19) + 'px, ' + (this.ry - 19) + 'px)';
    var self = this;
    requestAnimationFrame(function () { self._loop(); });
  };

  /* ============================================================
     3. NAVIGATION
     ============================================================ */
  function Navigation() {
    this.header = document.getElementById('siteHeader');
    this.ham = document.getElementById('hamburger');
    this.links = document.getElementById('navLinks');
    this.backdrop = document.getElementById('navBackdrop');
    this.navLinks = $$('.nav-link');
    this.open = false;

    this._bindScroll();
    this._bindToggle();
    this._bindLinks();
    this._bindKeyboard();
    this._setActive();

    var self = this;
    window.addEventListener('scroll', function () { self._setActive(); }, { passive: true });
  }

  Navigation.prototype._bindScroll = function () {
    var self = this;
    window.addEventListener('scroll', function () {
      if (self.header) {
        self.header.classList.toggle('is-scrolled', window.scrollY > 40);
      }
    }, { passive: true });
  };

  Navigation.prototype._bindToggle = function () {
    var self = this;

    function openMenu() {
      self.open = true;
      if (self.ham) self.ham.classList.add('is-open');
      if (self.links) self.links.classList.add('is-open');
      if (self.backdrop) self.backdrop.classList.add('is-open');
      if (self.ham) self.ham.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      self.open = false;
      if (self.ham) self.ham.classList.remove('is-open');
      if (self.links) self.links.classList.remove('is-open');
      if (self.backdrop) self.backdrop.classList.remove('is-open');
      if (self.ham) self.ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    this._closeMenu = closeMenu;

    if (this.ham) {
      this.ham.addEventListener('click', function () {
        self.open ? closeMenu() : openMenu();
      });
    }
    if (this.backdrop) {
      this.backdrop.addEventListener('click', closeMenu);
    }
  };

  Navigation.prototype._bindLinks = function () {
    var self = this;

    this.navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
        var top = target.getBoundingClientRect().top + window.scrollY - offset - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (typeof self._closeMenu === 'function') self._closeMenu();
      });
    });

    $$('a[href^="#"]').forEach(function (a) {
      if (a.classList.contains('nav-link')) return;
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
        var top = target.getBoundingClientRect().top + window.scrollY - offset - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (typeof self._closeMenu === 'function') self._closeMenu();
      });
    });
  };

  Navigation.prototype._bindKeyboard = function () {
    var self = this;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.open && typeof self._closeMenu === 'function') {
        self._closeMenu();
      }
    });
  };

  Navigation.prototype._setActive = function () {
    var sections = $$('section[id]');
    var offset = 160;
    var scrollPos = window.scrollY;

    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      var top = sec.offsetTop;
      var height = sec.offsetHeight;
      var id = sec.getAttribute('id');

      if (scrollPos + offset >= top && scrollPos + offset < top + height) {
        this.navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('data-section') === id);
        });
      }
    }
  };

  /* ============================================================
     4. TYPING EFFECT
     ============================================================ */
  function TypingEffect(el, strings, opts) {
    if (!el) return;
    this.el = el;
    this.strings = strings || [];
    this.speed = (opts && opts.speed) ? opts.speed : 52;
    this.pause = (opts && opts.pause) ? opts.pause : 2400;
    this.si = 0;
    this.ci = 0;
    this.del = false;
    this._t = null;

    this._run();
  }

  TypingEffect.prototype._run = function () {
    var self = this;
    var current = this.strings[this.si];
    var displayText;

    if (this.del) {
      displayText = current.substring(0, this.ci - 1);
      this.ci--;
    } else {
      displayText = current.substring(0, this.ci + 1);
      this.ci++;
    }

    this.el.innerHTML = displayText + '<span class="typer-cursor" aria-hidden="true"></span>';

    var typeSpeed = this.del ? this.speed / 1.8 : this.speed;

    if (!this.del && this.ci > current.length) {
      typeSpeed = this.pause;
      this.del = true;
    } else if (this.del && this.ci < 0) {
      this.del = false;
      this.si = (this.si + 1) % this.strings.length;
      typeSpeed = 320;
    }

    this._t = setTimeout(function () { self._run(); }, typeSpeed);
  };

  TypingEffect.prototype.destroy = function () {
    clearTimeout(this._t);
  };

  /* ============================================================
     5. SCROLL REVEAL
     ============================================================ */
  function ScrollReveal() {
    this.els = $$('.js-reveal');
    if (!this.els.length) return;

    if ('IntersectionObserver' in window) {
      var self = this;
      this.io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var delay = parseInt(en.target.getAttribute('data-delay')) || 0;
          setTimeout(function () {
            en.target.classList.add('is-visible');
          }, delay);
          self.io.unobserve(en.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      this.els.forEach(function (el) { self.io.observe(el); });
    } else {
      this.els.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ============================================================
     6. COUNTER ANIMATION
     ============================================================ */
  function CounterAnim() {
    this.els = $$('.stat-value[data-count]');
    if (!this.els.length) return;

    if ('IntersectionObserver' in window) {
      var self = this;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          self._animate(en.target);
          io.unobserve(en.target);
        });
      }, { threshold: 0.5 });
      this.els.forEach(function (el) { io.observe(el); });
    } else {
      this.els.forEach(function (el) {
        var v = el.getAttribute('data-count');
        var prefix = el.getAttribute('data-prefix') || '';
        var span = el.querySelector('span');
        var suffix = span ? span.outerHTML : '';
        el.innerHTML = prefix + v + suffix;
      });
    }
  }

  CounterAnim.prototype._animate = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimal = el.getAttribute('data-decimal') !== null;
    var prefix = el.getAttribute('data-prefix') || '';
    var span = el.querySelector('span');
    var suffix = span ? span.outerHTML : '';
    var dur = 2000;
    var t0 = performance.now();

    el.style.opacity = '1';

    function update(now) {
      var p = clamp((now - t0) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = eased * target;
      var txt = decimal ? val.toFixed(1) : Math.floor(val).toLocaleString();
      el.innerHTML = prefix + txt + suffix;
      if (p < 1) {
        requestAnimationFrame(update);
      } else {
        var finalTxt = decimal ? target.toFixed(1) : target.toLocaleString();
        el.innerHTML = prefix + finalTxt + suffix;
      }
    }

    requestAnimationFrame(update);
  };

  /* ============================================================
     7. FEATURE BARS
     ============================================================ */
  function FeatureBars() {
    this.bars = $$('.feat-bar-fill');
    if (!this.bars.length) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.style.width = en.target.getAttribute('data-w') + '%';
          io.unobserve(en.target);
        });
      }, { threshold: 0.3 });
      this.bars.forEach(function (bar) { io.observe(bar); });
    } else {
      this.bars.forEach(function (bar) {
        bar.style.width = bar.getAttribute('data-w') + '%';
      });
    }
  }

  /* ============================================================
     8. GAUGE RINGS
     ============================================================ */
  function GaugeRings() {
    this.gauges = $$('.js-gauge');
    if (!this.gauges.length) return;

    var CIRC = 351.86;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var val = parseInt(en.target.getAttribute('data-val'));
          var arc = en.target.querySelector('.gauge-arc');
          if (arc) {
            setTimeout(function () {
              arc.style.strokeDashoffset = CIRC - (val / 100) * CIRC;
            }, 200);
          }
          io.unobserve(en.target);
        });
      }, { threshold: 0.4 });
      this.gauges.forEach(function (g) { io.observe(g); });
    } else {
      this.gauges.forEach(function (g) {
        var arc = g.querySelector('.gauge-arc');
        var val = parseInt(g.getAttribute('data-val'));
        if (arc) arc.style.strokeDashoffset = CIRC - (val / 100) * CIRC;
      });
    }
  }

  /* ============================================================
     9. HUD SIMULATOR
     ============================================================ */
  function HUDSimulator() {
    this.el = document.getElementById('hudLoad');
    if (!this.el) return;
    this._tick();
  }

  HUDSimulator.prototype._tick = function () {
    var self = this;
    var v = (38 + Math.random() * 34).toFixed(0);
    if (this.el) this.el.textContent = v + '%';
    setTimeout(function () { self._tick(); }, 1800 + Math.random() * 1200);
  };

  /* ============================================================
     10. CONTACT FORM
     ============================================================ */
  function ContactForm() {
    this.form = document.getElementById('contactForm');
    this.msg = document.getElementById('formMsg');
    this.btn = this.form ? this.form.querySelector('[type="submit"]') : null;
    this.lbl = document.getElementById('btnLabel');
    if (!this.form) return;
    this.form.addEventListener('submit', this._submit.bind(this));
  }

  ContactForm.prototype._fields = function () {
    var nameEl = document.getElementById('f-name');
    var emailEl = document.getElementById('f-email');
    var augEl = document.getElementById('f-augment');
    var msgEl = document.getElementById('f-msg');
    return {
      name: nameEl ? nameEl.value.trim() : '',
      email: emailEl ? emailEl.value.trim() : '',
      aug: augEl ? augEl.value : '',
      msg: msgEl ? msgEl.value.trim() : ''
    };
  };

  ContactForm.prototype._validEmail = function (v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  ContactForm.prototype._setMsg = function (txt, type) {
    if (!this.msg) return;
    this.msg.textContent = txt;
    this.msg.className = 'form-msg is-' + type;
  };

  ContactForm.prototype._setBusy = function (busy) {
    if (this.btn) this.btn.disabled = busy;
    if (this.lbl) {
      this.lbl.textContent = busy ? 'Transmitting...' : 'Initiate Protocol';
    }
  };

  ContactForm.prototype._submit = function (e) {
    e.preventDefault();
    var fields = this._fields();

    if (!fields.name || !fields.email || !fields.aug || !fields.msg) {
      this._setMsg('ERROR: All fields are required.', 'error');
      return;
    }
    if (!this._validEmail(fields.email)) {
      this._setMsg('ERROR: Invalid comm channel (email) format.', 'error');
      return;
    }

    this._setBusy(true);
    this._setMsg('', '');

    var self = this;
    setTimeout(function () {
      self._setBusy(false);
      self._setMsg(
        'TRANSMISSION SUCCESSFUL — Augmentation protocol initiated. Await neural contact.',
        'success'
      );
      self.form.reset();
      setTimeout(function () {
        if (self.msg) {
          self.msg.textContent = '';
          self.msg.className = 'form-msg';
        }
      }, 6000);
    }, 2200);
  };

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    var canvas = document.getElementById('particleCanvas');
    if (canvas) new ParticleSystem(canvas);

    new CustomCursor();
    new Navigation();

    var typingEl = document.getElementById('typewriter');
    if (typingEl) {
      new TypingEffect(typingEl, [
        'Seamless neural integration — zero rejection rate.',
        'Bionic augmentations beyond human limitation.',
        'AI-driven intelligence for the next evolution.',
        'Your body upgraded. Your mind expanded. Forever.'
      ]);
    }

    new ScrollReveal();
    new CounterAnim();
    new FeatureBars();
    new GaugeRings();
    new HUDSimulator();
    new ContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();