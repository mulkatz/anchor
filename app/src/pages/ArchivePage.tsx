import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArchive } from '../hooks/useArchive';
import { useConversation } from '../hooks/useConversation';
import { useHaptics } from '../hooks/useHaptics';
import { useUI } from '../contexts/UIContext';
import { ConversationCard } from '../components/features/archive/ConversationCard';
import { EmptyArchive } from '../components/features/archive/EmptyArchive';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { cn } from '../utils/cn';

export const ArchivePage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { light, medium } = useHaptics();
  const { navbarBottom } = useUI();
  const { archivedConversations, isLoading, deleteConversation } = useArchive();
  const { unarchiveConversation } = useConversation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleBack = async () => {
    await light();
    navigate('/chat');
  };

  const handleResume = async (conversationId: string) => {
    await medium();
    await unarchiveConversation(conversationId);
    navigate('/chat');
  };

  const handleDeleteClick = async (conversationId: string) => {
    await light();
    setSelectedConversationId(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConversationId) return;

    try {
      await medium();
      await deleteConversation(selectedConversationId);
      setDeleteDialogOpen(false);
      setSelectedConversationId(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div className="flex h-full flex-col bg-void-blue/85">
      {/* Header */}
      <header className="shrink-0 border-b border-glass-border px-4 py-4 pt-safe sm:px-6">
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className={cn(
              'flex items-center justify-center rounded-full',
              'h-10 w-10 bg-glass-bg backdrop-blur-glass',
              'border border-glass-border',
              'text-mist-white transition-all duration-300 ease-viscous',
              'active:scale-95'
            )}
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-light text-mist-white">{t('archive.title')}</h1>
          </div>
        </div>

        <p className="text-sm text-mist-white/60">
          {t(
            archivedConversations.length === 0
              ? 'archive.savedConversations_zero'
              : archivedConversations.length === 1
                ? 'archive.savedConversations_one'
                : 'archive.savedConversations_other',
            { count: archivedConversations.length }
          )}
        </p>
      </header>

      {/* Content */}
      <div
        className="flex flex-1 flex-col overflow-y-auto px-4 pt-6 sm:px-6"
        style={{ paddingBottom: `${Math.max(navbarBottom + 32, 96)}px` }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-biolum-cyan border-t-transparent shadow-glow-md" />
          </div>
        ) : archivedConversations.length === 0 ? (
          <EmptyArchive />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {archivedConversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <ConversationCard
                    conversation={conversation}
                    onResume={() => handleResume(conversation.id)}
                    onDelete={() => handleDeleteClick(conversation.id)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('archive.deleteTitle')}
        message={t('archive.deleteMessage')}
        confirmText={t('archive.deleteButton')}
        cancelText={t('general.cancel')}
        destructive
      />
    </div>
  );
};
