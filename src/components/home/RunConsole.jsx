import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import {
  Bell,
  CircleCheck,
  Languages,
  MessageSquare,
  PanelRight,
  Play,
  SunMoon,
} from 'lucide-react';
import CodeBlock from '../CodeBlock';
import { useTheme } from '../../contexts/ThemeContext';
import { useLang } from '../../contexts/LangContext';
import { getConsoleTab } from '../../lib/prefs';
import { appRouteUrl, formatShellTime, updateShellSettings } from '../../lib/shell';

/** Quote a value for a JavaScript sample the same way it is passed at runtime. */
const q = (value) => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/**
 * Each tab keeps the code it shows and the function it runs side by side,
 * so the sample is always what Run executes.
 */
function useTabs({ t, lang, mode, report }) {
  return useMemo(() => {
    const now = () => formatShellTime(lang, shellui.initialSettings?.region?.timezone);
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    const nextLang = lang === 'fr' ? 'en' : 'fr';
    const toast = {
      title: t('home.demo.toastTitle'),
      description: t('home.demo.toastBody'),
      undo: t('home.demo.undo'),
    };
    const dialog = {
      title: t('home.demo.dialogTitle'),
      description: t('home.demo.dialogBody'),
      ok: t('home.demo.publish'),
      cancel: t('home.demo.cancel'),
      done: t('home.demo.published'),
    };

    return [
      {
        id: 'toast',
        icon: Bell,
        code: `shellui.toast({
  title: ${q(toast.title)},
  description: ${q(toast.description)},
  type: 'success',
  action: {
    label: ${q(toast.undo)},
    onClick: () => {
      // Updates the result line
    },
  },
});`,
        run: () => {
          shellui.toast({
            title: toast.title,
            description: toast.description,
            type: 'success',
            action: {
              label: toast.undo,
              onClick: () => report(t('home.result.undo', { time: now() })),
            },
          });
          report(t('home.result.toast'));
        },
      },
      {
        id: 'dialog',
        icon: MessageSquare,
        code: `shellui.dialog({
  title: ${q(dialog.title)},
  description: ${q(dialog.description)},
  mode: 'okCancel',
  okLabel: ${q(dialog.ok)},
  cancelLabel: ${q(dialog.cancel)},
  onOk: () => shellui.toast({
    title: ${q(dialog.done)},
    type: 'success',
  }),
  onCancel: () => {
    // Updates the result line
  },
});`,
        run: () => {
          shellui.dialog({
            title: dialog.title,
            description: dialog.description,
            mode: 'okCancel',
            okLabel: dialog.ok,
            cancelLabel: dialog.cancel,
            onOk: () => {
              shellui.toast({ title: dialog.done, type: 'success' });
              report(t('home.result.ok', { time: now() }));
            },
            onCancel: () => report(t('home.result.cancel', { time: now() })),
          });
        },
      },
      {
        id: 'drawer',
        icon: PanelRight,
        code: `shellui.openDrawer({
  url: appRouteUrl('/themes'),
  position: 'right',
  size: 'md',
});`,
        run: () => {
          shellui.openDrawer({ url: appRouteUrl('/themes'), position: 'right', size: 'md' });
          report(t('home.result.drawer'));
        },
      },
      {
        id: 'scheme',
        icon: SunMoon,
        code: `// Same settings message the Themes page sends
updateShellSettings((current) => ({
  appearance: {
    ...current.appearance,
    colorScheme: '${nextMode}',
  },
}));`,
        run: () => {
          updateShellSettings((current) => ({
            appearance: { ...current.appearance, colorScheme: nextMode },
          }));
          report(t('home.result.scheme', { mode: t(`home.mode.${nextMode}`).toLowerCase() }));
        },
      },
      {
        id: 'language',
        icon: Languages,
        code: `// Same settings message the Languages page sends
updateShellSettings(() => ({
  language: { code: '${nextLang}' },
}));`,
        run: () => {
          updateShellSettings(() => ({ language: { code: nextLang } }));
          report(t('home.result.language', { lang: nextLang === 'fr' ? 'Français' : 'English' }));
        },
      },
    ];
  }, [t, lang, mode, report]);
}

export default function RunConsole() {
  const { t } = useTranslation();
  const lang = useLang();
  const appearance = useTheme();
  const mode = appearance?.mode === 'dark' ? 'dark' : 'light';
  const [active, setActive] = useState(getConsoleTab);
  const [result, setResult] = useState(null);
  const tabRefs = useRef({});
  const report = useMemo(() => (text) => setResult(text), []);
  const tabs = useTabs({ t, lang, mode, report });
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  const onKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.id === active);
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    const id = tabs[next].id;
    setActive(id);
    setResult(null);
    tabRefs.current[id]?.focus();
  };

  return (
    <section
      aria-labelledby="console-title"
      className="relative min-w-0 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-lg"
    >
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h2
          id="console-title"
          className="font-heading text-sm font-semibold text-foreground"
        >
          {t('home.console.title')}
        </h2>
        <span className="text-xs text-muted-foreground">{t('home.console.hint')}</span>
      </header>

      <div
        role="tablist"
        aria-label={t('home.console.tabsLabel')}
        onKeyDown={onKeyDown}
        className="mb-3 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 [scrollbar-width:none]"
      >
        {tabs.map(({ id, icon: Icon }) => {
          const selected = id === active;
          return (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              id={`console-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="console-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setActive(id);
                setResult(null);
              }}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                selected
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon
                className="size-3.5"
                aria-hidden
              />
              {t(`home.tab.${id}`)}
            </button>
          );
        })}
      </div>

      <div
        id="console-panel"
        role="tabpanel"
        aria-labelledby={`console-tab-${current.id}`}
      >
        <CodeBlock
          labelKey={null}
          className="min-h-[264px] [&>div]:min-h-[264px]"
          title="home.jsx"
          copy
          code={current.code}
        />
      </div>

      <footer className="mt-3 flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-center min-[760px]:justify-between">
        <p
          aria-live="polite"
          className="flex min-h-5 min-w-0 items-center gap-2 text-sm text-muted-foreground"
        >
          {result ? (
            <>
              <CircleCheck
                className="size-4 shrink-0 text-success"
                aria-hidden
              />
              <span className="min-w-0">{result}</span>
            </>
          ) : (
            t('home.result.idle')
          )}
        </p>
        <button
          type="button"
          onClick={current.run}
          className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Play
            className="size-4"
            aria-hidden
          />
          {t('home.run')}
        </button>
      </footer>
    </section>
  );
}
