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

// The Shellui template sets tauri = "2". Cargo's caret then selects the
// newest 2.x crate, while the CLI requires that crate and @tauri-apps/api
// to share a major and minor. Pin the crate to the installed API minor.
// Tauri 2.12 constrains its own dependencies so they compile together.
// tauri-build stays on a separate 2.x line, so leave that requirement at "2".
const apiVersion = require('@tauri-apps/api/package.json').version;
const tauriMinor = apiVersion.split('.').slice(0, 2).join('.');
const cargoPath = 'dist/app/src-tauri/Cargo.toml';

function pinCrate(source, crate, version) {
  const pattern = new RegExp(`^(${crate}\\s*=\\s*\\{\\s*version\\s*=\\s*")[^"]+(")`, 'm');
  return source.replace(pattern, `$1${version}$2`);
}

const cargo = pinCrate(
  pinCrate(readFileSync(cargoPath, 'utf8'), 'tauri-build', '2'),
  'tauri',
  `~${tauriMinor}`,
);
writeFileSync(cargoPath, cargo);

console.log(`Scaffolded dist/app for Playground ${pkg.version} (Tauri ${tauriMinor})`);
