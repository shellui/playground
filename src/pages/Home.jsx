import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutPanelLeft, Palette, Settings } from 'lucide-react';
import { openShellSettings } from '../lib/openShellSettings';

const shelluiSiteLink = (
  <a
    href="https://shellui.com"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-link"
  />
);

const SCENES = [
  {
    to: '/themes',
    icon: Palette,
    titleKey: 'playgroundSceneThemesTitle',
    bodyKey: 'playgroundSceneThemesBody',
  },
  {
    to: '/layout',
    icon: LayoutPanelLeft,
    titleKey: 'playgroundSceneLayoutTitle',
    bodyKey: 'playgroundSceneLayoutBody',
  },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="font-body text-foreground max-w-3xl">
      <header className="mb-8">
        <p className="text-honey text-xs font-medium uppercase tracking-[0.16em]">
          {t('playgroundKicker')}
        </p>
        <h1 className="font-heading mt-2 text-3xl sm:text-4xl font-bold text-foreground tracking-tight text-balance">
          {t('playgroundTitle')}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground text-pretty max-w-xl">
          {t('playgroundTagline')}
        </p>
      </header>

      <section aria-label={t('playgroundScenesLabel')}>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
          {SCENES.map(({ to, icon: Icon, titleKey, bodyKey }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 text-inherit no-underline hover:border-foreground/25 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <Icon
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="font-heading text-base font-semibold tracking-tight">
                    {t(titleKey)}
                  </span>
                </span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t(bodyKey)}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                  {t('playgroundOpen')}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={openShellSettings}
              className="group flex h-full w-full flex-col rounded-lg border border-border bg-card p-4 text-left text-inherit hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-2 text-foreground">
                <Settings
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
                <span className="font-heading text-base font-semibold tracking-tight">
                  {t('playgroundSceneSettingsTitle')}
                </span>
              </span>
              <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {t('playgroundSceneSettingsBody')}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                {t('openSettings')}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </li>
        </ul>
      </section>

      <section className="mt-12 max-w-xl">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t('playgroundWhatIs')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <Trans
            i18nKey="playgroundWhatIsBody"
            components={{ shelluiLink: shelluiSiteLink }}
          />
        </p>
      </section>

      <p className="mt-10 text-muted-foreground text-sm flex items-center gap-2 flex-wrap">
        {t('playgroundCodeOnGitHub')}
        <a
          href="https://github.com/shellui/playground"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          aria-label="GitHub: shellui/playground"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          shellui/playground
        </a>
        {t('playgroundHostedOnGitHubPages')}
      </p>
    </div>
  );
}
