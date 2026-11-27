// The desktop app does not include Shellui Marketplace. This writes
// .shellui-desktop/shellui.config.json (git-ignored): shellui.config.json with the
// marketplace off. `start:desktop`, `build:desktop`, and the disk image build point the CLI
// at it with `SHELLUI_CONFIG`, and the Tauri build hook inherits that variable.
// Environment placeholders such as ${SHELLUI_IDENTITY_URL:-...} are left as they are, so the
// CLI resolves them the same way it does for the web build.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = JSON.parse(readFileSync(path.join(root, 'shellui.config.json'), 'utf8'));
config.marketplace = false;
mkdirSync(path.join(root, '.shellui-desktop'), { recursive: true });
writeFileSync(
  path.join(root, '.shellui-desktop/shellui.config.json'),
  `${JSON.stringify(config, null, 2)}\n`,
);
