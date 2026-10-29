/**
 * CSS drawings of the shell layouts, in the current theme's tokens so they follow light
 * and dark. Used by the Layouts page and the Home card.
 */

const line = 'block rounded-[3px] bg-foreground/15';
const head = 'block rounded-[3px] bg-foreground/35';

function Lines({ compact }) {
  return (
    <>
      <i className={`${head} ${compact ? 'h-1 w-1/2' : 'h-2 w-[45%]'}`} />
      <i className={`${line} ${compact ? 'h-[3px]' : 'h-1.5'} w-[85%]`} />
      {!compact && <i className={`${line} h-1.5 w-[65%]`} />}
    </>
  );
}

function Cards({ compact }) {
  return (
    <span className={`mt-auto grid grid-cols-2 ${compact ? 'gap-1' : 'gap-1.5'}`}>
      <span
        className={`block rounded-[4px] border border-border bg-card ${compact ? 'h-3' : 'h-10'}`}
      />
      <span
        className={`block rounded-[4px] border border-border bg-card ${compact ? 'h-3' : 'h-10'}`}
      />
    </span>
  );
}

function Content({ compact, className = '' }) {
  return (
    <span
      className={`flex min-w-0 flex-1 flex-col ${compact ? 'gap-1 p-1.5' : 'gap-1.5 p-2.5'} ${className}`}
    >
      <Lines compact={compact} />
      <Cards compact={compact} />
    </span>
  );
}

function Nav({ compact, className = '' }) {
  return (
    <span
      className={`flex flex-none flex-col ${compact ? 'w-[28%] gap-1 p-1.5' : 'w-[30%] gap-1.5 p-2.5'} ${className}`}
    >
      <i className={`block rounded-[3px] bg-primary ${compact ? 'h-[3px]' : 'h-1.5'} w-[80%]`} />
      <i className={`${line} ${compact ? 'h-[3px]' : 'h-1.5'} w-[70%]`} />
      <i className={`${line} ${compact ? 'h-[3px]' : 'h-1.5'} w-[55%]`} />
      {!compact && <i className={`${line} h-1.5 w-[62%]`} />}
    </span>
  );
}

function Bar({ compact, className = '' }) {
  return (
    <span
      className={`flex flex-none items-center ${compact ? 'h-3 gap-1 px-1.5' : 'h-6 gap-1.5 px-2.5'} ${className}`}
    >
      <i className={`block rounded-[2px] bg-foreground/80 ${compact ? 'size-1.5' : 'size-2.5'}`} />
      <i className={`block rounded-full bg-primary ${compact ? 'h-[3px] w-3' : 'h-1.5 w-6'}`} />
      <i className={`${line} ${compact ? 'h-[3px] w-2.5' : 'h-1.5 w-5'}`} />
      <i className={`${line} ${compact ? 'h-[3px] w-2.5' : 'h-1.5 w-5'}`} />
    </span>
  );
}

function Window({ className, compact }) {
  return (
    <span
      className={`absolute flex flex-col overflow-hidden rounded-[5px] border border-border bg-background shadow-[0_6px_14px_-8px_rgb(0_0_0/0.35)] ${className}`}
    >
      <span
        className={`flex flex-none gap-0.5 border-b border-border ${compact ? 'h-1.5 px-1' : 'h-3 items-center px-1.5'}`}
      >
        {!compact &&
          [0, 1, 2].map((i) => (
            <i
              key={i}
              className="block size-1 rounded-full bg-foreground/30"
            />
          ))}
      </span>
      <span className={`flex flex-col ${compact ? 'gap-0.5 p-1' : 'gap-1 p-1.5'}`}>
        <i className={`${head} ${compact ? 'h-[3px] w-1/2' : 'h-1.5 w-1/2'}`} />
        <i className={`${line} ${compact ? 'h-[2px]' : 'h-1'} w-[80%]`} />
      </span>
    </span>
  );
}

function Drawing({ id, compact }) {
  switch (id) {
    case 'sidebar-inset':
      return (
        <span className="flex h-full bg-sidebar">
          <Nav compact={compact} />
          <Content
            compact={compact}
            className={`rounded-[6px] border border-border bg-background ${compact ? 'my-1 mr-1' : 'my-2 mr-2'}`}
          />
        </span>
      );
    case 'app-bar':
      return (
        <span className="flex h-full flex-col bg-background">
          <Bar
            compact={compact}
            className="border-b border-border"
          />
          <Content compact={compact} />
        </span>
      );
    case 'app-bar-inset':
      return (
        <span className="flex h-full flex-col bg-sidebar">
          <Bar compact={compact} />
          <Content
            compact={compact}
            className={`rounded-[6px] border border-border bg-background ${compact ? 'mx-1 mb-1' : 'mx-2 mb-2'}`}
          />
        </span>
      );
    case 'floating':
      return (
        <span className="relative flex h-full bg-gradient-to-br from-primary/15 via-background to-background">
          <Nav
            compact={compact}
            className={`rounded-[6px] border border-border bg-background/70 shadow-[0_6px_14px_-8px_rgb(0_0_0/0.3)] backdrop-blur-sm ${compact ? 'm-1' : 'm-2'}`}
          />
          <Content compact={compact} />
          <span
            className={`absolute flex gap-0.5 rounded-full border border-border bg-background/80 ${compact ? 'top-1 right-1 p-0.5' : 'top-2 right-2 gap-1 p-1'}`}
          >
            <i className={`block rounded-full bg-foreground/30 ${compact ? 'size-1' : 'size-2'}`} />
            <i className={`block rounded-full bg-foreground/30 ${compact ? 'size-1' : 'size-2'}`} />
          </span>
        </span>
      );
    case 'windows':
      return (
        <span className="relative flex h-full flex-col bg-gradient-to-br from-primary/15 via-muted to-muted">
          <Window
            compact={compact}
            className="top-[10%] left-[8%] h-[42%] w-[52%]"
          />
          <Window
            compact={compact}
            className="top-[32%] left-[40%] h-[42%] w-[52%]"
          />
          <span
            className={`absolute inset-x-0 bottom-0 flex items-center justify-center bg-background/80 ${compact ? 'h-2 gap-0.5' : 'h-4 gap-1'}`}
          >
            {['bg-foreground/80', 'bg-primary', 'bg-foreground/25', 'bg-foreground/25'].map(
              (tone, i) => (
                <i
                  key={i}
                  className={`block rounded-[2px] ${tone} ${compact ? 'size-1' : 'size-2'}`}
                />
              ),
            )}
          </span>
        </span>
      );
    default:
      return (
        <span className="flex h-full bg-background">
          <Nav
            compact={compact}
            className="border-r border-border bg-sidebar"
          />
          <Content compact={compact} />
        </span>
      );
  }
}

/**
 * @param {{ id: string; label?: string; compact?: boolean; className?: string }} props
 * Pass `label` to expose the drawing as an image; without it the drawing is decorative.
 */
export default function LayoutSchematic({ id, label, compact = false, className = '' }) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`block overflow-hidden rounded-[8px] border border-border shadow-[0_8px_20px_-14px_rgb(16_24_40/0.35)] ${className}`}
    >
      <Drawing
        id={id}
        compact={compact}
      />
    </span>
  );
}
