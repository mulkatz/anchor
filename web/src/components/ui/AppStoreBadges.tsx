import { cn } from '@/lib/cn';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/constants';
import appStoreBadge from '@/assets/icons/app-store.svg';
import googlePlayBadge from '@/assets/icons/google-play.svg';

interface AppStoreBadgesProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
}

const sizeClasses = {
  sm: 'h-10',
  md: 'h-12',
  lg: 'h-14',
};

/**
 * App Store and Play Store download badges
 * Uses official badge assets
 */
export function AppStoreBadges({
  className,
  size = 'md',
  layout = 'horizontal',
}: AppStoreBadgesProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        layout === 'vertical' ? 'flex-col' : 'flex-wrap',
        className
      )}
    >
      {/* App Store Badge */}
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-block',
          'transition-all duration-300 ease-viscous',
          'hover:scale-105 hover:drop-shadow-glow',
          'focus-ring rounded-lg'
        )}
        aria-label="Download on the App Store"
      >
        <img
          src={appStoreBadge}
          alt="Download on the App Store"
          className={cn(sizeClasses[size], 'w-auto')}
        />
      </a>

      {/* Play Store Badge */}
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-block',
          'transition-all duration-300 ease-viscous',
          'hover:scale-105 hover:drop-shadow-glow',
          'focus-ring rounded-lg'
        )}
        aria-label="Get it on Google Play"
      >
        <img
          src={googlePlayBadge}
          alt="Get it on Google Play"
          className={cn(sizeClasses[size], 'w-auto')}
        />
      </a>
    </div>
  );
}
