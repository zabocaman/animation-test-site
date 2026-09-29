// Static build: node build.mjs [--preview]
// Renders content.js + templates.js into ./dist (multi-page site)
// and ./dist-preview/index.html (single self-contained file).
import { mkdir, writeFile, readFile, cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import * as C from './src/content.js';
import { layout, homePage, casePage, notFoundPage, FAVICON, isPlaceholder } from './src/templates.js';

const out = 'dist';
await rm(out, { recursive: true, force: true });
await mkdir(`${out}/assets`, { recursive: true });

const write = async (path, html) => { await mkdir(path.split('/').slice(0, -1).join('/'), { recursive: true }); await writeFile(path, html); };

// Home
await write(`${out}/index.html`, layout({ title: C.site.title, description: C.site.description, body: homePage('site'), mode: 'site' }));
// Case studies
for (const pr of C.projects) {
  await write(`${out}/work/${pr.slug}/index.html`,
    layout({ title: `${pr.title} | ${C.person.name}`, description: pr.summary, body: casePage(pr, 'site'), mode: 'site', depth: 2 }));
}
// 404 (root-absolute asset paths so it works at any URL depth)
let nf = layout({ title: `Page not found | ${C.person.name}`, description: C.site.description, body: notFoundPage(), mode: 'site' });
nf = nf.replaceAll('href="assets/', 'href="/assets/').replaceAll('src="assets/', 'src="/assets/').replaceAll('href="./"', 'href="/"').replaceAll('href="#', 'href="/#');
await write(`${out}/404.html`, nf);

// Assets
await cp('src/styles.css', `${out}/assets/styles.css`);
await cp('src/main.js', `${out}/assets/main.js`);
await writeFile(`${out}/assets/favicon.svg`, FAVICON);
if (existsSync('src/assets')) await cp('src/assets', `${out}/assets`, { recursive: true });

// robots + sitemap (sitemap only when a real site URL is set)
const url = isPlaceholder(C.site.url) ? null : C.site.url.replace(/\/$/, '');
await writeFile(`${out}/robots.txt`, `User-agent: *\nAllow: /\n${url ? `Sitemap: ${url}/sitemap.xml\n` : ''}`);
if (url) {
  const pages = ['', ...C.projects.map((p) => `work/${p.slug}/`)];
  await writeFile(`${out}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${url}/${p}</loc></url>`).join('\n')}\n</urlset>\n`);
}

// Single-file preview
let css = await readFile('src/styles.css', 'utf8');
for (const f of ['bric', 'ss']) css = css.replace(`url('fonts/${f}.woff2')`, `url(data:font/woff2;base64,${(await readFile(`src/assets/fonts/${f}.woff2`)).toString('base64')})`);
const js = await readFile('src/main.js', 'utf8');
await mkdir('dist-preview', { recursive: true });
await writeFile('dist-preview/index.html', layout({ title: C.site.title, description: C.site.description, body: homePage('preview'), mode: 'preview', css, js }));

// Content audit: warn about placeholders that still hide things
const todo = [];
if (isPlaceholder(C.site.url)) todo.push('site.url (canonical, Open Graph image and sitemap are off)');
if (isPlaceholder(C.links.email)) todo.push('links.email (email buttons are hidden)');
if (isPlaceholder(C.links.linkedin)) todo.push('links.linkedin (LinkedIn link is hidden)');
if (!C.person.portrait) todo.push('person.portrait (typographic plate shown)');
console.log(`Built ${C.projects.length + 2} pages to ./dist and a preview to ./dist-preview/index.html`);
if (todo.length) console.log('Placeholders still set:\n  - ' + todo.join('\n  - '));
