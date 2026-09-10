import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Monitor } from 'lucide-react';
import shellui from '@shellui/sdk';
import CodeBlock from '../components/CodeBlock';
import { Button } from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';
import { getAvailableThemes } from '../lib/theme';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ThemeSwitchSpinner = ({ className }) => (
  <svg
    data-theme-switch-spinner=""
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

function previewRadius(radius, inset = 0) {
  const base = radius?.trim() || '0.5rem';
  if (inset <= 0) return base;
  return `max(0px, calc(${base} - ${inset}px))`;
}

function MiniSwatch({ colors }) {
  const radius = colors?.radius;
  return (
    <div
      className="flex flex-1 flex-col gap-1 border p-1.5"
      style={{
        backgroundColor: colors?.background,
        borderColor: colors?.border,
        borderRadius: previewRadius(radius, 2),
      }}
    >
      <div
        className="h-3"
        style={{ backgroundColor: colors?.primary, borderRadius: previewRadius(radius, 4) }}
      />
      <div className="flex gap-0.5">
        <div
          className="h-2 flex-1"
          style={{ backgroundColor: colors?.secondary, borderRadius: previewRadius(radius, 4) }}
        />
        <div
          className="h-2 flex-1"
          style={{ backgroundColor: colors?.accent, borderRadius: previewRadius(radius, 4) }}
        />
        <div
          className="h-2 flex-1"
          style={{ backgroundColor: colors?.muted, borderRadius: previewRadius(radius, 4) }}
        />
      </div>
    </div>
  );
}

/**
 * Theme color preview component.
 * @param {{
 *   theme: import('@shellui/sdk').SettingsAvailableTheme;
 *   isSelected: boolean;
 *   isDark: boolean;
 *   isPending?: boolean;
 *   layout: 'single' | 'few' | 'many';
 * }} props
 */
function ThemePreview({ theme, isSelected, isDark, isPending = false, layout }) {
  const colors = isDark ? (theme.colors?.dark ?? {}) : (theme.colors?.light ?? {});
  const background = colors.background ?? (isDark ? '#0a0a0a' : '#ffffff');
  const radius = colors.radius;

  const pendingOverlay = (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center bg-background/55 backdrop-blur-[1px]',
        'transition-opacity duration-300 ease-out',
        isPending ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      style={{ borderRadius: previewRadius(radius) }}
      aria-hidden={!isPending}
    >
      <ThemeSwitchSpinner className="size-5 text-primary" />
      {isPending ? <span className="sr-only">Applying theme</span> : null}
    </div>
  );

  if (layout === 'many') {
    return (
      <div
        className={cn(
          'relative overflow-hidden border-2',
          isSelected
            ? 'border-primary shadow-md'
            : 'border-border hover:border-muted-foreground/40',
        )}
        style={{ borderRadius: previewRadius(radius) }}
      >
        {pendingOverlay}
        <div className="flex gap-1 p-2">
          <MiniSwatch colors={theme.colors?.light} />
          <MiniSwatch colors={theme.colors?.dark} />
        </div>
        <div
          className="border-t px-2 py-1.5"
          style={{
            backgroundColor: colors.background ?? background,
            borderColor: colors.border,
            color: colors.foreground,
          }}
        >
          <p
            className="truncate text-xs font-medium"
            style={
              theme.fontFamily
                ? {
                    fontFamily: theme.fontFamily,
                    letterSpacing: theme.letterSpacing || 'normal',
                    textShadow: theme.textShadow || 'none',
                  }
                : undefined
            }
          >
            {theme.displayName ?? theme.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden border-2',
        isSelected ? 'border-primary shadow-lg' : 'border-border',
        layout === 'single' && 'max-w-sm',
      )}
      style={{ backgroundColor: background, borderRadius: previewRadius(radius) }}
    >
      {pendingOverlay}
      <div className={cn('space-y-2', layout === 'single' ? 'p-4' : 'p-3')}>
        <div
          className={layout === 'single' ? 'h-10' : 'h-8'}
          style={{ backgroundColor: colors.primary, borderRadius: previewRadius(radius, 2) }}
        />
        <div className="flex gap-1">
          <div
            className="h-6 flex-1"
            style={{
              backgroundColor: colors.background,
              borderRadius: previewRadius(radius, 4),
            }}
          />
          <div
            className="h-6 flex-1"
            style={{
              backgroundColor: colors.secondary,
              borderRadius: previewRadius(radius, 4),
            }}
          />
          <div
            className="h-6 flex-1"
            style={{
              backgroundColor: colors.accent,
              borderRadius: previewRadius(radius, 4),
            }}
          />
        </div>
        <div className="flex gap-1">
          <div
            className="h-4 flex-1"
            style={{ backgroundColor: colors.muted, borderRadius: previewRadius(radius, 4) }}
          />
          <div
            className="h-4 flex-1"
            style={{ backgroundColor: colors.border, borderRadius: previewRadius(radius, 4) }}
          />
        </div>
      </div>
      <div
        className="px-2 py-1.5"
        style={{ backgroundColor: background, color: colors.foreground }}
      >
        <p
          className={cn('font-medium text-center', layout === 'single' ? 'text-sm' : 'text-xs')}
          style={
            theme.fontFamily
              ? {
                  fontFamily: theme.fontFamily,
                  letterSpacing: theme.letterSpacing || 'normal',
                  textShadow: theme.textShadow || 'none',
                }
              : undefined
          }
        >
          {theme.displayName ?? theme.name}
        </p>
      </div>
    </div>
  );
}

const THEMES_CODE = `import shellui from '@shellui/sdk';

// Listen to SHELLUI_SETTINGS to receive new values (shell sends this on init and when settings change)
shellui.addMessageListener('SHELLUI_SETTINGS', (message) => {
  const appearance = message.payload?.settings?.appearance;
  if (appearance) applyThemeToDocument(appearance);
});

const theme = shellui.initialSettings?.appearance;
applyThemeToDocument(theme);`;

const colorSchemeToKey = (scheme) => {
  if (scheme === 'dark') return 'themeDark';
  if (scheme === 'system') return 'themeSystem';
  return 'themeLight';
};

export default function Themes() {
  const { t } = useTranslation();
  const appearance = useTheme();
  const colorScheme = appearance?.colorScheme ?? 'system';

  const availableThemes = useMemo(() => getAvailableThemes(shellui.initialSettings ?? null), []);
  const sortedThemes = useMemo(
    () =>
      [...availableThemes].sort((a, b) =>
        (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name),
      ),
    [availableThemes],
  );
  const currentThemeName = appearance?.name ?? 'default';

  const [pendingThemeName, setPendingThemeName] = useState(null);
  const [pendingColorScheme, setPendingColorScheme] = useState(null);
  // Ref lock so rapid clicks in the same render cannot all pass the busy check.
  const switchLockRef = useRef(false);
  const themeSwitchBusy = pendingThemeName !== null || pendingColorScheme !== null;
  const displayedColorScheme = pendingColorScheme ?? colorScheme;

  const layout = sortedThemes.length <= 1 ? 'single' : sortedThemes.length <= 3 ? 'few' : 'many';

  // System preference for when colorScheme is "system" and appearance.mode isn't set
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setSystemPrefersDark(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // When "system", use resolved mode (appearance.mode) or OS preference so preview matches current theme
  const resolvedDark = appearance?.mode != null ? appearance.mode === 'dark' : systemPrefersDark;
  const isDarkForPreview =
    displayedColorScheme === 'dark' || (displayedColorScheme === 'system' && resolvedDark);

  const applyAppearance = useCallback(
    (updates) => {
      const currentSettings = shellui.initialSettings ?? {};
      const nextAppearance = { ...(appearance ?? {}), ...updates };
      shellui.sendMessageToParent({
        type: 'SHELLUI_SETTINGS_UPDATED',
        payload: {
          settings: { ...currentSettings, appearance: nextAppearance },
        },
      });
    },
    [appearance],
  );

  // Double rAF + settle delay covers shell apply, trailing iframe coalesce, and echo.
  const runAppearanceSwitch = useCallback(async (work) => {
    try {
      work();
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      await new Promise((resolve) => setTimeout(resolve, 400));
      return true;
    } catch {
      return false;
    }
  }, []);

  const selectTheme = useCallback(
    async (themeName) => {
      if (switchLockRef.current) return;
      if (themeName === currentThemeName) return;
      switchLockRef.current = true;
      setPendingThemeName(themeName);
      try {
        await runAppearanceSwitch(() => {
          applyAppearance({ name: themeName });
        });
      } finally {
        switchLockRef.current = false;
        setPendingThemeName(null);
      }
    },
    [currentThemeName, applyAppearance, runAppearanceSwitch],
  );

  const selectColorScheme = useCallback(
    async (nextScheme) => {
      if (switchLockRef.current) return;
      if (nextScheme === colorScheme) return;
      switchLockRef.current = true;
      setPendingColorScheme(nextScheme);
      try {
        await runAppearanceSwitch(() => {
          applyAppearance({ colorScheme: nextScheme });
        });
      } finally {
        switchLockRef.current = false;
        setPendingColorScheme(null);
      }
    },
    [colorScheme, applyAppearance, runAppearanceSwitch],
  );

  // 2 columns on small screens; from md, auto-fill so cards stay ~12rem
  // instead of stretching across a fixed column grid.
  const gridClass =
    layout === 'single'
      ? 'grid max-w-sm grid-cols-1'
      : layout === 'few'
        ? 'grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr))]'
        : 'grid grid-cols-2 gap-3 md:[grid-template-columns:repeat(auto-fill,minmax(12rem,1fr))]';

  const modeThemes = [
    { value: 'light', labelKey: 'themeLight', Icon: Sun },
    { value: 'dark', labelKey: 'themeDark', Icon: Moon },
    { value: 'system', labelKey: 'themeSystem', Icon: Monitor },
  ];

  return (
    <div className="font-body text-foreground max-w-5xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {t('pageThemesTitle')}
      </h1>
      <p className="mt-2 text-foreground">{t('pageThemesDescription')}</p>
      <p className="mt-2 text-sm text-muted-foreground">{t('pageThemesTry')}</p>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-medium text-foreground mb-1">
          {t('exampleTitleTheme')}
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          {t('currentTheme')}: {appearance?.displayName ?? appearance?.name ?? t('themeDefault')}
        </p>

        <div className="space-y-2 mt-4">
          <div className="space-y-0.5">
            <h3 className="font-heading text-sm font-medium text-foreground">
              {t('colorSchemeLabel')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('currentColorScheme')}: {t(colorSchemeToKey(displayedColorScheme))}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {modeThemes.map(({ value, labelKey, Icon }) => {
              const isSelected = displayedColorScheme === value;
              const isPending = pendingColorScheme === value;
              return (
                <Button
                  key={value}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    void selectColorScheme(value);
                  }}
                  disabled={themeSwitchBusy}
                  className={cn(
                    /* pointer-events-auto so disabled:cursor-wait is visible (base Button uses pointer-events-none) */
                    'flex items-center gap-1.5 disabled:pointer-events-auto disabled:cursor-wait',
                    'transition-opacity duration-300 ease-out',
                    themeSwitchBusy && !isPending
                      ? 'opacity-40 disabled:opacity-40'
                      : 'opacity-100 disabled:opacity-100',
                  )}
                  aria-busy={isPending}
                >
                  {isPending ? (
                    <ThemeSwitchSpinner className="size-3.5 shrink-0" />
                  ) : (
                    <Icon
                      className="size-3.5 shrink-0"
                      aria-hidden
                    />
                  )}
                  {t(labelKey)}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <div className="space-y-0.5">
            <label
              className="text-sm font-medium leading-none"
              style={{ fontFamily: 'var(--heading-font-family, inherit)' }}
            >
              {t('appearance.colorTheme')}
            </label>
            <p className="text-sm text-muted-foreground">{t('appearance.colorThemeDescription')}</p>
          </div>
          <div className={cn('mt-2', gridClass)}>
            {sortedThemes.map((theme) => {
              const isSelected = currentThemeName === theme.name;
              const previewColors = isDarkForPreview
                ? (theme.colors?.dark ?? {})
                : (theme.colors?.light ?? {});
              return (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => {
                    void selectTheme(theme.name);
                  }}
                  disabled={themeSwitchBusy}
                  className={cn(
                    'relative min-w-0 text-left transition-[opacity,transform] duration-300 ease-out',
                    themeSwitchBusy ? 'cursor-wait' : 'cursor-pointer',
                    isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                    themeSwitchBusy && pendingThemeName !== theme.name && 'opacity-40 scale-[0.99]',
                    (!themeSwitchBusy || pendingThemeName === theme.name) &&
                      'opacity-100 scale-100',
                  )}
                  style={{ borderRadius: previewRadius(previewColors.radius) }}
                  aria-label={theme.displayName ?? theme.name}
                  aria-pressed={isSelected}
                  aria-busy={pendingThemeName === theme.name}
                >
                  <ThemePreview
                    theme={theme}
                    isSelected={isSelected || pendingThemeName === theme.name}
                    isDark={isDarkForPreview}
                    isPending={pendingThemeName === theme.name}
                    layout={layout}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <CodeBlock code={THEMES_CODE} />
      </section>
    </div>
  );
}
