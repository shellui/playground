# Shellui Playground

A live demo of Shellui, and the shortest working example of a shell with an app inside it.

[![CI](https://github.com/shellui/playground/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shellui/playground/actions/workflows/ci.yml)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

The playground is one package: a Shellui shell (`shellui.config.json`) and a Vite and React app that runs inside it. Each sidebar page shows one part of the SDK: dialogs, modals and drawers, toasts, action buttons, layouts, themes, language and sign-in. Open it at [playground.shellui.com](https://playground.shellui.com), or download the macOS app from the [releases](https://github.com/shellui/playground/releases).

## Get started

You need Node.js 26 (the version in `.nvmrc`) and [pnpm](https://pnpm.io/) 10.30 or later (the `packageManager` field pins it). pnpm 9 cannot read the lockfile.

```bash
git clone https://github.com/shellui/playground.git
cd playground
pnpm install
pnpm start
```

Open [http://localhost:4000](http://localhost:4000). One command starts the app on port 5173 and the shell around it. `pnpm start:desktop` opens the same thing in a native Tauri window.

## Deploy variables

The GitHub Pages deploy and the macOS disk image need three repository Actions variables, and stop when one is missing:

| Variable             | What it is                                      |
| -------------------- | ----------------------------------------------- |
| `SHELLUI_COMPANY_ID` | The Shellui company the playground signs in to  |
| `SHELLUI_ADMIN_URL`  | The admin app URL                               |
| `FILES_URL`          | The Files app URL, also shares the access token |

Local `pnpm start` and CI builds run without them.

## Documentation

- [Create a project](https://docs.shellui.com/quickstart/) and the [SDK reference](https://docs.shellui.com/sdk/) on docs.shellui.com
- [Desktop apps with Tauri](https://docs.shellui.com/tauri/)
- [Development notes](docs/development.md): scripts, production build and the macOS disk image
- [CHANGELOG.md](CHANGELOG.md)

## Development

```bash
pnpm build        # shell in dist/web/, app in dist/web/app/
pnpm format:check
```

Every push to `main` builds and deploys `dist/web/` to GitHub Pages.

## Test Shellui Marketplace locally

`shellui.config.json` turns Shellui Marketplace on for the public playground with explicit `url` and `apiUrl`, `allowThirdParty: false` and `navigationCustomization.storage: "localStorage"`. The public playground does not install third-party apps, and a person's layout stays in their browser. In Shellui 0.9 the marketplace URL defaults to `https://marketplace.shellui.com` and the catalog API to `https://api.marketplace.shellui.com`.

The marketplace is not available in the desktop app, so the app stays compatible with the Mac App Store (a directory that installs web apps at runtime is not). `pnpm start:desktop` and `pnpm build:desktop` run [tools/desktop/write-desktop-config.mjs](tools/desktop/write-desktop-config.mjs), which writes a git-ignored `.shellui-desktop/shellui.config.json` with `"marketplace": false`. Both scripts then point the CLI at it with `SHELLUI_CONFIG`, and so does the macOS disk image build.

Home, Settings, Login, and Playground are pinned with `"locked": true`. The shell keeps those routes even when a navigation overlay tries to hide or remove them. Dialogs, toasts, modals, action buttons, layouts, themes, language, account, storage, Files, Website, and Docs are not pinned, so you can hide them and reorder them.

This repo pins `@shellui/cli`, `@shellui/core`, and `@shellui/sdk` at 0.8.6. `shellui build` checks `shellui.config.json` against the schema in `@shellui/core`, and the published 0.8.6 schema rejects `marketplace` and `locked`. A [pnpm patch](patches/@shellui__core@0.8.6.patch) adds those two fields to the schema, so no script edits `node_modules`. After 0.9.0 is on npm, bump the three `@shellui/*` packages to `0.9.0`, remove `pnpm.patchedDependencies` from `package.json`, and delete the `patches` folder.

The published 0.8.6 shell does not install apps or apply `locked`. To try that behavior, run this playground against the marketplace runtime on [shellui#215](https://github.com/shellui/shellui/pull/215) instead of the published packages.

### Directory and catalog

Clone the siblings next to this repo:

```bash
git clone https://github.com/shellui/marketplace.git ../marketplace
git clone https://github.com/shellui/marketplace-service.git ../marketplace-service
```

Start the catalog API. It listens on `http://localhost:8010`:

```bash
cd ../marketplace-service
docker compose up
```

Start the directory:

```bash
cd ../marketplace
cp .env.example .env.local
pnpm install
pnpm start
```

The directory listens on `http://localhost:5176`. The playground Vite app stays on `http://localhost:5173`, so those two ports do not clash. The Shellui dev stack also serves the playground on 5176. If that stack is already up, start the directory on another port:

```bash
VITE_DEV_PORT=5177 VITE_DEV_ORIGIN=http://localhost:5177 pnpm start
```

Set `VITE_MARKETPLACE_API_URL=http://localhost:8010` in `../marketplace/.env.local`. When that origin does not answer, the directory keeps its local catalog and shows "Showing the local catalog."

To test installs, change the `marketplace` block in `shellui.config.json` to point at those local origins and allow third-party installs:

```json
"marketplace": {
  "url": "http://localhost:5176",
  "apiUrl": "http://localhost:8010",
  "allowThirdParty": true,
  "navigationCustomization": { "storage": "localStorage" }
}
```

Put the block back to the committed values before you commit. `http://localhost` is allowed for local development. A remote install URL has to be `https`.

### What to check

Run `pnpm start` and open `http://localhost:4000`. With the marketplace runtime and the local block above:

- Shellui Marketplace is in the sidebar. Choose an app from the directory. The shell asks you to confirm, and names the app and its origin. After you confirm, the item appears, labelled as third-party. Remove it and the item leaves.
- Hide Dialogs, Toasts, or Files. Home, Settings, Login, and Playground stay.
- Reorder an item that is not pinned. A reload keeps the order.
- The layout is in `localStorage` under a key for the signed-in person and company. To sync it with identity-service instead, set `navigationCustomization.storage` to `"auto"`. The shell then uses `{backend.url}/api/v1/navigation-overlay`.

## Contributing

Open an issue or a pull request against `develop`. Coding agents start with [AGENTS.md](AGENTS.md).

## Shellui projects

| Project                                                               | What it does                          |
| --------------------------------------------------------------------- | ------------------------------------- |
| [shellui](https://github.com/shellui/shellui)                         | The shell, CLI and SDK                |
| [admin](https://github.com/shellui/admin)                             | Administration app inside the shell   |
| [files](https://github.com/shellui/files)                             | File explorer for storage-service     |
| [identity-service](https://github.com/shellui/identity-service)       | Sign-in, companies and tokens         |
| [storage-service](https://github.com/shellui/storage-service)         | File storage                          |
| [hosting-service](https://github.com/shellui/hosting-service)         | Deploys and serves Shellui apps       |
| [email-service](https://github.com/shellui/email-service)             | Templates and sends email             |
| [marketplace](https://github.com/shellui/marketplace)                 | Directory of apps for a Shellui shell |
| [marketplace-service](https://github.com/shellui/marketplace-service) | Catalog API for Shellui Marketplace   |
| [skills](https://github.com/shellui/skills)                           | Agent Skills for coding agents        |
| [playground](https://github.com/shellui/playground)                   | Live demo of the shell                |

## License

MIT
