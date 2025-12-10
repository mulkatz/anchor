import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { OceanicBubbles } from '@/components/effects/OceanicBubbles';
import { Header } from './Header';
import { Footer } from './Footer';

interface PageWrapperProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showBubbles?: boolean;
}

/**
 * Common page wrapper with oceanic bubbles background
 * Includes optional header and footer
 */
export function PageWrapper({
  children,
  showHeader = true,
  showFooter = true,
  showBubbles = true,
}: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-void-blue"
    >
      {/* Background Effects */}
      {showBubbles && <OceanicBubbles />}

      {/* Header */}
      {showHeader && <Header />}

      {/* Main Content */}
      <main className="relative z-10">{children}</main>

      {/* Footer */}
      {showFooter && <Footer />}
    </motion.div>
  );
}
