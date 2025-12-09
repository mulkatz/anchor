import { type FC } from 'react';
import { cn } from '../../../utils/cn';

interface AssistantMessageProps {
  text: string;
}

/**
 * Assistant Message Bubble
 * Left-aligned, glass morphism styled bubble with bioluminescent border
 */
export const AssistantMessage: FC<AssistantMessageProps> = ({ text }) => {
  return (
    <div className="mb-4 flex justify-start px-6">
      <div
        className={cn(
          'max-w-[80%] rounded-3xl rounded-tl-lg px-5 py-3',
          'bg-glass-bg backdrop-blur-glass',
          'border border-glass-border shadow-glass',
          'text-mist-white',
          'break-words'
        )}
      >
        <p className="whitespace-pre-line text-base leading-relaxed">{text}</p>
      </div>
    </div>
  );
};
