import { type FC, type ReactNode } from 'react';
import { FloatingDock } from '../features/navigation/FloatingDock';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-void-blue">
      {/* Main content area */}
      <main className="safe-area-top h-full w-full overflow-y-auto overflow-x-hidden pb-24">
        {children}
      </main>

      {/* Floating navigation dock */}
      <FloatingDock />
    </div>
  );
};
