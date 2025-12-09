import { type FC } from 'react';
import { MessageCircle, Trash2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { Conversation } from '../../../models';

interface ConversationCardProps {
  conversation: Conversation;
  onResume: () => void;
  onDelete: () => void;
}

/**
 * Format date to relative time string
 * e.g., "2 hours ago", "3 days ago"
 */
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

/**
 * Format date to readable string
 * e.g., "Dec 9, 2025"
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const ConversationCard: FC<ConversationCardProps> = ({
  conversation,
  onResume,
  onDelete,
}) => {
  const formattedDate = conversation.archivedAt
    ? formatDate(conversation.archivedAt)
    : formatDate(conversation.updatedAt);

  const relativeTime = conversation.archivedAt
    ? getRelativeTime(conversation.archivedAt)
    : getRelativeTime(conversation.updatedAt);

  return (
    <div
      className={cn(
        'rounded-2xl border border-glass-border',
        'bg-glass-bg backdrop-blur-glass',
        'p-5 shadow-glass',
        'transition-all duration-300 ease-viscous',
        'hover:border-biolum-cyan/30 hover:bg-glass-bg-hover'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 line-clamp-2 text-lg font-medium text-mist-white">
            {conversation.title}
          </h3>
          <p className="line-clamp-2 text-sm text-mist-white/50">
            {conversation.preview || 'No preview available'}
          </p>
        </div>

        {conversation.metadata?.hasCrisisMessages && (
          <div className="ml-3 rounded-full bg-danger/20 p-2">
            <AlertCircle size={16} className="text-danger" />
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="mb-4 flex items-center gap-4 text-xs text-mist-white/40">
        <div className="flex items-center gap-1.5">
          <MessageCircle size={14} />
          <span>{conversation.messageCount} messages</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{relativeTime}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onResume}
          className={cn(
            'flex-1 rounded-full px-4 py-2.5',
            'bg-biolum-cyan text-void-blue',
            'text-sm font-medium',
            'shadow-glow-sm transition-all duration-300 ease-viscous',
            'active:scale-95'
          )}
        >
          Resume Conversation
        </button>

        <button
          onClick={onDelete}
          className={cn(
            'flex items-center justify-center',
            'h-10 w-10 rounded-full',
            'border border-danger/30 bg-danger/10',
            'text-danger transition-all duration-300 ease-viscous',
            'hover:bg-danger/20 active:scale-95'
          )}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
