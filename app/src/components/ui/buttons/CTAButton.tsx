import { cn } from '../../../utils/cn';
import { type LucideIcon } from 'lucide-react';
import { ClipLoader } from 'react-spinners';

interface CTAButtonProps {
  loading?: boolean;
  text: string;
  icon?: LucideIcon;
  iconSize?: number;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  highlight?: boolean;
  'data-testid'?: string;
}

/**
 * CTA (Call to Action) Button
 * Primary button component with loading state and icon support
 * Uses lucide-react icons only
 */
export const CTAButton = ({
  loading,
  text,
  icon: Icon,
  iconSize = 20,
  onClick,
  className,
  disabled,
  highlight,
  'data-testid': dataTestId,
}: CTAButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      className={cn(
        'flex h-[42px] w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 shadow-md',
        'text-[14px] font-extrabold',

        // Conditional styling based on disabled state
        disabled
          ? 'transform cursor-not-allowed bg-gray-400 text-gray-200 transition-all'
          : highlight
            ? 'transform bg-primary-600 text-white transition-all hover:bg-primary-700 active:bg-primary-800'
            : 'transform bg-primary-500 text-white transition-all hover:bg-primary-600 active:bg-primary-700',
        className
      )}
    >
      {/* Only show the icon if not loading */}
      {Icon && !loading && <Icon size={iconSize} />}

      {/* Loading Spinner */}
      {loading && (
        <div className={'flex h-[24px] w-[24px] items-center justify-center'}>
          <ClipLoader color={'#ffffff'} size={18} />
        </div>
      )}

      {/* Button Text */}
      <span className={'truncate'}>{text}</span>
    </button>
  );
};
