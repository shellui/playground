import { useTranslation } from "react-i18next";
import shellui from "@shellui/sdk";
import CodeBlock from "../components/CodeBlock";
import { Button } from "../components/ui/Button";

function appRouteUrl(path) {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return new URL(
    `${base}${path.startsWith("/") ? path : "/" + path}`,
    window.location.href,
  ).href;
}

const MODAL_CODE = `import shellui from '@shellui/sdk';

shellui.openModal('https://your-app.com/themes');`;

const DRAWER_CODE = `import shellui from '@shellui/sdk';

shellui.openDrawer({
  url: 'https://your-app.com/settings',
  position: 'right',
  size: '400px',
});
shellui.closeDrawer(); // when done`;

export default function Modal() {
  const { t } = useTranslation();

  return (
    <div className="font-body text-foreground max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {t("pageModalDrawerTitle")}
      </h1>
      <p className="mt-2 text-foreground">{t("pageModalDrawerDescription")}</p>

      <div className="mt-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
        <p className="text-foreground font-medium">
          🎯 {t("pageModalDrawerFun")}
        </p>
      </div>

      <section className="mt-6 space-y-8">
        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t("exampleTitleModal")}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => shellui.openModal(appRouteUrl("/themes"))}
            >
              {t("openModalWithThemes")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shellui.openModal(appRouteUrl("/languages"))}
            >
              {t("openModalWithLanguages")}
            </Button>
          </div>
          <CodeBlock code={MODAL_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t("exampleTitleDrawer")}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                shellui.openDrawer({
                  url: appRouteUrl("/themes"),
                  position: "right",
                  size: "400px",
                })
              }
            >
              {t("openDrawerFromRight")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                shellui.openDrawer({
                  url: appRouteUrl("/languages"),
                  position: "bottom",
                  size: "40vh",
                })
              }
            >
              {t("openDrawerFromBottom")}
            </Button>
            <Button variant="ghost" size="sm" onClick={shellui.closeDrawer}>
              {t("closeDrawer")}
            </Button>
          </div>
          <CodeBlock code={DRAWER_CODE} />
        </div>
      </section>
    </div>
  );
}
