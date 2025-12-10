import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

interface GlowOrbProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-40 h-40',
  lg: 'w-56 h-56',
  xl: 'w-72 h-72',
};

/**
 * Central pulsing bioluminescent orb for the hero section
 * Multiple layered rings with breathing animation
 */
export function GlowOrb({ className, size = 'lg' }: GlowOrbProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseTransition = {
    duration: 4,
    ease: [0.22, 1, 0.36, 1] as const,
    repeat: Infinity,
    repeatType: 'reverse' as const,
  };

  if (prefersReducedMotion) {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        {/* Static core */}
        <div
          className="absolute inset-0 rounded-full bg-biolum-cyan/30"
          style={{
            boxShadow: `
              0 0 40px rgba(100, 255, 218, 0.4),
              0 0 80px rgba(100, 255, 218, 0.2),
              inset 0 0 40px rgba(100, 255, 218, 0.3)
            `,
          }}
        />
        {/* Static inner glow */}
        <div
          className="absolute inset-[20%] rounded-full bg-biolum-cyan/50"
          style={{
            boxShadow: '0 0 30px rgba(100, 255, 218, 0.6)',
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer glow ring - slowest */}
      <motion.div
        className="absolute -inset-8 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(100, 255, 218, 0.1) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          ...baseTransition,
          duration: 6,
        }}
      />

      {/* Middle glow ring */}
      <motion.div
        className="absolute -inset-4 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(100, 255, 218, 0.15) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          ...baseTransition,
          duration: 5,
          delay: 0.5,
        }}
      />

      {/* Main orb body */}
      <motion.div
        className="absolute inset-0 rounded-full bg-biolum-cyan/20"
        style={{
          boxShadow: `
            0 0 40px rgba(100, 255, 218, 0.4),
            0 0 80px rgba(100, 255, 218, 0.2),
            inset 0 0 40px rgba(100, 255, 218, 0.3)
          `,
        }}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 40px rgba(100, 255, 218, 0.4), 0 0 80px rgba(100, 255, 218, 0.2), inset 0 0 40px rgba(100, 255, 218, 0.3)',
            '0 0 60px rgba(100, 255, 218, 0.5), 0 0 100px rgba(100, 255, 218, 0.3), inset 0 0 50px rgba(100, 255, 218, 0.4)',
            '0 0 40px rgba(100, 255, 218, 0.4), 0 0 80px rgba(100, 255, 218, 0.2), inset 0 0 40px rgba(100, 255, 218, 0.3)',
          ],
        }}
        transition={baseTransition}
      />

      {/* Inner bright core */}
      <motion.div
        className="absolute inset-[25%] rounded-full bg-biolum-cyan/40"
        style={{
          boxShadow: '0 0 30px rgba(100, 255, 218, 0.6)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          ...baseTransition,
          duration: 3,
          delay: 0.2,
        }}
      />

      {/* Center point - brightest */}
      <motion.div
        className="absolute inset-[40%] rounded-full bg-biolum-cyan/60"
        style={{
          boxShadow: '0 0 20px rgba(100, 255, 218, 0.8)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          ...baseTransition,
          duration: 2.5,
          delay: 0.4,
        }}
      />
    </div>
  );
}
