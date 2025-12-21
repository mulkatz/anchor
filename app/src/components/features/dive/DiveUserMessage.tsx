import { type FC } from 'react';

interface DiveUserMessageProps {
  text: string;
}

/**
 * Dive User Message
 * Centered text with warm-ember tint - clearly different from AI
 * Your thoughts surfacing from the depths
 */
export const DiveUserMessage: FC<DiveUserMessageProps> = ({ text }) => {
  return (
    <div className="mb-14 flex justify-center px-8">
      <div className="max-w-[85%] text-center">
        <p className="text-base leading-loose text-warm-ember/55">{text}</p>
      </div>
    </div>
  );
};
