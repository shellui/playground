import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { ArrowUpRight } from 'lucide-react';
import { CONSOLE_TABS, getConsoleTab, setConsoleTab } from '../lib/prefs';

const REPO_URL = 'https://github.com/shellui/playground';

function Row({ label, children }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="m-0 min-w-0 truncate text-right font-mono text-sm text-foreground">
        {children}
      </dd>
    </div>
  );
}

/**
 * Settings panel for this app. The shell shows it in Settings > Applications > Playground
 * because the Playground nav item declares `"settings": ".../#/settings"`.
 */
export default function PlaygroundSettings() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(getConsoleTab);

  return (
    <div className="max-w-xl font-body text-foreground">
      <h1 className="font-heading text-xl font-semibold tracking-[-0.02em]">
        {t('appSettings.title')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('appSettings.body')}</p>

      <section
        aria-labelledby="app-settings-home"
        className="mt-6 rounded-lg border border-border bg-card p-4"
      >
        <h2
          id="app-settings-home"
          className="font-heading text-sm font-semibold"
        >
          {t('appSettings.consoleTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('appSettings.consoleBody')}</p>
        <label
          htmlFor="console-tab"
          className="sr-only"
        >
          {t('appSettings.consoleTitle')}
        </label>
        <select
          id="console-tab"
          value={tab}
          onChange={(event) => {
            setTab(event.target.value);
            setConsoleTab(event.target.value);
          }}
          className="mt-3 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-60"
        >
          {CONSOLE_TABS.map((id) => (
            <option
              key={id}
              value={id}
            >
              {t(`home.tab.${id}`)}
            </option>
          ))}
        </select>
      </section>

      <section
        aria-labelledby="app-settings-about"
        className="mt-4 rounded-lg border border-border bg-card px-4 py-1"
      >
        <h2
          id="app-settings-about"
          className="sr-only"
        >
          {t('appSettings.aboutTitle')}
        </h2>
        <dl className="m-0 divide-y divide-border">
          <Row label={t('appSettings.appVersion')}>{__APP_VERSION__}</Row>
          <Row label={t('appSettings.sdkVersion')}>{shellui.getVersion?.() ?? '?'}</Row>
          <Row label={t('appSettings.source')}>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm font-body text-primary-ink! focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              shellui/playground
              <ArrowUpRight
                className="size-3.5"
                aria-hidden
              />
            </a>
          </Row>
        </dl>
      </section>
    </div>
  );
}
