// Zero-dependency local server with rebuild-on-change: node serve.mjs
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { extname, join, normalize } from 'node:path';

const build = () => { try { execFileSync(process.execPath, ['build.mjs'], { stdio: 'inherit' }); } catch {} };
build();
let t; watch('src', { recursive: true }, () => { clearTimeout(t); t = setTimeout(build, 150); });

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain' };
const port = Number(process.env.PORT) || 4173;
createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join('dist', p);
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); }
  catch { file = join('dist', '404.html'); res.statusCode = 404; }
  try { res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream'); res.end(await readFile(file)); }
  catch { res.statusCode = 404; res.end('Not found'); }
}).listen(port, () => console.log(`Preview: http://localhost:${port}`));
