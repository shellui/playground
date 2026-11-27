import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const config = JSON.parse(
  readFileSync(new URL('../../shellui.config.json', import.meta.url), 'utf8'),
);
const prodText = readFileSync(new URL('../../.env.prod', import.meta.url), 'utf8');
const exampleText = readFileSync(new URL('../../.env.example', import.meta.url), 'utf8');

const COMPANION_PATHS = new Set([
  '',
  'dialog',
  'toaster',
  'modal',
  'actions',
  'layout',
  'themes',
  'languages',
  'account',
  'storage',
]);

function parseEnvFile(text) {
  /** @type {Record<string, string>} */
  const env = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function resolveEnv(name, defaultValue, env) {
  const value = env[name];
  if (value != null && value !== '') return value;
  if (defaultValue !== undefined) return defaultValue;
  return '';
}

function coerce(raw) {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null') return null;
  if (raw === '') return '';
  if (/^-?\d+$/.test(raw)) return Number(raw);
  return raw;
}

function substituteString(input, env) {
  if (!input.includes('${')) return input;
  const whole = /^\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}$/.exec(input);
  if (whole) return coerce(resolveEnv(whole[1], whole[2], env));
  return input.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}/g, (_match, name, def) =>
    resolveEnv(name, def, env),
  );
}

function substitute(value, env) {
  if (typeof value === 'string') return substituteString(value, env);
  if (Array.isArray(value)) return value.map((item) => substitute(item, env));
  if (value && typeof value === 'object') {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [key, child] of Object.entries(value)) out[key] = substitute(child, env);
    return out;
  }
  return value;
}

function walk(items, out = []) {
  for (const item of items || []) {
    if (item && typeof item === 'object' && Array.isArray(item.items)) {
      walk(item.items, out);
    } else if (item && typeof item === 'object') {
      out.push(item);
    }
  }
  return out;
}

function isPlaygroundAppUrl(url) {
  if (typeof url !== 'string' || url === '') return false;
  if (url.startsWith('/app/') || url.startsWith('/app#')) return true;
  try {
    return new URL(url).origin === 'http://localhost:5173';
  } catch {
    return false;
  }
}

function assertStarter(env, label) {
  const resolved = substitute(config, env);
  const items = walk(resolved.navigation);
  const flagged = items.filter((item) => item.safeForAuthToken === true && item.path !== 'files');

  assert.equal(resolved.backend.companyId, '', `${label}: company id is set`);
  assert.equal(resolved.backend.adminUrl, '', `${label}: admin URL is set`);
  assert.equal(resolved.storage.filesUrl, '', `${label}: files app URL is set`);

  const files = items.find((item) => item.path === 'files');
  assert.ok(files, `${label}: Files item missing`);
  assert.equal(files.url, '', `${label}: Files URL is set`);
  // Files keeps the opt-in, but its URL is empty here, so no origin receives the token.
  assert.equal(files.safeForAuthToken, true, `${label}: Files lost safeForAuthToken`);

  for (const path of ['website', 'docs', 'playground']) {
    const item = items.find((entry) => entry.path === path);
    assert.ok(item, `${label}: missing ${path}`);
    assert.notEqual(item.safeForAuthToken, true, `${label}: ${path} receives the access token`);
  }

  assert.equal(flagged.length, COMPANION_PATHS.size, `${label}: unexpected token opt-in`);
  for (const item of flagged) {
    assert.ok(COMPANION_PATHS.has(item.path), `${label}: ${item.path} receives the access token`);
    assert.equal(
      isPlaygroundAppUrl(item.url),
      true,
      `${label}: ${item.path} URL is not the playground app (${item.url})`,
    );
  }

  const adminItems = walk(resolved.administration.navigation);
  assert.equal(adminItems.length, 1, `${label}: administration navigation changed`);
  assert.notEqual(adminItems[0].safeForAuthToken, true, `${label}: admin homepage opts in`);
  assert.equal(
    isPlaygroundAppUrl(adminItems[0].url),
    true,
    `${label}: administration homepage is not the playground app`,
  );
}

