import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import PageHeader from '../components/PageHeader';
import ShowCode from '../components/ShowCode';
import { Button } from '../components/ui/Button';

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

const POSITION_CODE = `import shellui from '@shellui/sdk';

// Position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
shellui.toast({
  title: 'Top right',
  description: 'This toast appears in the top-right corner.',
  position: 'top-right',
});

shellui.toast({
  title: 'Bottom left',
  description: 'Popping up in this corner.',
  position: 'bottom-left',
});`;

const POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export default function Toaster() {
  const { t } = useTranslation();

  return (
    <div className="font-body text-foreground max-w-3xl">
      <PageHeader
        title={t('pageToasterTitle')}
        description={t('pageToasterDescription')}
      />

      <section className="rounded-lg border border-border p-4 space-y-5">
        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground mb-2">{t('tryIt')}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                shellui.toast({
                  title: t('toastSuccess'),
                  description: 'Action completed.',
                  type: 'success',
                })
              }
            >
              {t('toastSuccess')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                shellui.toast({
                  title: t('toastError'),
                  description: 'Something went wrong.',
                  type: 'error',
                })
              }
            >
              {t('toastError')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                shellui.toast({
                  title: t('toastWithAction'),
                  description: 'Click Undo or Dismiss.',
                  type: 'default',
                  action: { label: 'Undo', onClick: () => {} },
                  cancel: { label: 'Dismiss', onClick: () => {} },
                })
              }
            >
              {t('toastWithAction')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const toastId = shellui.toast({
                  title: 'Processing...',
                  description: 'Please wait.',
                  type: 'loading',
                });
                if (typeof toastId === 'string') {
                  setTimeout(() => {
                    shellui.toast({
                      id: toastId,
                      type: 'success',
                      title: 'Done!',
                      description: 'Your upload completed.',
                    });
                  }, 2000);
                }
              }}
            >
              {t('toastLoadThenSuccess')}
            </Button>
          </div>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground mb-2">
            {t('exampleTitleToastPosition')}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {POSITIONS.map((position) => {
              const key = `toastPosition${position
                .split('-')
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join('')}`;
              return (
                <Button
                  key={position}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    shellui.toast({
                      title: t(key),
                      description: t('toastPositionDescription'),
                      position,
                    })
                  }
                >
                  {t(key)}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      <ShowCode
        samples={[
          { title: t('exampleTitleToastSuccess'), code: SUCCESS_CODE },
          { title: t('exampleTitleToastError'), code: ERROR_CODE },
          { title: t('exampleTitleToastAction'), code: ACTION_CODE },
          { title: t('exampleTitleToastLoadThenSuccess'), code: LOAD_THEN_SUCCESS_CODE },
          { title: t('exampleTitleToastPosition'), code: POSITION_CODE },
        ]}
      />
    </div>
  );
}
