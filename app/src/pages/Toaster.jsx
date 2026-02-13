import { useTranslation } from "react-i18next";
import shellui from "@shellui/sdk";
import CodeBlock from "../components/CodeBlock";
import { Button } from "../components/ui/Button";

const SUCCESS_CODE = `import shellui from '@shellui/sdk';

shellui.toast({
  title: 'Saved!',
  type: 'success',
});`;

const ERROR_CODE = `import shellui from '@shellui/sdk';

shellui.toast({
  title: 'Something went wrong',
  type: 'error',
});`;

const ACTION_CODE = `import shellui from '@shellui/sdk';

shellui.toast({
  title: 'Item deleted',
  description: 'You can undo this.',
  action: { label: 'Undo', onClick: () => {} },
  cancel: { label: 'Dismiss', onClick: () => {} },
});`;

const LOAD_THEN_SUCCESS_CODE = `import shellui from '@shellui/sdk';

const toastId = shellui.toast({
  title: 'Processing...',
  description: 'Please wait.',
  type: 'loading',
});

// After async work, update same toast to success
if (typeof toastId === 'string') {
  setTimeout(() => {
    shellui.toast({
      id: toastId,
      type: 'success',
      title: 'Done!',
      description: 'Your upload completed.',
    });
  }, 2000);
}`;

export default function Toaster() {
  const { t } = useTranslation();

  return (
    <div className="font-body text-foreground max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {t("pageToasterTitle")}
      </h1>
      <p className="mt-2 text-foreground">{t("pageToasterDescription")}</p>

      <section className="mt-6 space-y-8">
        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t("exampleTitleToastSuccess")}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                shellui.toast({
                  title: t("toastSuccess"),
                  description: "Action completed.",
                  type: "success",
                })
              }
            >
              {t("toastSuccess")}
            </Button>
          </div>
          <CodeBlock code={SUCCESS_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t("exampleTitleToastError")}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                shellui.toast({
                  title: t("toastError"),
                  description: "Something went wrong.",
                  type: "error",
                })
              }
            >
              {t("toastError")}
            </Button>
          </div>
          <CodeBlock code={ERROR_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t("exampleTitleToastAction")}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                shellui.toast({
                  title: t("toastWithAction"),
                  description: "Click Undo or Dismiss.",
                  type: "default",
                  action: { label: "Undo", onClick: () => {} },
                  cancel: { label: "Dismiss", onClick: () => {} },
                })
              }
            >
              {t("toastWithAction")}
            </Button>
          </div>
          <CodeBlock code={ACTION_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t("exampleTitleToastLoadThenSuccess")}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const toastId = shellui.toast({
                  title: "Processing...",
                  description: "Please wait.",
                  type: "loading",
                });
                if (typeof toastId === "string") {
                  setTimeout(() => {
                    shellui.toast({
                      id: toastId,
                      type: "success",
                      title: "Done!",
                      description: "Your upload completed.",
                    });
                  }, 2000);
                }
              }}
            >
              {t("toastLoadThenSuccess")}
            </Button>
          </div>
          <CodeBlock code={LOAD_THEN_SUCCESS_CODE} />
        </div>
      </section>
    </div>
  );
}
