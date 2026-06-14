import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
// import * as XLSX from 'xlsx';
import { useSnackbar } from 'notistack';
import { ImportDevicesFromExcelDocument } from '../graphql/types/__generated__/graphql';
import { useMutation } from '@apollo/client/react';

// Поля нашей системы, которые обязательно или опционально нужно заполнить
const SYSTEM_FIELDS = [
  { key: 'name', label: 'Наименование прибора *', required: true },
  { key: 'model', label: 'Модель / Модификация *', required: true },
  {
    key: 'serialNumber',
    label: 'Заводской / Серийный номер *',
    required: true,
  },
  { key: 'grsiNumber', label: 'Номер ГРСИ', required: false },
  { key: 'inventoryNumber', label: 'Инвентарный номер', required: false },
  { key: 'measurementRange', label: 'Диапазон измерений', required: false },
  { key: 'accuracy', label: 'Класс точности / Погрешность', required: false },
  { key: 'manufacturer', label: 'Производитель', required: false },
  {
    key: 'verificationInterval',
    label: 'Межповерочный интервал (МПИ)',
    required: false,
  },
  { key: 'nomenclature', label: 'Номенклатура 1С', required: false },
  { key: 'comment', label: 'Примечание', required: false },
  { key: 'cityName', label: 'Город *', required: true },
  { key: 'companyName', label: 'Организация (Юр. лицо) *', required: true },
  {
    key: 'productionSiteName',
    label: 'Производственный участок *',
    required: true,
  },
  {
    key: 'statusName',
    label: 'Текущий статус (Годен/Списан) *',
    required: true,
  },
  {
    key: 'equipmentTypeName',
    label: 'Тип оборудования (СИ/ИО/ВО)',
    required: false,
  },
  {
    key: 'scopesNames',
    label: 'Сферы госрегулирования (через запятую)',
    required: false,
  },
  {
    key: 'measurementTypesNames',
    label: 'Виды измерений (через запятую)',
    required: false,
  },
  {
    key: 'primaryStandardsNames',
    label: 'Гос. первичные эталоны (через запятую)',
    required: false,
  },
];

