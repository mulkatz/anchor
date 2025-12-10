import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHaptics } from '../../../hooks/useHaptics';
import { cn } from '../../../utils/cn';

interface JournalInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeep: () => void;
  onRelease: () => void;
  disabled?: boolean;
  className?: string;
}

const MAX_CHARS = 1000;

/**
 * Journal text input with Keep/Release actions
 * Keep = Normal save (is_released: false)
 * Release = Save with dissolution animation (is_released: true)
 */
export const JournalInput: FC<JournalInputProps> = ({
  value,
  onChange,
  onKeep,
  onRelease,
  disabled = false,
  className,
}) => {
  const { t } = useTranslation();
  const { light, medium } = useHaptics();

  const charCount = value.length;
  const isNearLimit = charCount >= 900;
  const isAtLimit = charCount >= MAX_CHARS;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CHARS) {
      onChange(newValue);
    }
  };

  const handleKeep = () => {
    light();
    onKeep();
  };

  const handleRelease = () => {
    medium();
    onRelease();
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Text area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={t('tideLog.journal.placeholder')}
          disabled={disabled}
          rows={8}
          className={cn(
            'w-full rounded-2xl border border-glass-border bg-glass-bg px-4 py-3 text-mist-white placeholder-mist-white/50 backdrop-blur-glass transition-colors',
            'focus:border-biolum-cyan focus:outline-none focus:ring-2 focus:ring-biolum-cyan/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none'
          )}
          aria-label={t('tideLog.journal.title')}
        />

        {/* Character counter */}
        <div
          className={cn(
            'absolute bottom-3 right-3 text-xs transition-colors',
            isAtLimit ? 'text-danger' : isNearLimit ? 'text-warm-ember' : 'text-mist-white/50'
          )}
        >
          {t('tideLog.journal.charLimit', { count: charCount })}
        </div>
      </div>

      {/* Info text */}
      <p className="text-xs text-mist-white/60">{t('tideLog.journal.releaseInfo')}</p>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Keep button */}
        <motion.button
          onClick={handleKeep}
          disabled={disabled}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl border border-biolum-cyan bg-glass-bg px-6 py-3 text-biolum-cyan backdrop-blur-glass transition-all',
            'hover:bg-biolum-cyan/10 hover:shadow-glow-sm',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'font-medium'
          )}
        >
          <Save size={20} />
          <span>{t('tideLog.journal.keep')}</span>
        </motion.button>

        {/* Release button */}
        <motion.button
          onClick={handleRelease}
          disabled={disabled}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl border border-warm-ember bg-warm-ember/10 px-6 py-3 text-warm-ember backdrop-blur-glass transition-all',
            'hover:bg-warm-ember/20 hover:shadow-[0_0_20px_rgba(255,179,138,0.3)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'font-medium'
          )}
        >
          <Sparkles size={20} />
          <span>{t('tideLog.journal.release')}</span>
        </motion.button>
      </div>
    </div>
  );
};
