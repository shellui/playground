import { createContext, useContext, useState, useEffect } from "react";
import shellui from "@shellui/sdk";
import { getAppearanceFromPayload, applyThemeToDocument } from "../lib/theme";

const ThemeContext = createContext(null);

/**
 * Extract settings from SHELLUI_SETTINGS / SHELLUI_SETTINGS_UPDATED payload.
 * @param {{ payload?: { settings?: import('@shellui/sdk').Settings } }} message
 * @returns {{ settings: import('@shellui/sdk').Settings } | null}
 */
function getPayloadFromMessage(message) {
  const payload = message?.payload;
  if (!payload || typeof payload !== "object") return null;
  if (payload.settings != null) return payload;
  if (payload.appearance != null) return { settings: payload };
  return null;
}

/**
 * @param {{ initialAppearance?: import('@shellui/sdk').Appearance | null }} props
 */
export function ThemeProvider({ initialAppearance, children }) {
  const [appearance, setAppearance] = useState(
    () => initialAppearance ?? shellui.initialSettings?.appearance ?? null,
  );

  useEffect(() => {
    const apply = (next) => {
      applyThemeToDocument(next);
      setAppearance(next);
    };

    const handleSettings = (message) => {
      const payload = getPayloadFromMessage(message);
      if (payload) {
        const next = getAppearanceFromPayload(payload);
        apply(next);
      }
    };

    apply(initialAppearance ?? shellui.initialSettings?.appearance ?? null);

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
  }, [initialAppearance]);

  return (
    <ThemeContext.Provider value={appearance}>{children}</ThemeContext.Provider>
  );
}

/** @returns {import('@shellui/sdk').Appearance | null} */
export function useTheme() {
  return useContext(ThemeContext) ?? null;
}
