import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ensureTauriApp, syncTauriConfig } from '@shellui/cli/src/utils/tauri.js';

const root = process.cwd();
const overlay = path.join(root, 'src-tauri');
const appSrc = path.join(root, 'dist/app/src-tauri');

await ensureTauriApp('.', root);
await syncTauriConfig('.', root);

/**
 * @param {string} text
 * @param {string | RegExp} search
 * @param {string} replacement
 * @param {string} what
 */
function replaceOnce(text, search, replacement, what) {
  const next = text.replace(search, replacement);
  if (next === text) throw new Error(`Could not ${what}`);
  return next;
}

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const cargoPath = path.join(appSrc, 'Cargo.toml');
let cargo = readFileSync(cargoPath, 'utf8');
cargo = cargo.replace(/^version\s*=\s*"[^"]*"/m, `version = "${pkg.version}"`);
if (!cargo.includes('tauri-plugin-opener')) {
  cargo = replaceOnce(
    cargo,
    /tauri\s*=\s*\{\s*version\s*=\s*"2",\s*features\s*=\s*\[\]\s*\}/,
    [
      'tauri = { version = "2", features = [] }',
      'tauri-plugin-opener = "2"',
      'tauri-plugin-deep-link = "2"',
    ].join('\n'),
    'add opener and deep-link crates to Cargo.toml',
  );
}
// `generate_context!` references `::serde_json` when tauri.conf.json has a `plugins` block.
if (!/^serde_json\s*=/m.test(cargo)) {
  cargo = cargo.replace(/^(tauri\s*=\s*\{[^\n]*\}\n)/m, '$1serde_json = "1"\n');
}
// Windows and Linux start a second process for a deep link. This hands it to the running app.
if (!cargo.includes('tauri-plugin-single-instance')) {
  cargo = `${cargo.trimEnd()}\n\n[target.'cfg(any(windows, target_os = "linux"))'.dependencies]\ntauri-plugin-single-instance = { version = "2", features = ["deep-link"] }\n`;
}
writeFileSync(cargoPath, cargo);

const libPath = path.join(appSrc, 'src/lib.rs');
let lib = readFileSync(libPath, 'utf8');
if (!lib.includes('tauri_plugin_opener::init')) {
  lib = replaceOnce(
    lib,
    'tauri::Builder::default()\n',
    [
      'tauri::Builder::default()',
      '        .plugin(tauri_plugin_opener::init())',
      '        .plugin(tauri_plugin_deep_link::init())',
      '',
    ].join('\n'),
    'register opener and deep-link plugins in lib.rs',
  );
}
if (!lib.includes('tauri_plugin_single_instance')) {
  lib = replaceOnce(
    lib,
    /^ {4}tauri::Builder::default\(\)\n/m,
    [
      '    let builder = tauri::Builder::default();',
      '    // Must be the first plugin.',
      '    #[cfg(any(windows, target_os = "linux"))]',
      '    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {',
      '        use tauri::Manager;',
      '        if let Some(window) = app.get_webview_window("main") {',
      '            let _ = window.set_focus();',
      '        }',
      '    }));',
      '    builder',
      '',
    ].join('\n'),
    'register the single-instance plugin in lib.rs',
  );
}
if (!lib.includes('register_all')) {
  lib = replaceOnce(
    lib,
    /^( {8}\.setup\(\|app\| \{\n)/m,
    '$1' +
      [
        '            // Installers register the scheme. `tauri dev` registers it at runtime.',
        '            #[cfg(all(debug_assertions, any(windows, target_os = "linux")))]',
        '            {',
        '                use tauri_plugin_deep_link::DeepLinkExt;',
        '                app.deep_link().register_all()?;',
        '            }',
        '',
      ].join('\n'),
    'register deep-link schemes at runtime in lib.rs',
  );
}
writeFileSync(libPath, lib);

cpSync(
  path.join(overlay, 'capabilities/default.json'),
  path.join(appSrc, 'capabilities/default.json'),
);
