import { useTranslation } from 'react-i18next';
import { LayoutTemplate, Maximize, RotateCcw, Smartphone } from 'lucide-react';
import { layout as configLayout } from '../../shellui.config.json';
import CodeBlock from '../components/CodeBlock';
import LayoutSchematic from '../components/LayoutSchematic';
import { Inline, PageHeader } from '../components/playground';
import { updateShellSettings } from '../lib/shell';
import { useShellSettings } from '../lib/useShellSettings';
import { LAYOUTS, layoutName } from '../lib/layouts';

/** Phone notes, from core: Sheet on mobile, inset frame padding, floating tabs, windows phone mode. */
const PHONE = {
  sidebar: 'sheet',
  'sidebar-inset': 'sheet',
  'app-bar-inset': 'edge',
  floating: 'tabs',
  windows: 'windows',
};

function Badge({ children, tone = 'muted' }) {
  const tones = {
    gold: 'border-primary/40 bg-primary/15 text-foreground',
    muted: 'border-border bg-muted text-muted-foreground',
    warning: 'border-destructive/30 bg-destructive/10 text-destructive',
  };
  return (
    <span
      className={`inline-flex h-5 items-center rounded-md border px-1.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function Layout() {
  const { t } = useTranslation();
  const settings = useShellSettings();
  const override = settings?.layout;
  const fallback = configLayout ?? 'sidebar';
  // Core AppLayout: settings.layout ?? config.layout.
  const current = override ?? fallback;
  const overridden = Boolean(override) && override !== fallback;

  const pick = (layout) => updateShellSettings(() => ({ layout }));
  const reset = () => updateShellSettings(() => ({ layout: undefined }));
  const name = (id) => layoutName(t, id);

  const configCode = `{
  "title": "My app",
  "layout": "${current}",
  "navigation": [ … ]
}`;
  const chromeCode = `${t('layouts.jsonComment')}
shellui.applyLayoutChrome({ autoPadding: true });`;

  return (
    <div className="max-w-[1180px] font-body text-foreground">
      <PageHeader
        group={t('home.g.chrome')}
        icon={LayoutTemplate}
        title={t('layouts.title')}
        lede={t('layouts.lede')}
        apis={['settings.layout']}
        docs="https://docs.shellui.com/features/layouts"
      />

      <section
        className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-card-foreground"
        aria-live="polite"
      >
        <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-primary/15">
          <LayoutTemplate
            className="size-[18px]"
            aria-hidden
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-semibold">
            {overridden
              ? t('layouts.status.override', { layout: name(current), config: name(fallback) })
              : t('layouts.status.config', { layout: name(current) })}
          </p>
          <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">{t('layouts.status.help')}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={!override}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-[759px]:w-full max-[759px]:justify-center"
        >
          <RotateCcw
            className="size-4"
            aria-hidden
          />
          {t('layouts.reset')}
        </button>
      </section>

      <ul
        aria-label={t('layouts.cardsLabel')}
        className="m-0 mt-4 grid list-none grid-cols-3 gap-4 p-0 max-[1179px]:grid-cols-2 max-[759px]:grid-cols-1"
      >
        {LAYOUTS.map((layout) => {
          const on = layout.id === current;
          return (
            <li key={layout.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => pick(layout.id)}
                className={`flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-card p-0 text-left text-card-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none ${on ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-foreground/25'}`}
              >
                <span className="pg-dots block border-b border-border bg-muted/40 p-3 [background-size:14px_14px]">
                  <LayoutSchematic
                    id={layout.id}
                    className="h-[116px]"
                  />
                </span>
                <span className="flex flex-1 flex-col gap-1.5 px-3.5 py-3">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold">{t(`layouts.${layout.key}.t`)}</span>
                    {on && <Badge tone="gold">{t('layouts.badge.inUse')}</Badge>}
                    {layout.id === fallback && <Badge>{t('layouts.badge.config')}</Badge>}
                    {layout.experimental && (
                      <Badge tone="warning">{t('layouts.badge.experimental')}</Badge>
                    )}
                  </span>
                  <span className="text-[13px] leading-snug text-muted-foreground">
                    {t(`layouts.${layout.key}.d`)}
                  </span>
                  {PHONE[layout.id] && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Smartphone
                        className="size-3.5 flex-none"
                        aria-hidden
                      />
                      {t(`layouts.phone.${PHONE[layout.id]}`)}
                    </span>
                  )}
                  <code className="mt-auto self-start rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11.5px]">
                    {layout.id}
                  </code>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <section className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-card-foreground">
        <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-primary/15">
          <Maximize
            className="size-[18px]"
            aria-hidden
          />
        </span>
        <div className="min-w-0">
          <h2 className="m-0 text-sm font-semibold">{t('layouts.fs.t')}</h2>
          <p className="m-0 mt-0.5 text-[13px] leading-[1.55] text-muted-foreground">
            <Inline text={t('layouts.fs.d')} />
          </p>
        </div>
      </section>

      <section className="mt-4 grid overflow-hidden rounded-xl border border-border bg-card text-card-foreground min-[1180px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="p-5">
          <h2 className="m-0 font-heading text-lg font-semibold">{t('layouts.cfg.t')}</h2>
          <p className="mt-2 mb-0 text-sm leading-[1.55]">
            <Inline text={t('layouts.cfg.d')} />
          </p>
          <p className="mt-3 mb-0 text-[13px] leading-[1.55] text-muted-foreground">
            <Inline text={t('layouts.cfg.help')} />
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-2 p-3 min-[1180px]:pl-0">
          <CodeBlock
            code={configCode}
            language="json"
            title="shellui.config.json"
            labelKey={null}
            copy
            className=""
          />
          <CodeBlock
            code={chromeCode}
            title="main.js"
            labelKey={null}
            copy
            className=""
          />
        </div>
      </section>
    </div>
  );
}
