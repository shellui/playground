import {
  Check,
  ChevronLeft,
  CircleCheck,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCw,
  Trash2,
  CircleX,
} from 'lucide-react';
import LayoutPreview from '../LayoutPreview';

/*
 * Small schematic drawings for the tour cards. Built only from theme tokens
 * (card, border, muted, primary) so they recolor with every Shellui theme.
 * All of them are decorative: the card title carries the meaning.
 */

function Bar({ className = '' }) {
  return <span className={`block h-1.5 rounded-full bg-muted-foreground/25 ${className}`} />;
}

export function DialogIllustration() {
  return (
    <div className="w-[62%] rounded-md border border-border bg-card p-3 shadow-md">
      <Bar className="w-1/2 bg-muted-foreground/50" />
      <Bar className="mt-2 w-full" />
      <Bar className="mt-1.5 w-3/4" />
      <div className="mt-3 flex justify-end gap-1.5">
        <span className="h-3.5 w-10 rounded-sm border border-border bg-background" />
        <span className="h-3.5 w-10 rounded-sm bg-primary" />
      </div>
    </div>
  );
}

export function ToastsIllustration() {
  const rows = [
    { Icon: CircleCheck, tone: 'text-success', width: 'w-[66%]', offset: 'ml-auto' },
    {
      Icon: LoaderCircle,
      tone: 'text-muted-foreground',
      width: 'w-[60%]',
      offset: 'ml-auto mr-[3%]',
    },
    { Icon: CircleX, tone: 'text-destructive', width: 'w-[54%]', offset: 'ml-auto mr-[6%]' },
  ];
  return (
    <div className="flex w-full flex-col gap-1.5 px-4">
      {rows.map(({ Icon, tone, width, offset }, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 shadow-sm ${width} ${offset}`}
        >
          <Icon className={`size-3 shrink-0 ${tone}`} />
          <Bar className="flex-1" />
        </div>
      ))}
    </div>
  );
}

export function OverlaysIllustration() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-y-3 left-3 right-[36%] rounded-sm border border-border bg-background/70 p-2">
        <Bar className="w-3/4" />
        <Bar className="mt-1.5 w-1/2" />
      </div>
      <div className="absolute inset-y-0 right-0 w-[44%] border-l border-border bg-card p-2.5 shadow-lg">
        <Bar className="w-2/3 bg-muted-foreground/50" />
        <Bar className="mt-2 w-full" />
        <Bar className="mt-1.5 w-3/4" />
      </div>
    </div>
  );
}

export function ActionsIllustration() {
  return (
    <div className="relative w-full px-4">
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 shadow-sm">
        <ChevronLeft className="size-3 text-muted-foreground" />
        <span className="text-[10px] font-medium text-foreground">Message</span>
        <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
          <RotateCw className="size-3" />
          <Pencil className="size-3" />
          <Trash2 className="size-3" />
        </span>
      </div>
      <Bar className="mt-3 w-full" />
      <Bar className="mt-1.5 w-2/3" />
      <Bar className="mt-1.5 w-[90%]" />
      <span className="absolute -bottom-3 right-6 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
        <Plus className="size-3.5" />
      </span>
    </div>
  );
}

export function LayoutsIllustration({ current }) {
  const ids = ['sidebar', 'sidebar-inset', 'app-bar', 'floating'];
  return (
    <div className="grid w-full grid-cols-4 gap-2 px-3">
      {ids.map((id) => (
        <LayoutPreview
          key={id}
          layoutId={id}
          className={`h-14 w-full ${id === current ? 'ring-2 ring-primary ring-offset-2 ring-offset-muted' : ''}`}
        />
      ))}
    </div>
  );
}

/**
 * Swatches of the first available themes, current theme first and outlined.
 * Uses the primary of the active mode, so dark themes never draw black on black.
 */
export function ThemesIllustration({ themes, current, mode, countLabel }) {
  const list = [...themes];
  const index = list.findIndex((theme) => theme.name === current);
  if (index > 0) list.unshift(...list.splice(index, 1));
  const shown = list.slice(0, 8);
  return (
    <div className="flex w-full flex-col items-center gap-2 px-3">
      <div className="flex flex-wrap justify-center gap-1.5">
        {shown.map((theme) => {
          const colors = theme.colors?.[mode] ?? theme.colors?.light ?? {};
          const active = theme.name === current;
          return (
            <span
              key={theme.name}
              className={`flex h-7 w-8 flex-col items-center justify-center gap-1 rounded-md border ${active ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
              style={{ background: colors.background }}
            >
              <span
                className="block h-1.5 w-4 rounded-sm"
                style={{ background: colors.primary }}
              />
              <span
                className="block h-0.5 w-4 rounded-full opacity-40"
                style={{ background: colors.foreground }}
              />
            </span>
          );
        })}
      </div>
      {countLabel && (
        <span className="font-mono text-[10px] text-muted-foreground">{countLabel}</span>
      )}
    </div>
  );
}

export function LanguageIllustration({ lang, timeZone }) {
  const now = new Date();
  const fmt = (locale) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone,
      }).format(now);
    } catch {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(now);
    }
  };
  const tiles = [
    { code: 'en', hello: 'Good morning' },
    { code: 'fr', hello: 'Bonjour' },
  ];
  return (
    <div className="grid w-full grid-cols-2 gap-2 px-3">
      {tiles.map((tile) => (
        <div
          key={tile.code}
          className={`min-w-0 rounded-md border bg-card px-2.5 py-2 ${tile.code === lang ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
        >
          <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
            {tile.code}
            {tile.code === lang && <Check className="size-2.5 text-primary-ink" />}
          </span>
          <span className="block truncate text-xs font-semibold text-foreground">{tile.hello}</span>
          <span className="block truncate font-mono text-[9px] text-muted-foreground">
            {fmt(tile.code)}
          </span>
        </div>
      ))}
    </div>
  );
}
