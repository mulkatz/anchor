import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Ambient particle system for ProgressReef
 * Renders 15-20 "marine snow" particles that drift slowly
 * Creates the feeling of a living ocean even when no logs exist
 */
export const MarineSnow: FC = () => {
  // Generate 18 particles with random positions and drift
  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // 0-100% horizontal position
      y: Math.random() * 100, // 0-100% vertical position
      size: Math.random() * 2 + 1, // 1-3px
      delay: Math.random() * 10, // 0-10s stagger
      duration: Math.random() * 15 + 20, // 20-35s drift duration
      opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4 opacity
      drift: Math.random() * 40 - 20, // -20 to +20px horizontal drift
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-biolum-cyan"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            // Subtle glow
            boxShadow: `0 0 ${particle.size * 2}px rgba(100, 255, 218, 0.4)`,
          }}
          animate={{
            y: [0, -100], // Float upward 100px
            x: [0, particle.drift], // Gentle horizontal drift
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};
