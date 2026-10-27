import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import shellui from '@shellui/sdk';
import { Plus } from 'lucide-react';

/**
 * Route the Modals and drawers page opens inside the shell's overlays. It reports its
 * size so `size: 'content'` overlays grow with it, and closes itself with the SDK.
 */
export default function OverlaySample() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const inDrawer = params.get('in') === 'drawer';
  const [count, setCount] = useState(3);

  // Has an effect only when the overlay was opened with size 'content'.
  useEffect(() => shellui.overlay.autoSize(), []);

  const close = () => (inDrawer ? shellui.closeDrawer() : shellui.closeModal());

  return (
    <div className="p-5 font-body text-foreground">
      <p className="m-0 font-mono text-xs text-muted-foreground">
        {inDrawer ? t('overlays.drawer') : t('overlays.modal')}
      </p>
      <h1 className="mt-1 font-heading text-xl font-semibold">{t('sample.title')}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {t('sample.body', { where: t(inDrawer ? 'sample.whereDrawer' : 'sample.whereModal') })}
      </p>
      <ul className="mt-4 mb-0 list-none divide-y divide-border rounded-lg border border-border p-0">
        {Array.from({ length: count }, (_, i) => (
          <li
            key={i}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm"
          >
            <span
              className="size-2.5 rounded-sm bg-primary/60"
              aria-hidden
            />
            {t('sample.row', { n: i + 1 })}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCount((n) => n + 1)}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus
            className="size-4"
            aria-hidden
          />
          {t('sample.addRow')}
        </button>
        <button
          type="button"
          onClick={close}
          className="inline-flex h-9 cursor-pointer items-center rounded-md px-3 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('sample.close')}
        </button>
      </div>
    </div>
  );
}
