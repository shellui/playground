function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Non-content chrome uses primary; content stays as background. */
function ContentArea({ className }) {
  return <div className={cn('min-h-0 min-w-0 flex-1 bg-background', className)} />;
}

function SidebarSchematic({ inset = false }) {
  if (!inset) {
    return (
      <div className="flex h-full w-full overflow-hidden bg-background">
        <div className="w-[28%] shrink-0 bg-primary" />
        <ContentArea />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-primary">
      <div className="w-[22%] shrink-0" />
      <div className="min-h-0 min-w-0 flex-1 p-1.5 pl-1">
        <div className="h-full w-full rounded-[4px] bg-background" />
      </div>
    </div>
  );
}

function AppBarSchematic({ inset = false }) {
  if (!inset) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="h-[22%] shrink-0 bg-primary" />
        <ContentArea />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-primary">
      <div className="h-[18%] shrink-0" />
      <div className="min-h-0 min-w-0 flex-1 p-1.5 pt-1">
        <div className="h-full w-full rounded-[4px] bg-background" />
      </div>
    </div>
  );
}

function WindowsSchematic() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-muted">
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-1.5 bottom-2 overflow-hidden rounded-[2px] border border-border bg-background">
          <div className="h-[18%] bg-primary" />
          <ContentArea className="h-[82%]" />
        </div>
      </div>
      <div className="h-[18%] shrink-0 bg-primary" />
    </div>
  );
}

/** Full-bleed content with floating glass chrome (desktop sidebar silhouette). */
function FloatingSchematic() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div className="absolute inset-y-1.5 left-1.5 w-[26%] rounded-[4px] bg-primary/85 shadow-sm" />
    </div>
  );
}

/**
 * Compact theme schematic: primary = chrome, background = content.
 * Radius is hardcoded so previews stay subtle regardless of the active theme.
 * @param {{ layoutId: string; className?: string }} props
 */
export default function LayoutPreview({ layoutId, className }) {
  let schematic = null;
  if (layoutId === 'sidebar') schematic = <SidebarSchematic />;
  else if (layoutId === 'sidebar-inset') schematic = <SidebarSchematic inset />;
  else if (layoutId === 'app-bar') schematic = <AppBarSchematic />;
  else if (layoutId === 'app-bar-inset') schematic = <AppBarSchematic inset />;
  else if (layoutId === 'floating') schematic = <FloatingSchematic />;
  else if (layoutId === 'windows') schematic = <WindowsSchematic />;

  return (
    <div
      className={cn(
        'h-16 w-28 shrink-0 overflow-hidden rounded-[4px] border border-border',
        className,
      )}
      aria-hidden
    >
      {schematic}
    </div>
  );
}
