import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

/**
 * Glass morphism card component
 * Uses backdrop blur, semi-transparent background, and subtle borders
 */
export function GlassCard({
  children,
  hover = false,
  glow = false,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-glass-border bg-glass-bg shadow-glass backdrop-blur-glass',
        'transition-all duration-300 ease-viscous',
        hover && 'hover:-translate-y-1 hover:border-biolum-cyan/30 hover:shadow-glow-md',
        glow && 'shadow-glow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
