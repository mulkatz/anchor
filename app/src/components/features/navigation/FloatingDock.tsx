import { type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, AlertCircle, MessageCircle, Archive, User } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { cn } from '../../../utils/cn';

export const FloatingDock: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = async (path: string) => {
    // Light haptic feedback on tap
    await Haptics.impact({ style: ImpactStyle.Light });
    navigate(path);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/sos', icon: AlertCircle, label: 'SOS', isCenter: true },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/vault', icon: Archive, label: 'Vault' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="safe-area-bottom fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6">
      <nav
        className={cn(
          'flex items-center gap-4 rounded-full px-6 py-3',
          'bg-glass-bg backdrop-blur-glass',
          'border border-glass-border shadow-glass',
          'no-select'
        )}
      >
        {navItems.map(({ path, icon: Icon, label, isCenter }) => {
          const isActive = location.pathname === path;

          return (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={cn(
                'flex flex-col items-center justify-center',
                'transition-all duration-300 ease-viscous',
                'active:scale-95',
                isCenter ? 'relative -my-2 rounded-full bg-biolum-cyan p-4 shadow-glow-md' : 'p-2',
                isActive && !isCenter && 'text-biolum-cyan drop-shadow-glow',
                !isActive && !isCenter && 'text-mist-white/60'
              )}
              aria-label={label}
            >
              <Icon
                size={isCenter ? 32 : 24}
                className={cn(
                  'transition-transform duration-300',
                  isCenter && 'text-void-blue',
                  isCenter && 'animate-pulse-glow'
                )}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};
