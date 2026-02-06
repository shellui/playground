# ShellUI Playground

A demo of **ShellUI**, the microfrontend orchestration framework, deployed to GitHub Pages.

## Quick Start

```bash
pnpm install
pnpm start
```

Open [http://localhost:4000](http://localhost:4000).

## Build for Production

```bash
pnpm build
```

The output is in `dist/` — deploy it to any static hosting provider.

## Project Structure

```
shellui.config.ts     # ShellUI configuration (navigation, themes, layout)
static/               # Static assets copied to dist at build time
  favicon.svg
  logo.svg
  icons/              # Navigation icons
  pages/              # Demo microfrontend pages
    playground/       # Main playground page
    docs/             # Documentation-style page
```

## Deploy to GitHub Pages

Push to `main` and the GitHub Actions workflow will build and deploy automatically.