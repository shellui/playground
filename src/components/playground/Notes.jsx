import { useTranslation } from 'react-i18next';
import Inline from './Inline';

/** "Good to know": facts from the SDK types or the shell code, with `code` spans. */
export default function Notes({ items, title }) {
  const { t } = useTranslation();
  return (
    <section className="pg-notes min-w-0 rounded-xl border border-border bg-card text-card-foreground">
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="font-heading text-sm font-semibold">{title ?? t('pg.goodToKnow')}</h2>
      </div>
      <ul className="m-0 list-disc py-2.5 pr-4 pl-[34px] text-[13px] leading-[1.55] text-muted-foreground">
        {items.map((item) => (
          <li
            key={item}
            className="my-1"
          >
            <Inline text={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Two cards side by side, one column under 1180 px. */
export function Below({ children }) {
  return (
    <div className="mt-4 grid gap-4 min-[1180px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      {children}
    </div>
  );
}
