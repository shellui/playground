// `@shellui/core` 0.8.1 validates shellui.config.json and rejects unknown keys.
// Shellui 0.9 adds `marketplace` and navigation `locked`. Until `@shellui/core`
// and `@shellui/cli` are published at 0.9.0, this script adds those fields to
// the installed schema copy so `shellui build` and `shellui start` accept
// shellui.config.json. It does not change the package version. Delete this
// file after the 0.9.0 bump, and drop it from the package.json scripts.
import { createRequire } from 'node:module';
import { readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const schemaPath = require.resolve('@shellui/core/schemas/shellui.config.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const definitions = schema.definitions ?? schema.$defs;
const shell = definitions?.ShellUIConfig;
const navigationItem = definitions?.NavigationItem;

if (!shell?.properties || !navigationItem?.properties) {
  throw new Error(
    `Cannot patch ${schemaPath}: ShellUIConfig or NavigationItem is missing. ` +
      'Check @shellui/core before building.',
  );
}

const hasMarketplace = Object.prototype.hasOwnProperty.call(shell.properties, 'marketplace');
const hasLocked = Object.prototype.hasOwnProperty.call(navigationItem.properties, 'locked');

if (hasMarketplace && hasLocked) {
  process.exit(0);
}

if (!hasMarketplace) {
  definitions.NavigationStorageMode ??= {
    type: 'string',
    enum: ['auto', 'localStorage', 'api'],
    description: "Where a signed-in person's navigation overlay is stored.",
  };
  definitions.NavigationCustomizationConfig ??= {
    type: 'object',
    additionalProperties: false,
    description:
      'User-level navigation changes (order, hidden items, installed apps). `auto` syncs with Shellui Identity when the person is signed in and Identity is configured, and uses localStorage otherwise.',
    properties: {
      enabled: {
        type: 'boolean',
        description:
          'When false, the shell ignores the runtime overlay. Default: true when marketplace is on.',
      },
      storage: {
        $ref: '#/definitions/NavigationStorageMode',
        description: '`auto` (default), `localStorage`, or `api`.',
      },
      apiUrl: {
        type: 'string',
        description:
          'Identity base URL, or the full navigation-overlay endpoint. When omitted, the shell uses `backend.url` for a Shellui identity server.',
      },
    },
  };
  definitions.MarketplaceConfig ??= {
    type: 'object',
    additionalProperties: false,
    description:
      'Shellui Marketplace. There is no pricing in 0.9. `true` selects the public defaults. An object overrides only the fields you set.',
    properties: {
      url: {
        type: 'string',
        description: 'Marketplace app origin. Default: `https://marketplace.shellui.com`.',
      },
      apiUrl: {
        type: 'string',
        description: 'Marketplace HTTP API. Default: `https://api.marketplace.shellui.com`.',
      },
      allowThirdParty: {
        type: 'boolean',
        description: 'When false, third-party installs are rejected. Default: true.',
      },
      navigationCustomization: { $ref: '#/definitions/NavigationCustomizationConfig' },
    },
  };
  shell.properties.marketplace = {
    description:
      'Shellui Marketplace. `true` opts in with the public defaults (marketplace URL, API URL, third-party installs, and navigation overlay storage). An object overrides only the fields you set. Free in 0.9: no price or payment fields.',
    anyOf: [{ type: 'boolean' }, { $ref: '#/definitions/MarketplaceConfig' }],
  };
}

if (!hasLocked) {
  navigationItem.properties.locked = {
    type: 'boolean',
    description:
      'When true, people cannot hide or remove this item. The route stays in navigation even if a runtime overlay lists its path.',
  };
}

const next = `${JSON.stringify(schema, null, 2)}\n`;
const tmp = path.join(path.dirname(schemaPath), `.shellui.config.schema.${process.pid}.tmp`);
writeFileSync(tmp, next);
unlinkSync(schemaPath);
renameSync(tmp, schemaPath);

console.log(
  'Added marketplace and locked to the installed @shellui/core schema copy. ' +
    'Published 0.8.1 rejects those fields. Remove tools/shellui/accept-marketplace-config.mjs ' +
    'after @shellui/core and @shellui/cli are 0.9.0.',
);
