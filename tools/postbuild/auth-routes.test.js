import test from 'node:test';
import assert from 'node:assert/strict';
import { rewriteRelativeAssetDepth } from './auth-routes.js';

const sample = `<script type="module" crossorigin src="./assets/main.js"></script>
<link rel="stylesheet" crossorigin href="./assets/main.css">
<link rel="icon" href="./favicon.svg" type="image/svg+xml">`;

test('depth 0 leaves ./ paths unchanged', () => {
  assert.equal(rewriteRelativeAssetDepth(sample, 0), sample);
});

test('depth 1 rewrites ./ to ../', () => {
  const out = rewriteRelativeAssetDepth(sample, 1);
  assert.match(out, /src="\.\.\/assets\/main\.js"/);
  assert.match(out, /href="\.\.\/assets\/main\.css"/);
  assert.match(out, /href="\.\.\/favicon\.svg"/);
});

test('depth 2 rewrites ./ to ../../', () => {
  const out = rewriteRelativeAssetDepth(sample, 2);
  assert.match(out, /src="\.\.\/\.\.\/assets\/main\.js"/);
  assert.match(out, /href="\.\.\/\.\.\/assets\/main\.css"/);
  assert.match(out, /href="\.\.\/\.\.\/favicon\.svg"/);
});
