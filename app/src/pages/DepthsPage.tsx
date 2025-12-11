import { type FC } from 'react';
import { Feather } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DepthsDocument } from '../components/features/depths/DepthsDocument';
import { useJournal } from '../hooks/useJournal';
import { useUI } from '../contexts/UIContext';

export const DepthsPage: FC = () => {
  const { t } = useTranslation();
  const {
    entries,
    loading,
    todayEntry,
    activeSession,
    updateActiveSessionText,
    loadOlderEntries,
    hasMoreEntries,
  } = useJournal();
  const { navbarBottom } = useUI();

  // Calculate bottom padding to account for fixed navbar
  const bottomPadding = Math.max(navbarBottom, 100);

  return (
    <div
      className="flex h-full flex-col bg-void-blue/70"
      style={{ paddingBottom: `${bottomPadding}px` }}
    >
      {/* Sticky Header */}
      <header className="shrink-0 border-b border-glass-border px-4 py-4 pt-safe sm:px-6">
        <h1 className="text-3xl font-light text-mist-white">{t('depths.title')}</h1>
        <p className="text-sm text-mist-white/60">{t('depths.subtitle')}</p>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-biolum-cyan border-t-transparent shadow-glow-md" />
        </div>
      ) : entries.length === 0 && !todayEntry ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <Feather size={64} className="mb-6 text-mist-white/20" />
          <p className="text-center text-xl font-light text-mist-white/60">
            {t('depths.emptyState.title')}
          </p>
          <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-mist-white/40">
            {t('depths.emptyState.description')}
          </p>

          {/* Start writing prompt */}
          <button
            onClick={() => updateActiveSessionText('')}
            className="mt-8 rounded-2xl border border-biolum-cyan/30 bg-biolum-cyan/10 px-8 py-4 text-biolum-cyan shadow-glow-sm transition-all duration-300 ease-viscous active:scale-95"
          >
            <span className="text-lg">{t('depths.placeholder')}</span>
          </button>
        </div>
      ) : (
        <DepthsDocument
          entries={entries}
          todayEntry={todayEntry}
          activeSession={activeSession}
          onTextChange={updateActiveSessionText}
          onLoadMore={loadOlderEntries}
          hasMore={hasMoreEntries}
        />
      )}
    </div>
  );
};
