# Shellui Playground

A demo of **Shellui**, the microfrontend orchestration framework, deployed to GitHub Pages.

The shell (`@shellui/cli`) and the embedded Vite/React app live in **one package** — a single `pnpm install`.

## Quick Start

```bash
pnpm install
```

Run the shell and the iframe app (two terminals):

```bash
pnpm start        # Shellui CLI → http://localhost:4000
pnpm start:app    # Vite app     → http://localhost:5173
```

Open [http://localhost:4000](http://localhost:4000). Navigation loads the app from port 5173.

## Scripts

| Script            | What it does                                                                     |
| ----------------- | -------------------------------------------------------------------------------- |
| `pnpm start`      | `shellui start` — shell dev server (config, nav, themes)                         |
| `pnpm start:app`  | `vite` — embedded React app (SDK demo pages)                                     |
| `pnpm build`      | `shellui build` then `vite build` (production env from [`.env.prod`](.env.prod)) |
| `pnpm preview`    | Vite preview of the app                                                          |
| `pnpm serve:dist` | Serve the GitHub Pages artifact from `dist/web/` locally                         |

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
