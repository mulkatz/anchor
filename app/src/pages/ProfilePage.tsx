import { type FC } from 'react';
import { User, Settings, HelpCircle, Shield } from 'lucide-react';

export const ProfilePage: FC = () => {
  const menuItems = [
    { icon: Settings, label: 'Preferences', description: 'Haptics, sounds, appearance' },
    { icon: Shield, label: 'Privacy', description: 'Data storage and security' },
    { icon: HelpCircle, label: 'Help & Support', description: 'Crisis resources' },
  ];

  return (
    <div className="flex h-full flex-col px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-glass-bg backdrop-blur-glass">
          <User size={40} className="text-biolum-cyan" />
        </div>
        <div>
          <h1 className="text-2xl font-light text-mist-white">Profile</h1>
          <p className="text-sm text-mist-white/60">Settings & preferences</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-3">
        {menuItems.map(({ icon: Icon, label, description }) => (
          <button
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-glass-border bg-glass-bg p-4 backdrop-blur-glass transition-all duration-300 ease-viscous active:scale-98 active:bg-glass-bg-hover"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-void-blue">
              <Icon size={24} className="text-biolum-cyan" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-lg font-medium text-mist-white">{label}</p>
              <p className="text-sm text-mist-white/50">{description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Version */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-xs text-mist-white/30">
          Anxiety Buddy v0.1.0
        </p>
      </div>
    </div>
  );
};
