import { type FC, useMemo } from 'react';
import { Waves } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const HomePage: FC = () => {
  const { t } = useTranslation();

  // Ambient floating particles for depth
  const ambientParticles = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: 15 + Math.random() * 70,
        y: 20 + Math.random() * 60,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 2,
        duration: 6 + Math.random() * 4,
      })),
    []
  );

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-void-blue/60 px-4 sm:px-6">
      {/* Ambient particles */}
      {ambientParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="pointer-events-none absolute rounded-full bg-biolum-cyan/40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}

      {/* Central icon with layered glow effect */}
      <motion.div
        className="relative mb-10 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Outer glow ring - slow pulse */}
        <motion.div
          className="absolute h-56 w-56 rounded-full bg-biolum-cyan/10 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Middle glow ring */}
        <motion.div
          className="absolute h-40 w-40 rounded-full bg-biolum-cyan/15 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
        />

        {/* Inner soft glow */}
        <motion.div
          className="absolute h-28 w-28 rounded-full bg-biolum-cyan/20 blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.6,
          }}
        />

        {/* Waves icon with breathing animation */}
        <motion.div
          className="relative z-10"
          animate={{
            scale: [1, 1.03, 1],
            filter: [
              'drop-shadow(0 0 20px rgba(100, 255, 218, 0.5))',
              'drop-shadow(0 0 35px rgba(100, 255, 218, 0.7))',
              'drop-shadow(0 0 20px rgba(100, 255, 218, 0.5))',
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Waves size={110} className="text-biolum-cyan" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      {/* Title with staggered entrance */}
      <motion.h1
        className="mb-5 text-center text-5xl font-light tracking-wider text-mist-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {t('home.title')}
      </motion.h1>

      {/* Subtitle with elegant fade-in */}
      <motion.p
        className="text-center text-xl font-light tracking-wide text-biolum-cyan/80"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {t('home.subtitle')}
      </motion.p>
    </div>
  );
};
