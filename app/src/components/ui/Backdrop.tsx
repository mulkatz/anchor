import { cn } from '../../utils/cn';

interface BackdropProps {
  isVisible: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Backdrop component for overlays and modals
 * Provides a darkened background with smooth transitions
 */
export const Backdrop = ({ isVisible, onClick, className }: BackdropProps) => {
  return (
    <div
      className={cn(
        'absolute inset-0 z-40 bg-black transition-opacity duration-300 ease-out',
        isVisible ? 'pointer-events-auto opacity-70' : 'pointer-events-none opacity-0',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={-1}
      aria-label="Close"
    />
  );
};
