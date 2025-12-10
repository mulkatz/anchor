import { type FC } from 'react';
import { Archive, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const VaultPage: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Archive size={32} className="text-biolum-cyan" />
          <h1 className="text-3xl font-light text-mist-white">{t('vault.title')}</h1>
        </div>
        <p className="text-mist-white/60">{t('vault.subtitle')}</p>
      </div>

      {/* Empty State (placeholder) */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <Clock size={64} className="mb-4 text-mist-white/30" />
        <p className="text-center text-lg text-mist-white/50">{t('vault.emptyTitle')}</p>
        <p className="mt-2 text-center text-sm text-mist-white/40">{t('vault.emptyDescription')}</p>
      </div>
    </div>
  );
};
