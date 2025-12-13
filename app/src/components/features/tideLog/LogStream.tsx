import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';

import { LogCard } from './LogCard';
import { LoadingSpinner } from '../../ui';
import type { DailyLog } from '../../../models';
import { cn } from '../../../utils/cn';

interface LogStreamProps {
  logs: DailyLog[];
  onLogClick: (log: DailyLog) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Vertical timeline of journal entries
 * Shows most recent entries first
 */
export const LogStream: FC<LogStreamProps> = ({ logs, onLogClick, loading = false, className }) => {
  const { t } = useTranslation();

  if (loading) {
    return <LoadingSpinner className={cn('py-12', className)} />;
  }

  if (logs.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <FileText size={48} className="mb-3 text-mist-white/30" />
        <p className="text-center text-mist-white/50">{t('tideLog.stream.noEntries')}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Section title */}
      <h3 className="mb-4 text-lg font-medium text-mist-white">{t('tideLog.stream.title')}</h3>

      {/* Entry cards */}
      <div className="space-y-3">
        {logs.map((log, index) => (
          <LogCard key={log.id} log={log} onClick={() => onLogClick(log)} index={index} />
        ))}
      </div>
    </div>
  );
};
