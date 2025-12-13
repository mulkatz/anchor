import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waves, Lock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDive } from '../contexts/DiveContext';
import { useApp } from '../contexts/AppContext';
import { useHaptics } from '../hooks/useHaptics';
import {
  diveLessons,
  zoneThemes,
  getZonesInOrder,
  getZoneTranslationKey,
  getZoneDescriptionKey,
  type DiveZone,
} from '../data/dive-lessons';
import { cn } from '../utils/cn';

/**
 * The Dive - Ocean Depth Map
 * Visual overview of all 25 lessons organized by zone
 */
export const DivePage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { light } = useHaptics();
  const { userId } = useApp();
  const { progress, isLoading, getLessonStatus, initializeProgress } = useDive();

  // Initialize progress for first-time users
  useEffect(() => {
    if (userId && !isLoading && !progress) {
      initializeProgress();
    }
  }, [userId, isLoading, progress, initializeProgress]);

  // Group lessons by zone
  const lessonsByZone = diveLessons.reduce(
    (acc, lesson) => {
      if (!acc[lesson.zone]) {
        acc[lesson.zone] = [];
      }
      acc[lesson.zone].push(lesson);
      return acc;
    },
    {} as Record<DiveZone, typeof diveLessons>
  );

  const zones = getZonesInOrder();

  const handleLessonClick = async (lessonId: string, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    await light();
    navigate(`/dive/${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-mist-white/60">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="safe-area-padding-top flex items-center justify-between px-6 pb-4 pt-4">
        <div>
          <h1 className="font-display text-2xl font-medium text-mist-white">{t('dive.title')}</h1>
          <p className="mt-1 text-sm text-mist-white/60">{t('dive.subtitle')}</p>
        </div>
        <Waves className="h-8 w-8 text-biolum-cyan" />
      </header>

      {/* Ocean Depth Map */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {zones.map((zone, zoneIndex) => {
          const theme = zoneThemes[zone];
          const zoneLessons = lessonsByZone[zone] || [];

          return (
            <motion.section
              key={zone}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: zoneIndex * 0.15, duration: 0.6 }}
              className="mb-8"
            >
              {/* Zone Header */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: theme.primary, boxShadow: `0 0 12px ${theme.glow}` }}
                />
                <div>
                  <h2 className="font-medium text-mist-white">{t(getZoneTranslationKey(zone))}</h2>
                  <p className="text-xs text-mist-white/50">{t(getZoneDescriptionKey(zone))}</p>
                </div>
              </div>

              {/* Lesson Nodes */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {zoneLessons.map((lesson) => {
                  const status = getLessonStatus(lesson.id);
                  const isUnlocked = status !== 'locked';
                  const isCompleted = status === 'completed';
                  const isCurrent = progress?.currentLessonId === lesson.id;

                  return (
                    <motion.button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson.id, isUnlocked)}
                      disabled={!isUnlocked}
                      whileTap={isUnlocked ? { scale: 0.95 } : undefined}
                      className={cn(
                        'relative flex aspect-square flex-col items-center justify-center rounded-2xl border p-3',
                        'transition-all duration-300 ease-viscous',
                        isUnlocked
                          ? 'border-glass-border bg-glass-bg backdrop-blur-glass'
                          : 'border-transparent bg-void-blue/30 opacity-40',
                        isCurrent && 'ring-2',
                        isCompleted && 'border-green-500/30'
                      )}
                      style={{
                        ...(isCurrent && {
                          ringColor: theme.primary,
                          boxShadow: `0 0 20px ${theme.glow}`,
                        }),
                      }}
                    >
                      {/* Status Icon */}
                      {isCompleted ? (
                        <CheckCircle className="mb-1 h-5 w-5 text-green-400" strokeWidth={2.5} />
                      ) : !isUnlocked ? (
                        <Lock className="mb-1 h-5 w-5 text-mist-white/30" />
                      ) : (
                        <div
                          className="mb-1 h-5 w-5 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        />
                      )}

                      {/* Lesson ID */}
                      <span
                        className={cn(
                          'text-xs font-medium',
                          isUnlocked ? 'text-mist-white' : 'text-mist-white/30'
                        )}
                      >
                        {lesson.id}
                      </span>

                      {/* Current indicator */}
                      {isCurrent && (
                        <motion.div
                          className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          );
        })}

        {/* Empty State */}
        {diveLessons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Waves className="mb-4 h-12 w-12 text-mist-white/30" />
            <p className="text-mist-white/60">{t('dive.noLessons')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
