import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import shellui from "@shellui/sdk";
import { LangProvider, getLangFromSettings } from "./contexts/LangContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { getAppearanceFromSettings, applyThemeToDocument } from "./lib/theme";
import i18n from "./i18n";
import App from "./App";
import "./index.css";

async function bootstrap() {
  await shellui.init();
  const initialLang =
    getLangFromSettings(shellui.initialSettings) || i18n.language || "en";
  await i18n.changeLanguage(initialLang);
  const initialTheme = getAppearanceFromSettings(shellui.initialSettings);
  applyThemeToDocument(initialTheme);
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ThemeProvider initialAppearance={initialTheme}>
        <LangProvider>
          <BrowserRouter
            basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}
          >
            <App />
          </BrowserRouter>
        </LangProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}

bootstrap();
