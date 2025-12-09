import { FC } from 'react';
import { User, Mail, Calendar } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    avatar?: string;
  };
  onEdit?: () => void;
  className?: string;
}

/**
 * Feature Component Example: UserCard
 * Displays user information with actions
 * Composed from UI components
 */
export const UserCard: FC<UserCardProps> = ({ user, onEdit, className }) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl',
        'border border-gray-200 dark:border-gray-700 dark:bg-gray-800',
        className
      )}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <User size={32} />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user.name}
          </h3>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail size={14} />
              <span>{user.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar size={14} />
              <span>Joined {user.createdAt.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Actions */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
