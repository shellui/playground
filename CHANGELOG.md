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

### ✨ Feature

- `pnpm start` runs the iframe Vite app and the shell together (`dev.run` in `shellui.config.json`). Ctrl+C or a Vite crash stops both. `pnpm start:app` remains as an escape hatch.

### 🚨 Changed

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
