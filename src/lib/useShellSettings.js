import { useEffect, useState } from 'react';
import shellui from '@shellui/sdk';

/**
 * The settings the shell sent this app. Re-reads `shellui.initialSettings`, which the
 * SDK keeps fresh, whenever the shell pushes SHELLUI_SETTINGS or SHELLUI_SETTINGS_UPDATED.
 */
export function useShellSettings() {
  const [settings, setSettings] = useState(() => shellui.initialSettings ?? null);
  useEffect(() => {
    const refresh = (message) => {
      setSettings(message?.payload?.settings ?? shellui.initialSettings ?? null);
    };
    const offUpdated = shellui.addMessageListener('SHELLUI_SETTINGS_UPDATED', refresh);
    const offSettings = shellui.addMessageListener('SHELLUI_SETTINGS', refresh);
    return () => {
      offUpdated();
      offSettings();
    };
  }, []);
  return settings;
}

/** Re-renders every `intervalMs` so clocks stay current. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
