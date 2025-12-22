import { type FC, type ReactNode } from 'react';
import { FloatingDock } from '../features/navigation/FloatingDock';
import { OceanicBubbles } from '../ui/OceanicBubbles';
import { useAchievementTracker } from '../../hooks/useAchievementTracker';
import { useUpdateDialog } from '../../hooks/useUpdateDialog';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  // Track user activity for achievement unlocks
  useAchievementTracker();

  // Expose update dialog triggers on window object
  useUpdateDialog();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-void-blue">
      {/* Persistent bubble background - sits behind all content, survives route changes */}
      <OceanicBubbles />

      {/* Main content area - layered above bubbles */}
      <main className="relative z-10 h-full w-full">{children}</main>

      {/* Floating navigation dock - highest layer */}
      <FloatingDock />
    </div>
  );
};
