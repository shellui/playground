import { useTranslation } from 'react-i18next';
import { Highlight, themes } from 'prism-react-renderer';

/**
 * Renders a code sample with syntax highlighting. Label from i18n (e.g. "Code sample").
 */
export default function CodeBlock({ labelKey = 'codeSample', code, language = 'javascript' }) {
  const { t } = useTranslation();

  return (
    <section className="mt-6">
      <h3 className="font-heading text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {t(labelKey)}
      </h3>
      <div className="rounded-lg border border-border overflow-hidden bg-[#1e1e1e]">
        <Highlight theme={themes.vsDark} code={code.trim()} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} text-sm overflow-x-auto p-4 m-0`}
              style={{ ...style, background: undefined }}
            >
              <code className="font-mono">
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
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
