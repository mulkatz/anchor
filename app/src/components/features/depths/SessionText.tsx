import { type FC } from 'react';
import { cn } from '../../../utils/cn';
import type { JournalSession } from '../../../models';

interface SessionTextProps {
  session: JournalSession;
  isActive: boolean;
}

export const SessionText: FC<SessionTextProps> = ({ session, isActive }) => {
  const isFixed = session.fixedAt !== null;

  // Don't render empty sessions that aren't active
  if (!session.text && !isActive) return null;

  return (
    <p
      className={cn(
        'whitespace-pre-wrap break-words font-light leading-relaxed transition-colors duration-[600ms] ease-viscous',
        // Fixed text is more muted
        isFixed && 'text-mist-white/60',
        // Active text glows cyan
        !isFixed && 'text-biolum-cyan'
      )}
      style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
    >
      {session.text}
    </p>
  );
};
