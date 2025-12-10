import { type FC } from 'react';
import { Clock, Plus, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

import {
  CheckInModal,
  LogStream,
  LogDetailDialog,
  ProgressReef,
} from '../components/features/tideLog';
import { useDailyLogs } from '../hooks/useDailyLogs';
import { useDialog } from '../contexts/DialogContext';
import { useUI } from '../contexts/UIContext';
import { logAnalyticsEvent, AnalyticsEvent } from '../services/analytics.service';
import type { DailyLog } from '../models';

export const VaultPage: FC = () => {
  const { t } = useTranslation();
  const { logs, todayLog, loading } = useDailyLogs();
  const { push, pop } = useDialog();
  const { navbarBottom } = useUI();

  const openCheckIn = () => {
    logAnalyticsEvent(AnalyticsEvent.CHECK_IN_MODAL_OPENED);
    push(<CheckInModal existingLog={todayLog} onClose={() => pop()} />);
  };

  const handleLogClick = (log: DailyLog) => {
    logAnalyticsEvent(AnalyticsEvent.TIDE_LOG_VIEWED, { log_id: log.id });
    push(<LogDetailDialog log={log} onClose={() => pop()} />);
  };

  return (
    <div
      className="flex h-full flex-col overflow-y-auto bg-void-blue/70 px-4 py-8 pt-safe sm:px-6"
      style={{ paddingBottom: `${Math.max(navbarBottom + 32, 96)}px` }}
    >
      {/* Header - matches Profile page spacing */}
      <div className="mb-6">
        <h1 className="text-3xl font-light text-mist-white">{t('tideLog.title')}</h1>
        <p className="text-sm text-mist-white/60">
          {logs.length > 0
            ? t('tideLog.reef.entriesCount', { count: logs.length })
            : t('vault.subtitle')}
        </p>
      </div>

      {/* Check-In CTA Button - prominent placement */}
      <motion.button
        onClick={openCheckIn}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="active:scale-98 mb-10 flex w-full items-center justify-center gap-3 rounded-2xl border border-biolum-cyan/30 bg-biolum-cyan/10 px-6 py-4 text-lg font-medium text-biolum-cyan shadow-glow-sm transition-all duration-300 ease-viscous"
      >
        {todayLog ? <Edit2 size={22} /> : <Plus size={22} />}
        <span>{todayLog ? t('tideLog.updateCheckIn') : t('tideLog.checkIn')}</span>
      </motion.button>

      {/* Empty State or Content */}
      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-biolum-cyan border-t-transparent shadow-glow-md" />
          <p className="mt-4 text-sm text-mist-white/50">Loading...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Clock size={64} className="mb-4 text-mist-white/20" />
          <p className="text-center text-xl font-light text-mist-white/60">
            {t('tideLog.reef.emptyTitle')}
          </p>
          <p className="mt-3 text-center text-sm text-mist-white/40">
            {t('tideLog.reef.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Encouragement message */}
          {logs.length < 7 && (
            <p className="text-center text-sm text-biolum-cyan/70">{t('tideLog.reef.keepGoing')}</p>
          )}

          {/* Progress Reef (30-day visualization) - floating in void */}
          <ProgressReef logs={logs} onOrbClick={handleLogClick} />

          {/* Log Stream - minimal glass cards */}
          <LogStream logs={logs} onLogClick={handleLogClick} loading={loading} />
        </div>
      )}
    </div>
  );
};
