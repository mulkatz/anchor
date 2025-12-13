import { type FC } from 'react';
import { Waves } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Empty State for The Dive
 * Shown when user hasn't started any lessons yet
 */
export const DiveEmptyState: FC<{ onBegin: () => void }> = ({ onBegin }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      <Waves size={64} className="mb-6" style={{ color: '#3F4457' }} />
      <p className="text-center text-xl font-light text-mist-white/60">
        {t('dive.emptyState.title')}
      </p>
      <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-mist-white/40">
        {t('dive.emptyState.description')}
      </p>

      {/* CTA Button */}
      <button
        onClick={onBegin}
        className="mt-8 rounded-2xl border border-biolum-cyan/30 bg-biolum-cyan/10 px-8 py-4 text-biolum-cyan shadow-glow-sm transition-all duration-300 ease-viscous active:scale-95"
      >
        <span className="text-lg">{t('dive.emptyState.startButton')}</span>
      </button>
    </div>
  );
};
