import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

interface DateDividerProps {
  date: string; // YYYY-MM-DD format
}

export const DateDivider: FC<DateDividerProps> = ({ date }) => {
  const { t } = useTranslation();

  const getDisplayDate = (dateStr: string): string => {
    const parsedDate = parseISO(dateStr);

    if (isToday(parsedDate)) {
      return t('depths.today');
    }

    if (isYesterday(parsedDate)) {
      return t('depths.yesterday');
    }

    return format(parsedDate, 'MMM d');
  };

  return (
    <div data-date={date} className="mb-4 mt-10 flex items-center justify-start">
      <span className="rounded-full border border-mist-white/10 bg-mist-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-mist-white/40">
        {getDisplayDate(date)}
      </span>
    </div>
  );
};
