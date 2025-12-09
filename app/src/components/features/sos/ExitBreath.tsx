import { type FC, useState, useEffect } from 'react';
import { Wind } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';

interface ExitBreathProps {
  onComplete: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const ExitBreath: FC<ExitBreathProps> = ({ onComplete }) => {
  const { light } = useHaptics();
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [scale, setScale] = useState(0.8);
  const TOTAL_CYCLES = 3;

  // 4-7-8 breathing: 4s in, 7s hold, 8s out
  const DURATIONS = {
    inhale: 4000,
    hold: 7000,
    exhale: 8000,
  };

  useEffect(() => {
    let phaseTimer: NodeJS.Timeout;
    let scaleInterval: NodeJS.Timeout;

    const runPhase = () => {
      const duration = DURATIONS[phase];
      const startScale = phase === 'inhale' ? 0.8 : phase === 'hold' ? 1.2 : 1.2;
      const endScale = phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 0.8;
      const steps = 60; // 60fps
      const stepDuration = duration / steps;
      const scaleStep = (endScale - startScale) / steps;

      let currentStep = 0;
      setScale(startScale);

      // Haptic on inhale start
      if (phase === 'inhale') {
        light();
      }

      scaleInterval = setInterval(() => {
        currentStep++;
        setScale(startScale + scaleStep * currentStep);

        if (currentStep >= steps) {
          clearInterval(scaleInterval);
        }
      }, stepDuration);

      phaseTimer = setTimeout(() => {
        // Move to next phase
        if (phase === 'inhale') {
          setPhase('hold');
        } else if (phase === 'hold') {
          setPhase('exhale');
        } else {
          // Complete cycle
          const newCycleCount = cycleCount + 1;
          setCycleCount(newCycleCount);

          if (newCycleCount >= TOTAL_CYCLES) {
            // All cycles complete
            setTimeout(onComplete, 500);
          } else {
            // Start next cycle
            setPhase('inhale');
          }
        }
      }, duration);
    };

    runPhase();

    return () => {
      clearTimeout(phaseTimer);
      clearInterval(scaleInterval);
    };
  }, [phase, cycleCount, light, onComplete]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe out';
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      {/* Icon */}
      <div className="mb-12">
        <Wind size={48} className="text-biolum-cyan drop-shadow-glow" />
      </div>

      {/* Breathing circle */}
      <div className="relative mb-12 flex h-64 w-64 items-center justify-center">
        <div
          className="absolute rounded-full bg-biolum-cyan/30 shadow-glow-lg transition-all duration-100 ease-linear"
          style={{
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
          }}
        />
        <div
          className="absolute rounded-full border-4 border-biolum-cyan transition-all duration-100 ease-linear"
          style={{
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
          }}
        />
      </div>

      {/* Phase text */}
      <h2 className="mb-2 text-center text-2xl font-light text-mist-white">
        {getPhaseText()}
      </h2>

      {/* Cycle progress */}
      <div className="flex gap-2">
        {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i < cycleCount ? 'bg-success shadow-glow-sm' : 'bg-mist-white/20'
            }`}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-sm text-mist-white/50">
        Cycle {cycleCount + 1} of {TOTAL_CYCLES}
      </p>
    </div>
  );
};
