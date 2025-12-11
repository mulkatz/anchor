import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { parseISO, isToday, isYesterday } from 'date-fns';

interface DateDividerProps {
  date: string; // YYYY-MM-DD format
}

export const DateDivider: FC<DateDividerProps> = ({ date }) => {
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
    <div data-date={date} className="mb-4 mt-10 flex items-center justify-start">
      <span className="text-sm italic text-biolum-cyan/60">{getDisplayDate(date)}</span>
    </div>
  );
};
