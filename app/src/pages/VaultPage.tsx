import { type FC } from 'react';
import { Archive, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';

import {
  CheckInModal,
  CheckInFAB,
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
      className="flex h-full flex-col overflow-y-auto bg-void-blue px-6 py-8 pt-safe"
      style={{ paddingBottom: `${Math.max(navbarBottom + 32, 96)}px` }}
    >
      {/* Header - floating in void */}
      <div className="mb-12">
        <div className="mb-3 flex items-center gap-3">
          <Archive size={36} className="text-biolum-cyan drop-shadow-glow" />
          <h1 className="text-3xl font-light text-white">{t('tideLog.title')}</h1>
        </div>
        <p className="text-sm text-mist-white/50">
          {logs.length > 0
            ? t('tideLog.reef.entriesCount', { count: logs.length })
            : t('vault.subtitle')}
        </p>
      </div>

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

      {/* Floating Action Button */}
      <CheckInFAB onClick={openCheckIn} hasTodayLog={!!todayLog} />
    </div>
  );
};
