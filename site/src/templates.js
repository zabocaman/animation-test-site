// HTML templates. Content lives in content.js; this file controls markup.
import * as C from './content.js';

export const isPlaceholder = (v) => !v || /^\[.*\]$/.test(String(v).trim());
const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ── deterministic randomness so generative art is stable per build ──
function rng(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const deg = (r) => ((r * 180) / Math.PI).toFixed(1);

// Generative "signal signature": scattered dashes that align into a pattern.
export function signature(slug, pattern = 'rise', { cols = 18, rows = 11, W = 360, H = 220 } = {}) {
  const r = rng(slug);
  const cx = W * (0.35 + r() * 0.3), cy = H * (0.4 + r() * 0.2);
  let lines = '';
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = ((i + 0.5) / cols) * W + (r() - 0.5) * 6;
      const y = ((j + 0.5) / rows) * H + (r() - 0.5) * 6;
      const u = x / W;
      let a = 0, hot = false;
      if (pattern === 'rise') {
        const yc = H * (0.82 - 0.62 * u) + Math.sin(u * 7) * 8;
        a = Math.atan2(-0.62 * H + Math.cos(u * 7) * 56, W);
        hot = Math.abs(y - yc) < 16;
      } else if (pattern === 'wave') {
        const k = (Math.PI * 3) / W, amp = H * 0.22;
        const yc = H / 2 + Math.sin(x * k) * amp;
        a = Math.atan(Math.cos(x * k) * amp * k);
        hot = Math.abs(y - yc) < 15;
      } else if (pattern === 'converge') {
        a = Math.atan2(cy - y, cx - x);
        hot = Math.hypot(cx - x, cy - y) < Math.min(W, H) * 0.28;
      } else if (pattern === 'orbit') {
        a = Math.atan2(cy - y, cx - x) + Math.PI / 2;
        const d = Math.hypot(cx - x, cy - y);
        hot = Math.abs(d - Math.min(W, H) * 0.32) < 14;
      } else {
        a = 0;
        hot = Math.abs(y - H * 0.5) < 14;
      }
      const rot = (r() - 0.5) * Math.PI * 1.8;
      const len = hot ? 7 : 5;
      lines += `<line class="${hot ? 'hot' : ''}" x1="${(x - len).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + len).toFixed(1)}" y2="${y.toFixed(1)}" style="--r:${deg(rot)}deg;--a:${deg(a)}deg;--d:${Math.round(u * 700)}"/>`;
    }
  }
  return `<svg class="sig" data-align viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${lines}</svg>`;
}

// Section rule: a line of dashes that align when the section enters view.
function rule(seed) {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < 24; i++) s += `<i style="--r:${Math.round((r() - 0.5) * 160)}deg;--d:${i * 22}"></i>`;
  return `<div class="rule" data-align aria-hidden="true">${s}</div>`;
}
const glyph = `<span class="glyph" aria-hidden="true"><i></i><i></i><i></i></span>`;

// ── helpers for link paths (site pages vs single-file preview) ──
function paths(mode, depth) {
  const up = '../'.repeat(depth);
  return {
    home: mode === 'preview' ? '#top' : up || './',
    section: (id) => (mode === 'preview' || depth === 0 ? `#${id}` : `${up}#${id}`),
    project: (slug) => (mode === 'preview' ? `#work/${slug}` : `${up}work/${slug}/`),
    asset: (f) => `${up}assets/${f}`,
  };
}

const emailReady = () => !isPlaceholder(C.links.email);
const mailto = (subject) => `mailto:${C.links.email}?subject=${encodeURIComponent(subject)}`;

// ── page shell ──
export function layout({ title, description, body, mode, depth = 0, css, js, bodyClass = '' }) {
  const p = paths(mode, depth);
  const siteUrl = isPlaceholder(C.site.url) ? null : C.site.url.replace(/\/$/, '');
  const canonical = siteUrl ? `${siteUrl}/${depth ? body.canonicalPath || '' : ''}` : null;
  const head = `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#E8EBE4">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="${C.site.locale}">
<meta name="twitter:card" content="summary_large_image">
${siteUrl ? `<link rel="canonical" href="${canonical}">\n<meta property="og:url" content="${canonical}">\n<meta property="og:image" content="${siteUrl}/assets/og.png">` : ''}
<script>document.documentElement.classList.add('js')</script>
${mode === 'preview' ? '' : `<link rel="preload" href="${p.asset('fonts/bric.woff2')}" as="font" type="font/woff2" crossorigin>`}
${mode === 'preview' ? `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(FAVICON)}">` : `<link rel="icon" href="${p.asset('favicon.svg')}" type="image/svg+xml">`}
${css ? `<style>${css}</style>` : `<link rel="stylesheet" href="${p.asset('styles.css')}">`}
${js ? '' : `<script type="module" src="${p.asset('main.js')}"></script>`}
</head>`;
  return `${head}
