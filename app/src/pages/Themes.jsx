import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Monitor } from "lucide-react";
import shellui from "@shellui/sdk";
import CodeBlock from "../components/CodeBlock";
import { Button } from "../components/ui/Button";
import { useTheme } from "../contexts/ThemeContext";
import { getAvailableThemes } from "../lib/theme";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Theme color preview component.
 * @param {{ theme: import('@shellui/sdk').Theme; isSelected: boolean; isDark: boolean }} props
 */
function ThemePreview({ theme, isSelected, isDark }) {
  const colors = isDark
    ? theme.colors?.dark ?? {}
    : theme.colors?.light ?? {};
  const background = colors.background ?? (isDark ? "#0a0a0a" : "#ffffff");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border-2 transition-all",
        isSelected ? "border-primary shadow-lg" : "border-border",
      )}
      style={{ backgroundColor: background }}
    >
      <div className="p-3 space-y-2">
        {/* Primary color */}
        <div
          className="h-8 rounded-md"
          style={{ backgroundColor: colors.primary }}
        />
        {/* Secondary colors */}
        <div className="flex gap-1">
          <div
            className="h-6 flex-1 rounded"
            style={{ backgroundColor: colors.background }}
          />
          <div
            className="h-6 flex-1 rounded"
            style={{ backgroundColor: colors.secondary }}
          />
          <div
            className="h-6 flex-1 rounded"
            style={{ backgroundColor: colors.accent }}
          />
        </div>
        {/* Accent colors */}
        <div className="flex gap-1">
          <div
            className="h-4 flex-1 rounded"
            style={{ backgroundColor: colors.muted }}
          />
          <div
            className="h-4 flex-1 rounded"
            style={{ backgroundColor: colors.border }}
          />
        </div>
      </div>
      {/* Theme name overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 backdrop-blur-sm px-2 py-1"
        style={{ backgroundColor: background }}
      >
        <p
          className="text-xs font-medium text-center"
          style={
            theme.fontFamily
              ? {
                  fontFamily: theme.fontFamily,
                  letterSpacing: theme.letterSpacing || "normal",
                  textShadow: theme.textShadow || "none",
                }
              : {}
          }
        >
          {theme.displayName ?? theme.name}
        </p>
      </div>
    </div>
  );
}

const THEMES_CODE = `import shellui from '@shellui/sdk';

// Listen to SHELLUI_SETTINGS to receive new values (shell sends this on init and when settings change)
shellui.addMessageListener('SHELLUI_SETTINGS', (message) => {
  const appearance = message.payload?.settings?.appearance;
  if (appearance) applyThemeToDocument(appearance);
});

const theme = shellui.initialSettings?.appearance;
applyThemeToDocument(theme);`;

const colorSchemeToKey = (scheme) => {
  if (scheme === "dark") return "themeDark";
  if (scheme === "system") return "themeSystem";
  return "themeLight";
};

export default function Themes() {
  const { t } = useTranslation();
  const appearance = useTheme();
  const colorScheme = appearance?.colorScheme ?? "system";

  const availableThemes = useMemo(
    () => getAvailableThemes(shellui.initialSettings ?? null),
    [],
  );
  const currentThemeName = appearance?.name ?? "default";

  // System preference for when colorScheme is "system" and appearance.mode isn't set
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemPrefersDark(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // When "system", use resolved mode (appearance.mode) or OS preference so preview matches current theme
  const resolvedDark =
    appearance?.mode != null
      ? appearance.mode === "dark"
      : systemPrefersDark;
  const isDarkForPreview =
    colorScheme === "dark" || (colorScheme === "system" && resolvedDark);

  const applyAppearance = (updates) => {
    const currentSettings = shellui.initialSettings ?? {};
    const nextAppearance = { ...(appearance ?? {}), ...updates };
    shellui.sendMessageToParent({
      type: "SHELLUI_SETTINGS_UPDATED",
      payload: {
        settings: { ...currentSettings, appearance: nextAppearance },
      },
    });
  };

  return (
    <div className="font-body text-foreground max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {t("pageThemesTitle")}
      </h1>
      <p className="mt-2 text-foreground">{t("pageThemesDescription")}</p>
      <p className="mt-2 text-sm text-muted-foreground">{t("pageThemesTry")}</p>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-medium text-foreground mb-1">
          {t("exampleTitleTheme")}
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          {t("currentTheme")}:{" "}
          {appearance?.displayName ?? appearance?.name ?? t("themeDefault")}
        </p>

        <h3 className="font-heading text-sm font-medium text-foreground mt-4 mb-2">
          {t("colorSchemeLabel")}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          {t("currentColorScheme")}: {t(colorSchemeToKey(colorScheme))}
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          <Button
            variant={colorScheme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => applyAppearance({ colorScheme: "light" })}
          >
            <Sun className="size-3.5 shrink-0 mr-1.5" aria-hidden />
            {t("themeLight")}
          </Button>
          <Button
            variant={colorScheme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => applyAppearance({ colorScheme: "dark" })}
          >
            <Moon className="size-3.5 shrink-0 mr-1.5" aria-hidden />
            {t("themeDark")}
          </Button>
          <Button
            variant={colorScheme === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => applyAppearance({ colorScheme: "system" })}
          >
            <Monitor className="size-3.5 shrink-0 mr-1.5" aria-hidden />
            {t("themeSystem")}
          </Button>
        </div>

        {/* Theme Selection (Color Scheme) */}
        <div className="space-y-2 mt-4">
          <div className="space-y-0.5">
            <label
              className="text-sm font-medium leading-none"
              style={{ fontFamily: "var(--heading-font-family, inherit)" }}
            >
              {t("appearance.colorTheme")}
            </label>
            <p className="text-sm text-muted-foreground">
              {t("appearance.colorThemeDescription")}
            </p>
          </div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableThemes.map((theme) => {
              const isSelected = currentThemeName === theme.name;
              return (
                <button
                  key={theme.name}
                  onClick={() => {
                    applyAppearance({ name: theme.name });
                  }}
                  className={cn(
                    "text-left transition-all cursor-pointer",
                    isSelected && "ring-2 ring-primary ring-offset-2 rounded-lg",
                  )}
                  aria-label={theme.displayName ?? theme.name}
                >
                  <ThemePreview
                    theme={theme}
                    isSelected={isSelected}
                    isDark={isDarkForPreview}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <CodeBlock code={THEMES_CODE} />
      </section>
    </div>
  );
}
