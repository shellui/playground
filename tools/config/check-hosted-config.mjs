#!/usr/bin/env node
// Guard for the Pages deploy. The starter leaves the company, admin app and files app
// unset, so a deploy must fail instead of publishing a playground without them.
//
//   node tools/config/check-hosted-config.mjs env    fail when an Actions variable is unset
//   node tools/config/check-hosted-config.mjs dist   fail when dist/web/shellui.config.json
//                                                    does not carry the variable values
import { readFileSync } from 'node:fs';

const NAMES = ['SHELLUI_COMPANY_ID', 'SHELLUI_ADMIN_URL', 'FILES_URL'];
const mode = process.argv[2];

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

if (mode === 'env') {
  const missing = NAMES.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    fail(`Pages deploy needs Actions variables: ${missing.join(' ')}.`);
  }
  console.log('hosted config variables are set');
} else if (mode === 'dist') {
  const file = process.argv[3] || 'dist/web/shellui.config.json';
  const config = JSON.parse(readFileSync(file, 'utf8'));
  const wrong = [];
  const check = (label, actual, expected) => {
    if (String(actual ?? '') !== expected) wrong.push(label);
  };
  check('backend.companyId', config.backend?.companyId, process.env.SHELLUI_COMPANY_ID ?? '');
  check('backend.adminUrl', config.backend?.adminUrl, process.env.SHELLUI_ADMIN_URL ?? '');
  check('storage.filesUrl', config.storage?.filesUrl, process.env.FILES_URL ?? '');
  const all = JSON.stringify(config);
  if (all.includes('${')) wrong.push('unresolved ${...} placeholder');
  if (wrong.length > 0) {
    fail(`${file} does not match the Actions variables: ${wrong.join(', ')}.`);
  }
  console.log(`${file} carries the Actions variable values`);
} else {
  fail('usage: check-hosted-config.mjs env|dist [file]');
}