<body class="${bodyClass}"${mode === 'preview' ? ' data-preview' : ''}>
<a class="skip" href="#main">Skip to content</a>
${header(p)}
${body.html}
${footer(p)}
${js ? `<script type="module">${js}</script>` : ''}
</body>
</html>`;
}

export const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#141C2B"/><g stroke-linecap="round" stroke-width="3"><path d="M7 11 l6 -3" stroke="#8D96FF"/><path d="M9 19 l14 0" stroke="#E8EBE4"/><path d="M13 25 l12 0" stroke="#8D96FF"/></g></svg>`;

function header(p) {
  const items = C.nav
    .map((n) => `<li><a class="nav-link" href="${p.section(n.id)}" data-nav="${n.id}">${esc(n.label)}</a></li>`)
    .join('');
  return `<header class="site-header" data-header>
  <div class="wrap header-inner">
    <a class="wordmark" href="${p.home}" aria-label="${esc(C.person.name)}, home">${glyph}<span>${esc(C.person.name)}</span></a>
    <nav class="primary-nav" aria-label="Primary">
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-panel" data-menu-toggle>
        <span class="menu-label">Menu</span><span class="menu-icon" aria-hidden="true"><i></i><i></i></span>
      </button>
      <div class="nav-panel" id="nav-panel" data-nav-panel>
        <ul class="nav-list">${items}</ul>
        <a class="btn btn-talk" href="${p.section('contact')}">${glyph}<span>Let’s talk</span></a>
      </div>
    </nav>
  </div>
</header>`;
}

function footer(p) {
  const year = new Date().getFullYear();
  const links = [];
  if (emailReady()) links.push(`<a href="mailto:${esc(C.links.email)}">Email</a>`);
  if (!isPlaceholder(C.links.linkedin)) links.push(`<a href="${esc(C.links.linkedin)}" rel="me noopener" target="_blank">LinkedIn<span class="vh"> (opens in a new tab)</span></a>`);
  if (!isPlaceholder(C.links.portfolio)) links.push(`<a href="${esc(C.links.portfolio)}" rel="me noopener" target="_blank">Portfolio archive<span class="vh"> (opens in a new tab)</span></a>`);
  return `<footer class="site-footer">
  <div class="wrap footer-inner">
    <p>© ${year} ${esc(C.person.name)}. ${esc(C.person.location)}.</p>
    <ul class="footer-links">${links.map((l) => `<li>${l}</li>`).join('')}<li><a href="#main">Back to top</a></li></ul>
  </div>
</footer>`;
}

// ── home sections ──
function heroSection(p) {
  const h = C.hero;
  return `<section class="hero" id="top" aria-labelledby="hero-title">
  <canvas class="field" data-field aria-hidden="true"></canvas>
  <div class="wrap hero-inner">
    <p class="hero-id"><span class="hero-name">${esc(C.person.name)}</span><span class="hero-role">${esc(C.person.role)}, ${esc(C.person.location)}</span></p>
    <div class="hero-copy" data-hero-copy>
      <h1 id="hero-title" class="hero-title">${h.headline.map((l, i) => `<span class="line"><span style="--i:${i}">${esc(l)}</span></span>`).join(' ')}</h1>
      <p class="hero-sub">${esc(h.sub)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${p.section('work')}">${glyph}<span>${esc(h.primary.label)}</span></a>
        <a class="btn btn-quiet" href="${p.section('contact')}"><span>${esc(h.secondary.label)}</span></a>
      </div>
    </div>
    <p class="field-hint" aria-hidden="true"><span class="hint-fine">Move your pointer to pull the signals into line.</span><span class="hint-coarse">Touch the field to pull the signals into line.</span></p>
  </div>
</section>`;
}

const statusLabel = (s) => (s === 'published' ? '' : '<span class="status">Case study in development</span>');

function workSection(p) {
  const items = C.projects
    .map(
      (pr) => `<li class="work-item">
    <a class="work-link" href="${p.project(pr.slug)}">
      <div class="work-art" style="view-transition-name: art-${pr.slug}">${signature(pr.slug, pr.pattern)}</div>
      <div class="work-text">
        <p class="work-cat">${esc(pr.category)}${pr.year ? `<span class="work-year">${esc(pr.year)}</span>` : ''}</p>
        <h3 class="work-title">${esc(pr.title)}</h3>
        <p class="work-summary">${esc(pr.summary)}</p>
        <p class="work-foot">${statusLabel(pr.status)}<span class="work-open">Read the project</span></p>
      </div>
    </a>
  </li>`
    )
    .join('');
  return `<section class="section work" id="work" aria-labelledby="work-title" data-section>
  <div class="wrap">
    ${rule('work')}
    <div class="section-head">
      <h2 id="work-title">Selected work</h2>
      <p>Paid media, storytelling and learning projects. Each one is written up as a case study; results appear only once they’re confirmed.</p>
    </div>
    <ul class="work-list" role="list">${items}</ul>
  </div>
</section>`;
}

