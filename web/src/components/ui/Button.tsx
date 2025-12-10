import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-biolum-cyan text-void-blue font-semibold
    shadow-glow-md hover:shadow-glow-lg
    hover:bg-biolum-cyan/90
    active:scale-95
  `,
  secondary: `
    bg-glass-bg border border-biolum-cyan/50 text-biolum-cyan
    backdrop-blur-glass
    hover:bg-glass-bg-hover hover:border-biolum-cyan
    active:scale-95
  `,
  ghost: `
    text-mist-white hover:text-biolum-cyan
    hover:bg-glass-bg
    active:scale-95
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
};

/**
 * Button component with Anchor's bioluminescent styling
 * Supports primary (cyan), secondary (glass), and ghost variants
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'transition-all duration-300 ease-viscous',
          'focus-ring',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
