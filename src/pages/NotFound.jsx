import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Compass,
  House,
  LayoutTemplate,
  MapPinOff,
  MessageSquare,
  Palette,
} from 'lucide-react';
import shellui from '@shellui/sdk';
import { Inline } from '../components/playground';
import { useTheme } from '../contexts/ThemeContext';
import { getAvailableThemes } from '../lib/theme';

const MAX_PATH = 32;

function shorten(text) {
  return text.length > MAX_PATH ? `${text.slice(0, MAX_PATH - 1)}…` : text;
}

/** Decorative browser window with the unknown address and a faint 404. */
function LostWindow({ path }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[400px]"
      aria-hidden
    >
      <span className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_65%)] blur-xl" />
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center gap-2 border-b border-border bg-muted px-3 py-2">
          <span className="flex gap-1">
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            #{shorten(path)}
          </span>
        </div>
        <div className="pg-dots relative flex h-[156px] items-center justify-center">
          <span className="font-heading select-none text-[88px] leading-none font-bold tracking-[-0.04em] text-foreground/10">
            404
          </span>
          <span className="absolute flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <MapPinOff className="size-6" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Tile({ to, icon: Icon, name, line }) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 text-card-foreground no-underline! transition-[border-color,box-shadow] duration-200 hover:border-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-primary/15 text-primary-ink">
        <Icon
          className="size-4"
          aria-hidden
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
        <span className="block text-xs text-muted-foreground">{line}</span>
      </span>
      <ArrowRight
        className="size-4 flex-none text-muted-foreground transition-transform duration-200 group-hover:text-primary-ink motion-safe:group-hover:translate-x-[3px]"
        aria-hidden
      />
    </Link>
  );
}

export default function NotFound() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const appearance = useTheme();
  const themeCount = useMemo(() => {
    const list = appearance?.availableThemes?.length
      ? appearance.availableThemes
      : getAvailableThemes(shellui.initialSettings ?? null);
    return list.length;
  }, [appearance?.availableThemes]);
  const canGoBack = typeof window !== 'undefined' && window.history.length > 1;

  const tiles = [
    { to: '/dialog', icon: MessageSquare, name: t('home.c.dialogs'), line: t('notFound.dialogs') },
    { to: '/toaster', icon: Bell, name: t('home.c.toasts'), line: t('notFound.toasts') },
    {
      to: '/themes',
      icon: Palette,
      name: t('home.c.themes'),
      line: t('notFound.themes', { count: themeCount }),
    },
    { to: '/layout', icon: LayoutTemplate, name: t('home.c.layouts'), line: t('notFound.layouts') },
  ];

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 py-10 font-body text-foreground sm:px-8 min-[760px]:py-16">
      <div className="grid items-center gap-10 min-[760px]:grid-cols-2">
        <LostWindow path={pathname} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Compass
              className="size-4"
              aria-hidden
            />
            {t('notFound.crumb')}
          </p>
          <h1 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.02em] text-balance">
            {t('notFound.title')}
          </h1>
          <p className="mt-3 max-w-[48ch] text-[15px] text-muted-foreground [overflow-wrap:anywhere]">
            <Inline text={t('notFound.lede', { path: pathname })} />
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border-0 bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <House
                className="size-4"
                aria-hidden
              />
              {t('notFound.home')}
            </button>
            {canGoBack && (
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeft
                  className="size-4"
                  aria-hidden
                />
                {t('notFound.back')}
              </button>
            )}
          </div>
        </div>
      </div>

      <section
        aria-labelledby="nf-more"
        className="mt-12"
      >
        <h2
          id="nf-more"
          className="text-sm font-semibold text-foreground"
        >
          {t('notFound.more')}
        </h2>
        <div className="mt-3 grid gap-3 min-[560px]:grid-cols-2 min-[1000px]:grid-cols-4">
          {tiles.map((tile) => (
            <Tile
              key={tile.to}
              {...tile}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
