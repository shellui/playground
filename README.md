# Shellui Playground

A demo of **Shellui 0.6.2**, the microfrontend orchestration framework, deployed to GitHub Pages.

The shell (`@shellui/cli`) and the embedded Vite/React app live in **one package**. One `pnpm install` (npm `@shellui/*` ^0.6.2).

## Quick Start

```bash
pnpm install
```

`pnpm install` installs `@shellui/cli`, `@shellui/core`, and `@shellui/sdk` from npm.

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

Branding comes from root [`tauri.conf.json`](tauri.conf.json) (`productName`: **Playground**, icon: [`static/icon.png`](static/icon.png) padded to Apple’s dock grid). Requires a Shellui CLI that syncs root `tauri.conf.json` (0.5.1+).

`pnpm start:desktop` signs in with `shellui-playground-dev`. Installed builds keep `shellui-playground`. The macOS window uses an overlay titlebar, and the shell can unminimize, show, and focus that window when the sign-in link arrives.

### macOS disk image

GitHub Actions builds an unsigned universal macOS disk image for Playground. The image contains both Apple silicon and Intel code (`aarch64` and `x86_64`).

Publish a GitHub release on a version tag such as `v0.4.0`, or push that tag yourself. This repo already marks releases with `v*` tags. The workflow attaches `Playground_<version>_universal.dmg` to the [GitHub release](https://github.com/shellui/playground/releases).

To build without publishing a release, open the Actions tab, choose **Desktop macOS**, and run the workflow on your branch. Download the `Playground-macos-universal` artifact. That artifact is the disk image.

The disk image contains the Shellui shell and the React playground. `vite build` writes the playground to `dist/web/app` (Vite `base` `/app/`). Navigation opens that build because the workflow sets `PLAYGROUND_APP_URL=/app` and `DOTENV_CONFIG_PATH=.env.prod`, the same values `pnpm build` and `pnpm build:desktop` load from [`.env.prod`](.env.prod). That file also supplies `SHELLUI_COMPANY_ID`, `WEBSITE_URL`, `DOCS_URL`, and `FILES_URL`. Without `PLAYGROUND_APP_URL=/app`, navigation falls back to `http://localhost:5173` and the window never shows the bundled app.

The disk image is unsigned, so Gatekeeper blocks the first open:

1. Open the disk image and drag Playground into Applications.
2. Control-click Playground, choose Open, then choose Open again.
3. If macOS blocks it after that, open System Settings, then Privacy & Security, and choose Open Anyway.

Clear the download quarantine flag in Terminal:

```bash
xattr -dr com.apple.quarantine /Applications/Playground.app
```

Signing and notarization stay off until all of these repository secrets are set:

- **APPLE_CERTIFICATE**: base64-encoded `.p12` certificate
- **APPLE_CERTIFICATE_PASSWORD**: password for that `.p12`
- **APPLE_SIGNING_IDENTITY**: keychain identity, such as `Developer ID Application: Shellui (your_team_id)`
- **APPLE_ID**: Apple ID email for notarization
- **APPLE_PASSWORD**: app-specific password for that Apple ID
- **APPLE_TEAM_ID**: Apple Team ID

When every secret above is present, the same workflow signs and notarizes the disk image. If a secret is missing, the workflow does not set `APPLE_*`. It builds an unsigned disk image and uploads that image.

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
