import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import shellui, { init } from '@shellui/sdk';
import { LangProvider, getLangFromSettings } from './contexts/LangContext';
import i18n from './i18n';
import App from './App';
import './index.css';

async function bootstrap() {
  await init();
  const initialLang = getLangFromSettings(shellui.initialSettings) || i18n.language || 'en';
  await i18n.changeLanguage(initialLang);
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <LangProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
          <App />
        </BrowserRouter>
      </LangProvider>
    </StrictMode>
  );
}

bootstrap();
