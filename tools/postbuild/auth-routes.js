#!/usr/bin/env node
/**
 * Ensure OAuth login routes ship index.html with asset paths rewritten for nesting depth.
 * Workaround until @shellui/cli 0.5.2 emits login/callback/index.html with ../../assets/.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const distDir = path.join(projectRoot, 'dist/web');
const sourceIndexPath = path.join(distDir, 'index.html');

/** Routes that must exist under dist/web for OAuth / SPA hosting (path → optional fixed depth). */
const AUTH_ROUTES = ['login', 'login/callback'];

/**
 * Prefix ./-relative src/href URLs so assets resolve from nested route folders.
 * @param {string} html
 * @param {number} depth - Path segment count (login = 1, login/callback = 2).
 */
export function rewriteRelativeAssetDepth(html, depth) {
  if (depth <= 0) return html;
  const prefix = '../'.repeat(depth);
  return html.replace(/(\b(?:src|href)=["'])\.\//g, `$1${prefix}`);
}

function routeDepth(routePath) {
  return routePath.split('/').filter(Boolean).length;
}

function ensureAuthRouteIndex(routePath) {
  const depth = routeDepth(routePath);
  const routeDir = path.join(distDir, routePath);
  const routeIndexPath = path.join(routeDir, 'index.html');

  fs.mkdirSync(routeDir, { recursive: true });

  const html = fs.readFileSync(sourceIndexPath, 'utf8');
  const rewritten = rewriteRelativeAssetDepth(html, depth);
  fs.writeFileSync(routeIndexPath, rewritten);

  console.log(`auth-routes: wrote ${path.relative(projectRoot, routeIndexPath)} (depth ${depth})`);
}

function main() {
  if (!fs.existsSync(sourceIndexPath)) {
    console.error(`auth-routes: missing ${sourceIndexPath}; run shellui build first.`);
    process.exit(1);
  }

  for (const routePath of AUTH_ROUTES) {
    ensureAuthRouteIndex(routePath);
  }
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  main();
}
