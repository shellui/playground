import { Fragment } from 'react';

/**
 * Renders translated text with `code` spans and **bold** runs, so strings can stay
 * plain text in i18n and still show API names in mono.
 */
export default function Inline({ text }) {
  const parts = String(text).split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return (
        <code
          key={i}
          className="rounded border border-border bg-muted px-1 py-px font-mono text-[0.86em] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 3) {
      return (
        <strong
          key={i}
          className="font-semibold text-foreground"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
