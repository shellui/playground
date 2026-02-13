import { forwardRef } from "react";

const variantStyles = {
  default:
    "border border-border/80 bg-muted/50 text-foreground [&>svg]:text-foreground",
  destructive:
    "border border-destructive/30 bg-destructive/5 text-destructive [&>svg]:text-destructive",
};

/**
 * Shadcn-style Alert with optional icon on the left.
 * Place an icon (e.g. from lucide-react) as first child, then AlertTitle and AlertDescription.
 * @see https://ui.shadcn.com/docs/components/radix/alert
 */
const Alert = forwardRef(
  ({ className = "", variant = "default", ...props }, ref) => {
    const classes = [
      "relative w-full rounded-lg border p-4",
      "[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4 [&>svg~*]:pl-7 [&>svg+*]:translate-y-[-3px]",
      variantStyles[variant] ?? variantStyles.default,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        role="alert"
        className={classes}
        {...props}
      />
    );
  }
);

Alert.displayName = "Alert";

const AlertTitle = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={["text-sm font-medium leading-snug text-foreground", className]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
));

AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={["mt-1.5 text-sm leading-relaxed text-muted-foreground [&_p]:leading-relaxed", className]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
));

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
