# Shellui Playground

A demo of **Shellui**, the microfrontend orchestration framework, deployed to GitHub Pages.

The shell (`@shellui/cli`) and the embedded Vite/React app live in **one package** — a single `pnpm install`.

## Quick Start

```bash
pnpm install
```

This playground expects the sibling [`shellui`](../shellui) monorepo (linked via `link:../shellui/packages/*`). After SDK changes in that repo, run `pnpm build:sdk`.

One terminal starts the iframe app and the shell (`config.dev.run`). Stopping the app (or Ctrl+C) stops the shell:

```bash
pnpm start        # vite + Shellui CLI → http://localhost:4000 (app at :5173)
```

Open [http://localhost:4000](http://localhost:4000). Navigation loads the app from port 5173.

### Floating Actions

The **Floating Actions** sidebar page demos `shellui.actions.set` / `clear` (back, title, trailing overflow, primary FAB). Register clicks with **`onClick` on each control** inside `set` (see [shellui#42](https://github.com/shellui/shellui/pull/42) / issue [#41](https://github.com/shellui/shellui/issues/41)).

```bash
cd ../shellui && git checkout cursor/floating-actions-sdk-100e && pnpm build:sdk
cd ../playground && git checkout cursor/floating-actions-demo-75ab && pnpm start
```

Without the SDK export, the page shows an alert instead of crashing.

To run only the Vite app: `pnpm start:app`. To run only the shell: `shellui start --shell-only`.

### Desktop (Tauri)

```bash
pnpm start:desktop   # shell + Vite + native window
```

Branding comes from root [`tauri.conf.json`](tauri.conf.json) (`productName`: **Playground**, icon: [`static/icon.png`](static/icon.png) padded to Apple’s dock grid). Requires a Shellui CLI that syncs root `tauri.conf.json` (0.5.0+).

## Scripts

| Script               | What it does                                                                     |
| -------------------- | -------------------------------------------------------------------------------- |
| `pnpm start`         | `shellui start` — companion Vite app + shell (exits if the app dies)             |
| `pnpm start:app`     | `vite` — embedded React app only (escape hatch)                                  |
| `pnpm start:desktop` | `shellui start --app` — native Tauri window (**Playground** + dock icon)         |
| `pnpm build`         | `shellui build` then `vite build` (production env from [`.env.prod`](.env.prod)) |
| `pnpm build:sdk`     | Rebuild `@shellui/sdk` in the sibling `../shellui` monorepo                      |
| `pnpm preview`       | Vite preview of the app                                                          |
| `pnpm serve:dist`    | Serve the GitHub Pages artifact from `dist/web/` locally                         |

`pnpm build` loads [`.env.prod`](.env.prod) (via `DOTENV_CONFIG_PATH`) so navigation URLs in `shellui.config.json` resolve to production values (`${PLAYGROUND_APP_URL}`, `${WEBSITE_URL}`, …). Local `pnpm start` keeps the `${VAR:-default}` localhost defaults unless you set them in `.env`.

## Build for Production

```bash
pnpm build
```

Output (this is what GitHub Pages deploys):

- `dist/web/` — shell
- `dist/web/app/` — embedded app (`PLAYGROUND_APP_URL=/app`, Vite `base` `/app/`)

## Project Structure

```
package.json            # One package: Shellui CLI + Vite app
shellui.config.json      # Shell (navigation, themes, layout, backend)
static/                 # Shell assets copied into dist/web
src/                    # Embedded React app (Tailwind v4 via @tailwindcss/vite)
index.html
vite.config.js          # App only — the CLI does not use this file
public/                 # App public assets
dist/web/               # Production output (gitignored)
```

## Deploy to GitHub Pages

Push to `main` and the GitHub Actions workflow will `pnpm install`, `pnpm build`, and deploy `dist/web/`.
