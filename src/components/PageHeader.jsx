/**
 * Shared page title + one-line purpose. Keep first viewports short for screenshots.
 */
export default function PageHeader({ title, description, children }) {
  return (
    <header className="mb-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </header>
  );
}
