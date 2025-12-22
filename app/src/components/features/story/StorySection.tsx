import { type FC, type ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';

interface StorySectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  depth: number; // 1-6, affects visual styling
  defaultOpen?: boolean;
  children: ReactNode;
  isEmpty?: boolean;
}

/**
 * StorySection - Collapsible section for grouping story fields
 * Uses ocean depth metaphor with deeper sections having darker styling
 */
export const StorySection: FC<StorySectionProps> = ({
  title,
  subtitle,
  icon,
  depth,
  defaultOpen = false,
  children,
  isEmpty = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { light } = useHaptics();

  const handleToggle = async () => {
    await light();
    setIsOpen(!isOpen);
  };

  // Depth-based opacity for background
  const getDepthOpacity = () => {
    const opacities = ['0.05', '0.04', '0.035', '0.03', '0.025', '0.02'];
    return opacities[depth - 1] || '0.05';
  };

  return (
    <div className="mb-3">
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between rounded-2xl border border-glass-border px-4 py-3 text-left transition-colors hover:bg-glass-bg-hover"
        style={{ backgroundColor: `rgba(255, 255, 255, ${getDepthOpacity()})` }}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-glass-bg text-biolum-cyan">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-medium text-mist-white">{title}</h3>
            {subtitle && <p className="text-xs text-mist-white/50">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEmpty && (
            <span className="rounded-full bg-glass-bg px-2 py-0.5 text-xs text-mist-white/40">
              empty
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChevronDown size={20} className="text-mist-white/60" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2 pl-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
