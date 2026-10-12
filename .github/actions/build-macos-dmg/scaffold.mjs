import { readFileSync, writeFileSync } from 'node:fs';
import { ensureTauriApp, syncTauriConfig } from '@shellui/cli/src/utils/tauri.js';

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

console.log(`Scaffolded dist/app for Playground ${pkg.version}`);
