import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ensureTauriApp, syncTauriConfig } from '@shellui/cli/src/utils/tauri.js';

const root = process.cwd();
const overlay = path.join(root, 'src-tauri');
const appSrc = path.join(root, 'dist/app/src-tauri');

await ensureTauriApp('.', root);
await syncTauriConfig('.', root);

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const cargoPath = path.join(appSrc, 'Cargo.toml');
let cargo = readFileSync(cargoPath, 'utf8');
cargo = cargo.replace(/^version\s*=\s*"[^"]*"/m, `version = "${pkg.version}"`);
if (!cargo.includes('tauri-plugin-opener')) {
  const withPlugins = cargo.replace(
    /tauri\s*=\s*\{\s*version\s*=\s*"2",\s*features\s*=\s*\[\]\s*\}/,
    [
      'tauri = { version = "2", features = [] }',
      'tauri-plugin-opener = "2"',
      'tauri-plugin-deep-link = "2"',
    ].join('\n'),
  );
  if (withPlugins === cargo) {
    throw new Error('Could not add opener and deep-link crates to Cargo.toml');
  }
  cargo = withPlugins;
}
// `generate_context!` references `::serde_json` when tauri.conf.json has a `plugins` block.
if (!/^serde_json\s*=/m.test(cargo)) {
  cargo = cargo.replace(/^(tauri\s*=\s*\{[^\n]*\}\n)/m, '$1serde_json = "1"\n');
}
writeFileSync(cargoPath, cargo);

const libPath = path.join(appSrc, 'src/lib.rs');
let lib = readFileSync(libPath, 'utf8');
if (!lib.includes('tauri_plugin_opener::init')) {
  const withPlugins = lib.replace(
    'tauri::Builder::default()\n',
    [
      'tauri::Builder::default()',
      '        .plugin(tauri_plugin_opener::init())',
      '        .plugin(tauri_plugin_deep_link::init())',
      '',
    ].join('\n'),
  );
  if (withPlugins === lib) {
    throw new Error('Could not register opener and deep-link plugins in lib.rs');
  }
  lib = withPlugins;
}
writeFileSync(libPath, lib);

cpSync(
  path.join(overlay, 'capabilities/default.json'),
  path.join(appSrc, 'capabilities/default.json'),
);
cpSync(path.join(overlay, 'Info.plist'), path.join(appSrc, 'Info.plist'));
cpSync(path.join(overlay, 'Info.ios.plist'), path.join(appSrc, 'Info.ios.plist'));
