import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { TriangleAlert } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ShowCode from '../components/ShowCode';
import LayoutPreview from '../components/LayoutPreview';
import { Alert, AlertTitle } from '../components/ui/Alert';

const LAYOUT_CONFIG_CODE = `// shellui.config.ts
const config: ShelluiConfig = {
  // 'sidebar' (default) | 'sidebar-inset' | 'app-bar' | 'app-bar-inset' | 'floating' | 'fullscreen' | 'windows'
  layout: "sidebar",
  // ...
};`;

const LAYOUT_CATEGORIES = [
  {
    titleKey: 'layoutCategorySidebar',
    items: [
      { id: 'sidebar', labelKey: 'layoutSidebar' },
      { id: 'sidebar-inset', labelKey: 'layoutSidebarInset', hintKey: 'layoutInsetHint' },
    ],
  },
  {
    titleKey: 'layoutCategoryTopBar',
    items: [
      { id: 'app-bar', labelKey: 'layoutAppBar' },
      { id: 'app-bar-inset', labelKey: 'layoutAppBarInset', hintKey: 'layoutInsetHint' },
    ],
  },
  {
    titleKey: 'layoutCategoryFloating',
    items: [{ id: 'floating', labelKey: 'layoutFloating', hintKey: 'layoutFloatingHint' }],
  },
  {
    titleKey: 'layoutCategoryExperimental',
    items: [{ id: 'windows', labelKey: 'layoutWindows', hintKey: 'layoutWindowsHint' }],
    experimental: true,
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const layoutToKey = (layout) => {
  if (layout === 'fullscreen') return 'layoutFullscreen';
  if (layout === 'windows') return 'layoutWindows';
  if (layout === 'floating') return 'layoutFloating';
  if (layout === 'app-bar') return 'layoutAppBar';
  if (layout === 'app-bar-inset') return 'layoutAppBarInset';
  if (layout === 'sidebar-inset') return 'layoutSidebarInset';
  return 'layoutSidebar';
};

export default function Layout() {
  const { t } = useTranslation();
  const [layout, setLayout] = useState(() => shellui.initialSettings?.layout ?? 'sidebar');
  const currentLayout = layout;

  const applyLayout = (nextLayout) => {
    setLayout(nextLayout);
    const settings = { ...(shellui.initialSettings ?? {}), layout: nextLayout };
    shellui.sendMessageToParent({
      type: 'SHELLUI_SETTINGS_UPDATED',
      payload: { settings },
    });
  };

  return (
    <div className="font-body text-foreground max-w-4xl">
      <PageHeader
        title={t('pageLayoutTitle')}
        description={t('pageLayoutDescription')}
      >
        <p className="mt-2 text-sm text-muted-foreground">
          {t('currentLayout')}:{' '}
          <span className="text-foreground font-medium">{t(layoutToKey(currentLayout))}</span>
        </p>
      </PageHeader>

      <div className="space-y-7">
        {LAYOUT_CATEGORIES.map((category) => (
          <section key={category.titleKey}>
            <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground mb-2.5">
              {t(category.titleKey)}
            </h2>
            {category.experimental ? (
              <Alert className="mb-3">
                <TriangleAlert />
                <AlertTitle>{t('pageLayoutExperimental')}</AlertTitle>
              </Alert>
            ) : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {category.items.map((item) => {
                const isSelected = currentLayout === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => applyLayout(item.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex items-center gap-4 rounded-lg border p-3 text-left transition-colors',
                      isSelected
                        ? 'border-primary bg-muted/30 shadow-sm'
                        : 'border-border hover:border-muted-foreground/40',
                    )}
                  >
                    <LayoutPreview layoutId={item.id} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{t(item.labelKey)}</p>
                      {item.hintKey ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{t(item.hintKey)}</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <ShowCode
        samples={[
          {
            title: t('exampleTitleLayoutConfig'),
            hint: t('pageLayoutConfigNote'),
            code: LAYOUT_CONFIG_CODE,
            language: 'typescript',
          },
        ]}
      />
    </div>
  );
}
