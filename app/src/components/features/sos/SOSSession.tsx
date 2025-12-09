import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOSSession } from '../../../hooks/useSOSSession';
import { BreachScreen } from './BreachScreen';
import { AcknowledgeScreen } from './AcknowledgeScreen';
import { GroundingSight } from './GroundingSight';
import { GroundingTouch } from './GroundingTouch';
import { GroundingSound } from './GroundingSound';
import { ExitBreath } from './ExitBreath';
import { CompletionScreen } from './CompletionScreen';

// Smooth, viscous transitions between steps
const stepVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 1.05,
  },
};

const stepTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Viscous easing
};

export const SOSSession: FC = () => {
  const { currentStep, startSession, nextStep, getDuration } = useSOSSession();

  const renderStep = () => {
    switch (currentStep) {
      case 'trigger':
        return <BreachScreen onComplete={startSession} />;

      case 'acknowledgement':
        return <AcknowledgeScreen onComplete={nextStep} />;

      case 'grounding-sight':
        return <GroundingSight onComplete={nextStep} />;

      case 'grounding-touch':
        return <GroundingTouch onComplete={nextStep} />;

      case 'grounding-sound':
        return <GroundingSound onComplete={nextStep} />;

      case 'exit-breath':
        return <ExitBreath onComplete={nextStep} />;

      case 'completion':
        return <CompletionScreen duration={getDuration()} />;

      default:
        return <BreachScreen onComplete={startSession} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={stepTransition}
        className="h-full w-full"
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
};
