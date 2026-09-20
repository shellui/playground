import shellui from '@shellui/sdk';

/** Open shell Settings (modal when available). */
export function openShellSettings() {
  try {
    if (typeof shellui.openModal === 'function') {
      shellui.openModal('/__settings');
      return;
    }
    if (typeof shellui.navigate === 'function') {
      shellui.navigate('/__settings');
    }
  } catch {
    /* ignore */
  }
}
