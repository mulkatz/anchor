import { type FC } from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  /** Size of the spinner - default is 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Optional className for the container */
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-12 w-12 border-4',
  lg: 'h-16 w-16 border-4',
};

/**
 * Consistent loading spinner with bioluminescent glow
 * Always uses transparent background
 */
export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full',
          'border-biolum-cyan border-t-transparent',
          // 'shadow-glow-md',
          sizeClasses[size]
        )}
      />
    </div>
  );
};
