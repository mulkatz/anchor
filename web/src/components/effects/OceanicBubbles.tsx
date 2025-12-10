import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  wobbleAmplitude: number;
  riseDistance: number;
  glow: number;
}

interface OceanicBubblesProps {
  count?: number;
  className?: string;
}

/**
 * Persistent oceanic bubble background
 * Creates a mesmerizing deep ocean atmosphere with bubbles that drift upward
 * with organic wobble motion. Adapted from the Anchor app for web.
 *
 * Performance optimized:
 * - GPU-accelerated (transform3d, willChange)
 * - Reduced motion support
 * - Configurable particle count
 */
export function OceanicBubbles({ count = 35, className = '' }: OceanicBubblesProps) {
  const prefersReducedMotion = useReducedMotion();

  // Generate bubbles with random properties (memoized)
  const bubbles = useMemo<Bubble[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = Math.random() * 4 + 2; // 2-6px

      return {
        id: i,
        x: Math.random() * 100, // 0-100% horizontal position
        y: Math.random() * 120, // 0-120% vertical (some start below viewport)
        size,
        duration: Math.random() * 20 + 25, // 25-45s (slow, meditative)
        delay: Math.random() * 15, // 0-15s stagger start
        opacity: Math.random() * 0.25 + 0.15, // 0.15-0.4 (subtle)
        wobbleAmplitude: Math.random() * 50 + 30, // 30-80px (larger = more drift)
        riseDistance: Math.random() * 80 - 200, // -120 to -200px (upward)
        glow: size * 1.5, // Proportional glow (3-9px)
      };
    });
  }, [count]);

  // Reduced motion: Show static bubbles
  if (prefersReducedMotion) {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        {bubbles.slice(0, 10).map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-biolum-cyan"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              opacity: bubble.opacity,
              boxShadow: `0 0 ${bubble.glow}px rgba(100, 255, 218, 0.4)`,
            }}
          />
        ))}
      </div>
    );
  }

  // Animated bubbles
  return (
    <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-biolum-cyan"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            boxShadow: `0 0 ${bubble.glow}px rgba(100, 255, 218, 0.4)`,
            // GPU acceleration
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity',
          }}
          animate={{
            // Horizontal wobble (sine wave simulation with keyframes)
            x: [0, bubble.wobbleAmplitude, 0, -bubble.wobbleAmplitude, 0],
            // Vertical rise (constant upward drift)
            y: [0, bubble.riseDistance],
            // Opacity pulse (breathing effect)
            opacity: [bubble.opacity, bubble.opacity * 1.3, bubble.opacity * 1.3, bubble.opacity],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            delay: bubble.delay,
            ease: 'linear',
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        />
      ))}
    </div>
  );
}
