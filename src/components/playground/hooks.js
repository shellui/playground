import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import {
  RESET_KEY,
  getPrefs,
  loadOptions,
  onPlaygroundStorage,
  saveOptions,
} from '../../lib/prefs';
import { formatShellTime } from '../../lib/shell';

/** Demo preferences from Settings > Applications > Playground, kept live. */
export function usePrefs() {
  const [prefs, setPrefs] = useState(getPrefs);
  useEffect(
    () =>
      onPlaygroundStorage((key) => {
        if (key === null || key === 'playground.prefs') setPrefs(getPrefs());
      }),
    [],
  );
  return prefs;
}

/** Calls `onReset` when "Clear logs and saved options" runs in Settings. */
export function useResetSignal(onReset) {
  const ref = useRef(onReset);
  ref.current = onReset;
  useEffect(
    () =>
      onPlaygroundStorage((key) => {
        if (key === RESET_KEY || key === null) ref.current();
      }),
    [],
  );
}

/**
 * One options object per page. With "Keep my options between visits" on, it is
 * saved under `playground.options.{page}` and restored on the next visit.
 */
export function usePageOptions(page, defaults) {
  const prefs = usePrefs();
  const [options, setOptions] = useState(() => {
    const saved = getPrefs().keepOptions ? loadOptions(page) : null;
    return saved ? { ...defaults, ...saved } : defaults;
  });
  useEffect(() => {
    if (prefs.keepOptions) saveOptions(page, options);
  }, [page, options, prefs.keepOptions]);
  const defaultsRef = useRef(defaults);
  useResetSignal(() => setOptions(defaultsRef.current));
  const update = useCallback((patch) => setOptions((current) => ({ ...current, ...patch })), []);
  return [options, setOptions, update];
}

const CLOCK_FORMAT = { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' };

/** Wall clock (HH:mm:ss) in the shell timezone, for log rows and result lines. */
export function useShellClock() {
  const { i18n } = useTranslation();
  return useCallback(
    () => formatShellTime(i18n.language, shellui.initialSettings?.region?.timezone, CLOCK_FORMAT),
    [i18n.language],
  );
}

/** Newest first, at most 8 rows. Emptied by Clear or by the Settings reset. */
export function useEventLog() {
  const now = useShellClock();
  const [rows, setRows] = useState([]);
  const log = useCallback(
    (name, detail, extra = {}) => {
      const time = now();
      setRows((current) =>
        [{ id: `${Date.now()}-${Math.random()}`, time, name, detail, ...extra }, ...current].slice(
          0,
          8,
        ),
      );
      return time;
    },
    [now],
  );
  const clear = useCallback(() => setRows([]), []);
  useResetSignal(clear);
  return { rows, log, clear };
}
