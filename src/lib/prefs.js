/**
 * Preferences that belong to this app (not to the shell). Stored in this app's
 * localStorage and edited from Settings > Applications > Playground.
 */
const CONSOLE_TAB_KEY = 'playground.consoleTab';
export const CONSOLE_TABS = ['toast', 'dialog', 'drawer', 'scheme', 'language'];
export const DEFAULT_CONSOLE_TAB = 'dialog';

export function getConsoleTab() {
  try {
    const value = localStorage.getItem(CONSOLE_TAB_KEY);
    return CONSOLE_TABS.includes(value) ? value : DEFAULT_CONSOLE_TAB;
  } catch {
    return DEFAULT_CONSOLE_TAB;
  }
}

export function setConsoleTab(value) {
  try {
    if (value === DEFAULT_CONSOLE_TAB) localStorage.removeItem(CONSOLE_TAB_KEY);
    else localStorage.setItem(CONSOLE_TAB_KEY, value);
  } catch {
    // Storage can be blocked (private mode); the default stays in use.
  }
}

/**
 * Demo preferences, edited in Settings > Applications > Playground. The settings pane
 * is another frame of this app (same origin), so pages listen to the `storage` event
 * and pick up changes without a reload.
 */
const PREFS_KEY = 'playground.prefs';
const OPTIONS_PREFIX = 'playground.options.';
/** Written after "Clear logs and saved options" so open pages reset themselves. */
export const RESET_KEY = 'playground.reset';
/** Same-frame notification; the `storage` event only fires in other frames. */
const LOCAL_EVENT = 'playground:storage';

export const DEFAULT_PREFS = { showCode: true, actionToast: true, keepOptions: false };

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeKey(key, value) {
  try {
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    // Storage can be blocked (private mode); the change only lives in memory then.
  }
  window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: { key } }));
}

export function getPrefs() {
  return { ...DEFAULT_PREFS, ...readJson(PREFS_KEY, {}) };
}

export function setPref(name, value) {
  writeKey(PREFS_KEY, { ...getPrefs(), [name]: value });
}

/** Calls `listener(key)` when a playground key changes in this frame or another one. */
export function onPlaygroundStorage(listener) {
  const fromOtherFrame = (event) => {
    if (event.key === null || event.key.startsWith('playground.')) listener(event.key);
  };
  const fromThisFrame = (event) => listener(event.detail.key);
  window.addEventListener('storage', fromOtherFrame);
  window.addEventListener(LOCAL_EVENT, fromThisFrame);
  return () => {
    window.removeEventListener('storage', fromOtherFrame);
    window.removeEventListener(LOCAL_EVENT, fromThisFrame);
  };
}

export function loadOptions(page) {
  return readJson(OPTIONS_PREFIX + page, null);
}

export function saveOptions(page, options) {
  try {
    localStorage.setItem(OPTIONS_PREFIX + page, JSON.stringify(options));
  } catch {
    // See writeKey.
  }
}

/** Removes saved options and tells every open page to reset. Demo prefs stay. */
export function clearLogsAndOptions() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(OPTIONS_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Nothing stored.
  }
  writeKey(RESET_KEY, String(Date.now()));
}
