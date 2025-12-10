import { type FC, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../services/firebase.service';
import { AppProvider } from '../contexts/AppContext';
import { DialogProvider } from '../contexts/DialogContext';
import { UIProvider } from '../contexts/UIContext';
import { MainLayout } from '../components/layouts/MainLayout';
import { HomePage } from './HomePage';
import { SOSPage } from './SOSPage';
import { ChatPage } from './ChatPage';
import { ArchivePage } from './ArchivePage';
import { VaultPage } from './VaultPage';
import { ProfilePage } from './ProfilePage';

// Animation variants for page transitions
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

// Animated route wrapper component
const AnimatedRoutes: FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
      </Routes>
    </AnimatePresence>
  );
};

const App: FC = () => {
  // Ensure user is signed in anonymously on app load
  useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((error) => {
        console.error('Anonymous sign-in failed:', error);
      });
    }
  }, []);

  return (
    <AppProvider>
      <UIProvider>
        <DialogProvider>
          <BrowserRouter>
            <MainLayout>
              <AnimatedRoutes />
            </MainLayout>
          </BrowserRouter>
        </DialogProvider>
      </UIProvider>
    </AppProvider>
  );
};

export default App;
