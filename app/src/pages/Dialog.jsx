import { useTranslation } from "react-i18next";
import shellui from "@shellui/sdk";
import CodeBlock from "../components/CodeBlock";
import { Button } from "../components/ui/Button";

const ALERT_CODE = `import shellui from '@shellui/sdk';

shellui.dialog({
  title: 'Done',
  description: 'Your changes were saved.',
  mode: 'ok',
});`;

const CONFIRM_CODE = `import shellui from '@shellui/sdk';

shellui.dialog({
  title: 'Discard changes?',
  description: 'You cannot undo this.',
  mode: 'okCancel',
  onOk: () => { /* save */ },
  onCancel: () => {},
});`;

const DELETE_CODE = `import shellui from '@shellui/sdk';

shellui.dialog({
  title: 'Delete item?',
  description: 'This action cannot be undone.',
  mode: 'delete',
  onOk: () => { /* delete */ },
});`;

export default function DialogPage() {
  const { t } = useTranslation();

  return (
    <div className="font-body text-foreground max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {t("pageDialogTitle")}
      </h1>
      <p className="mt-2 text-foreground">{t("pageDialogDescription")}</p>

      <section className="mt-6 space-y-8">
        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t("exampleTitleAlert")}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                shellui.dialog({
                  title: t("pageDialogTitle"),
                  description: t("pageDialogDescription"),
                  mode: "ok",
                })
              }
            >
              {t("showAlert")}
            </Button>
          </div>
          <CodeBlock code={ALERT_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t("exampleTitleConfirm")}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                shellui.dialog({
                  title: t("showConfirm"),
                  description: "Choose OK or Cancel.",
                  mode: "okCancel",
                  okLabel: t("dialogOk"),
                  cancelLabel: t("dialogCancel"),
                  onOk: () => {},
                  onCancel: () => {},
                })
              }
            >
              {t("showConfirm")}
            </Button>
          </div>
          <CodeBlock code={CONFIRM_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t("exampleTitleDelete")}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                shellui.dialog({
                  title: t("showDelete"),
                  description: "This action cannot be undone.",
                  mode: "delete",
                  okLabel: t("dialogDelete"),
                  cancelLabel: t("dialogCancel"),
                  onOk: () => {},
                  onCancel: () => {},
                })
              }
            >
              {t("showDelete")}
            </Button>
          </div>
          <CodeBlock code={DELETE_CODE} />
        </div>
      </section>
    </div>
  );
}
