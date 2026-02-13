import { forwardRef } from 'react';

const variantStyles = {
  default:
    'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  destructive:
    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline:
    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  secondary:
    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeStyles = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
};

/**
 * Shadcn-style Button. Variants: default, destructive, outline, secondary, ghost, link.
 */
const Button = forwardRef(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      as: Component = 'button',
      ...props
    },
    ref
  ) => {
    const classes = [
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      variantStyles[variant] ?? variantStyles.default,
      sizeStyles[size] ?? sizeStyles.default,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <Component ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = 'Button';

export { Button };
