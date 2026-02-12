/**
 * Theme: apply @shellui/sdk Appearance to the document (no transformation).
 * Settings.appearance is used as-is; we only apply it to DOM/CSS.
 */

import {
  KEY_TO_CSS_VAR,
  applyVariablesToRoot,
  applyTypographyFromAppearance,
  applyFontFiles,
} from './themeUtils.js';

/**
 * Get appearance from SDK settings (e.g. shellui.initialSettings).
 * Same type as settings.appearance – use without modification.
 *
 * @param {import('@shellui/sdk').Settings | null | undefined} settings
 * @returns {import('@shellui/sdk').Appearance | null}
 */
export function getAppearanceFromSettings(settings) {
  return settings?.appearance ?? null;
}

/**
 * Get appearance from SHELLUI_SETTINGS / SHELLUI_SETTINGS_UPDATED payload.
 *
 * @param {{ settings?: import('@shellui/sdk').Settings } | import('@shellui/sdk').Settings | null | undefined} payload
 * @returns {import('@shellui/sdk').Appearance | null}
 */
export function getAppearanceFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const settings = payload.settings ?? payload;
  return settings?.appearance ?? null;
}

/**
 * Apply Appearance to document: .dark class, shadcn CSS vars from colors[mode],
 * typography (fontFamily, bodyFontFamily, headingFontFamily, lineHeight, letterSpacing, fontFiles), and --link.
 *
 * @param {import('@shellui/sdk').Appearance | null} appearance
 */
export function applyThemeToDocument(appearance) {
  const root = document.documentElement;
  if (!appearance) {
    root.classList.remove('dark');
    return;
  }

  if (appearance.mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  const colorsForMode = appearance.colors?.[appearance.mode];
  if (colorsForMode && typeof colorsForMode === 'object') {
    const variables = {};
    for (const [key, value] of Object.entries(colorsForMode)) {
      const cssVar = KEY_TO_CSS_VAR[key];
      if (cssVar && value != null) variables[cssVar] = value;
    }
    applyVariablesToRoot(root, variables);
  }

  applyTypographyFromAppearance(root, appearance);
  applyFontFiles(appearance.fontFiles);

  const primary = typeof getComputedStyle !== 'undefined'
    ? getComputedStyle(root).getPropertyValue('--primary').trim()
    : '';
  if (primary) {
    root.style.setProperty('--link', primary);
  }
}
