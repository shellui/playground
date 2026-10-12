import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { ensureTauriApp, syncTauriConfig } from '@shellui/cli/src/utils/tauri.js';

const require = createRequire(import.meta.url);
const root = process.cwd();

await ensureTauriApp('.', root);
await syncTauriConfig('.', root, { bundles: 'dmg' });

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const confPath = 'dist/app/src-tauri/tauri.conf.json';
const conf = JSON.parse(readFileSync(confPath, 'utf8'));
conf.version = pkg.version;
conf.bundle = conf.bundle || {};
conf.bundle.targets = ['dmg'];
writeFileSync(confPath, `${JSON.stringify(conf, null, 2)}\n`);

// The Shellui template floats tauri = "2", which can resolve past the
// @tauri-apps/cli minor. The CLI rejects that mismatch.
const cliVersion = require('@tauri-apps/cli/package.json').version;
const tauriMinor = cliVersion.split('.').slice(0, 2).join('.');
const cargoPath = 'dist/app/src-tauri/Cargo.toml';
const cargo = readFileSync(cargoPath, 'utf8')
  .replace(/^(tauri-build\s*=\s*\{\s*version\s*=\s*")[^"]+(")/m, `$1${tauriMinor}$2`)
  .replace(/^(tauri\s*=\s*\{\s*version\s*=\s*")[^"]+(")/m, `$1${tauriMinor}$2`);
writeFileSync(cargoPath, cargo);

console.log(`Scaffolded dist/app for Playground ${pkg.version} (Tauri ${tauriMinor})`);
