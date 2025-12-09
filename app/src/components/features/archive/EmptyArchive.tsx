import { type FC } from 'react';
import { Archive } from 'lucide-react';

export const EmptyArchive: FC = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="mb-6 rounded-full bg-glass-bg p-8 backdrop-blur-glass">
        <Archive size={64} className="text-mist-white/30" />
      </div>

      <h2 className="mb-2 text-xl font-light text-mist-white">No archived conversations</h2>
      <p className="max-w-sm text-center text-sm text-mist-white/50">
        When you start a new conversation, your current chat will be automatically archived here.
      </p>
    </div>
  );
};
