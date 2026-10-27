import shellui from '@shellui/sdk';

/** Absolute URL of a route of this app, for overlays the shell opens (modal, drawer). */
export function appRouteUrl(path) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';
  const pathPart = path.startsWith('/') ? path : '/' + path;
  return `${window.location.origin}${base}#${pathPart}`;
}

/**
 * Send updated settings to the shell. The shell applies them to itself and to every
 * app, then echoes them back as SHELLUI_SETTINGS. `shellui.initialSettings` stays
 * fresh across those messages, so merging into it keeps the other settings intact.
 *
 * @param {(current: import('@shellui/sdk').Settings) => Partial<import('@shellui/sdk').Settings>} update
 */
export function updateShellSettings(update) {
  const current = shellui.initialSettings ?? {};
  const settings = { ...current, ...update(current) };
  // The shell adds the theme list for apps; sending it back would store all 47 themes.
  if (settings.appearance?.availableThemes) {
    const { availableThemes: _list, ...appearance } = settings.appearance;
    settings.appearance = appearance;
  }
  shellui.sendMessageToParent({ type: 'SHELLUI_SETTINGS_UPDATED', payload: { settings } });
  return settings;
}

/** Wall clock time in the shell timezone, formatted for the current language. */
export function formatShellTime(lang, timeZone, options = { timeStyle: 'medium' }) {
  try {
    return new Intl.DateTimeFormat(lang, { ...options, timeZone }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat(lang, options).format(new Date());
  }
}
