import { ReactElement } from 'react';
import { cn } from '../../../utils/cn';

interface IconButtonProps {
  onClick?: () => void;
  icon: ReactElement;
  className?: string;
  active?: boolean;
  'data-testid'?: string;
}

/**
 * Icon Button
 * Circular button with icon, perfect for toolbars and FABs
 */
export const IconButton = ({
  onClick,
  icon,
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
      aria-label="Icon button">
      {icon}
    </button>
  );
};

/**
 * Round Icon Button (Smaller variant)
 */
export const RoundIconButton = ({
  onClick,
  icon,
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
      aria-label="Round icon button">
      {icon}
    </button>
  );
};