export const ExcelImporter: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Состояния для хранения распарсенных данных Excel
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isFileReading, setIsFileReading] = useState<boolean>(false);

  // Карта сопоставления: { [ключ_нашей_системы]: "Название_колонки_из_Excel" }
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const [importDevices, { loading }] = useMutation(
    ImportDevicesFromExcelDocument,
    {
      // refetchQueries: ['GetDevicesWithRelations'], // Обновляем основную таблицу оборудования
      onCompleted: (res: any) => {
        // enqueueSnackbar(
        //   `Импорт успешно завершен! Загружено приборов: ${res.importDevicesFromExcel}`,
        //   {
        //     variant: 'success',
        //   }

        // const { jobId, message } = res.importDevicesFromExcel;
        const { message } = res.importDevicesFromExcel;
        // 1. Выводим тост Шага 1 в наш единый не накладывающийся менеджер тостов
        enqueueSnackbar(
          message ||
            'Файл успешно принят. Валидация строк запущена в фоновом режиме.',
          {
            variant: 'warning',
            key: 'db-import-toast',
            autoHideDuration: 60000,
          }
        );
        // Сбрасываем состояние после успешного импорта
        setExcelHeaders([]);
        setExcelRows([]);
        setMapping({});
        setFileName('');
      },
      onError: (err: any) => {
        // enqueueSnackbar(`Ошибка импорта: ${err.message}`, { variant: 'error' });
        enqueueSnackbar(`Ошибка старта импорта: ${err.message}`, {
          variant: 'error',
          key: 'db-import-toast',
        });
      },
    }
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsFileReading(true);

    // 1. Описываем код, который будет выполняться изолированно в фоновом потоке (Web Worker)
    // Мы загружаем SheetJS прямо внутрь воркера через официальный CDN
    // importScripts("https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js");
    const workerCode = `
   importScripts("${window.location.origin}/xlsx.full.min.js");
 self.addEventListener('message', (e) => {
    try {
      const buffer = e.data;
      
      const wb = XLSX.read(buffer, { 
        type: 'array',
        cellHTML: false,
        cellFormula: false,
        cellDates: false,
        cellText: true
      });
      
      const wsname = wb.SheetNames[0]; // Надежно берем первый лист
      const ws = wb.Sheets[wsname];
      if (!ws) throw new Error("Лист в Excel-файле не найден");

      // 🎯 МАГИЯ ОПТИМИЗАЦИИ: Защита от битых !ref (1048576 строк)
      // Мы самостоятельно вычисляем реальный диапазон, где физически есть данные
      let maxRow = 0;
      let maxCol = 0;

      // Ключи объекта ws — это координаты ячеек (например, "A1", "B20")
      for (const key in ws) {
        if (key[0] === '!') continue; // Пропускаем служебные поля вроде !ref
        
        const coord = XLSX.utils.decode_cell(key);
        if (coord.r > maxRow) maxRow = coord.r;
        if (coord.c > maxCol) maxCol = coord.c;
      }

      // Ограничиваем фантомные колонки до разумного лимита (паспорт СИ — это максимум 30 колонок)
      const safeMaxCol = Math.min(maxCol, 30);

      // Жестко перезаписываем рамки таблицы реальным диапазоном!
      // Теперь sheet_to_json обработает ровно столько строк, сколько там физически есть
      ws['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: maxRow, c: safeMaxCol }
      });

      // Теперь вызов функции произойдет мгновенно, так как диапазон сжат
      const rawData = XLSX.utils.sheet_to_json(ws, { 
        header: 1, 
        blankrows: false 
      });

      // Фильтруем пустые массивы
      const finalData = rawData.filter(row => {
        return Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== "");
      });

      self.postMessage({ success: true, data: finalData });
    } catch (err) {
      self.postMessage({ success: false, error: err.message });
    }
  });
`;

    // 2. Создаем Blob из строки кода и инициализируем воркер
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    // 3. Подписываемся на ответ от фонового потока
    worker.onmessage = (evt) => {
      const { success, data, error } = evt.data;

      if (!success) {
        enqueueSnackbar(`Ошибка парсинга: ${error}`, { variant: 'error' });
        setIsFileReading(false);
        worker.terminate(); // Убиваем воркер после работы
        return;
      }

      if (!data || data.length === 0) {
        enqueueSnackbar('Выбранный Excel файл пуст', { variant: 'warning' });
        setIsFileReading(false);
        worker.terminate();
        return;
      }

      // Извлекаем заголовки и строки в основном потоке (это уже работает мгновенно)
      const firstRow = data[0];
      const headers = firstRow.map((h: any, index: number) => {
        if (h === undefined || h === null) return `Колонка ${index + 1}`;
        return String(h).trim();
      });

      const rows = data.slice(1);

      setExcelHeaders(headers);
      setExcelRows(rows);

      // Умный авто-маппинг
      const initialMapping: Record<string, string> = {};
      SYSTEM_FIELDS.forEach((sys) => {
        const exactMatch = headers.find((h: any) => {
          if (!h || typeof h !== 'string') return false;
          const cleanHeader = h.toLowerCase().trim();
          const cleanLabel = sys.label.replace('*', '').trim().toLowerCase();
          const cleanKey = sys.key.toLowerCase();
          return cleanHeader === cleanLabel || cleanHeader === cleanKey;
        });

        if (exactMatch) {
          initialMapping[sys.key] = exactMatch;
        }
      });
      setMapping(initialMapping);

      setIsFileReading(false);
      worker.terminate(); // Обязательно завершаем поток, чтобы не текла память
    };

    worker.onerror = (err) => {
      console.error('Ошибка внутри Web Worker:', err);
      enqueueSnackbar('Ошибка фонового потока при разборе файла', {
        variant: 'error',
      });
      setIsFileReading(false);
      worker.terminate();
    };

    // 4. Читаем файл как ArrayBuffer и перекидываем сырые байты в воркер
    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;

      // Передаем буфер в воркер (используем трансфераблы для нулевого копирования памяти)
      worker.postMessage(buffer, [buffer]);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSelectChange = (sysKey: string, excelHeader: string) => {
    setMapping((prev) => ({ ...prev, [sysKey]: excelHeader }));
  };

  const handleStartImport = async () => {
    // Проверяем, все ли обязательные поля замаплены
    const missingFields = SYSTEM_FIELDS.filter(
      (f) => f.required && !mapping[f.key]
    );
    if (missingFields.length > 0) {
      enqueueSnackbar(
        `Сопоставьте обязательные поля: ${missingFields
          .map((f) => f.label)
          .join(', ')}`,
        {
          variant: 'error',
        }
      );
      return;
    }

    // Трансформируем строки Excel в плоский массив JSON-объектов по нашей карте маппинга
    const payload = excelRows
      .map((row) => {
        const item: Record<string, any> = {};

        SYSTEM_FIELDS.forEach((sys) => {
          // Находим индекс колонки Excel по её названию
          const excelHeaderName = mapping[sys.key];
          const columnIndex = excelHeaders.indexOf(excelHeaderName);

          // Вытаскиваем значение из ячейки, если колонка привязана
          let value = columnIndex !== -1 ? row[columnIndex] : null;

          // Приводим все значения к строке для бэкенда
          item[sys.key] =
            value !== undefined && value !== null ? String(value).trim() : null;
        });

        return item;
      })
      // Отсекаем пустые строчки в Excel, где не заполнены ключевые поля
      .filter((item) => item.name && item.serialNumber);

    if (payload.length === 0) {
      enqueueSnackbar('Нет валидных данных для импорта', {
        variant: 'warning',
      });
      return;
    }
    try {
      enqueueSnackbar(
        `📦 Шаг 1/2: Отправка ${payload.length} приборов на сервер...`,
        {
          variant: 'info',
          key: 'db-import-toast',
        }
      );
      await importDevices({ variables: { input: payload as any } });
    } catch (error) {
      console.error('Ошибка вызова мутации импорта:', error);
    }
    // Отправляем пачку готового JSON на бэкенд
  };

  return (
    <Box
      sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.paper', borderRadius: 2 }}
    >
      {/* Шапка страницы импорта в стиле панели администратора */}
      <Box
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          📥 Пакетный импорт оборудования
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Загрузите файл Excel (.xlsx), сопоставьте колонки таблицы с полями
          паспорта прибора и запустите автоматическое наполнение реестра.
        </Typography>
      </Box>

      {/* Зона загрузки файла */}
      <Box
        sx={{
          p: 4,
          mb: 4,
          border: '2px dashed',
          borderColor: isFileReading
            ? 'warning.main'
            : excelHeaders.length > 0
            ? 'success.light'
            : 'divider',
          borderRadius: 2,
          bgcolor: 'grey.50',
          textAlign: 'center',
        }}
      >
        {isFileReading ? (
          // Состояние когда файл парсится в памяти браузера
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              py: 1,
            }}
          >
            <CircularProgress size={32} color="warning" />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 'medium' }}
            >
              ⏳ Чтение и анализ структуры таблицы "{fileName}"...
            </Typography>
          </Box>
        ) : (
          // Обычное состояние или когда файл уже успешно загружен
          <Box>
            <Typography
              variant="body1"
              sx={{ mb: 2, color: 'text.secondary', fontWeight: 'medium' }}
            >
              {excelHeaders.length > 0
                ? `📁 Файл: ${fileName} (Колонок: ${excelHeaders.length}, Строк с данными: ${excelRows.length})`
                : 'Выберите файл xlsx со списком средств измерений для начала настройки соответствия'}
            </Typography>

            <Button
              variant={excelHeaders.length > 0 ? 'outlined' : 'contained'}
              component="label"
              color={excelHeaders.length > 0 ? 'inherit' : 'primary'}
              disabled={loading}
            >
              {excelHeaders.length > 0
                ? '🔄 Выбрать другой файл'
                : '📁 Выбрать Excel-файл (.xlsx)'}
              <input
                type="file"
                accept=".xlsx, .xls"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        )}
      </Box>

      {excelHeaders.length > 0 && (
        <Grid container spacing={3}>
          {/* Левая часть: Интерфейс сопоставления полей */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, p: 2, bgcolor: 'grey.50' }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'bold', mb: 2 }}
              >
                ⚙️ Настройка соответствия колонок
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {SYSTEM_FIELDS.map((field) => (
                  <FormControl
                    key={field.key}
                    size="small"
                    fullWidth
                    // bgcolor="background.paper"
                  >
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={mapping[field.key] || ''}
                      label={field.label}
                      onChange={(e) =>
                        handleSelectChange(field.key, e.target.value)
                      }
                    >
                      <MenuItem value="">
                        <em>-- Не импортировать --</em>
                      </MenuItem>
                      {excelHeaders.map((header, idx) => (
                        <MenuItem key={idx} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </Box>

              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                disabled={loading || isFileReading}
                onClick={handleStartImport}
                sx={{ mt: 3, fontWeight: 'bold', textTransform: 'none' }}
              >
                {loading
                  ? '⏳ Инициализация очереди...'
                  : '🚀 Запустить импорт приборов'}
              </Button>
            </Card>
          </Grid>

          {/* Правая часть: Превью файла пользователя (первые 4 строки) */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              👀 Превью загруженного файла (Первые строки)
            </Typography>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2, maxHeight: 500 }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {excelHeaders.map((h, i) => (
                      <TableCell
                        key={i}
                        sx={{ bgcolor: 'grey.100', fontWeight: 'bold' }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {excelRows.slice(0, 4).map((row, rIdx) => (
                    <TableRow key={rIdx}>
                      {excelHeaders.map((_, cIdx) => (
                        <TableCell key={cIdx}>
                          {row[cIdx] !== undefined ? String(row[cIdx]) : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
