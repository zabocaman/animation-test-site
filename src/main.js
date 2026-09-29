// Interaction layer. Everything here is progressive enhancement:
// the site is fully readable and navigable without it.
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ── Hero signal field ─────────────────────────────────────
   A grid of short dashes ("signals"). Noise keeps them scattered;
   an outcome trace and the pointer (or an autonomous focus on touch)
   pull them into alignment and colour. */
function signalField(canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const hero = canvas.parentElement;
    let w = 0, h = 0, dpr = 1, pts = [], raf = 0, running = false, visible = true, t0 = performance.now();
  const pointer = { x: 0, y: 0, last: -1e9 };
  const INK = '20,28,43', SIG = '47,59,240';

  function build() {
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gap = w < 700 ? 26 : 21;
    // Protect readability: quiet the field behind each block of hero text.
    // (.line is measured instead of its span because the span may be mid-animation.)
    const hr = hero.getBoundingClientRect(), pad = 14;
    const boxes = [...$$('.hero-title .line', hero), ...$$('.hero-sub, .hero-actions, .hero-id', hero)].map((el) => {
      const r = el.getBoundingClientRect();
      const width = el.classList.contains('line') ? el.firstElementChild.offsetWidth : el.classList.contains('hero-actions') ? Math.min(r.width, [...el.children].reduce((m, c) => Math.max(m, c.offsetLeft + c.offsetWidth - el.offsetLeft), 0)) : r.width;
      return { l: r.left - hr.left - pad, t: r.top - hr.top - pad, r: r.left - hr.left + width + pad, b: r.bottom - hr.top + pad };
    });
    pts = [];
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let y = gap / 2; y < h; y += gap) {
      for (let x = gap / 2; x < w; x += gap) {
        const px = x + (rand() - 0.5) * gap * 0.5, py = y + (rand() - 0.5) * gap * 0.5;
        const inText = boxes.some((b) => px > b.l && px < b.r && py > b.t && py < b.b);
        pts.push({ x: px, y: py, a: rand() * 6.28, heat: 0, ph: rand() * 6.28, mask: inText ? 0.28 : 1 });
      }
    }
  }

  function step(now, settle) {
    const t = now - t0;
    const sweep = settle ? 1 : Math.min(1, t / 1700);
    const ease = 1 - Math.pow(1 - sweep, 3);
    const sweepX = -0.15 * w + ease * w * 1.3;
    let fx, fy, fr;
    const active = now - pointer.last < 2600;
    if (active) { fx = pointer.x; fy = pointer.y; }
    else { fx = w * (0.64 + 0.24 * Math.sin(t * 0.00012)); fy = h * (0.46 + 0.3 * Math.sin(t * 0.00019 + 1.3)); }
    fr = Math.min(w, h) * (w < 700 ? 0.3 : 0.2);
    const fr2 = fr * fr, bw = h * 0.075;
    const paths = [new Path2D(), new Path2D(), new Path2D()];
    for (const p of pts) {
      const noise = Math.sin(p.x * 0.012 + t * 0.00035 + p.ph) * 1.7 + Math.cos(p.y * 0.016 - t * 0.00028) * 1.3;
      const u = p.x / w;
      const yc = h * (0.8 - 0.55 * u) + Math.sin(p.x * 0.005 + t * 0.00025) * h * 0.05;
      const flow = Math.atan2(-0.55 * h + Math.cos(p.x * 0.005 + t * 0.00025) * h * 0.25, w);
      const dy = (p.y - yc) / bw;
      const reveal = Math.max(0, Math.min(1, (sweepX - p.x) / (w * 0.2)));
      const band = Math.exp(-dy * dy) * reveal;
      const dx = p.x - fx, dyy = p.y - fy;
      const focus = Math.exp(-(dx * dx + dyy * dyy) / fr2) * (active ? 1 : 0.8);
      const order = Math.min(1, Math.max(band, focus)) * p.mask;
      let d = noise * (1 - order) + flow * order - p.a;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      p.a += settle ? d : d * 0.12;
      p.heat += settle ? order - p.heat : (order - p.heat) * 0.1;
      const len = 3.5 + p.heat * 8;
      const cx = Math.cos(p.a) * len, sy = Math.sin(p.a) * len;
      const bucket = p.heat > 0.6 ? 2 : p.heat > 0.25 ? 1 : 0;
      const path = paths[bucket];
      path.moveTo(p.x - cx, p.y - sy); path.lineTo(p.x + cx, p.y + sy);
    }
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.4; ctx.strokeStyle = `rgba(${INK},0.2)`; ctx.stroke(paths[0]);
    ctx.lineWidth = 1.7; ctx.strokeStyle = `rgba(${SIG},0.5)`; ctx.stroke(paths[1]);
    ctx.lineWidth = 2.1; ctx.strokeStyle = `rgba(${SIG},0.92)`; ctx.stroke(paths[2]);
  }

  const loop = (now) => { step(now, false); raf = running ? requestAnimationFrame(loop) : 0; };
  function start() {
    if (reduceMQ.matches) { stop(); step(performance.now() + 4000, true); return; }
    if (running || !visible || document.hidden) return;
    running = true; raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); raf = 0; }

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.last = performance.now();
  };
  const onVis = () => (document.hidden ? stop() : start());
  const onMotion = () => { stop(); build(); start(); };
  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (!running) step(performance.now() + 4000, true); }, 120); };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); });

  build();
  document.fonts?.ready.then(() => { build(); if (!running) step(performance.now() + 4000, true); });
  io.observe(canvas);
  hero.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('pointerdown', onMove, { passive: true });
  document.addEventListener('visibilitychange', onVis);
  reduceMQ.addEventListener('change', onMotion);
  const ro = new ResizeObserver(onResize); ro.observe(hero);
  start();
  return () => { stop(); io.disconnect(); ro.disconnect(); hero.removeEventListener('pointermove', onMove); hero.removeEventListener('pointerdown', onMove); document.removeEventListener('visibilitychange', onVis); reduceMQ.removeEventListener('change', onMotion); };
}

