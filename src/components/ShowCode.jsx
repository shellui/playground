import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import CodeBlock from './CodeBlock';

/**
 * Collapsed code samples so recipe first-viewports stay interactive, not Prism walls.
 * @param {{ samples: Array<{ title?: string, hint?: string, code: string, language?: string }> }} props
 */
export default function ShowCode({
  samples = [],
  className = 'mt-10 border-t border-border pt-4',
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (samples.length === 0) return null;

  return (
    <div className={className}>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronRight
          className={['size-4 transition-transform', open ? 'rotate-90' : ''].join(' ')}
        />
        {open ? t('hideCode') : t('showCode')}
      </button>
      {open ? (
        <div className="mt-4 space-y-8">
          {samples.map((sample, index) => (
            <div key={sample.title ?? index}>
              {sample.title ? (
                <h2 className="font-heading text-lg font-medium text-foreground mb-1">
                  {sample.title}
                </h2>
              ) : null}
              {sample.hint ? (
                <p className="text-sm text-muted-foreground mb-2">{sample.hint}</p>
              ) : null}
              <CodeBlock
                code={sample.code}
                language={sample.language}
                className="mt-2"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
