import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive } from 'lucide-react';

export const EmptyArchive: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      <Archive size={64} className="mb-6" style={{ color: '#3F4457' }} />
      <p className="text-center text-xl font-light text-mist-white/60">{t('archive.emptyTitle')}</p>
      <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-mist-white/40">
        {t('archive.emptyDescription')}
      </p>
    </div>
  );
};
