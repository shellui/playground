import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

/**
 * Group crumb, title, lede, the SDK calls the page covers and a Docs link.
 *
 * @param {{ group: string; icon: import('react').ComponentType<any>; title: string;
 *   lede: import('react').ReactNode; apis?: string[]; docs?: string; children?: import('react').ReactNode }} props
 */
export default function PageHeader({ group, icon: Icon, title, lede, apis = [], docs, children }) {
  const { t } = useTranslation();
  return (
    <header className="mb-6 max-w-[760px]">
      <p className="mb-2.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
        {Icon && (
          <Icon
            className="size-[13px]"
            aria-hidden
          />
        )}
        {group}
      </p>
      <h1 className="font-heading text-[26px] leading-[1.15] font-semibold tracking-[-0.022em] text-foreground min-[760px]:text-[30px]">
        {title}
      </h1>
      <p className="mt-2.5 mb-3.5 max-w-[68ch] text-[15.5px] leading-relaxed text-muted-foreground">
        {lede}
      </p>
      {(apis.length > 0 || docs) && (
        <div className="flex flex-wrap items-center gap-2.5">
          {apis.map((api) => (
            <code
              key={api}
              className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
            >
              {api}
            </code>
          ))}
          {docs && (
            <a
              href={docs}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-sm text-[13.5px] font-medium text-foreground! no-underline! hover:underline! focus-visible:outline-2 focus-visible:outline-ring"
            >
              {t('pg.docs')}
              <ArrowUpRight
                className="size-3.5"
                aria-hidden
              />
              <span className="sr-only">{t('pg.newTab')}</span>
            </a>
          )}
        </div>
      )}
      {children}
    </header>
  );
}
