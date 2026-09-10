import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { TriangleAlert } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import LayoutPreview from '../components/LayoutPreview';
import { Alert, AlertTitle } from '../components/ui/Alert';

const LAYOUT_CONFIG_CODE = `// shellui.config.ts
const config: ShelluiConfig = {
  // 'sidebar' (default) | 'sidebar-inset' | 'app-bar' | 'app-bar-inset' | 'fullscreen' | 'windows'
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
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {t('pageLayoutTitle')}
      </h1>
      <p className="mt-2 text-foreground">{t('pageLayoutDescription')}</p>
      <p className="mt-2 text-sm text-muted-foreground">{t('pageLayoutConfigNote')}</p>

      <p className="mt-6 text-sm text-muted-foreground">
        {t('currentLayout')}: {t(layoutToKey(currentLayout))}
      </p>

      <div className="mt-4 space-y-8">
        {LAYOUT_CATEGORIES.map((category) => (
          <section key={category.titleKey}>
            <h2 className="font-heading text-lg font-medium text-foreground mb-3">
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
                      'flex items-center gap-3 rounded-lg border-2 p-2.5 text-left transition-colors',
                      isSelected
                        ? 'border-primary shadow-md'
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

      <section className="mt-8">
        <h2 className="font-heading text-lg font-medium text-foreground mb-1">
          {t('exampleTitleLayoutConfig')}
        </h2>
        <p className="text-xs text-muted-foreground mb-3">{t('layoutFullscreenNote')}</p>
        <CodeBlock
          code={LAYOUT_CONFIG_CODE}
          language="typescript"
        />
      </section>
    </div>
  );
}
