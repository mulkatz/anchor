import { FC, useState } from 'react';
import { UserCard } from './UserCard';
import { UserEditDialog } from './UserEditDialog';
import { LoaderAnimation } from '../../ui';
import toast from 'react-hot-toast';

/**
 * Complete Feature Flow Example
 * Demonstrates how to compose UI and feature components
 * Shows data flow, state management, and async operations
 */
export const UserProfileFlow: FC = () => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Example user data (in real app, this would come from context or API)
  const [user, setUser] = useState({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2024-01-15'),
    avatar: undefined,
  });

  const handleSave = async (data: { name: string; email: string }) => {
    // Simulate API call
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update user data
    setUser((prev) => ({
      ...prev,
      ...data,
    }));

    toast.success('Profile updated successfully!');
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderAnimation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>

        <UserCard user={user} onEdit={() => setShowEditDialog(true)} />

        {showEditDialog && (
          <UserEditDialog
            user={user}
            onClose={() => setShowEditDialog(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
};
