import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/** Whole-card link into one page of the tour. */
export default function TourCard({ to, title, body, api, badge, children }) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground no-underline! transition-[border-color,transform,box-shadow] duration-200 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:hover:-translate-y-0.5"
    >
      <div
        className="flex h-[92px] items-center justify-center overflow-hidden border-b border-border bg-muted/60 bg-[radial-gradient(color-mix(in_oklab,var(--muted-foreground)_22%,transparent)_1px,transparent_1px)] [background-size:12px_12px] sm:h-[132px]"
        aria-hidden
      >
        {children}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading flex items-center gap-2 text-[15px] font-semibold text-foreground">
          {title}
          {badge}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="truncate font-mono text-xs text-muted-foreground">{api}</span>
          <ArrowRight
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-primary-ink motion-safe:group-hover:translate-x-[3px]"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
