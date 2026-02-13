import { useTranslation } from "react-i18next";
import { Sun, Moon, Monitor } from "lucide-react";
import shellui from "@shellui/sdk";
import CodeBlock from "../components/CodeBlock";
import { Button } from "../components/ui/Button";
import { useTheme } from "../contexts/ThemeContext";

const THEMES_CODE = `import shellui from '@shellui/sdk';

// Listen to SHELLUI_SETTINGS to receive new values (shell sends this on init and when settings change)
shellui.addMessageListener('SHELLUI_SETTINGS', (message) => {
  const appearance = message.payload?.settings?.appearance;
  if (appearance) applyThemeToDocument(appearance);
});

const theme = shellui.initialSettings?.appearance;
applyThemeToDocument(theme);`;

const THEME_OPTIONS = [
  { name: "default", labelKey: "themeDefault" },
  { name: "sebastienbarbier", labelKey: "themeSebastienbarbier" },
];

const colorSchemeToKey = (scheme) => {
  if (scheme === "dark") return "themeDark";
  if (scheme === "system") return "themeSystem";
  return "themeLight";
};

export default function Themes() {
  const { t } = useTranslation();
  const appearance = useTheme();
  const colorScheme = appearance?.colorScheme ?? "system";

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

        <h3 className="font-heading text-sm font-medium text-foreground mt-4 mb-2">
          {t("selectTheme")}
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {THEME_OPTIONS.map(({ name, labelKey }) => (
            <Button
              key={name}
              variant={
                (appearance?.name ?? "default") === name ? "default" : "outline"
              }
              size="sm"
              onClick={() => applyAppearance({ name })}
            >
              {t(labelKey)}
            </Button>
          ))}
        </div>

        <CodeBlock code={THEMES_CODE} />
      </section>
    </div>
  );
}
