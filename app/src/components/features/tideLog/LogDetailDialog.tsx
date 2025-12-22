import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Trash2, CloudRain, CloudFog, Sun, Sparkles, Wind, Anchor } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import type { DailyLog, WeatherType } from '../../../models';
import { useDailyLogs } from '../../../hooks/useDailyLogs';
import { useHaptics } from '../../../hooks/useHaptics';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { logAnalyticsEvent, AnalyticsEvent } from '../../../services/analytics.service';
import { cn } from '../../../utils/cn';

interface LogDetailDialogProps {
  log: DailyLog;
  onClose: () => void;
}

const weatherIcons: Record<WeatherType, typeof CloudRain> = {
  stormy: CloudRain,
  foggy: CloudFog,
  turbulent: Wind,
  clear: Sun,
  sunny: Sparkles,
  calm: Anchor,
};

const weatherColors: Record<WeatherType, string> = {
  stormy: 'text-[#9B7DFF]',
  foggy: 'text-[#B0B0B0]',
  turbulent: 'text-biolum-cyan',
  clear: 'text-[#FFD93D]',
  sunny: 'text-warm-ember',
  calm: 'text-[#7DD3FC]',
};

/**
 * Full-screen dialog showing complete log entry details
 * Includes delete functionality
 */
export const LogDetailDialog: FC<LogDetailDialogProps> = ({ log, onClose }) => {
  const { t } = useTranslation();
  const { light, heavy } = useHaptics();
  const { deleteLog } = useDailyLogs();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResurfaced, setIsResurfaced] = useState(false);

  const Icon = weatherIcons[log.weather];
  const iconColor = weatherColors[log.weather];

  const handleClose = () => {
    light();
    onClose();
  };

  const handleResurface = () => {
    light();
    setIsResurfaced(true);

    // Auto-blur after 5 seconds
    setTimeout(() => {
      setIsResurfaced(false);
    }, 5000);
  };

  const handleDeleteClick = () => {
    heavy();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteLog(log.id);
      logAnalyticsEvent(AnalyticsEvent.TIDE_LOG_DELETED);
      onClose();
    } catch (error) {
      console.error('Error deleting log:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998] bg-void-blue/80 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center px-4 pt-safe pb-safe"
      >
        <div className="pointer-events-auto w-full max-w-lg">
          <div
            className={cn(
              'rounded-2xl border border-glass-border',
              'bg-void-blue/95 backdrop-blur-glass',
              'p-6 shadow-glass'
            )}
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Icon size={56} className={iconColor} />
                <div>
                  <h2 className="text-xl font-medium text-mist-white">
                    {t(`tideLog.weather.${log.weather}`)}
                  </h2>
                  <p className="text-sm text-mist-white/60">
                    {format(log.createdAt, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="rounded-full p-2 text-mist-white/70 transition-colors hover:bg-mist-white/10 hover:text-mist-white"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mood depth */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-sm text-mist-white/70">
                <span>{t('tideLog.depth.title')}</span>
                <span className="font-medium text-mist-white">
                  {log.mood_depth} -{' '}
                  {log.mood_depth > 66
                    ? t('tideLog.depth.surface')
                    : log.mood_depth < 34
                      ? t('tideLog.depth.deep')
                      : t('tideLog.depth.anchored')}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-mist-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${log.mood_depth}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-biolum-cyan shadow-glow-sm"
                />
              </div>
            </div>

            {/* Journal note */}
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-mist-white/70">
                {t('tideLog.journal.title')}
              </h3>
              {log.is_released && !isResurfaced ? (
                <button
                  onClick={handleResurface}
                  className="group relative w-full rounded-xl border border-glass-border bg-glass-bg p-4 text-left transition-all hover:border-warm-ember/40"
                >
                  <p className="select-none text-mist-white/70 blur-sm">
                    {log.note_text || t('tideLog.stream.noNote')}
                  </p>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="rounded-full bg-void-blue px-4 py-2 text-sm font-medium text-warm-ember shadow-glass transition-all group-hover:shadow-glow-md">
                      {t('tideLog.stream.dissolved')}
                    </span>
                    <span className="text-xs text-mist-white/50">{t('tideLog.resurface')}</span>
                  </div>
                </button>
              ) : (
                <div className="rounded-xl border border-glass-border bg-glass-bg p-4">
                  <p className="whitespace-pre-wrap text-mist-white/70">
                    {log.note_text || t('tideLog.stream.noNote')}
                  </p>
                  {log.is_released && isResurfaced && (
                    <p className="mt-2 text-xs italic text-warm-ember/60">
                      {t('tideLog.resurfacing')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl border border-danger bg-danger/10 px-6 py-3 text-danger transition-all',
                'hover:bg-danger/20',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <Trash2 size={20} />
              <span>{isDeleting ? 'Deleting...' : t('general.delete')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('tideLog.deleteTitle')}
        message={t('tideLog.deleteMessage')}
        confirmText={t('general.delete')}
        cancelText={t('general.cancel')}
        onConfirm={handleConfirmDelete}
        destructive
      />
    </>
  );
};
