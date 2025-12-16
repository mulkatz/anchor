import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Trash2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { useIlluminate } from '../hooks/useIlluminate';
import { useUI } from '../contexts/UIContext';
import { useHaptics } from '../hooks/useHaptics';
import { LoadingSpinner, ConfirmDialog } from '../components/ui';
import { DISTORTION_INFO } from '../services/illuminate.service';
import type { CognitiveDistortion } from '../models';
import { cn } from '../utils/cn';
import { formatShortDate, formatTime } from '../utils/time';

/**
 * Illuminate Detail Page
 * Displays a full CBT reflection entry with all 6 steps
 */
export const IlluminateDetailPage: FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { entryId } = useParams<{ entryId: string }>();
  const { entries, loading, deleteEntry } = useIlluminate();
  const { navbarBottom } = useUI();
  const { light, medium, heavy } = useHaptics();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Find the entry
  const entry = entries.find((e) => e.id === entryId);

  // Handle back navigation
  const handleBack = async () => {
    await light();
    navigate('/lighthouse');
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    heavy();
    setShowDeleteConfirm(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteEntry(entryId!);
      await medium();
      navigate('/lighthouse');
    } catch (error) {
      console.error('Error deleting entry:', error);
      setIsDeleting(false);
    }
  };

  // Get intensity color
  const getIntensityColor = (value: number): string => {
    if (value <= 20) return 'bg-green-400';
    if (value <= 40) return 'bg-biolum-cyan';
    if (value <= 60) return 'bg-yellow-400';
    if (value <= 80) return 'bg-orange-400';
    return 'bg-red-400';
  };

  // Get intensity label
  const getIntensityLabel = (value: number): string => {
    if (value <= 20) return t('illuminate.intensity.minimal');
    if (value <= 40) return t('illuminate.intensity.mild');
    if (value <= 60) return t('illuminate.intensity.moderate');
    if (value <= 80) return t('illuminate.intensity.strong');
    return t('illuminate.intensity.intense');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-void-blue/75">
        <LoadingSpinner />
      </div>
    );
  }

  // Not found state
  if (!entry) {
    return (
      <div className="flex h-full flex-col bg-void-blue/75">
        <header className="shrink-0 border-b border-glass-border bg-void-blue px-4 py-4 pt-safe">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="rounded-full p-2 text-mist-white/70 transition-colors hover:bg-mist-white/10 hover:text-mist-white"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-light text-mist-white">{t('illuminateDetail.title')}</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <AlertCircle size={48} className="mb-4 text-mist-white/30" />
          <p className="text-center text-mist-white/60">{t('illuminateDetail.notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-void-blue/75">
      {/* Header */}
      <header className="shrink-0 border-b border-glass-border bg-void-blue px-4 py-4 pt-safe">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="rounded-full p-2 text-mist-white/70 transition-colors hover:bg-mist-white/10 hover:text-mist-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-light text-mist-white">{t('illuminateDetail.title')}</h1>
            <p className="text-sm text-mist-white/60">
              {formatShortDate(entry.createdAt, i18n.language)} •{' '}
              {formatTime(entry.createdAt, i18n.language)}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{ paddingBottom: `${Math.max(navbarBottom + 32, 96)}px` }}
      >
        <div className="space-y-4">
          {/* Section 1: The Situation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="rounded-xl border border-glass-border bg-glass-bg p-4"
          >
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-mist-white/50">
              {t('illuminateDetail.sections.situation')}
            </h2>
            <p className="whitespace-pre-wrap text-mist-white">{entry.situation}</p>
          </motion.section>

          {/* Section 2: The Thoughts */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-glass-border bg-glass-bg p-4"
          >
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-mist-white/50">
              {t('illuminateDetail.sections.thoughts')}
            </h2>
            <p className="whitespace-pre-wrap text-mist-white">{entry.automaticThoughts}</p>
          </motion.section>

          {/* Section 3: The Feelings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-glass-border bg-glass-bg p-4"
          >
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-mist-white/50">
              {t('illuminateDetail.sections.feelings')}
            </h2>

            {/* Emotion chips */}
            {entry.primaryEmotions.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {entry.primaryEmotions.map((emotion) => (
                  <span
                    key={emotion}
                    className="rounded-full bg-biolum-cyan/10 px-3 py-1 text-sm text-biolum-cyan"
                  >
                    {t(`illuminate.emotions.${emotion}`)}
                  </span>
                ))}
              </div>
            )}

            {/* Intensity */}
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-mist-white/60">{t('illuminateDetail.intensity')}</span>
                <span
                  className={cn(
                    'font-medium',
                    getIntensityColor(entry.emotionalIntensity).replace('bg-', 'text-')
                  )}
                >
                  {entry.emotionalIntensity}% • {getIntensityLabel(entry.emotionalIntensity)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-mist-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${entry.emotionalIntensity}%` }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className={cn('h-full rounded-full', getIntensityColor(entry.emotionalIntensity))}
                />
              </div>
            </div>
          </motion.section>

          {/* Section 4: Patterns Identified */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-glass-border bg-glass-bg p-4"
          >
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-mist-white/50">
              {t('illuminateDetail.sections.patterns')}
            </h2>

            {entry.userConfirmedDistortions.length > 0 ? (
              <div className="space-y-3">
                {entry.userConfirmedDistortions.map((type) => {
                  const info = DISTORTION_INFO[type as CognitiveDistortion];
                  return (
                    <div
                      key={type}
                      className="rounded-lg border border-warm-ember/20 bg-warm-ember/5 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{info?.emoji || '💭'}</span>
                        <span className="font-medium text-mist-white">
                          {t(`illuminate.distortions.${type}.name`, info?.name || type)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-mist-white/60">
                        {t(`illuminate.distortions.${type}.description`, info?.description || '')}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-mist-white/50">{t('illuminateDetail.noPatterns')}</p>
            )}
          </motion.section>

          {/* Section 5: The Reframe */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-biolum-cyan/30 bg-biolum-cyan/5 p-4"
          >
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-mist-white/50">
              {t('illuminateDetail.sections.reframe')}
            </h2>

            <div className="mb-2 flex items-center gap-2">
              <Lightbulb size={16} className="text-biolum-cyan" />
              <span className="text-xs text-biolum-cyan">
                {entry.customReframe
                  ? t('illuminateDetail.customReframe')
                  : t('illuminateDetail.suggestedReframe')}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-mist-white">{entry.selectedReframe}</p>
          </motion.section>

          {/* Delete Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pt-4"
          >
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>{t('illuminateDetail.deleteButton')}</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title={t('illuminateDetail.deleteConfirm.title')}
        message={t('illuminateDetail.deleteConfirm.message')}
        confirmText={t('illuminateDetail.deleteConfirm.confirm')}
        destructive
      />
    </div>
  );
};
