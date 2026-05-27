export const FIELD_TRANSLATIONS: Record<string, string> = {
  name: 'Название',
  model: 'Модель',
  serialNumber: 'Серийный номер',
  releaseDate: 'Дата выпуска',
  grsiNumber: 'Номер ГРСИ',
  measurementRange: 'Диапазон измерений',
  accuracy: 'Погрешность',
  inventoryNumber: 'Инвентарный номер',
  receiptDate: 'Дата поступления',
  manufacturer: 'Производитель',
  verificationInterval: 'Межповерочный интервал',
  archived: 'В архиве',
  nomenclature: 'Номенклатура',
  comment: 'Комментарий',
  statusId: 'ID статуса',
  productionSiteId: 'ID участка',
  equipmentTypeId: 'ID типа оборудования',
  scopes: 'Области применения (ID)',
  primaryStandarts: 'Эталоны (ID)',
  measurementTypes: 'Виды измерений (ID)',
  verifications: 'Поверки',
};

// export const formatAuditValue = (value: any): string => {
//   if (value === null || value === undefined || value === '') return 'пусто';
//   if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
//   if (Array.isArray(value))
//     return value.length > 0 ? value.join(', ') : 'пусто';
//   return String(value);
// };
// export const formatAuditValue = (value: any): string => {
//   if (value === null || value === undefined || value === '') return 'пусто';
//   if (typeof value === 'boolean') return value ? 'Да' : 'Нет';

//   // Если это массив
//   if (Array.isArray(value)) {
//     if (value.length === 0) return 'пусто';

//     // Если это массив ОБЪЕКТОВ (например, поверки verifications)
//     if (typeof value[0] === 'object') {
//       return value
//         .map((obj: any, index: number) => {
//           // Пробуем вытащить понятные свойства поверки (например, номер свидетельства или дату)
//           const docNumber = obj.number || obj.verificationNumber || '';
//           const date =
//             obj.date || obj.verificationDate
//               ? new Date(obj.date || obj.verificationDate).toLocaleDateString()
//               : '';
//           return `[Поверка №${docNumber || index + 1} от ${date || '---'}]`;
//         })
//         .join(', ');
//     }

//     // Если это массив обычных строк/ID (scopes, measurementTypes)
//     return value.join(', ');
//   }

//   // Если это одиночный пришедший объект
//   if (typeof value === 'object') {
//     return JSON.stringify(value);
//   }

//   return String(value);
// };
// export const formatAuditValue = (value: any): string => {
//   if (value === null || value === undefined || value === '') return 'пусто';
//   if (typeof value === 'boolean') return value ? 'Да' : 'Нет';

//   // Если это массив
//   if (Array.isArray(value)) {
//     if (value.length === 0) return 'пусто';

//     // Если это массив ОБЪЕКТОВ (поверки)
//     if (typeof value[0] === 'object') {
//       return value
//         .map((obj: any, index: number) => {
//           const docNumber = obj.number || obj.verificationNumber || '';
//           const date =
//             obj.date || obj.verificationDate
//               ? new Date(obj.date || obj.verificationDate).toLocaleDateString()
//               : '';
//           return `[Поверка №${docNumber || index + 1} от ${date || '---'}]`;
//         })
//         .join(', ');
//     }

//     return value.join(', ');
//   }

//   // Проверка: если строка является ISO датой (например, дата выпуска прибора)
//   if (
//     typeof value === 'string' &&
//     value.includes('T') &&
//     !isNaN(Date.parse(value))
//   ) {
//     return new Date(value).toLocaleDateString();
//   }

//   return String(value);
// };
export const formatAuditValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return 'пусто';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'пусто';

    // Проверяем, является ли первый элемент объектом (поверки)
    if (typeof value[0] === 'object' && value[0] !== null) {
      return value
        .map((obj: any, index: number) => {
          const docNumber = obj.number || obj.verificationNumber || '';

          // Безопасно парсим дату поверки
          const rawDate = obj.date || obj.verificationDate;
          let formattedDate = '---';
          if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toLocaleDateString();
            } else if (typeof rawDate === 'string') {
              // Если пришла уже готовая строка YYYY-MM-DD, пробуем развернуть её красиво
              const parts = rawDate.split('-');
              if (parts.length === 3)
                formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
            }
          }

          return `[Поверка №${docNumber || index + 1} от ${formattedDate}]`;
        })
        .join(', ');
    }

    // Если это массив строк/ID
    return value.join(', ');
  }

  if (
    typeof value === 'string' &&
    value.includes('T') &&
    !isNaN(Date.parse(value))
  ) {
    return new Date(value).toLocaleDateString();
  }

  return String(value);
};

// Функция для безопасного парсинга даты создания лога
export const formatLogDate = (dateInput: any): string => {
  if (!dateInput) return '---';

  // Если это timestamp в виде строки или числа
  const timestamp = Number(dateInput);
  const parsedDate = !isNaN(timestamp)
    ? new Date(timestamp)
    : new Date(dateInput);

  if (isNaN(parsedDate.getTime())) {
    return 'Дата не указана';
  }

  return parsedDate.toLocaleString();
};
