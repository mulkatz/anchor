import { type FC, type PropsWithChildren, type ReactNode, Children } from 'react';
import { cn } from '../../utils/cn';

/**
 * SettingSection Component
 * Glass morphism card wrapper for grouped settings
 * Children are separated by dividers automatically
 */

interface SettingSectionProps extends PropsWithChildren {
  title?: string;
  className?: string;
}

export const SettingSection: FC<SettingSectionProps> = ({ title, className, children }) => {
  // Convert children to array for mapping
  const childArray = Children.toArray(children);

  return (
    <div className="mb-6">
      {/* Optional section title */}
      {title && (
        <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-mist-white/50">
          {title}
        </h3>
      )}

      {/* Glass card wrapper */}
      <div
        className={cn(
          'overflow-hidden rounded-3xl',
          'border border-glass-border',
          'bg-glass-bg backdrop-blur-glass',
          'shadow-glass',
          className
        )}
      >
        {/* Render children with dividers */}
        {childArray.map((child, index) => (
          <div key={index}>
            {child}
            {/* Divider between items (not after last item) */}
            {index < childArray.length - 1 && <div className="border-b border-glass-border" />}
          </div>
        ))}
      </div>
    </div>
  );
};
