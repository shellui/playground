import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import PageHeader from '../components/PageHeader';
import ShowCode from '../components/ShowCode';
import { Button } from '../components/ui/Button';

const ALERT_CODE = `import shellui from '@shellui/sdk';

shellui.dialog({
  title: 'Done',
  description: 'Your changes were saved.',
  mode: 'ok',
  size: 'default', // or 'sm'
});`;

const CONFIRM_CODE = `import shellui from '@shellui/sdk';

shellui.dialog({
  title: 'Discard changes?',
  description: 'You cannot undo this.',
  mode: 'okCancel',
  size: 'default', // or 'sm'
  onOk: () => { /* save */ },
  onCancel: () => {},
});`;

const DELETE_CODE = `import shellui from '@shellui/sdk';

shellui.dialog({
  title: 'Delete item?',
  description: 'This action cannot be undone.',
  mode: 'delete',
  size: 'default', // or 'sm'
  onOk: () => { /* delete */ },
});`;

export default function DialogPage() {
  const { t } = useTranslation();

  return (
    <div className="font-body text-foreground max-w-3xl">
      <PageHeader
        title={t('pageDialogTitle')}
        description={t('pageDialogDescription')}
      />

      <section className="rounded-lg border border-border divide-y divide-border">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              {t('exampleTitleAlert')}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{t('dialogOk')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                shellui.dialog({
                  title: t('pageDialogTitle'),
                  description: t('pageDialogDescription'),
                  mode: 'ok',
                  size: 'default',
                })
              }
            >
              {t('showAlert')} — {t('dialogSizeDefault')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                shellui.dialog({
                  title: t('pageDialogTitle'),
                  description: t('pageDialogDescription'),
                  mode: 'ok',
                  size: 'sm',
                })
              }
            >
              {t('showAlert')} — {t('dialogSizeSmall')}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              {t('exampleTitleConfirm')}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('dialogOk')} / {t('dialogCancel')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                shellui.dialog({
                  title: t('showConfirm'),
                  description: 'Choose OK or Cancel.',
                  mode: 'okCancel',
                  okLabel: t('dialogOk'),
                  cancelLabel: t('dialogCancel'),
                  size: 'default',
                  onOk: () => {},
                  onCancel: () => {},
                })
              }
            >
              {t('showConfirm')} — {t('dialogSizeDefault')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                shellui.dialog({
                  title: t('showConfirm'),
                  description: 'Choose OK or Cancel.',
                  mode: 'okCancel',
                  okLabel: t('dialogOk'),
                  cancelLabel: t('dialogCancel'),
                  size: 'sm',
                  onOk: () => {},
                  onCancel: () => {},
                })
              }
            >
              {t('showConfirm')} — {t('dialogSizeSmall')}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              {t('exampleTitleDelete')}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{t('dialogDelete')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                shellui.dialog({
                  title: t('showDelete'),
                  description: 'This action cannot be undone.',
                  mode: 'delete',
                  okLabel: t('dialogDelete'),
                  cancelLabel: t('dialogCancel'),
                  size: 'default',
                  onOk: () => {},
                  onCancel: () => {},
                })
              }
            >
              {t('showDelete')} — {t('dialogSizeDefault')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                shellui.dialog({
                  title: t('showDelete'),
                  description: 'This action cannot be undone.',
                  mode: 'delete',
                  okLabel: t('dialogDelete'),
                  cancelLabel: t('dialogCancel'),
                  size: 'sm',
                  onOk: () => {},
                  onCancel: () => {},
                })
              }
            >
              {t('showDelete')} — {t('dialogSizeSmall')}
            </Button>
          </div>
        </div>
      </section>

      <ShowCode
        samples={[
          { title: t('exampleTitleAlert'), code: ALERT_CODE },
          { title: t('exampleTitleConfirm'), code: CONFIRM_CODE },
          { title: t('exampleTitleDelete'), code: DELETE_CODE },
        ]}
      />
    </div>
  );
}
