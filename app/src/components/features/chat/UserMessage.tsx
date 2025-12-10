import { type FC } from 'react';
import { cn } from '../../../utils/cn';

interface UserMessageProps {
  text: string;
}

/**
 * User Message Bubble
 * Right-aligned, warm-ember colored speech bubble
 */
export const UserMessage: FC<UserMessageProps> = ({ text }) => {
  return (
    <div className="mb-4 flex justify-end px-4 sm:px-6">
      <div
        className={cn(
          'max-w-[90%] rounded-3xl rounded-tr-lg px-5 py-3',
          'bg-warm-ember text-void-blue',
          'shadow-lg',
          'break-words'
        )}
      >
        <p className="text-base leading-relaxed">{text}</p>
      </div>
    </div>
  );
};
