# Shellui Playground

A live demo of Shellui, and the shortest working example of a shell with an app inside it.

[![CI](https://github.com/shellui/playground/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shellui/playground/actions/workflows/ci.yml)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

The playground is one package: a Shellui shell (`shellui.config.json`) and a Vite and React app that runs inside it. Each sidebar page shows one part of the SDK: dialogs, modals and drawers, toasts, action buttons, layouts, themes, language and sign-in. Open it at [playground.shellui.com](https://playground.shellui.com), or download the macOS app from the [releases](https://github.com/shellui/playground/releases).

## Get started

You need Node.js 26 (the version in `.nvmrc`) and [pnpm](https://pnpm.io/).

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

`shellui.config.json` turns Shellui Marketplace on with `"marketplace": true`. In Shellui 0.9 that flag selects the public directory at `https://marketplace.shellui.com` and the catalog API at `https://api.marketplace.shellui.com`. Listings are free. There is no price and no checkout.

Home, Settings, Login, and Playground are pinned with `"locked": true`. The shell keeps those routes even when a navigation overlay tries to hide or remove them. Dialogs, toasts, modals, action buttons, layouts, themes, language, account, storage, Files, Website, and Docs are not pinned, so you can hide them, reorder them, install apps, and remove apps.

This repo pins `@shellui/cli`, `@shellui/core`, and `@shellui/sdk` at 0.8.1. `shellui build` checks `shellui.config.json` against the schema in that pin, and 0.8.1 rejects `marketplace` and `locked`. `pnpm start` and `pnpm build` run [tools/shellui/accept-marketplace-config.mjs](tools/shellui/accept-marketplace-config.mjs) first. The script adds those fields to the installed schema copy when they are missing, and the published CLI then validates the config.

After 0.9.0 is on npm, bump the three `@shellui/*` packages to `0.9.0` and delete the script. The published 0.8.1 shell does not install apps or apply `locked`. To try that behavior, run this playground against the marketplace runtime on [shellui#215](https://github.com/shellui/shellui/pull/215) instead of the published packages.

### Directory and catalog

Clone the siblings next to this repo:

```bash
git clone https://github.com/shellui/marketplace.git ../marketplace
git clone https://github.com/shellui/marketplace-service.git ../marketplace-service
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

`VITE_MARKETPLACE_API_URL` in `../marketplace/.env.local` points at marketplace-service. The default is `https://api.marketplace.shellui.com`. Start marketplace-service with the command in that repo's README, then set `VITE_MARKETPLACE_API_URL` to the origin it prints. When that origin does not answer, the directory keeps its local catalog and shows "Showing the local catalog."

`"marketplace": true` is the public default. While you test local origins, replace it with an object. Set `url` to the directory and `apiUrl` to the same origin as `VITE_MARKETPLACE_API_URL`:

```json
"marketplace": {
  "url": "http://localhost:5176",
  "apiUrl": "https://api.marketplace.shellui.com"
}
```

Put the playground back to `"marketplace": true` before you commit. `http://localhost` is allowed for local development. A remote install URL has to be `https`.

### What to check

Run `pnpm start` and open `http://localhost:4000`. With the marketplace runtime:

- Shellui Marketplace is in the sidebar. Install an app from the directory. The item appears. Remove it and the item leaves.
- Hide Dialogs, Toasts, or Files. Home, Settings, Login, and Playground stay.
- Reorder an item that is not pinned. A reload keeps the order.
- Signed out, the overlay is in `localStorage` under `shellui.navigation.overlay`. Signed in, storage `auto` uses identity-service at `/api/v1/user/navigation-overlay`.

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