/* ── Header: scroll state, mobile menu, current section ─── */
function header() {
  const hd = $('[data-header]');
  if (!hd) return;
  const toggle = $('[data-menu-toggle]', hd), panel = $('[data-nav-panel]', hd);
  const setScrolled = () => hd.classList.toggle('is-scrolled', scrollY > 24 || !$('.hero'));
  setScrolled();
  addEventListener('scroll', setScrolled, { passive: true });

  const mq = matchMedia('(max-width: 900px)');
  const focusables = () => [toggle, ...$$('a', panel)];
  function setOpen(open, returnFocus = true) {
    toggle.setAttribute('aria-expanded', String(open));
    hd.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('a', panel)?.focus();
    else if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('click', (e) => { if (e.target.closest('a') && mq.matches) setOpen(false, false); });
  hd.addEventListener('keydown', (e) => {
    if (!hd.classList.contains('is-open')) return;
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Tab') {
      const f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  mq.addEventListener('change', () => hd.classList.contains('is-open') && setOpen(false, false));

  // current section
  const links = new Map($$('[data-nav]').map((a) => [a.dataset.nav, a]));
  const sections = $$('[data-section]');
  if (!sections.length) return;
  const seen = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
    let best = null, max = 0;
    seen.forEach((v, k) => { if (v > max) { max = v; best = k; } });
    links.forEach((a, id) => (id === best ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.5, 1] });
  sections.forEach((s) => io.observe(s));
}

/* ── Alignment reveals (rules and project art) ──────────── */
function aligners() {
  const els = $$('[data-align]');
  if (reduceMQ.matches || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-aligned')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-aligned'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  els.forEach((el) => io.observe(el));
}

/* ── Expertise tabs (ARIA tabs, arrow keys) ─────────────── */
function tabs() {
  $$('[data-tabs]').forEach((root) => {
    const tabs = $$('[role="tab"]', root);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    function select(i, focus) {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
        if (on) { panels[j].classList.remove('is-entering'); void panels[j].offsetWidth; panels[j].classList.add('is-entering'); }
      });
      if (focus) { tabs[i].focus(); tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i, false));
      t.addEventListener('keydown', (e) => {
        const k = e.key; let n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % tabs.length;
        if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        if (k === 'Home') n = 0; if (k === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });
    panels.forEach((p, j) => (p.hidden = j !== 0));
  });
}

/* ── Single-file preview: case studies as hash views ────── */
function previewRouter() {
  if (!document.body.hasAttribute('data-preview')) return;
  const cases = $$('[data-case]');
  let lastY = 0;
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    const target = h.startsWith('work/') ? document.getElementById(h) : null;
    const wasCase = document.body.classList.contains('is-case');
    if (!wasCase && target) lastY = scrollY;
    cases.forEach((c) => (c.hidden = c !== target));
    document.body.classList.toggle('is-case', !!target);
    if (target) { scrollTo(0, 0); $('.case-title', target).focus({ preventScroll: true }); document.title = `${$('.case-title', target).textContent} | Warren Chanansingh`; }
    else {
      document.title = document.body.dataset.title;
      if (wasCase) {
        const el = h && document.getElementById(h);
        el ? el.scrollIntoView() : scrollTo(0, lastY);
      }
    }
  }
  document.body.dataset.title = document.title;
  addEventListener('hashchange', route);
  route();
}

header();
tabs();
aligners();
previewRouter();
const canvas = $('[data-field]');
if (canvas && canvas.getContext) signalField(canvas);
