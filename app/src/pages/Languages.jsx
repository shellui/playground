import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import shellui from "@shellui/sdk";
import CodeBlock from "../components/CodeBlock";
import { Button } from "../components/ui/Button";
import { useLang } from "../contexts/LangContext";

const LANGUAGES_CODE = `import shellui from '@shellui/sdk';
import i18n from './i18n';

function getLangFromSettings(settings) {
  const code = settings?.language?.code;
  return code === 'fr' || code === 'en' ? code : 'en';
}

// Listen to SHELLUI_SETTINGS to receive new values (shell sends this on init and when settings change)
shellui.addMessageListener('SHELLUI_SETTINGS', (message) => {
  const settings = message.payload?.settings;
  if (settings) i18n.changeLanguage(getLangFromSettings(settings));
});

const lang = getLangFromSettings(shellui.initialSettings);
await i18n.changeLanguage(lang);`;

const TIMEZONE_OPTIONS = [
  { value: "UTC", labelKey: "timezoneUTC" },
  { value: "Europe/Paris", labelKey: "timezoneParis" },
  { value: "Europe/London", labelKey: "timezoneLondon" },
  { value: "America/New_York", labelKey: "timezoneNewYork" },
  { value: "Asia/Tokyo", labelKey: "timezoneTokyo" },
];

export default function Languages() {
  const { t } = useTranslation();
  const lang = useLang();
  const browserTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  const [timezone, setTimezone] = useState(
    () => shellui.initialSettings?.region?.timezone ?? browserTimezone,
  );
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const syncFromSettings = (message) => {
      const tz = message?.payload?.settings?.region?.timezone;
      if (tz) setTimezone(tz);
    };
    const unsubUpdated = shellui.addMessageListener(
      "SHELLUI_SETTINGS_UPDATED",
      syncFromSettings,
    );
    const unsubSettings = shellui.addMessageListener(
      "SHELLUI_SETTINGS",
      syncFromSettings,
    );
    return () => {
      unsubUpdated();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeInRegion = (() => {
    try {
      return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
        timeZone: timezone,
        dateStyle: "medium",
        timeStyle: "long",
      }).format(now);
    } catch {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        dateStyle: "medium",
        timeStyle: "long",
      }).format(now);
    }
  })();

  const applySettings = (updates) => {
    const current = shellui.initialSettings ?? {};
    const nextSettings = { ...current, ...updates };
    shellui.sendMessageToParent({
      type: "SHELLUI_SETTINGS_UPDATED",
      payload: { settings: nextSettings },
    });
    if (updates.region?.timezone) setTimezone(updates.region.timezone);
  };

  return (
    <div className="font-body text-foreground max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {t("pageLanguagesTitle")}
      </h1>
      <p className="mt-2 text-foreground">{t("pageLanguagesDescription")}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("pageLanguagesTry")}
      </p>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-medium text-foreground mb-1">
          {t("exampleTitleLanguage")}
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          {t("currentLanguage")}:{" "}
          {lang === "fr" ? t("languageFr") : t("languageEn")}
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            {t("selectLanguage")}:
          </span>
          <Button
            variant={lang === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => applySettings({ language: { code: "en" } })}
          >
            {t("languageEn")}
          </Button>
          <Button
            variant={lang === "fr" ? "default" : "outline"}
            size="sm"
            onClick={() => applySettings({ language: { code: "fr" } })}
          >
            {t("languageFr")}
          </Button>
        </div>

        <h3 className="font-heading text-sm font-medium text-foreground mt-4 mb-2">
          {t("regionLabel")}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          {t("currentRegion")}: {timezone}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          {t("currentTimeInRegion")}:{" "}
          <span className="font-medium text-foreground tabular-nums">
            {timeInRegion}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            {t("selectTimezone")}:
          </span>
          {TIMEZONE_OPTIONS.map(({ value, labelKey }) => (
            <Button
              key={value}
              variant={timezone === value ? "default" : "outline"}
              size="sm"
              onClick={() => applySettings({ region: { timezone: value } })}
            >
              {t(labelKey)}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              applySettings({ region: { timezone: browserTimezone } })
            }
          >
            {t("resetTimezoneToBrowser")}
          </Button>
        </div>

        <CodeBlock code={LANGUAGES_CODE} />
      </section>
    </div>
  );
}
