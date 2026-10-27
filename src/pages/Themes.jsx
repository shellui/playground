import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, Moon, Palette, Search, Sun } from 'lucide-react';
import shellui from '@shellui/sdk';
import CodeBlock from '../components/CodeBlock';
import { Inline, PageHeader, Segmented } from '../components/playground';
import { useTheme } from '../contexts/ThemeContext';
import { updateShellSettings } from '../lib/shell';
import { getAvailableThemes } from '../lib/theme';
import { KEY_TO_CSS_VAR } from '../lib/themeUtils';

const nameOf = (theme) => theme?.displayName ?? theme?.name ?? '';

/** Theme radius, capped so a tile never turns into a pill. */
function tileRadius(radius) {
  return `min(${radius?.trim() || '0.5rem'}, 8px)`;
}

/** First family of a CSS font stack, without quotes. */
function firstFamily(stack) {
  const first = String(stack ?? '')
    .split(',')[0]
    ?.trim()
    .replace(/^['"]|['"]$/g, '');
  return first || 'system-ui';
}

/**
 * The theme's colors as CSS variables for a subtree. Tailwind resolves `--color-*` at the
 * root, so both the raw token and its `--color-*` alias are set.
 */
function themeStyle(colors = {}, theme) {
  const style = {};
  for (const [key, value] of Object.entries(colors)) {
    const cssVar = KEY_TO_CSS_VAR[key];
    if (!cssVar || value == null) continue;
    style[cssVar] = value;
    if (key !== 'radius') style[`--color-${cssVar.slice(2)}`] = value;
  }
  style.backgroundColor = colors.background;
  style.color = colors.foreground;
  if (theme?.fontFamily) {
    style.fontFamily = theme.fontFamily;
    style.letterSpacing = theme.letterSpacing || 'normal';
    style.textShadow = theme.textShadow || 'none';
  }
  return style;
}

/** Arrow keys, Home and End move between theme radios and select the one they land on. */
function onRadioKeyDown(event) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
  if (step === undefined && event.key !== 'Home' && event.key !== 'End') return;
  const radios = [...event.currentTarget.querySelectorAll('[role="radio"]')];
  if (!radios.length) return;
  event.preventDefault();
  const at = radios.indexOf(document.activeElement);
  let next;
  if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = radios.length - 1;
  else next = (Math.max(at, 0) + step + radios.length) % radios.length;
  radios[next].focus();
  radios[next].click();
}

function Tile({ theme, dark, checked, focusable, current, onSelect, badge }) {
  const c = (dark ? theme.colors?.dark : theme.colors?.light) ?? {};
  const r = tileRadius(c.radius);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={focusable ? 0 : -1}
      onClick={onSelect}
      className={`flex w-full min-w-0 cursor-pointer flex-col gap-2 rounded-lg border bg-card p-1.5 pb-2 text-left text-card-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none ${checked ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-foreground/25'}`}
    >
      <span
        aria-hidden
        className="flex flex-col gap-1.5 border p-2"
        style={{ backgroundColor: c.background, borderColor: c.border, borderRadius: r }}
      >
        <i
          className="block h-2 w-3/5"
          style={{ backgroundColor: c.primary, borderRadius: r }}
        />
        <span className="flex gap-1">
          {[c.secondary, c.accent, c.foreground].map((color, i) => (
            <i
              key={i}
              className="block h-1.5 flex-1"
              style={{ backgroundColor: color, borderRadius: r }}
            />
          ))}
        </span>
      </span>
      <span className="flex min-w-0 items-center justify-between gap-1.5 px-0.5">
        <span className="truncate text-[12.5px]">{nameOf(theme)}</span>
        {current && badge}
      </span>
    </button>
  );
}

