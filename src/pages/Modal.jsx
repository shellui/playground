import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import PageHeader from '../components/PageHeader';
import ShowCode from '../components/ShowCode';
import { Button } from '../components/ui/Button';

function appRouteUrl(path) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';
  const pathPart = path.startsWith('/') ? path : '/' + path;
  return `${window.location.origin}${base}#${pathPart}`;
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
      <PageHeader
        title={t('pageModalDrawerTitle')}
        description={t('pageModalDrawerDescription')}
      />

      <section className="rounded-lg border border-border divide-y divide-border">
        <div className="p-4">
          <h2 className="font-heading text-sm font-semibold text-foreground mb-1">
            {t('exampleTitleModal')}
          </h2>
          <p className="text-xs text-muted-foreground mb-3">{t('pageModalDrawerFun')}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => shellui.openModal(appRouteUrl('/themes'))}
            >
              {t('openModalWithThemes')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shellui.openModal(appRouteUrl('/languages'))}
            >
              {t('openModalWithLanguages')}
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h2 className="font-heading text-sm font-semibold text-foreground mb-3">
            {t('exampleTitleDrawer')}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                shellui.openDrawer({
                  url: appRouteUrl('/themes'),
                  position: 'right',
                  size: '400px',
                })
              }
            >
              {t('openDrawerFromRight')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                shellui.openDrawer({
                  url: appRouteUrl('/languages'),
                  position: 'bottom',
                  size: '40vh',
                })
              }
            >
              {t('openDrawerFromBottom')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={shellui.closeDrawer}
            >
              {t('closeDrawer')}
            </Button>
          </div>
        </div>
      </section>

      <ShowCode
        samples={[
          { title: t('exampleTitleModal'), code: MODAL_CODE },
          { title: t('exampleTitleDrawer'), code: DRAWER_CODE },
        ]}
      />
    </div>
  );
}
