# Shellui Playground

A live demo of Shellui, and the shortest working example of a shell with an app inside it.

[![CI](https://github.com/shellui/playground/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shellui/playground/actions/workflows/ci.yml)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

The playground is one package: a Shellui shell (`shellui.config.json`) and a Vite and React app that runs inside it. Each sidebar page shows one part of the SDK: dialogs, modals and drawers, toasts, action buttons, layouts, themes, language and sign-in. Open it at [playground.shellui.com](https://playground.shellui.com), or download the macOS app from the [releases](https://github.com/shellui/playground/releases).

## Get started

You need Node.js 18 or later and [pnpm](https://pnpm.io/).

```bash
git clone https://github.com/shellui/playground.git
cd playground
pnpm install
pnpm start
```

Open [http://localhost:4000](http://localhost:4000). One command starts the app on port 5173 and the shell around it. `pnpm start:desktop` opens the same thing in a native Tauri window.

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

## Contributing

Open an issue or a pull request against `develop`. Coding agents start with [AGENTS.md](AGENTS.md).

## Shellui projects

| Project                                                         | What it does                        |
| --------------------------------------------------------------- | ----------------------------------- |
| [shellui](https://github.com/shellui/shellui)                   | The shell, CLI and SDK              |
| [admin](https://github.com/shellui/admin)                       | Administration app inside the shell |
| [files](https://github.com/shellui/files)                       | File explorer for storage-service   |
| [identity-service](https://github.com/shellui/identity-service) | Sign-in, companies and tokens       |
| [storage-service](https://github.com/shellui/storage-service)   | File storage                        |
| [hosting-service](https://github.com/shellui/hosting-service)   | Deploys and serves Shellui apps     |
| [email-service](https://github.com/shellui/email-service)       | Templates and sends email           |
| [skills](https://github.com/shellui/skills)                     | Agent Skills for coding agents      |
| [playground](https://github.com/shellui/playground)             | Live demo of the shell              |

## License

MIT
