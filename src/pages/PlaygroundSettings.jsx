import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { ArrowUpRight, Info, Play, Trash2 } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { Inline, Switch, usePrefs } from '../components/playground';
import { clearLogsAndOptions, setPref } from '../lib/prefs';

const SOURCE_URL = 'https://github.com/shellui/playground';

// The Playground item of this repo's shellui.config.json.
const NAV_ITEM = `{
  "label": "Playground",
  "path": "playground",
  "url": "/",
  "settings": "\${PLAYGROUND_APP_URL}/#/settings"
}`;

function Group({ title, children }) {
  return (
    <section
      className="mt-3.5 rounded-xl border border-border bg-card text-card-foreground"
      aria-label={title}
    >
      <h2 className="m-0 px-3.5 pt-3 pb-1 text-xs font-semibold text-muted-foreground">{title}</h2>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function SwitchRow({ title, help, checked, onChange }) {
  return (
    <div className="px-3.5 py-2.5">
      <Switch
        label={<span className="text-sm font-medium">{title}</span>}
        help={help}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 px-3.5 py-2.5">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="m-0 min-w-0 truncate text-right text-[13px]">{children}</dd>
    </div>
  );
}

/**
 * Settings panel for this app. The shell shows it in Settings > Applications > Playground
 * because the Playground nav item declares a `settings` URL.
 */
export default function PlaygroundSettings() {
  const { t } = useTranslation();
  const prefs = usePrefs();

  const clear = () =>
    shellui.dialog({
      mode: 'delete',
      title: t('prefs.clear.dlgTitle'),
      description: t('prefs.clear.dlgText'),
      okLabel: t('prefs.clear.btn'),
      cancelLabel: t('prefs.clear.cancel'),
      onOk: () => {
        clearLogsAndOptions();
        shellui.toast({ type: 'success', title: t('prefs.clear.done') });
      },
    });

  return (
    <div className="max-w-[640px] px-[26px] py-[22px] font-body text-foreground max-[759px]:p-4">
      <header className="flex items-center gap-3">
        <span className="flex size-11 flex-none items-center justify-center rounded-xl border border-border bg-card">
          <Play
            className="size-5"
            aria-hidden
          />
        </span>
        <div className="min-w-0">
          <h1 className="m-0 font-heading text-lg font-semibold">{t('prefs.title')}</h1>
          <p className="m-0 text-[13px] text-muted-foreground">{t('prefs.lede')}</p>
        </div>
      </header>

      <Group title={t('prefs.demos')}>
        <SwitchRow
          title={t('prefs.code.t')}
          help={t('prefs.code.d')}
          checked={prefs.showCode}
          onChange={(value) => setPref('showCode', value)}
        />
        <SwitchRow
          title={t('prefs.actionToast.t')}
          help={t('prefs.actionToast.d')}
          checked={prefs.actionToast}
          onChange={(value) => setPref('actionToast', value)}
        />
        <SwitchRow
          title={t('prefs.keep.t')}
          help={t('prefs.keep.d')}
          checked={prefs.keepOptions}
          onChange={(value) => setPref('keepOptions', value)}
        />
      </Group>

      <Group title={t('prefs.data')}>
        <div className="flex flex-wrap items-center gap-3 px-3.5 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-medium">{t('prefs.clear.t')}</p>
            <p className="m-0 mt-0.5 text-xs text-muted-foreground">{t('prefs.clear.d')}</p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Trash2
              className="size-4"
              aria-hidden
            />
            {t('prefs.clear.btn')}
          </button>
        </div>
      </Group>

      <Group title={t('prefs.about')}>
        <dl className="m-0 divide-y divide-border">
          <InfoRow label={t('prefs.info.app')}>
            <span className="font-mono font-semibold">{__APP_VERSION__}</span>
          </InfoRow>
          <InfoRow label={t('prefs.info.sdk')}>
            <span className="font-mono font-semibold">{shellui.getVersion?.() ?? '?'}</span>
          </InfoRow>
          <InfoRow label={t('prefs.info.source')}>
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm text-foreground underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
            >
              github.com/shellui/playground
              <ArrowUpRight
                className="size-3.5"
                aria-hidden
              />
              <span className="sr-only">({t('prefs.newTab')})</span>
            </a>
          </InfoRow>
        </dl>
      </Group>

      <details
        open
        className="group mt-3.5 rounded-xl border border-border bg-card text-card-foreground"
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
          <Info
            className="size-4"
            aria-hidden
          />
          {t('prefs.how.t')}
        </summary>
        <div className="px-3.5 pb-3.5">
          <p className="m-0 mb-3 text-[13px] leading-[1.55] text-muted-foreground">
            <Inline text={t('prefs.how.d')} />
          </p>
          <CodeBlock
            code={NAV_ITEM}
            language="json"
            title="shellui.config.json"
            labelKey={null}
            copy
            className=""
          />
        </div>
      </details>
    </div>
  );
}
