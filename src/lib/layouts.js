/** The layouts a person can switch to. Fullscreen is left out: it has no way back. */
export const LAYOUTS = [
  { id: 'sidebar', key: 'sidebar' },
  { id: 'sidebar-inset', key: 'sidebarInset' },
  { id: 'app-bar', key: 'appBar' },
  { id: 'app-bar-inset', key: 'appBarInset' },
  { id: 'floating', key: 'floating' },
  { id: 'windows', key: 'windows', experimental: true },
];

/** Display name of a shell layout id, in the current language. */
export function layoutName(t, id) {
  const layout = LAYOUTS.find((l) => l.id === id);
  return layout ? t(`layouts.${layout.key}.t`) : id;
}
