import { type LucideIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface IconButtonProps {
  onClick?: () => void;
  icon: LucideIcon;
  iconSize?: number;
  className?: string;
  active?: boolean;
  'data-testid'?: string;
}

/**
 * Icon Button
 * Circular button with icon, perfect for toolbars and FABs
 * Uses lucide-react icons only
 */
export const IconButton = ({
  onClick,
  icon: Icon,
  iconSize = 24,
  className,
  active,
  'data-testid': dataTestId,
}: IconButtonProps) => {
  return (
    <button
      onClick={onClick}
      data-testid={dataTestId}
      className={cn(
        'box-border flex h-[48px] w-[48px] items-center justify-center rounded-full bg-primary-800 p-3 text-white shadow-md',
        { 'bg-primary-600': active },
        'transform transition-all hover:bg-primary-700 active:bg-primary-600',
        className
      )}
      aria-label="Icon button"
    >
      <Icon size={iconSize} />
    </button>
  );
};

/**
 * Round Icon Button (Smaller variant)
 * Uses lucide-react icons only
 */
export const RoundIconButton = ({
  onClick,
  icon: Icon,
  iconSize = 20,
  className,
  active,
}: IconButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'box-border flex h-[36px] items-center justify-center rounded-full border border-gray-300 bg-white p-3.5',
        { 'bg-gray-100 text-primary-600': active },
        'hover:bg-gray-50 active:bg-gray-100',
        className
      )}
      aria-label="Round icon button"
    >
      <Icon size={iconSize} />
    </button>
  );
};
