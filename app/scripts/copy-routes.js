import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distApp = path.join(__dirname, '../../dist/app');
const indexHtml = path.join(distApp, 'index.html');

// Routes that need their own index.html for direct URL access when serving statically
const routes = ['about'];

if (!fs.existsSync(indexHtml)) {
  console.error('Build output not found at', indexHtml);
  process.exit(1);
}

const html = fs.readFileSync(indexHtml, 'utf8');

for (const route of routes) {
  const dir = path.join(distApp, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('Created', path.join(route, 'index.html'));
}

console.log('Static route copies done.');
