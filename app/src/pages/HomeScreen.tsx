import { FC } from 'react';
import { CTAButton, IconButton } from '../components/ui';
import { Settings, User } from 'lucide-react';

/**
 * Home Screen Example
 * Template for creating new screens
 */
export const HomeScreen: FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="safe-area-top flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-primary-900 dark:text-white">YourApp</h1>
        <div className="flex gap-2">
          <IconButton icon={User} iconSize={20} onClick={() => {}} />
          <IconButton icon={Settings} iconSize={20} onClick={() => {}} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="text-center">
          <h2 className="mb-4 text-4xl font-bold text-primary-900 dark:text-white">
            Welcome to YourApp
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Get started by exploring the features
          </p>

          <div className="max-w-sm space-y-3">
            <CTAButton text="Get Started" onClick={() => {}} highlight />
            <CTAButton text="Learn More" onClick={() => {}} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="safe-area-bottom p-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Made with Project Starter
      </footer>
    </div>
  );
};
