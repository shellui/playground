// Copies legal/*.md into shellui.config.json > legalDocuments.
// legal/*.md is the single source. Run `pnpm legal:sync` after editing them.
// `--check` fails (used by the build) when the config is out of date.
import { readFileSync, writeFileSync } from 'node:fs';
import prettier from 'prettier';

const MAP = {
  privacyPolicy: 'legal/privacy-policy.md',
  termsOfService: 'legal/terms-of-service.md',
  legalNotice: 'legal/legal-notice.md',
};
const check = process.argv.includes('--check');
const raw = readFileSync('shellui.config.json', 'utf8');
const config = JSON.parse(raw);
const docs = {};
for (const [key, file] of Object.entries(MAP)) docs[key] = readFileSync(file, 'utf8');
config.legalDocuments = docs;
const next = await prettier.format(JSON.stringify(config), {
  ...(await prettier.resolveConfig('shellui.config.json')),
  filepath: 'shellui.config.json',
});
if (check) {
  if (next !== raw) {
    console.error('shellui.config.json legalDocuments is out of date. Run: pnpm legal:sync');
    process.exit(1);
  }
} else {
  writeFileSync('shellui.config.json', next);
}
