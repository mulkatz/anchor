import { type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, MessageCircle, Archive, User } from 'lucide-react';
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
    { path: '/sos', icon: AlertCircle, label: 'SOS' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/vault', icon: Archive, label: 'Vault' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="safe-area-margin-bottom fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
      <nav
        className={cn(
          'flex items-center gap-4 rounded-full px-6 py-3',
          'bg-glass-bg backdrop-blur-glass',
          'border border-glass-border shadow-glass',
          'no-select'
        )}
      >
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;

          return (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={cn(
                'flex flex-col items-center justify-center',
                'transition-all duration-300 ease-viscous',
                'p-2 active:scale-95',
                isActive && 'text-biolum-cyan drop-shadow-glow',
                !isActive && 'text-mist-white/60'
              )}
              aria-label={label}
            >
              <Icon size={24} className="transition-transform duration-300" />
            </button>
          );
        })}
      </nav>
    </div>
  );
};
