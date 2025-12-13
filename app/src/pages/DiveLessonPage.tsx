import { type FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDiveSession } from '../hooks/useDiveSession';
import { useDiveLesson } from '../hooks/useDiveLesson';
import { useDive } from '../contexts/DiveContext';
import { useHaptics } from '../hooks/useHaptics';
import { getLessonById, zoneThemes, getZoneTranslationKey } from '../data/dive-lessons';
import { DiveChatContainer } from '../components/features/dive/DiveChatContainer';
import { ChatInput } from '../components/features/chat/ChatInput';
import { LoadingSpinner } from '../components/ui';
import { cn } from '../utils/cn';

type PageState = 'intro' | 'session';

/**
 * The Dive - Lesson Page
 * Shows intro card, then transitions to session chat
 */
export const DiveLessonPage: FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { medium, light } = useHaptics();
  const { getLessonStatus } = useDive();

  const [pageState, setPageState] = useState<PageState>('intro');

  // Static lesson data for structure/theming
  const lessonBase = lessonId ? getLessonById(lessonId) : null;
  const theme = lessonBase ? zoneThemes[lessonBase.zone] : null;
  const status = lessonId ? getLessonStatus(lessonId) : 'locked';

  // Localized lesson content from backend
  const { lesson: localizedLesson, isLoading: isLessonLoading } = useDiveLesson({ lessonId });

  const {
    sessionId,
    messages,
    isThinking,
    isLessonComplete,
    error,
    startSession,
    sendReflection,
    sendVoiceReflection,
  } = useDiveSession({ lessonId: lessonId || '' });

  // Handle back navigation
  const handleBack = async () => {
    await light();
    navigate('/dive');
  };

  // Start the lesson session
  const handleBeginDive = async () => {
    await medium();
    await startSession();
    setPageState('session');
  };

  // If no lesson found (base data)
  if (!lessonBase || !theme) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-void-blue/85 p-6">
        <p className="text-mist-white/60">{t('dive.lessonNotFound')}</p>
        <button onClick={handleBack} className="mt-4 text-biolum-cyan underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-void-blue/85">
      {/* Header */}
      <header
        className="safe-area-padding-top flex items-center gap-4 px-4 pb-4 pt-4"
        style={{ borderBottom: `1px solid ${theme.glow}` }}
      >
        <button
          onClick={handleBack}
          className="rounded-full p-2 transition-colors hover:bg-glass-bg-hover"
        >
          <ArrowLeft className="h-5 w-5 text-mist-white" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.primary }} />
            <span className="text-xs text-mist-white/60">
              {localizedLesson?.zone || t(getZoneTranslationKey(lessonBase.zone))}
            </span>
          </div>
          <h1 className="font-medium text-mist-white">
            {localizedLesson?.title || lessonBase.title}
          </h1>
        </div>
        {isLessonComplete && <CheckCircle className="h-6 w-6 text-green-400" />}
      </header>

      <AnimatePresence mode="wait">
        {pageState === 'intro' ? (
          /* Intro Card */
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col items-center justify-center p-6"
          >
            <div
              className={cn(
                'w-full max-w-md rounded-3xl border p-8',
                'bg-glass-bg backdrop-blur-glass'
              )}
              style={{
                borderColor: `${theme.primary}30`,
                boxShadow: `0 0 40px ${theme.glow}`,
              }}
            >
              {isLessonLoading ? (
                /* Loading State */
                <LoadingSpinner className="py-8" />
              ) : (
                <>
                  {/* Lesson Info */}
                  <div className="mb-6 text-center">
                    <span className="text-sm font-medium" style={{ color: theme.primary }}>
                      {lessonBase.id}
                    </span>
                    <h2 className="mt-2 text-2xl font-medium text-mist-white">
                      {localizedLesson?.title || lessonBase.title}
                    </h2>
                    <p className="mt-2 text-sm text-mist-white/60">
                      {localizedLesson?.clinicalConcept || lessonBase.clinical_concept}
                    </p>
                  </div>

                  {/* Ocean Metaphor Preview */}
                  <div className="mb-8 rounded-2xl bg-void-blue/50 p-4">
                    <p className="text-center text-sm italic text-mist-white/80">
                      "{(localizedLesson?.oceanMetaphor || lessonBase.ocean_metaphor).slice(0, 100)}
                      ..."
                    </p>
                  </div>

                  {/* Begin Button */}
                  <button
                    onClick={handleBeginDive}
                    className={cn(
                      'flex w-full items-center justify-center gap-3 rounded-full py-4',
                      'font-medium transition-all duration-300 ease-viscous',
                      'active:scale-95'
                    )}
                    style={{
                      backgroundColor: theme.primary,
                      color: '#0A1128',
                      boxShadow: `0 0 20px ${theme.glow}`,
                    }}
                  >
                    <Play className="h-5 w-5" />
                    {t('dive.beginDive')}
                  </button>

                  {/* Suggested Reading */}
                  {(localizedLesson?.suggestedReading || lessonBase.suggested_reading) && (
                    <p className="mt-6 text-center text-xs text-mist-white/40">
                      {t('dive.suggestedReading')}:{' '}
                      {lessonBase.suggested_reading_isbn_link ? (
                        <a
                          href={lessonBase.suggested_reading_isbn_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-mist-white/40 underline decoration-mist-white/20 underline-offset-2 transition-colors hover:text-mist-white/60 hover:decoration-mist-white/40"
                        >
                          {localizedLesson?.suggestedReading || lessonBase.suggested_reading}
                        </a>
                      ) : (
                        localizedLesson?.suggestedReading || lessonBase.suggested_reading
                      )}
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ) : (
          /* Session Chat - Same layout structure as ChatPage */
          <motion.div
            key="session"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex-1 overflow-hidden"
          >
            {/* Messages */}
            <DiveChatContainer
              messages={messages}
              isThinking={isThinking}
              isLessonComplete={isLessonComplete}
              onNavigateBack={handleBack}
            />

            {/* Input - reuse ChatInput for consistent UX */}
            <ChatInput
              onSend={sendReflection}
              onSendVoice={sendVoiceReflection}
              disabled={isThinking}
            />

            {/* Error Display */}
            {error && (
              <div className="absolute bottom-24 left-4 right-4 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-400">
                {error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
