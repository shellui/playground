# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

<!---
## [Unreleased] - yyyy-mm-dd

### ✨ Feature – for new features
### 🛠 Improvements – for general improvements
### 🚨 Changed – for changes in existing functionality
### ⚠️ Deprecated – for soon-to-be removed features
### 📚 Documentation – for documentation update
### 🗑 Removed – for removed features
### 🐛 Bug Fixes – for any bug fixes
### 🔒 Security – in case of vulnerabilities
### 🏗 Chore – for tidying code

See for sample https://raw.githubusercontent.com/favoloso/conventional-changelog-emoji/master/CHANGELOG.md
-->

## [Unreleased]

### 📚 Documentation

- Add root `AGENTS.md` with Shellui writing and design guidelines for coding agents.

### 🛠 Improvements

- Bump to Shellui [0.5.2](https://github.com/shellui/shellui/releases/tag/v0.5.2) (`@shellui/cli`, `@shellui/core`, `@shellui/sdk`). Includes upstream fix for OAuth login/callback static HTML on nested routes (replaces playground PR #4 hotfix).

## [0.4.0] - 2026-09-18

### 🔒 Security

- Opt in to `safeForAuthToken: true` on every companion navigation item so iframe apps keep receiving the session access token after Shellui 0.5.x H-08 ([shellui#68](https://github.com/shellui/shellui/pull/68)). This demo trusts all playground companion URLs.

### 🛠 Improvements

- Bump to Shellui [0.5.1](https://github.com/shellui/shellui/releases/tag/v0.5.1) (`@shellui/cli`, `@shellui/core`, `@shellui/sdk`).

### ✨ Feature

- Floating Actions demo page (`/#/actions`): `shellui.actions.set` / `clear` with per-control `onClick`, live triggers, and click log. Requires the SDK from [shellui#42](https://github.com/shellui/shellui/pull/42) ([#41](https://github.com/shellui/shellui/issues/41)); feature-detects and shows an alert when `shellui.actions` is missing.
- `pnpm start` runs the iframe Vite app and the shell together (`dev.run` in `shellui.config.json`). Ctrl+C or a Vite crash stops both. `pnpm start:app` remains as an escape hatch.
- **Desktop (Tauri):** root `tauri.conf.json` sets the app name to **Playground** and uses a padded dock icon (`static/icon.png`, Apple ~824/1024 grid).
- Layout page: categorized pickers (Sidebar, Top bar, Floating, Experimental) with theme-colored schematic previews for `sidebar`, `sidebar-inset`, `app-bar`, `app-bar-inset`, `floating`, and `windows`.

### 🚨 Changed

- Depend on local sibling `@shellui/cli`, `@shellui/core`, and `@shellui/sdk` via `link:../shellui/packages/*` so the playground runs against the monorepo source (including the floating layout). Use `pnpm build:sdk` after SDK changes.
- Merge the nested `app/` package into the playground root: one `package.json`, one pnpm lockfile. Use `pnpm start` (Shellui CLI) and `pnpm start:app` (Vite) locally; `pnpm build` still writes the GitHub Pages artifact to `dist/web/` (shell) and `dist/web/app/` (iframe app).
- Use Tailwind v4 (`@tailwindcss/vite`) for the iframe app so it can share the package with the shell (Tailwind v3 at the project root broke `shellui build`).

### 🐛 Bug Fixes

- Give the Vite app its own cache (`node_modules/.vite-app`) so it does not overwrite the shell’s prebundled deps. Sharing `node_modules/.vite` broke Settings (`react-markdown` failed to load).

## [0.3.0] - 2026-08-24

### 🛠 Improvements

- Add storage and playground within admin
- Bump to shellui 0.4.1
- Add favicon
- Display the product name as Shellui (not ShellUI) in playground copy

## [0.2.0] - 2026-02-20

### 🛠 Improvements

- Bump Shellui to 0.2.0

### 🐛 Bug Fixes

- Minor bug fixes

## [0.1.0] - 2026-02-09

### ✨ Feature

- First playground version with sidebar layout, English and French language support, sebastienbarbier theme, navigation items (Playground, Docs, Shellui, Sebastienbarbier, Settings), and Sentry cookie consent
