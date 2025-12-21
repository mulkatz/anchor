import { type FC, type ReactNode } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Toggle } from './Toggle';
import { cn } from '../../utils/cn';

/**
 * SettingRow Component
 * Reusable row for settings with icon, label, description, and action
 * Adapted from cap2cal's SettingRow with bioluminescent styling
 */

interface SettingRowProps {
  icon: ReactNode;
  label: string;
  description?: string;
  value?: string;
  onClick?: () => void;
  toggle?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  destructive?: boolean;
  hideChevron?: boolean;
  customRight?: ReactNode; // For custom right-side content (e.g., slider)
  loading?: boolean; // Show spinner instead of chevron during async operations
}

export const SettingRow: FC<SettingRowProps> = ({
  icon,
  label,
  description,
  value,
  onClick,
  toggle = false,
  checked = false,
  onChange,
  destructive = false,
  hideChevron = false,
  customRight,
  loading = false,
}) => {
  const isClickable = !toggle && onClick;

  // Don't disable button for toggle rows - iOS blocks touch events to children of disabled buttons
  const isDisabled = !toggle && !onClick;

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={isDisabled}
      className={cn(
        'flex w-full items-center justify-between p-4 text-left transition-all duration-300 ease-viscous',
        isClickable && 'cursor-pointer active:bg-glass-bg-hover',
        (toggle || isDisabled) && 'cursor-default'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0', destructive ? 'text-danger' : 'text-biolum-cyan')}>
          {icon}
        </div>

        {/* Label & Description */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              'text-base font-semibold',
              destructive ? 'text-danger' : 'text-mist-white'
            )}
          >
            {label}
          </span>
          {description && <span className="mt-0.5 text-xs text-mist-white/50">{description}</span>}
        </div>
      </div>

      {/* Right-side content */}
      <div className="ml-3 flex flex-shrink-0 items-center gap-2">
        {/* Custom content (e.g., slider) */}
        {customRight && <div onClick={(e) => e.stopPropagation()}>{customRight}</div>}

        {/* Value display */}
        {value && !toggle && !customRight && (
          <span className="text-sm text-mist-white/60">{value}</span>
        )}

        {/* Toggle switch */}
        {toggle && onChange && <Toggle checked={checked} onChange={onChange} aria-label={label} />}

        {/* Chevron or Loading spinner */}
        {!toggle &&
          !hideChevron &&
          onClick &&
          (loading ? (
            <Loader2 size={18} className="animate-spin text-biolum-cyan" />
          ) : (
            <ChevronRight size={20} className="text-mist-white/40" />
          ))}
      </div>
    </button>
  );
};
