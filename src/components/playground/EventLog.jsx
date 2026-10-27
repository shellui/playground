import { useTranslation } from 'react-i18next';
import { GhostButton } from './Workbench';

/** Newest first. `rows` come from useEventLog(). */
export default function EventLog({ title, rows, onClear, empty }) {
  const { t } = useTranslation();
  return (
    <section
      aria-label={title}
      className="min-w-0 rounded-xl border border-border bg-card text-card-foreground"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="font-heading text-sm font-semibold">{title}</h2>
        <GhostButton
          onClick={onClear}
          className="h-8 px-2.5 text-[13px]"
          disabled={rows.length === 0}
        >
          {t('pg.clear')}
        </GhostButton>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-5 text-[13px] text-muted-foreground">{empty ?? t('pg.logEmpty')}</p>
      ) : (
        <ol
          className="m-0 list-none p-0 py-1"
          aria-live="polite"
        >
          {rows.map((row) => (
            <li
              key={row.id}
              className="grid grid-cols-[62px_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1 border-t border-border px-4 py-2 text-[13px] first:border-t-0 min-[760px]:grid-cols-[72px_112px_minmax(0,1fr)]"
            >
              <span className="font-mono text-xs text-muted-foreground">{row.time}</span>
              <code className="justify-self-start rounded border border-border bg-muted px-1.5 py-px font-mono text-xs text-foreground">
                {row.name}
              </code>
              <span className="min-w-0 truncate text-muted-foreground max-[759px]:col-start-2">
                {row.detail}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
