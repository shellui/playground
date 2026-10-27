import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Highlight, themes } from 'prism-react-renderer';
import { Check, Copy } from 'lucide-react';

function CopyButton({ text }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard can be blocked inside an iframe; fall back to a hidden textarea.
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-2 py-1 text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? (
        <Check
          className="size-3.5"
          aria-hidden
        />
      ) : (
        <Copy
          className="size-3.5"
          aria-hidden
        />
      )}
      <span aria-live="polite">{copied ? t('home.copied') : t('home.copy')}</span>
    </button>
  );
}

/**
 * Dark code panel with syntax highlighting. Long lines wrap, so it never scrolls sideways.
 *
 * @param {{
 *   code: string;
 *   language?: string;
 *   labelKey?: string | null;  // section heading above the panel, null to hide it
 *   title?: string;            // file name shown in the panel header
 *   copy?: boolean;            // show a Copy button in the panel header
 *   className?: string;
 * }} props
 */
export default function CodeBlock({
  labelKey = 'codeSample',
  code,
  language = 'javascript',
  title,
  copy = false,
  className = 'mt-6',
}) {
  const { t } = useTranslation();
  const source = code.trim();
  const hasHeader = Boolean(title || copy);

  return (
    <section className={`min-w-0 ${className}`}>
      {labelKey && (
        <h3 className="font-heading text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
          {t(labelKey)}
        </h3>
      )}
      <div className="h-full overflow-hidden rounded-lg border border-border bg-[#0f121a] dark:border-white/10">
        {hasHeader && (
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
            <span className="truncate font-mono text-xs text-white/60">{title}</span>
            {copy && <CopyButton text={source} />}
          </div>
        )}
        <Highlight
          theme={themes.vsDark}
          code={source}
          language={language}
        >
          {({ className: hlClass, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${hlClass} m-0 p-4 text-[13px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]`}
              style={{ ...style, background: undefined }}
            >
              <code className="font-mono">
                {tokens.map((line, i) => (
                  <div
                    key={i}
                    {...getLineProps({ line })}
                  >
                    {line.map((token, key) => (
                      <span
                        key={key}
                        {...getTokenProps({ token })}
                      />
                    ))}
                  </div>
                ))}
              </code>
            </pre>
          )}
        </Highlight>
      </div>
    </section>
  );
}
