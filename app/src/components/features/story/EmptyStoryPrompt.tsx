import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';

/**
 * EmptyStoryPrompt - Shown when user has no story data yet
 * Encourages starting a conversation to begin building their story
 */
export const EmptyStoryPrompt: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { medium } = useHaptics();

  const handleStartChat = async () => {
    await medium();
    navigate('/chat');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center px-6 py-12 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-glass-bg">
        <BookOpen size={40} className="text-biolum-cyan/60" />
      </div>

      <h2 className="mb-2 text-xl font-medium text-mist-white">{t('myStory.emptyState.title')}</h2>

      <p className="mb-8 max-w-sm text-sm leading-relaxed text-mist-white/60">
        {t('myStory.emptyState.description')}
      </p>

      <button
        onClick={handleStartChat}
        className="flex items-center gap-2 rounded-xl bg-biolum-cyan/20 px-6 py-3 font-medium text-biolum-cyan transition-all hover:bg-biolum-cyan/30 active:scale-95"
      >
        <MessageCircle size={20} />
        {t('myStory.emptyState.startChat')}
      </button>

      <p className="mt-6 max-w-xs text-xs text-mist-white/40">{t('myStory.emptyState.hint')}</p>
    </motion.div>
  );
};