function expertiseSection() {
  const tabs = C.expertise
    .map(
      (e, i) => `<button class="xp-tab" role="tab" id="tab-${e.id}" aria-controls="panel-${e.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" type="button">
      <span class="xp-tab-bar" aria-hidden="true"></span>${esc(e.title)}</button>`
    )
    .join('');
  const panels = C.expertise
    .map(
      (e) => `<div class="xp-panel" role="tabpanel" id="panel-${e.id}" aria-labelledby="tab-${e.id}" tabindex="0">
      <h3 class="xp-title">${esc(e.title)}</h3>
      <p class="xp-lead">${esc(e.lead)}</p>
      <ul class="xp-list">${e.doing.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
    </div>`
    )
    .join('');
  return `<section class="section expertise" id="expertise" aria-labelledby="xp-heading" data-section>
  <div class="wrap">
    ${rule('expertise')}
    <div class="section-head">
      <h2 id="xp-heading">Expertise</h2>
      <p>Four kinds of work, one habit: start with the audience, end with something you can measure.</p>
    </div>
    <div class="xp" data-tabs>
      <div class="xp-tabs" role="tablist" aria-label="Areas of expertise" aria-orientation="vertical">${tabs}</div>
      <div class="xp-panels">${panels}</div>
    </div>
  </div>
</section>`;
}

function aboutSection(p) {
  const a = C.about;
  const portrait = C.person.portrait
    ? `<img src="${p.asset(C.person.portrait)}" alt="${esc(C.person.portraitAlt)}" width="800" height="1000" loading="lazy" decoding="async">`
    : `<div class="plate" aria-hidden="true"><span class="plate-initials">WC</span>${signature('warren-portrait', 'converge', { cols: 12, rows: 15, W: 288, H: 360 })}</div>`;
  return `<section class="section about" id="about" aria-labelledby="about-title" data-section>
  <div class="wrap">
    ${rule('about')}
    <div class="about-grid">
      <figure class="portrait">${portrait}</figure>
      <div class="about-text">
        <h2 id="about-title">About</h2>
        ${a.paragraphs.map((t, i) => `<p${i === 0 ? ' class="about-lead"' : ''}>${esc(t)}</p>`).join('')}
        <dl class="facts">${a.facts.map((f) => `<div><dt>${esc(f.term)}</dt><dd>${esc(f.detail)}</dd></div>`).join('')}</dl>
      </div>
    </div>
  </div>
</section>`;
}

function insightsSection() {
  const items = C.insights
    .map((n) => {
      const pub = n.status === 'published' && n.href;
      const title = pub ? `<a href="${esc(n.href)}">${esc(n.title)}</a>` : esc(n.title);
      return `<li class="insight">
      <h3 class="insight-title">${title}</h3>
      <p class="insight-premise">${esc(n.premise)}</p>
      ${pub ? '' : '<span class="status">Draft</span>'}
    </li>`;
    })
    .join('');
  return `<section class="section insights" id="insights" aria-labelledby="insights-title" data-section>
  <div class="wrap">
    ${rule('insights')}
    <div class="section-head">
      <h2 id="insights-title">Insights and experiments</h2>
      <p>Short pieces I’m writing now. They’ll link here as they’re published.</p>
    </div>
    <ol class="insight-list" role="list">${items}</ol>
  </div>
</section>`;
}

function contactSection() {
  const c = C.contact;
  const ready = emailReady();
  const portfolio = !isPlaceholder(C.links.portfolio);
  const routes = c.routes
    .map(
      (r) => `<li class="route">
      <h3>${esc(r.title)}</h3>
      <p>${esc(r.text)}</p>
      ${ready ? `<a class="btn btn-invert" href="${mailto(r.subject)}">${glyph}<span>${esc(r.action)}</span></a>` : ''}
    </li>`
    )
    .join('');
  const fallback =
    !ready && portfolio
      ? `<p class="contact-fallback"><a class="btn btn-invert" href="${esc(C.links.portfolio)}" target="_blank" rel="noopener">${glyph}<span>Contact me through my portfolio</span><span class="vh"> (opens in a new tab)</span></a></p>`
      : '';
  const linkedin = !isPlaceholder(C.links.linkedin)
    ? `<p class="contact-alt"><a href="${esc(C.links.linkedin)}" target="_blank" rel="me noopener">Or connect on LinkedIn<span class="vh"> (opens in a new tab)</span></a></p>`
    : '';
  return `<section class="section contact" id="contact" aria-labelledby="contact-title" data-section>
  <div class="wrap">
    ${rule('contact')}
    <h2 id="contact-title" class="closing">${c.closing.map((l) => `<span>${esc(l)}</span>`).join(' ')}</h2>
    <p class="contact-intro">${esc(c.intro)}</p>
    <ul class="routes" role="list">${routes}</ul>
    ${fallback}${linkedin}
  </div>
</section>`;
}

