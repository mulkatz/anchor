import { FC, useState } from 'react';
import { Dialog, CTAButton } from '../../ui';
import { cn } from '../../../utils/cn';

interface UserEditDialogProps {
  user: {
    name: string;
    email: string;
  };
  onClose: () => void;
  onSave: (data: { name: string; email: string }) => Promise<void>;
}

/**
 * Feature Component Example: UserEditDialog
 * Dialog for editing user information
 * Demonstrates form handling and async operations
 */
export const UserEditDialog: FC<UserEditDialogProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({ name, email });
      onClose();
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onClose={onClose} closeOnClickOutside={false}>
      <div className="p-6">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Edit Profile
        </h2>

        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'w-full rounded-lg border border-gray-300 px-4 py-2',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
                'dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              )}
              placeholder="Enter your name"
            />
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'w-full rounded-lg border border-gray-300 px-4 py-2',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
                'dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              )}
              placeholder="Enter your email"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </button>
            <CTAButton
              text="Save Changes"
              onClick={handleSave}
              loading={loading}
              disabled={loading}
              highlight
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};
