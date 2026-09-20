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

function showBootstrapError(error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[playground] shellui.init() failed — shell handshake did not complete.', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="font:14px/1.5 system-ui,sans-serif;padding:2rem;max-width:36rem">
      <h1 style="font-size:1.25rem;margin:0 0 .5rem">Playground failed to start</h1>
      <p style="margin:0 0 .75rem;color:#444">The shellui SDK handshake did not complete. Open this app inside the shell (port 4000), and ensure the shell is running.</p>
      <pre style="white-space:pre-wrap;background:#f4f4f5;padding:1rem;border-radius:8px;font-size:12px">${message.replace(/</g, '&lt;')}</pre>
    </div>`;
  }
}

async function bootstrap() {
  try {
    await shellui.init();
  } catch (error) {
    showBootstrapError(error);
    return;
  }

  const initialLang = getLangFromSettings(shellui.initialSettings) || i18n.language || 'en';
  await i18n.changeLanguage(initialLang);
  const initialTheme = getAppearanceFromSettings(shellui.initialSettings);
  applyThemeToDocument(initialTheme);
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

bootstrap();