export function homePage(mode) {
  const p = paths(mode, 0);
  const cases = mode === 'preview' ? C.projects.map((pr) => caseArticle(pr, p, true)).join('') : '';
  return {
    html: `<main id="main">${heroSection(p)}${workSection(p)}${expertiseSection()}${aboutSection(p)}${insightsSection()}${contactSection()}</main>${cases}`,
  };
}

// ── case study ──
function caseArticle(pr, p, embedded = false) {
  const meta = [
    ['Category', pr.category],
    ['Year', pr.year],
    ['Client', pr.client],
    ['Role', pr.role],
    ['Channels and tools', pr.channels && pr.channels.join(', ')],
  ].filter(([, v]) => v);
  const block = (title, content) => (content ? `<section class="case-block"><h2>${title}</h2>${content}</section>` : '');
  const para = (t) => (t ? `<p>${esc(t)}</p>` : '');
  const list = (a) => (a && a.length ? `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  const media = (pr.media || [])
    .map((m) => `<figure class="case-media"><img src="${p.asset(m.src)}" alt="${esc(m.alt)}" loading="lazy" decoding="async">${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ''}</figure>`)
    .join('');
  const related = (pr.related || [])
    .map((s) => C.projects.find((x) => x.slug === s))
    .filter(Boolean)
    .map((r) => `<li><a href="${p.project(r.slug)}"><span class="rel-cat">${esc(r.category)}</span><span class="rel-title">${esc(r.title)}</span></a></li>`)
    .join('');
  const body = [
    block('Context', para(pr.context)),
    block('Challenge', para(pr.challenge)),
    block('Approach', list(pr.approach)),
    block('Key decisions', list(pr.decisions)),
    block('Results', para(pr.outcome)),
    block('Learnings and next steps', para(pr.learnings)),
  ].join('');
  const inDev = pr.status !== 'published';
  const id = embedded ? ` id="work/${pr.slug}"` : '';
  const Tag = embedded ? 'article' : 'main';
  return `<${Tag} class="case"${id}${embedded ? ' data-case hidden' : ' id="main"'}>
  <div class="wrap">
    <a class="back" href="${p.section('work')}">${glyph}<span>Back to selected work</span></a>
    <header class="case-head">
      <p class="work-cat">${esc(pr.category)}</p>
      <h1 class="case-title" tabindex="-1">${esc(pr.title)}</h1>
      <p class="case-summary">${esc(pr.summary)}</p>
    </header>
    <div class="case-art" style="view-transition-name: art-${pr.slug}">${signature(pr.slug, pr.pattern, { cols: 30, rows: 12, W: 600, H: 240 })}</div>
    ${inDev ? `<p class="case-note"><span class="status">In development</span> This case study is still being written. Everything shown here is confirmed; results and visuals will be added once they’re approved.</p>` : ''}
    <div class="case-grid">
      ${meta.length ? `<dl class="case-meta">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : '<div></div>'}
      <div class="case-body">${body || '<section class="case-block"><h2>Coming soon</h2><p>The full story of this project is being written up now.</p></section>'}${media}
        ${pr.link && !isPlaceholder(pr.link.href) ? `<p><a class="btn btn-primary" href="${esc(pr.link.href)}" target="_blank" rel="noopener">${glyph}<span>${esc(pr.link.label)}</span><span class="vh"> (opens in a new tab)</span></a></p>` : ''}
      </div>
    </div>
    ${related ? `<nav class="related" aria-label="Related work"><h2>Related work</h2><ul role="list">${related}</ul></nav>` : ''}
  </div>
</${Tag}>`;
}

export function casePage(pr, mode) {
  const p = paths(mode, 2);
  return { html: caseArticle(pr, p), canonicalPath: `work/${pr.slug}/` };
}

export function notFoundPage() {
  const p = paths('site', 0);
  return {
    html: `<main id="main" class="case notfound"><div class="wrap"><h1 class="case-title">This page is out of range.</h1><p class="case-summary">The link may be old or mistyped.</p><p><a class="btn btn-primary" href="./">${glyph}<span>Go to the home page</span></a></p></div></main>`,
  };
}
