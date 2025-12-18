import { type ReactNode, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
  threshold?: number;
}

/**
 * Scroll-triggered reveal animation wrapper
 * Uses Framer Motion's useInView for intersection observer behavior
 * Respects prefers-reduced-motion
 * Includes Safari mobile fallback to ensure content visibility
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 30,
  once = true,
  threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const prefersReducedMotion = useReducedMotion();

  // Safari mobile fallback: force visibility after a timeout if IntersectionObserver fails
  const [forceVisible, setForceVisible] = useState(false);

  useEffect(() => {
    // Fallback timer to ensure content is visible on Safari mobile
    // If isInView doesn't trigger within 1 second, force visibility
    const fallbackTimer = setTimeout(() => {
      if (!isInView) {
        setForceVisible(true);
      }
    }, 1000);

    return () => clearTimeout(fallbackTimer);
  }, [isInView]);

  // Calculate initial offset based on direction
  const getInitialOffset = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'none':
        return { x: 0, y: 0 };
    }
  };

  const offset = getInitialOffset();
  const shouldShow = isInView || forceVisible;

  // Skip animation for reduced motion
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{
        opacity: 0,
        ...offset,
      }}
      animate={{
        opacity: shouldShow ? 1 : 0,
        x: shouldShow ? 0 : offset.x,
        y: shouldShow ? 0 : offset.y,
      }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Viscous easing
      }}
    >
      {children}
    </motion.div>
  );
}

interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

/**
 * Container for staggered scroll reveal animations
 * Children should be direct ScrollReveal components or elements
 */
export function ScrollRevealGroup({
  children,
  className,
  staggerDelay = 0.1,
}: ScrollRevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child item for ScrollRevealGroup with stagger animation
 */
export function ScrollRevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
