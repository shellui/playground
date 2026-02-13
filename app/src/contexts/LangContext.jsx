import { createContext, useContext, useState, useEffect } from "react";
import shellui from "@shellui/sdk";
import i18n from "../i18n";

const LangContext = createContext("en");

export function getLangFromSettings(settings) {
  const code = settings?.language?.code;
  return code === "fr" || code === "en" ? code : "en";
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    () => getLangFromSettings(shellui.initialSettings) || i18n.language || "en",
  );

  useEffect(() => {
    const applyLang = (newLang) => {
      if (newLang !== i18n.language) {
        i18n.changeLanguage(newLang);
      }
      setLang(newLang);
    };

    const handleSettings = (message) => {
      const settings = message.payload?.settings;
      if (settings) {
        applyLang(getLangFromSettings(settings));
      }
    };

    const initial =
      getLangFromSettings(shellui.initialSettings) || i18n.language || "en";
    applyLang(initial);

    const cleanupUpdated = shellui.addMessageListener(
      "SHELLUI_SETTINGS_UPDATED",
      handleSettings,
    );
    const cleanupSettings = shellui.addMessageListener(
      "SHELLUI_SETTINGS",
      handleSettings,
    );

    return () => {
      cleanupUpdated();
      cleanupSettings();
    };
  }, []);

  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang() {
  const lang = useContext(LangContext);
  return lang ?? "en";
}
