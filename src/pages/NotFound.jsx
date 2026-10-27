import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center font-body text-foreground">
      <p className="font-mono text-xs text-muted-foreground">404</p>
      <h1 className="font-heading mt-2 text-2xl font-semibold tracking-[-0.02em]">
        {t('notFound.title')}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('notFound.body')}{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground [overflow-wrap:anywhere]">
          #{pathname}
        </code>
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground! no-underline! shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft
          className="size-4"
          aria-hidden
        />
        {t('notFound.home')}
      </Link>
    </div>
  );
}
