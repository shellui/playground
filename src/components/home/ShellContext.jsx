import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import {
  Clock3,
  Languages,
  LayoutTemplate,
  Palette,
  Settings,
  SunMoon,
  UserRound,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLang } from '../../contexts/LangContext';
import { useNow, useShellSettings } from '../../lib/useShellSettings';
import { layout as configLayout } from '../../../shellui.config.json';
import { layoutName } from '../../lib/layouts';
import { formatShellTime } from '../../lib/shell';

function Cell({ icon: Icon, label, children, to, linkLabel }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 border-border p-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon
          className="size-3.5"
          aria-hidden
        />
        {label}
      </span>
      <div className="min-w-0 text-sm font-semibold text-foreground">{children}</div>
      {to && (
        <Link
          to={to}
          className="mt-auto w-fit text-xs text-muted-foreground! hover:text-foreground! focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function Account({ settings }) {
  const { t } = useTranslation();
  if (!settings || !('user' in settings) || settings.user === undefined) {
    return <span className="font-normal text-muted-foreground">{t('home.ctx.notShared')}</span>;
  }
  const user = settings.user;
  if (!user?.id) {
    return (
      <span className="flex flex-col gap-1.5">
        <span className="font-normal">{t('home.ctx.signedOut')}</span>
        <button
          type="button"
          onClick={() => shellui.login({ method: 'oauth', provider: 'github' })}
          className="w-fit cursor-pointer rounded-sm text-left text-xs font-medium text-primary-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('home.ctx.signIn')}
        </button>
      </span>
    );
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt=""
          className="size-6 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
          aria-hidden
        >
          {initials(user.name || user.email)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate">{user.name || user.email}</span>
        {user.authProvider && (
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {t('home.ctx.signedInWith', { provider: user.authProvider })}
          </span>
        )}
      </span>
    </span>
  );
}

/** Live view of the settings the shell sent this app. */
export default function ShellContext({ showOpenSettings }) {
  const { t } = useTranslation();
  const appearance = useTheme();
  const lang = useLang();
  const settings = useShellSettings();
  useNow(15000);

  const mode = appearance?.mode === 'dark' ? 'dark' : 'light';
  const colors = appearance?.colors?.[mode] ?? {};
  const scheme = appearance?.colorScheme ?? mode;
  const timeZone = settings?.region?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const clock = formatShellTime(lang, timeZone, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <section
      aria-labelledby="ctx-title"
      className="min-w-0 rounded-xl border border-border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 max-w-[62ch]">
          <h2
            id="ctx-title"
            className="font-heading text-base font-semibold text-foreground"
          >
            {t('home.ctx.title')}
          </h2>
          <p
            className="mt-1 text-sm text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground"
            dangerouslySetInnerHTML={{ __html: t('home.ctx.body') }}
          />
        </div>
        {showOpenSettings && (
          <button
            type="button"
            onClick={() => shellui.openModal('/__settings')}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 self-start rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Settings
              className="size-4"
              aria-hidden
            />
            {t('home.ctx.openSettings')}
          </button>
        )}
      </header>
      <div className="grid grid-cols-2 border-t border-border min-[760px]:grid-cols-3 min-[1180px]:grid-cols-6 [&>*]:border-b [&>*]:border-r max-[759px]:[&>*:nth-child(2n)]:border-r-0 min-[760px]:max-[1179px]:[&>*:nth-child(3n)]:border-r-0 min-[1180px]:[&>*]:border-b-0 min-[1180px]:[&>*:last-child]:border-r-0 max-[759px]:[&>*:nth-last-child(-n+2)]:border-b-0 min-[760px]:max-[1179px]:[&>*:nth-last-child(-n+3)]:border-b-0">
        <Cell
          icon={Palette}
          label={t('home.ctx.theme')}
          to="/themes"
          linkLabel={t('home.ctx.linkThemes')}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="flex shrink-0"
              aria-hidden
            >
              {[colors.primary, colors.foreground, colors.background].map((color, i) => (
                <span
                  key={i}
                  className="-ml-1 size-3 rounded-full border border-border first:ml-0"
                  style={{ background: color }}
                />
              ))}
            </span>
            <span className="truncate">{appearance?.displayName ?? appearance?.name ?? '?'}</span>
          </span>
        </Cell>
        <Cell
          icon={SunMoon}
          label={t('home.ctx.scheme')}
          to="/themes"
          linkLabel={t('home.ctx.linkThemes')}
        >
          {t(mode === 'dark' ? 'home.mode.dark' : 'home.mode.light')}
          {scheme === 'system' && (
            <span className="font-normal text-muted-foreground"> {t('home.ctx.system')}</span>
          )}
        </Cell>
        <Cell
          icon={Languages}
          label={t('home.ctx.language')}
          to="/languages"
          linkLabel={t('home.ctx.linkLanguage')}
        >
          {lang === 'fr' ? 'Français' : 'English'}
        </Cell>
        <Cell
          icon={Clock3}
          label={t('home.ctx.timezone')}
          to="/languages#region"
          linkLabel={t('home.ctx.linkRegion')}
        >
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            <span className="truncate">{timeZone}</span>
            <time className="font-mono text-xs font-normal text-muted-foreground">{clock}</time>
          </span>
        </Cell>
        <Cell
          icon={LayoutTemplate}
          label={t('home.ctx.layout')}
          to="/layout"
          linkLabel={t('home.ctx.linkLayouts')}
        >
          {layoutName(t, settings?.layout ?? configLayout ?? 'sidebar')}
        </Cell>
        <Cell
          icon={UserRound}
          label={t('home.ctx.account')}
        >
          <Account settings={settings} />
        </Cell>
      </div>
    </section>
  );
}
