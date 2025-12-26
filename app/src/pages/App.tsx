import { type FC } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from '../contexts/AppContext';
import { DialogProvider } from '../contexts/DialogContext';
import { UIProvider } from '../contexts/UIContext';
import { DiveProvider } from '../contexts/DiveContext';
import { InsightProvider } from '../contexts/InsightContext';
import { AchievementProvider } from '../contexts/AchievementContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { MainLayout } from '../components/layouts/MainLayout';
import { HomePage } from './HomePage';
import { SOSPage } from './SOSPage';
import { ChatPage } from './ChatPage';
import { DepthsPage } from './DepthsPage';
import { ArchivePage } from './ArchivePage';
import { VaultPage } from './VaultPage';
import { ProfilePage } from './ProfilePage';
import { DivePage } from './DivePage';
import { DiveLessonPage } from './DiveLessonPage';
import { LighthousePage } from './LighthousePage';
import { IlluminateDetailPage } from './IlluminateDetailPage';
import { HorizonPage } from './HorizonPage';
import { OnboardingPage } from './OnboardingPage';
import { AchievementsPage } from './AchievementsPage';
import { MyStoryPage } from './MyStoryPage';

// Animation variants for page transitions
// Note: Using negative y for initial (starts above, slides down) to work with overflow-hidden parent
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

// Viscous, slow transition
const pageTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // cubic-bezier(0.22, 1, 0.36, 1) - viscous easing
};

// Animated route wrapper component (for main app routes)
const AnimatedRoutes: FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/onboarding" element={<Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <HomePage />
            </motion.div>
          }
        />
        <Route
          path="/sos"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <SOSPage />
            </motion.div>
          }
        />
        <Route
          path="/chat"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <ChatPage />
            </motion.div>
          }
        />
        <Route
          path="/depths"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <DepthsPage />
            </motion.div>
          }
        />
        <Route
          path="/archive"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <ArchivePage />
            </motion.div>
          }
        />
        <Route
          path="/vault"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <VaultPage />
            </motion.div>
          }
        />
        <Route
          path="/lighthouse"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <LighthousePage />
            </motion.div>
          }
        />
        <Route
          path="/lighthouse/:entryId"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <IlluminateDetailPage />
            </motion.div>
          }
        />
        <Route
          path="/horizon"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <HorizonPage />
            </motion.div>
          }
        />
        <Route
          path="/profile"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <ProfilePage />
            </motion.div>
          }
        />
        <Route
          path="/my-story"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <MyStoryPage />
            </motion.div>
          }
        />
        <Route
          path="/treasures"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <AchievementsPage />
            </motion.div>
          }
        />
        <Route
          path="/dive"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <DivePage />
            </motion.div>
          }
        />
        <Route
          path="/dive/:lessonId"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <DiveLessonPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

// Router content component that handles onboarding redirect logic
const RouterContent: FC = () => {
  const location = useLocation();

  // Read directly from localStorage to ensure we get the latest value
  // (React state in useOnboarding doesn't sync between hook instances)
  const hasCompleted = localStorage.getItem('onboardingCompleted') === 'true';

  // If onboarding not completed and not on onboarding page, redirect to onboarding
  if (!hasCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If on onboarding page, render OnboardingPage directly (no MainLayout)
  if (location.pathname === '/onboarding') {
    return <OnboardingPage />;
  }

  // Otherwise, render the main app with MainLayout
  return (
    <MainLayout>
      <AnimatedRoutes />
    </MainLayout>
  );
};

const App: FC = () => {
  // Auth is now handled in AppContext with proper onAuthStateChanged tracking
  return (
    <ErrorBoundary>
      <AppProvider>
        <UIProvider>
          <DiveProvider>
            <AchievementProvider>
              <InsightProvider>
                <DialogProvider>
                  <BrowserRouter>
                    <RouterContent />
                  </BrowserRouter>
                </DialogProvider>
              </InsightProvider>
            </AchievementProvider>
          </DiveProvider>
        </UIProvider>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
