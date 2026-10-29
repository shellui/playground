import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Play } from 'lucide-react';
import CodeBlock from '../CodeBlock';
import { usePrefs } from './hooks';

const NARROW = '(max-width: 1179px)';

function useMedia(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatch(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);
  return match;
}

function useVisible(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export function RunButton({ label, onClick, disabled, icon: Icon = Play, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <Icon
        className="size-4"
        aria-hidden
      />
      {label}
    </button>
  );
}

export function GhostButton({ children, onClick, className = '', ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function Footer({ result, secondary, run, compact = false }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2.5 max-[759px]:gap-2 ${compact ? 'px-3 py-2.5' : 'px-4 py-3.5 max-[759px]:p-3'}`}
    >
      <div
        className={`min-w-0 flex-1 text-[13px] text-muted-foreground max-[759px]:basis-full ${compact ? 'truncate max-[759px]:hidden' : ''}`}
        aria-live={compact ? undefined : 'polite'}
      >
        {result}
      </div>
      {secondary && (
        <GhostButton
          onClick={secondary.onClick}
          className="max-[759px]:flex-1"
        >
          {secondary.label}
        </GhostButton>
      )}
      {run && (
        <RunButton
          {...run}
          className="max-[759px]:flex-[2]"
        />
      )}
    </div>
  );
}

/**
 * Options on the left; the drawing, the generated code and Run on the right. Under
 * 1180 px it stacks with the drawing, code and Run first, and the Run bar sticks to
 * the bottom while the options are on screen.
 *
 * @param {{ label: string; options: import('react').ReactNode; stage: import('react').ReactNode;
 *   stageLabel?: string; code?: string; fileName?: string; result?: import('react').ReactNode;
 *   secondary?: { label: string; onClick: () => void };
 *   run?: { label: string; onClick: () => void; disabled?: boolean; icon?: any } }} props
 */
export default function Workbench({
  label,
  options,
  stage,
  stageLabel,
  code,
  fileName,
  result,
  secondary,
  run,
}) {
  const { t } = useTranslation();
  const prefs = usePrefs();
  const narrow = useMedia(NARROW);
  const optionsRef = useRef(null);
  const footerRef = useRef(null);
  const optionsVisible = useVisible(optionsRef);
  const footerVisible = useVisible(footerRef);
  const headingId = useId();
  const sticky = narrow && optionsVisible && !footerVisible;

  return (
    <section
      aria-label={label}
      className="pg-bench grid overflow-hidden rounded-xl border border-border bg-card text-card-foreground min-[1180px]:grid-cols-[310px_minmax(0,1fr)]"
    >
      <div
        ref={optionsRef}
        role="group"
        aria-labelledby={headingId}
        className="order-2 min-w-0 border-t border-border px-[18px] pt-4 pb-2 min-[1180px]:order-1 min-[1180px]:border-t-0 min-[1180px]:border-r min-[1180px]:pt-[18px]"
      >
        <h2
          id={headingId}
          className="mb-3 font-heading text-[15px] font-semibold min-[1180px]:sr-only"
        >
          {t('pg.options')}
        </h2>
        {options}
      </div>
      <div className="order-1 flex min-w-0 flex-col min-[1180px]:order-2">
        <div className="pg-dots relative border-b border-border p-[22px] pt-9 [background-size:14px_14px] max-[759px]:p-3.5 max-[759px]:pt-8">
          <span className="absolute top-2.5 left-3.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye
              className="size-[13px]"
              aria-hidden
            />
            {stageLabel ?? t('pg.stage')}
          </span>
          {stage}
        </div>
        {code && prefs.showCode && (
          <CodeBlock
            labelKey={null}
            code={code}
            title={fileName}
            copy
            className="mx-4 mt-4 max-[759px]:mx-3 max-[759px]:mt-3"
          />
        )}
        <div ref={footerRef}>
          <Footer
            result={result}
            secondary={secondary}
            run={run}
          />
        </div>
      </div>
      {sticky && run && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)] backdrop-blur-sm">
          <Footer
            compact
            result={result}
            secondary={secondary}
            run={run}
          />
        </div>
      )}
    </section>
  );
}
