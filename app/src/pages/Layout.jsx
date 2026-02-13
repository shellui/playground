import { useState } from "react";
import { useTranslation } from "react-i18next";
import shellui from "@shellui/sdk";
import CodeBlock from "../components/CodeBlock";
import { Button } from "../components/ui/Button";

const LAYOUT_CONFIG_CODE = `// shellui.config.ts
const config: ShellUIConfig = {
  // 'sidebar' (default) | 'app-bar' | 'fullscreen' | 'windows'
  layout: "sidebar",
  // ...
};`;

const layoutToKey = (layout) => {
  if (layout === "fullscreen") return "layoutFullscreen";
  if (layout === "windows") return "layoutWindows";
  if (layout === "app-bar") return "layoutAppBar";
  return "layoutSidebar";
};

export default function Layout() {
  const { t } = useTranslation();
  const [layout, setLayout] = useState(
    () => shellui.initialSettings?.layout ?? "sidebar",
  );
  const currentLayout = layout;

  const applyLayout = (nextLayout) => {
    setLayout(nextLayout);
    const settings = { ...(shellui.initialSettings ?? {}), layout: nextLayout };
    shellui.sendMessageToParent({
      type: "SHELLUI_SETTINGS_UPDATED",
      payload: { settings },
    });
  };

  return (
    <div className="font-body text-foreground max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {t("pageLayoutTitle")}
      </h1>
      <p className="mt-2 text-foreground">{t("pageLayoutDescription")}</p>

      <div
        className="mt-4 p-3 rounded-lg border border-border bg-muted text-foreground"
        role="status"
      >
        <p className="text-sm font-medium">⚠️ {t("pageLayoutExperimental")}</p>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {t("pageLayoutConfigNote")}
      </p>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-medium text-foreground mb-1">
          {t("exampleTitleLayoutConfig")}
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          {t("currentLayout")}: {t(layoutToKey(currentLayout))}
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            {t("switchLayout")}:
          </span>
          <Button
            variant={currentLayout === "sidebar" ? "default" : "outline"}
            size="sm"
            onClick={() => applyLayout("sidebar")}
          >
            {t("layoutSidebar")}
          </Button>
          <Button
            variant={currentLayout === "app-bar" ? "default" : "outline"}
            size="sm"
            onClick={() => applyLayout("app-bar")}
          >
            {t("layoutAppBar")}
          </Button>
          <Button
            variant={currentLayout === "windows" ? "default" : "outline"}
            size="sm"
            onClick={() => applyLayout("windows")}
          >
            {t("layoutWindows")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {t("layoutFullscreenNote")}
        </p>
        <CodeBlock code={LAYOUT_CONFIG_CODE} language="typescript" />
      </section>
    </div>
  );
}
