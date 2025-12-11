import { type FC } from 'react';
import { cn } from '../../utils/cn';

/**
 * Toggle Component
 * Bioluminescent toggle switch matching Anchor's aesthetic
 * Adapted from cap2cal with cyan glow styling
 */

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  'aria-label'?: string;
  disabled?: boolean;
}

export const Toggle: FC<ToggleProps> = ({
  checked,
  onChange,
  'aria-label': ariaLabel,
  disabled = false,
}) => {
  return (
    <label
      className={cn(
        'relative inline-block h-6 w-11 flex-shrink-0',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      )}
      onClick={(e) => e.stopPropagation()} // Prevent parent button click
    >
      {/* Hidden checkbox for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
        disabled={disabled}
        className="peer sr-only" // Screen reader only
      />

      {/* Track */}
      <span
        className={cn(
          'absolute inset-0 rounded-full transition-all duration-300 ease-viscous',
          checked ? 'bg-biolum-cyan shadow-glow-sm' : 'border border-mist-white/30 bg-mist-white/20'
        )}
      />

      {/* Thumb */}
      <span
        className={cn(
          'absolute left-1 top-1 h-4 w-4 rounded-full transition-transform duration-300 ease-viscous',
          checked ? 'translate-x-5 bg-void-blue' : 'bg-mist-white'
        )}
      />
    </label>
  );
};
