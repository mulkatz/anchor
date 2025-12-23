import { type FC } from 'react';
import { MessageCircle, Trash2, Clock, AlertCircle, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../utils/cn';
import { getRelativeTime, formatDate } from '../../../utils/time';
import type { Conversation } from '../../../models';

interface ConversationCardProps {
  conversation: Conversation;
  onResume: () => void;
  onDelete: () => void;
}

export const ConversationCard: FC<ConversationCardProps> = ({
  conversation,
  onResume,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();

  const formattedDate = conversation.archivedAt
    ? formatDate(conversation.archivedAt, i18n.language)
    : formatDate(conversation.updatedAt, i18n.language);

  const relativeTime = conversation.archivedAt
    ? getRelativeTime(conversation.archivedAt, t)
    : getRelativeTime(conversation.updatedAt, t);

  // Use AI-generated content if available, fallback to original
  const displayTitle = conversation.metadata?.aiTitle || conversation.title;
  const displaySummary = conversation.metadata?.aiSummary || conversation.preview;
  const topics = conversation.metadata?.aiTopics || [];

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
          <h3 className="mb-1 line-clamp-2 text-lg font-medium text-mist-white">{displayTitle}</h3>
          <p className="line-clamp-4 text-sm text-mist-white/50">
            {displaySummary || t('archive.noPreview')}
          </p>
        </div>

        {conversation.metadata?.hasCrisisMessages && (
          <div className="ml-3 rounded-full bg-danger/20 p-2">
            <AlertCircle size={16} className="text-danger" />
          </div>
        )}
      </div>

      {/* Topic Tags */}
      {topics.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1',
                'rounded-full bg-biolum-cyan/10 text-xs text-biolum-cyan/70',
                'border border-biolum-cyan/20'
              )}
            >
              <Tag size={10} />
              {t(`topics.${topic}`, { defaultValue: topic })}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="mb-4 flex items-center gap-4 text-xs text-mist-white/40">
        <div className="flex items-center gap-1.5">
          <MessageCircle size={14} />
          <span>{t('archive.messageCount', { count: conversation.messageCount })}</span>
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
          {t('archive.resumeConversation')}
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
