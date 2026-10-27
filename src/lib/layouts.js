/** i18n key for the display name of a shell layout id. */
export function layoutToKey(layout) {
  if (layout === 'fullscreen') return 'layoutFullscreen';
  if (layout === 'windows') return 'layoutWindows';
  if (layout === 'floating') return 'layoutFloating';
  if (layout === 'app-bar') return 'layoutAppBar';
  if (layout === 'app-bar-inset') return 'layoutAppBarInset';
  if (layout === 'sidebar-inset') return 'layoutSidebarInset';
  return 'layoutSidebar';
}
