import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-void-blue/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center px-4 pt-safe pb-safe"
          >
            <div className="pointer-events-auto w-full max-w-md">
              <div
                className={cn(
                  'rounded-2xl border border-glass-border',
                  'bg-void-blue/95 backdrop-blur-glass',
                  'p-6 shadow-glass'
                )}
              >
                {/* Icon */}
                {destructive && (
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-danger/20 p-3">
                      <AlertTriangle size={32} className="text-danger" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <h2 className="mb-2 text-center text-xl font-medium text-mist-white">{title}</h2>
                <p className="mb-6 text-center text-sm text-mist-white/70">{message}</p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className={cn(
                      'flex-1 rounded-full px-4 py-3',
                      'border border-glass-border bg-glass-bg',
                      'text-sm font-medium text-mist-white',
                      'transition-all duration-300 ease-viscous',
                      'hover:bg-glass-bg-hover active:scale-95'
                    )}
                  >
                    {cancelText}
                  </button>

                  <button
                    onClick={onConfirm}
                    className={cn(
                      'flex-1 rounded-full px-4 py-3',
                      'text-sm font-medium',
                      'transition-all duration-300 ease-viscous',
                      'active:scale-95',
                      destructive
                        ? 'bg-danger text-white shadow-[0_0_20px_rgba(255,107,107,0.3)]'
                        : 'bg-biolum-cyan text-void-blue shadow-glow-md'
                    )}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
