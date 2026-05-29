import { Box, Stack, Typography } from '@mui/material';

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
  status: 'Статуса',
  productionSite: 'Участок',
  equipmentType: 'Тип оборудования',
  scopes: 'Области применения',
  primaryStandarts: 'Эталоны',
  measurementTypes: 'Виды измерений',
  verifications: 'Поверки',
};

const VERIFICATION_FIELD_TRANSLATIONS: Record<string, string> = {
  date: 'Дата поверки',
  validUntil: 'Действительна до',
  result: 'Результат',
  protocolNumber: '№ Протокола/Свидетельства',
  comment: 'Примечание',
  documentUrl: 'Ссылка на документ',
  verificationOrganization: 'Организация-Поверитель',
  metrologyControleType: 'Вид контроля',
};

const IGNORED_VERIFICATION_FIELDS = [
  'id',
  'deviceId',
  'createdAt',
  'updatedAt',
];

export const formatAuditValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return 'пусто';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'пусто';

    if (
      typeof value[0] === 'object' &&
      value[0] !== null &&
      'name' in value[0]
    ) {
      return value.map((item: any) => item.name || 'Без названия').join(', ');
    }

    return value.join(', ');
  }

  if (typeof value === 'object' && value !== null) {
    if ('name' in value) {
      return String(value.name);
    }
    return 'Объект';
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

export const formatLogDate = (dateInput: any): string => {
  if (!dateInput) return '---';
  const timestamp = Number(dateInput);
  const parsedDate = !isNaN(timestamp)
    ? new Date(timestamp)
    : new Date(dateInput);
  return isNaN(parsedDate.getTime())
    ? 'Дата не указана'
    : parsedDate.toLocaleString();
};

const formatInnerValue = (val: any): string => {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val))) {
    return new Date(val).toLocaleDateString();
  }
  if (typeof val === 'object' && val?.name) return val.name;
  return String(val);
};

export const VerificationsList = ({
  items,
  type,
}: {
  items: any[];
  type: 'old' | 'new';
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontStyle: 'italic', p: 2, textAlign: 'center' }}
      >
        Список поверок пуст
      </Typography>
    );
  }

  const sortedItems = [...items].sort((a, b) => {
    return (
      new Date(b.validUntil || 0).getTime() -
      new Date(a.validUntil || 0).getTime()
    );
  });

  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      {sortedItems.map((v, index) => (
        <Box
          key={v.id || index}
          sx={{
            p: 1.5,
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            bgcolor: type === 'old' ? '#f8fafc' : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1, borderBottom: '1px dashed #e2e8f0', pb: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '0.8rem',
              }}
            >
              {v.protocolNumber || 'Без номера свидетельства'}
            </Typography>
            <Box
              sx={{
                px: 1,
                py: 0.2,
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: v.result === 'Годен' ? '#f0fdf4' : '#fff1f2',
                color: v.result === 'Годен' ? '#16a34a' : '#e11d48',
                border: `1px solid ${
                  v.result === 'Гоden' ? '#bbf7d0' : '#fecdd3'
                }`,
              }}
            >
              {v.result || '—'}
            </Box>
          </Stack>

          {Object.keys(v)
            .filter(
              (key) =>
                !IGNORED_VERIFICATION_FIELDS.includes(key) &&
                key !== 'result' &&
                key !== 'protocolNumber' &&
                key !== 'organization' &&
                !key.endsWith('Id')
            )
            .map((key) => {
              const label = VERIFICATION_FIELD_TRANSLATIONS[key] || key;
              return (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem', mr: 1 }}
                  >
                    {label}:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      textAlign: 'right',
                      maxWidth: '70%',
                      color: 'text.primary',
                    }}
                  >
                    {formatInnerValue(v[key])}
                  </Typography>
                </Box>
              );
            })}
        </Box>
      ))}
    </Stack>
  );
};
