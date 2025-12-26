import { type FC } from 'react';
import { cn } from '../../../utils/cn';
import { getFullTimestamp } from '../../../utils/temporal';

interface UserMessageProps {
  text: string;
  timestamp: Date;
}

/**
 * User Message Bubble
 * Right-aligned, warm-ember colored speech bubble
 */
export const UserMessage: FC<UserMessageProps> = ({ text, timestamp }) => {
  const timeStr = getFullTimestamp(timestamp);

  return (
    <div className="group mb-4 flex flex-col items-end gap-1">
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
