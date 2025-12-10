import { motion } from 'framer-motion';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';

interface ReleaseAnimationProps {
  text: string;
  onComplete: () => void;
  duration?: number; // Duration in seconds (default: 2.5)
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  targetY: number;
}

// Generate particles based on text length
const generateParticles = (text: string): Particle[] => {
  const particleCount = Math.min(50, Math.max(10, Math.ceil(text.length / 10)));
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100 - 50, // -50 to +50
      y: 0,
      delay: Math.random() * 0.3, // 0 to 0.3s stagger
      targetY: -150 - Math.random() * 50, // -150 to -200
    });
  }

  return particles;
};

export const ReleaseAnimation: FC<ReleaseAnimationProps> = ({
  text,
  onComplete,
  duration = 2.5,
}) => {
  const particles = useMemo(() => generateParticles(text), [text]);

  useEffect(() => {
    // Call onComplete after animation finishes (duration + 0.5s buffer)
    const timer = setTimeout(
      () => {
        onComplete();
      },
      (duration + 0.5) * 1000
    );

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute h-1 w-1 rounded-full bg-biolum-cyan/60 shadow-glow-sm"
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: particle.x + (Math.random() * 40 - 20), // Add horizontal drift
            y: particle.targetY,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: duration,
            delay: particle.delay,
            ease: [0.22, 1, 0.36, 1], // Viscous easing
          }}
        />
      ))}

      {/* Text fade out */}
      <motion.div
        className="absolute text-center text-lg font-medium text-biolum-cyan"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 1.1 }}
        transition={{
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {text.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </motion.div>
    </div>
  );
};
