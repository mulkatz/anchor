import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { parseISO, isToday, isYesterday } from 'date-fns';
import { cn } from '../../../utils/cn';

interface DateDividerProps {
  date: string; // YYYY-MM-DD format
  isFirst?: boolean;
}

export const DateDivider: FC<DateDividerProps> = ({ date, isFirst }) => {
  const { t, i18n } = useTranslation();

  const getDisplayDate = (dateStr: string): string => {
    const parsedDate = parseISO(dateStr);

    // Use Intl.DateTimeFormat for localized short date (e.g., "11.12.25" in DE, "12/11/25" in EN)
    const shortDate = new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(parsedDate);

    if (isToday(parsedDate)) {
      return `${shortDate} (${t('depths.today').toLowerCase()})`;
    }

    if (isYesterday(parsedDate)) {
      return `${shortDate} (${t('depths.yesterday').toLowerCase()})`;
    }

    return shortDate;
  };

  return (
    <div
      data-date={date}
      className={cn('mb-6 flex items-center gap-4', isFirst ? 'mt-0' : 'mt-12')}
    >
      {/* Left gradient line */}
      <div className="h-px flex-1 bg-gradient-to-l from-biolum-cyan/20 to-transparent" />

      {/* Date badge */}
      <span className="rounded-full border border-biolum-cyan/10 bg-biolum-cyan/[0.03] px-3 py-1 text-xs tracking-wider text-biolum-cyan/50">
        {getDisplayDate(date)}
      </span>

      {/* Right gradient line */}
      <div className="h-px flex-1 bg-gradient-to-r from-biolum-cyan/20 to-transparent" />
    </div>
  );
};
