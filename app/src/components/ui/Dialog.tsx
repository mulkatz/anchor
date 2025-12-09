import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DialogProps {
  children: ReactNode;
  onClose?: () => void;
  closeOnClickOutside?: boolean;
  full?: boolean;
  noCard?: boolean;
}

export const Dialog = ({
  children,
  onClose,
  closeOnClickOutside = false,
  full,
  noCard = false,
}: DialogProps) => {
  const dialogContent = (
    <div className={cn('fixed inset-0 z-[100]', full && 'bg-gradient-to-br from-primary-900 to-primary-950')}>
      {/* Backdrop layer - separate from content */}
      {!noCard && (
        <div
          className={'absolute inset-0 bg-black/85 backdrop-blur-sm'}
          onClick={closeOnClickOutside ? onClose : undefined}
        />
      )}
      {full && (
        <div
          className={'absolute inset-0 bg-gradient-to-t from-black/50 to-black/20'}
          onClick={closeOnClickOutside ? onClose : undefined}
        />
      )}

      {/* Content layer - isolated from backdrop */}
      <div
        className={'pointer-events-none absolute inset-0 flex max-h-screen items-center justify-center p-6'}
        onClick={closeOnClickOutside ? onClose : undefined}>
        {/* Dialog container with smooth fade + scale animation */}
        <div
          className={'pointer-events-auto flex max-h-[90%] w-full max-w-md animate-fadeIn flex-col'}
          onClick={(e) => e.stopPropagation()}>
          {onClose && (
            <div
              className={'flex w-full items-end justify-end pb-1 pr-0'}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/30"
                aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>
          )}

          {/* Conditionally render card wrapper or content directly */}
          {noCard ? (
            children
          ) : (
            <div
              className={cn(
                'relative overflow-hidden rounded-3xl bg-white shadow-2xl',
                'border border-gray-200 dark:border-gray-700 dark:bg-gray-800'
              )}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};
