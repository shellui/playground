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