function Preview({ theme, dark, t }) {
  const c = (dark ? theme.colors?.dark : theme.colors?.light) ?? {};
  const r = c.radius?.trim() || '0.5rem';
  const [notify, setNotify] = useState(true);
  return (
    <div
      className="flex flex-col gap-3 border-y border-border p-3"
      style={themeStyle(c, theme)}
      aria-label={t('themes.sample', { name: nameOf(theme) })}
      role="group"
    >
      <div
        className="border border-border bg-card p-3 text-card-foreground"
        style={{ borderRadius: r }}
      >
        <p className="m-0 text-sm font-semibold">{t('themes.pv.cardTitle')}</p>
        <p className="m-0 mt-0.5 text-xs text-muted-foreground">{t('themes.pv.cardText')}</p>
        <input
          readOnly
          tabIndex={-1}
          aria-hidden
          value="ana@example.com"
          className="mt-2.5 h-8 w-full border border-input bg-background px-2.5 text-xs text-foreground"
          style={{ borderRadius: r }}
        />
        <div className="mt-2.5 flex flex-wrap gap-2">
          <span
            className="inline-flex h-8 items-center bg-primary px-3 text-xs font-medium text-primary-foreground"
            style={{ borderRadius: r }}
          >
            {t('themes.pv.send')}
          </span>
          <span
            className="inline-flex h-8 items-center border border-border bg-background px-3 text-xs font-medium"
            style={{ borderRadius: r }}
          >
            {t('themes.pv.cancel')}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex h-5 items-center border border-border bg-secondary px-1.5 text-[11px] font-medium text-secondary-foreground"
          style={{ borderRadius: r }}
        >
          {t('themes.pv.draft')}
        </span>
        <span
          className="inline-flex h-5 items-center bg-primary px-1.5 text-[11px] font-medium text-primary-foreground"
          style={{ borderRadius: r }}
        >
          {t('themes.pv.live')}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={notify}
          onClick={() => setNotify((v) => !v)}
          className="ml-auto inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span
            aria-hidden
            className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors motion-reduce:transition-none ${notify ? 'bg-primary' : 'bg-input'}`}
          >
            <span
              className={`block size-3.5 rounded-full bg-background shadow transition-transform motion-reduce:transition-none ${notify ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </span>
          {t('themes.pv.notify')}
        </button>
      </div>
      <div
        className="flex gap-2.5 border border-border bg-popover px-3 py-2.5 text-popover-foreground shadow-[0_8px_20px_-12px_rgb(0_0_0/0.35)]"
        style={{ borderRadius: r }}
      >
        <i
          aria-hidden
          className="mt-1.5 block size-1.5 flex-none rounded-full bg-primary"
        />
        <span>
          <span className="block text-xs font-semibold">{t('themes.pv.toastTitle')}</span>
          <span className="block text-xs text-muted-foreground">{t('themes.pv.toastText')}</span>
        </span>
      </div>
    </div>
  );
}

export default function Themes() {
  const { t, i18n } = useTranslation();
  const appearance = useTheme();
  const dark = appearance?.mode === 'dark';
  const scheme = appearance?.colorScheme ?? 'system';
  const currentName = appearance?.name ?? 'default';

  const themes = useMemo(() => {
    const list = appearance?.availableThemes?.length
      ? appearance.availableThemes
      : getAvailableThemes(shellui.initialSettings ?? null);
    return [...list].sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
  }, [appearance?.availableThemes]);
  const count = themes.length;
  const currentTheme = themes.find((theme) => theme.name === currentName) ?? {
    name: currentName,
    displayName: appearance?.displayName,
    colors: appearance?.colors,
    fontFamily: appearance?.fontFamily,
  };

  const [query, setQuery] = useState('');
  // The theme just picked, until the shell echoes it back. Selection shows it right away.
  const [pending, setPending] = useState(null);
  const pendingTimer = useRef(null);

  const selectedName = pending ?? currentName;
  const selected = themes.find((theme) => theme.name === selectedName) ?? currentTheme;

  useEffect(() => {
    if (pending && pending === currentName) {
      clearTimeout(pendingTimer.current);
      setPending(null);
    }
  }, [pending, currentName]);
  useEffect(() => () => clearTimeout(pendingTimer.current), []);

  const send = (updates) =>
    updateShellSettings(() => ({ appearance: { ...(appearance ?? {}), ...updates } }));

  const select = (theme) => {
    if (theme.name === selectedName) return;
    setPending(theme.name === currentName ? null : theme.name);
    clearTimeout(pendingTimer.current);
    pendingTimer.current = setTimeout(() => setPending(null), 5000);
    send({ name: theme.name, displayName: theme.displayName, colors: theme.colors });
  };

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? themes.filter(
        (theme) =>
          nameOf(theme).toLowerCase().includes(needle) || theme.name.toLowerCase().includes(needle),
      )
    : themes;
  const tabName = matches.some((theme) => theme.name === selectedName)
    ? selectedName
    : matches[0]?.name;

  const modeLabel = t(dark ? 'themes.dark' : 'themes.light');
  const previewColors = (dark ? selected.colors?.dark : selected.colors?.light) ?? {};
  const currentBadge = (
    <span className="inline-flex h-[18px] flex-none items-center rounded-md border border-primary/40 bg-primary/15 px-1.5 text-[10.5px] font-medium">
      {t('themes.current')}
    </span>
  );

  const code = `const { appearance } = shellui.initialSettings;
// ${t('themes.c1')}
// ${t('themes.c2')}
applyThemeToDocument(appearance);

shellui.addMessageListener('SHELLUI_SETTINGS', (message) =>
  applyThemeToDocument(message.payload.settings.appearance),
);`;

  const tileFor = (theme) => (
    <Tile
      key={theme.name}
      theme={theme}
      dark={dark}
      checked={theme.name === selectedName}
      focusable={theme.name === tabName}
      current={theme.name === currentName}
      badge={currentBadge}
      onSelect={() => select(theme)}
    />
  );

  return (
    <div className="max-w-[1180px] font-body text-foreground">
      <PageHeader
        group={t('home.g.prefs')}
        icon={Palette}
        title={t('themes.title')}
        lede={t('themes.lede', { count })}
        apis={['settings.appearance']}
        docs="https://docs.shellui.com/features/themes"
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className="text-sm font-medium"
          aria-hidden
        >
          {t('themes.scheme')}
        </span>
        <div className="inline-block">
          <Segmented
            label={t('themes.scheme')}
            value={scheme}
            onChange={(colorScheme) => colorScheme !== scheme && send({ colorScheme })}
            options={[
              { value: 'light', label: t('themes.light'), icon: Sun },
              { value: 'dark', label: t('themes.dark'), icon: Moon },
              { value: 'system', label: t('themes.system'), icon: Monitor },
            ]}
          />
        </div>
        {scheme === 'system' && (
          <span className="text-[13px] text-muted-foreground">
            {t('themes.systemHelp', {
              mode: i18n.language?.startsWith('fr') ? modeLabel.toLowerCase() : modeLabel,
            })}
          </span>
        )}
      </div>

      <div className="grid items-start gap-4 min-[1180px]:grid-cols-[minmax(0,1fr)_320px]">
        <aside
          className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground min-[1180px]:sticky min-[1180px]:top-4 min-[1180px]:order-2"
          aria-labelledby="pv-title"
        >
          <div className="flex items-end justify-between gap-2 px-3.5 pt-3 pb-2.5">
            <div className="min-w-0">
              <p className="m-0 text-xs text-muted-foreground">{t('themes.preview')}</p>
              <h2
                id="pv-title"
                className="m-0 truncate font-heading text-base font-semibold"
              >
                {nameOf(selected)}
              </h2>
            </div>
            <code className="font-mono text-[11.5px] text-muted-foreground">{selected.name}</code>
          </div>
          <Preview
            key={selected.name}
            theme={selected}
            dark={dark}
            t={t}
          />
          <dl className="m-0 grid grid-cols-3">
            {[
              [t('themes.font'), firstFamily(selected.fontFamily)],
              [t('themes.radius'), previewColors.radius?.trim() || '0rem'],
              [t('themes.mode'), modeLabel],
            ].map(([label, value], i) => (
              <div
                key={label}
                className={`min-w-0 px-3 py-2 ${i ? 'border-l border-border' : ''}`}
              >
                <dt className="text-[11px] text-muted-foreground">{label}</dt>
                <dd
                  className={`m-0 truncate text-[12.5px] font-semibold ${i === 1 ? 'font-mono' : ''}`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>

        <section
          className="min-w-0 overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
          aria-label={t('themes.grid')}
        >
          <div className="flex items-center gap-3 border-b border-border p-3">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t('themes.search', { count })}</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('themes.search', { count })}
                className="h-9 w-full rounded-md border border-input bg-background pr-2.5 pl-8 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
              />
            </label>
            <span
              className="flex-none text-xs text-muted-foreground"
              aria-live="polite"
            >
              {needle
                ? t('themes.countFiltered', { n: matches.length, count })
                : t('themes.count', { count })}
            </span>
          </div>

          <div className="relative">
            <div className="max-h-[640px] overflow-y-auto p-3 pb-8 max-[759px]:max-h-[520px]">
              {!needle && <h3 className="m-0 mb-2 text-[13px] font-medium">{t('themes.all')}</h3>}
              {matches.length ? (
                <div
                  role="radiogroup"
                  aria-label={t('themes.all')}
                  aria-busy={Boolean(pending)}
                  onKeyDown={onRadioKeyDown}
                  className="grid grid-cols-4 gap-2.5 max-[759px]:grid-cols-2"
                >
                  {matches.map(tileFor)}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                  <p className="m-0">{t('themes.empty', { query: query.trim() })}</p>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="inline-flex h-8 cursor-pointer items-center rounded-md border-0 bg-transparent px-3 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {t('themes.clearSearch')}
                  </button>
                </div>
              )}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent"
            />
          </div>
        </section>
      </div>

      <section className="mt-4 grid overflow-hidden rounded-xl border border-border bg-card text-card-foreground min-[1180px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="p-5">
          <h2 className="m-0 font-heading text-lg font-semibold">{t('themes.read.t')}</h2>
          <p className="mt-2 mb-0 text-sm leading-[1.55]">
            <Inline text={t('themes.read.d')} />
          </p>
        </div>
        <div className="min-w-0 p-3 min-[1180px]:pl-0">
          <CodeBlock
            code={code}
            title="theme.js"
            labelKey={null}
            copy
            className=""
          />
        </div>
      </section>
    </div>
  );
}