test('starter env leaves company and token hosts unset', () => {
  assertStarter({}, 'empty env');
});

test('production env file does not fill company or token hosts', () => {
  const prod = parseEnvFile(prodText);
  for (const key of ['SHELLUI_COMPANY_ID', 'SHELLUI_ADMIN_URL', 'FILES_URL']) {
    assert.ok(!(key in prod) || prod[key] === '', `${key} is set in .env.prod`);
  }
  assert.equal(prod.PLAYGROUND_APP_URL, '/app');
  assert.equal(prod.WEBSITE_URL, 'https://shellui.com/');
  assert.equal(prod.DOCS_URL, 'https://docs.shellui.com');
  assertStarter(prod, '.env.prod');

  const website = walk(substitute(config, prod).navigation).find((item) => item.path === 'website');
  const docs = walk(substitute(config, prod).navigation).find((item) => item.path === 'docs');
  assert.equal(website.url, 'https://shellui.com/');
  assert.equal(docs.url, 'https://docs.shellui.com');
  assert.notEqual(website.safeForAuthToken, true);
  assert.notEqual(docs.safeForAuthToken, true);
});

test('env examples do not assign hosted admin, files, or company 1', () => {
  for (const [name, text] of [
    ['.env.prod', prodText],
    ['.env.example', exampleText],
  ]) {
    const assigned = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
    for (const line of assigned) {
      assert.equal(line.includes('admin.shellui.com'), false, `${name}: ${line}`);
      assert.equal(line.includes('files.shellui.com'), false, `${name}: ${line}`);
      assert.equal(line.includes('SHELLUI_COMPANY_ID=1'), false, `${name}: ${line}`);
    }
  }
});

test('with FILES_URL set, the Files item opens that app with the token opt-in', () => {
  const env = {
    SHELLUI_COMPANY_ID: '7',
    SHELLUI_ADMIN_URL: 'https://admin.example.test',
    FILES_URL: 'https://files.example.test',
  };
  const resolved = substitute(config, env);
  const files = walk(resolved.navigation).find((item) => item.path === 'files');
  assert.equal(files.url, 'https://files.example.test');
  assert.equal(files.safeForAuthToken, true);
  assert.equal(resolved.storage.filesUrl, 'https://files.example.test');
  assert.equal(resolved.backend.companyId, 7);
  assert.equal(resolved.backend.adminUrl, 'https://admin.example.test');
});

function runGuard(args, env) {
  return spawnSync(process.execPath, ['tools/config/check-hosted-config.mjs', ...args], {
    cwd: new URL('../..', import.meta.url),
    env: { PATH: process.env.PATH, ...env },
    encoding: 'utf8',
  });
}

test('the deploy guard fails when any hosted variable is unset or empty', () => {
  const all = {
    SHELLUI_COMPANY_ID: '1',
    SHELLUI_ADMIN_URL: 'https://admin.example.test',
    FILES_URL: 'https://files.example.test',
  };
  assert.equal(runGuard(['env'], all).status, 0);
  for (const name of Object.keys(all)) {
    const missing = { ...all };
    delete missing[name];
    const result = runGuard(['env'], missing);
    assert.equal(result.status, 1, `${name} unset should fail`);
    assert.match(result.stderr, new RegExp(name));
    assert.equal(runGuard(['env'], { ...all, [name]: '' }).status, 1, `${name} empty should fail`);
  }
});

test('the dist guard checks the built config against the variables', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'hosted-'));
  const file = path.join(dir, 'shellui.config.json');
  const env = {
    SHELLUI_COMPANY_ID: '1',
    SHELLUI_ADMIN_URL: 'https://admin.example.test',
    FILES_URL: 'https://files.example.test',
  };
  const built = substitute(config, env);
  writeFileSync(file, JSON.stringify(built));
  assert.equal(runGuard(['dist', file], env).status, 0);
  writeFileSync(file, JSON.stringify(substitute(config, {})));
  const result = runGuard(['dist', file], env);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /backend\.companyId/);
});
