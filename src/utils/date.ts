import { format, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (
  value: string | number | Date | null | undefined,
  dateFormat = 'd MMMM yyyy'
): string => {
  // 1. Быстрая проверка на пустые значения
  if (value === null || value === undefined || value === '') return '—';

  let date: Date;

  // 2. Если уже пришел объект даты
  if (value instanceof Date) {
    date = value;
  }
  // 3. Если пришло число (таймстамп в миллисекундах)
  else if (typeof value === 'number') {
    date = new Date(value);
  }
  // 4. Если пришла строка
  else {
    const trimmed = String(value).trim();

    // Если строка состоит только из цифр (таймстамп в виде строки, например "1719218732000")
    if (/^\d+$/.test(trimmed)) {
      date = new Date(Number(trimmed));
    }
    // Если это стандартная ISO строка (например "2026-06-24")
    else {
      date = parseISO(trimmed);
    }
  }

  // 5. ЖЕЛЕЗОБЕТОННАЯ ЗАЩИТА: Проверяем валидность даты перед форматированием
  if (!isValid(date)) {
    console.error('Invalid date value received:', value);
    return '—'; // Вместо падения приложения возвращаем аккуратный прочерк
  }

  try {
    return format(date, dateFormat, { locale: ru });
  } catch (err) {
    console.error('Error during date formatting:', err);
    return '—';
  }
};
