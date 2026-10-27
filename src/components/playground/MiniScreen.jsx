/**
 * A small picture of the shell: sidebar strip, neutral content lines and an optional
 * scrim. Children are drawn above it (the overlay being configured). Under 760 px the
 * sidebar strip hides, like the real shell.
 *
 * @param {{ label: string; scrim?: boolean; children?: import('react').ReactNode; className?: string; sidebar?: boolean }} props
 */
export default function MiniScreen({
  label,
  scrim = false,
  children,
  className = '',
  sidebar = true,
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative mt-1 flex h-[330px] overflow-hidden rounded-[10px] border border-border bg-background shadow-[0_12px_32px_-18px_rgb(16_24_40/0.3)] max-[759px]:h-[300px] ${className}`}
    >
      {sidebar && (
        <div className="flex w-[118px] flex-none flex-col gap-[9px] border-r border-border bg-sidebar px-2.5 py-3 max-[759px]:hidden">
          <span className="mb-1.5 block h-[9px] w-[54px] rounded-[3px] bg-foreground/60" />
          <i className="block h-1.5 rounded-[3px] bg-primary/60" />
          <i className="block h-1.5 rounded-[3px] bg-foreground/13" />
          <i className="block h-1.5 w-[70%] rounded-[3px] bg-foreground/13" />
          <i className="block h-1.5 rounded-[3px] bg-foreground/13" />
          <i className="block h-1.5 w-[60%] rounded-[3px] bg-foreground/13" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-[9px] px-5 py-[18px]">
        <b className="pg-mini-head" />
        <i className="pg-mini-line" />
        <i className="pg-mini-line w-[82%]" />
        <i className="pg-mini-line w-[64%]" />
        <div className="mt-1.5 h-[70px] rounded-lg border border-border bg-card" />
        <i className="pg-mini-line w-[76%]" />
        <i className="pg-mini-line w-1/2" />
      </div>
      {scrim && <div className="pg-scrim absolute inset-0 z-[1]" />}
      {children}
    </div>
  );
}
