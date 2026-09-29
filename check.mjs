// Pre-publish checks: internal links resolve, no raw [PLACEHOLDER] or lorem text in pages.
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const files = [];
async function walk(d) { for (const f of await readdir(d)) { const p = join(d, f); (await stat(p)).isDirectory() ? await walk(p) : p.endsWith('.html') && files.push(p); } }
await walk('dist');
let errors = 0;
for (const f of files) {
  const html = await readFile(f, 'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  if (/\[[A-Z_]{3,}\]/.test(text)) { console.error(`✗ placeholder text in ${f}`); errors++; }
  if (/lorem ipsum/i.test(text)) { console.error(`✗ lorem ipsum in ${f}`); errors++; }
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(href)) continue;
    const [path, hash] = href.split('#');
    let target = path ? (path.startsWith('/') ? join('dist', path) : resolve(dirname(f), path)) : f;
    if (path && (path.endsWith('/') || existsSync(target) && (await stat(target)).isDirectory())) target = join(target, 'index.html');
    if (!existsSync(target)) { console.error(`✗ ${f}: broken link ${href}`); errors++; continue; }
    if (hash) {
      const tHtml = target === f ? html : await readFile(target, 'utf8');
      if (!new RegExp(`\\sid="${hash}"`).test(tHtml)) { console.error(`✗ ${f}: missing anchor #${hash}`); errors++; }
    }
  }
  if (!/<h1[\s>]/.test(html)) { console.error(`✗ ${f}: no h1`); errors++; }
}
console.log(errors ? `${errors} problem(s) found` : `✓ ${files.length} pages checked: links, anchors, placeholders, headings`);
process.exit(errors ? 1 : 0);
