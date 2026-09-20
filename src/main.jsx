import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import shellui from '@shellui/sdk';
import { LangProvider, getLangFromSettings } from './contexts/LangContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { getAppearanceFromSettings, applyThemeToDocument } from './lib/theme';
import i18n from './i18n';
import App from './App';
import './index.css';

/**
 * @shellui/sdk@0.5.2 `_setupInitialSettings` has no timeout: if the shell drops
 * the first SETTINGS reply (about:blank postMessage race), `init()` never
 * resolves and the iframe stays white. Cap the wait so React always paints.
 * Newer SDKs (develop) already time out; this race is then a no-op.
 */
const INIT_HANDSHAKE_TIMEOUT_MS = 2500;

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function renderApp(initialTheme) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ThemeProvider initialAppearance={initialTheme}>
        <LangProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </LangProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}

function renderBootstrapError(error) {
  const root = document.getElementById('root');
  if (!root) return;
  const message = error instanceof Error ? error.message : String(error);
  const safe = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  root.innerHTML = `
    <div style="font-family: system-ui, sans-serif; max-width: 36rem; margin: 2rem auto; padding: 1.25rem; border: 1px solid #fca5a5; background: #fef2f2; color: #7f1d1d; border-radius: 0.5rem;">
      <h1 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Playground failed to start</h1>
      <p style="margin: 0 0 0.75rem; font-size: 0.875rem; line-height: 1.45;">
        Bootstrap threw before React could paint. Check the browser console and Vite terminal.
        If you use <code>link:../shellui</code>, run <code>pnpm build:sdk</code> in the sibling monorepo first,
        then <code>pnpm install</code> here.
      </p>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 0.75rem;">${safe}</pre>
    </div>
  `;
}

async function bootstrap() {
  try {
    await withTimeout(shellui.init(), INIT_HANDSHAKE_TIMEOUT_MS, 'shellui.init()');
  } catch (error) {
    // Still paint — theme/lang may be defaults until a later SETTINGS push.
    console.warn('[playground] shellui.init() did not finish; rendering anyway', error);
  }

  const initialLang = getLangFromSettings(shellui.initialSettings) || i18n.language || 'en';
  await i18n.changeLanguage(initialLang);
  const initialTheme = getAppearanceFromSettings(shellui.initialSettings);
  applyThemeToDocument(initialTheme);
  renderApp(initialTheme);
}

bootstrap().catch((error) => {
  console.error('[playground] bootstrap failed', error);
  renderBootstrapError(error);
});
