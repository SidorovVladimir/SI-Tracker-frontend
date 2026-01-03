import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (
  value: string,
  dateFormat = 'd MMMM yyyy'
): string => {
  if (!value) return '—';

  try {
    let date: Date;

    if (typeof value === 'number') {
      date = new Date(value);
    } else {
      date = new Date(Number(value));
    }

    return format(date, dateFormat, { locale: ru });
  } catch (err) {
    console.error('Invalid date value:', err);
    return '—';
  }
};
