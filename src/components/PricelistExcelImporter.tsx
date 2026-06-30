// import React, { useState } from 'react';
// import {
//   Box,
//   Button,
//   Card,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   Typography,
//   Grid,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   CircularProgress,
//   TextField,
//   FormControlLabel,
//   Switch,
// } from '@mui/material';
// import { useSnackbar } from 'notistack';
// import { useMutation, useQuery } from '@apollo/client/react';
// import {
//   CreatePricelistDocument,
//   GetPricelistsDocument,
//   GetVerificationOrganizationsListDocument,
// } from '../graphql/types/__generated__/graphql';
// import { useSocketApp } from '../context/SocketContext';
// import { formatStrictUpper } from '../utils/capitalize';

// const PRICELIST_FIELDS = [
//   { key: 'name', label: 'Наименование СИ из прайса *', required: true },
//   { key: 'price', label: 'Цена без НДС *', required: true },
//   {
//     key: 'grsiNumber',
//     label: 'Номер ГРСИ (Для регулируемых)',
//     required: false,
//   },
//   {
//     key: 'csmCode',
//     label: 'Код СИ / Шифр позиции (Для договорных)',
//     required: false,
//   },
//   {
//     key: 'modelOrType',
//     label: 'Модель / Тип / Модификация СИ',
//     required: false,
//   },
// ];

// export const PricelistExcelImporter: React.FC = () => {
//   const { enqueueSnackbar } = useSnackbar();

//   const { addRunningJob } = useSocketApp();

//   // 1. Состояния метаданных самого прейскуранта
//   const [title, setTitle] = useState<string>('');
//   const [year, setYear] = useState<number>(new Date().getFullYear());
//   const [isRegulated, setIsRegulated] = useState<boolean>(true);

//   const [headerRowIndex, setHeaderRowIndex] = useState<number>(0);
//   const [verificationOrganizationId, setVerificationOrganizationId] =
//     useState<string>('');

//   // 2. Состояния для хранения распарсенных данных Excel
//   const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
//   const [excelRows, setExcelRows] = useState<any[]>([]);
//   const [fileName, setFileName] = useState<string>('');
//   const [isFileReading, setIsFileReading] = useState<boolean>(false);

//   // Карта сопоставления: { [ключ_нашей_системы]: "Название_колонки_из_Excel" }
//   const [mapping, setMapping] = useState<Record<string, string>>({});
//   // 3. Мутация для отправки готового прейскуранта на бэкенд
//   const [createPricelist, { loading: submitting }] = useMutation(
//     CreatePricelistDocument,
//     {
//       refetchQueries: [{ query: GetPricelistsDocument }], // Обновляем список прайсов
//       onCompleted: (res: any) => {
//         const { jobId, message } = res.createPricelist;

//         enqueueSnackbar(message || 'Прейскурант принят сервером.', {
//           variant: 'warning',
//           autoHideDuration: 10000,
//         });

//         if (jobId) {
//           addRunningJob(jobId, 'pricelist-import');
//         }

//         // Сбрасываем состояние файла после успеха
//         setExcelHeaders([]);
//         setExcelRows([]);
//         setMapping({});
//         setFileName('');
//         setTitle('');
//       },
//       onError: (err) => {
//         enqueueSnackbar(`Ошибка импорта: ${err.message}`, { variant: 'error' });
//       },
//     }
//   );

//   const { data: orgsData, loading: orgLoading } = useQuery(
//     GetVerificationOrganizationsListDocument
//   );

//   const organizations = orgsData?.verificationOrganizations || [];

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setFileName(file.name);
//     setIsFileReading(true);

//     const workerCode = `
//       importScripts("${window.location.origin}/xlsx.full.min.js");
//       self.addEventListener('message', (e) => {
//         try {
//           const buffer = e.data;
//           const wb = XLSX.read(buffer, {
//             type: 'array',
//             cellHTML: false,
//             cellFormula: false,
//             cellDates: false,
//             cellText: true
//           });

//           const wsname = wb.SheetNames[0];
//           const ws = wb.Sheets[wsname];
//           if (!ws) throw new Error("Лист в Excel-файле не найден");

//           let maxRow = 0;
//           let maxCol = 0;

//           for (const key in ws) {
//             if (key[0] === '!') continue;
//             const coord = XLSX.utils.decode_cell(key);
//             if (coord.r > maxRow) maxRow = coord.r;
//             if (coord.c > maxCol) maxCol = coord.c;
//           }

//           const safeMaxCol = Math.min(maxCol, 30);
//           ws['!ref'] = XLSX.utils.encode_range({
//             s: { r: 0, c: 0 },
//             e: { r: maxRow, c: safeMaxCol }
//           });

//           const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
//           const finalData = rawData.filter(row => {
//             return Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== "");
//           });

//           self.postMessage({ success: true, data: finalData });
//         } catch (err) {
//           self.postMessage({ success: false, error: err.message });
//         }
//       });
//     `;

//     const blob = new Blob([workerCode], { type: 'application/javascript' });
//     const worker = new Worker(URL.createObjectURL(blob));

//     worker.onmessage = (evt) => {
//       const { success, data, error } = evt.data;

//       if (!success) {
//         enqueueSnackbar(`Ошибка парсинга: ${error}`, { variant: 'error' });
//         setIsFileReading(false);
//         worker.terminate();
//         return;
//       }

//       if (!data || data.length === 0) {
//         enqueueSnackbar('Выбранный Excel файл пуст', { variant: 'warning' });
//         setIsFileReading(false);
//         worker.terminate();
//         return;
//       }

//       setExcelRows(data);

//       const targetHeaderRow = data[headerRowIndex] || data[0];

//       const headers = targetHeaderRow.map((h: any, index: number) =>
//         h !== undefined && h !== null
//           ? String(h).trim()
//           : `Колонка ${index + 1}`
//       );
//       setExcelHeaders(headers);

//       const initialMapping: Record<string, string> = {};
//       PRICELIST_FIELDS.forEach((sys) => {
//         const exactMatch = headers.find((h: any) => {
//           if (!h || typeof h !== 'string') return false;
//           const cleanHeader = h.toLowerCase().trim();
//           const cleanLabel = sys.label.replace('*', '').trim().toLowerCase();
//           const cleanKey = sys.key.toLowerCase();
//           return cleanHeader.includes(cleanLabel) || cleanHeader === cleanKey;
//         });
//         if (exactMatch) initialMapping[sys.key] = exactMatch;
//       });

//       setMapping(initialMapping);
//       setIsFileReading(false);
//       worker.terminate();
//     };

//     worker.onerror = () => {
//       enqueueSnackbar('Ошибка фонового потока при разборе файла', {
//         variant: 'error',
//       });
//       setIsFileReading(false);
//       worker.terminate();
//     };

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const buffer = evt.target?.result as ArrayBuffer;
//       worker.postMessage(buffer, [buffer]);
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const handleSelectChange = (sysKey: string, excelHeader: string) => {
//     setMapping((prev) => ({ ...prev, [sysKey]: excelHeader }));
//   };
//   const handleStartImport = async () => {
//     if (!title.trim() || !verificationOrganizationId) {
//       enqueueSnackbar(
//         'Заполните название прейскуранта и выберите организацию ЦСМ',
//         {
//           variant: 'error',
//         }
//       );
//       return;
//     }

//     // 2. Валидация обязательных колонок маппинга
//     const missingFields = PRICELIST_FIELDS.filter(
//       (f) => f.required && !mapping[f.key]
//     );
//     if (missingFields.length > 0) {
//       enqueueSnackbar(
//         `Сопоставьте обязательные поля: ${missingFields
//           .map((f) => f.label)
//           .join(', ')}`,
//         { variant: 'error' }
//       );
//       return;
//     }

//     const nextRow = excelRows[headerRowIndex + 1];
//     const isTechnicalRow =
//       Array.isArray(nextRow) &&
//       nextRow.some((cell) => cell === 1 || cell === '1');

//     const dataStartShift = isTechnicalRow ? 2 : 1;

//     const itemsPayload = excelRows
//       .slice(headerRowIndex + dataStartShift)
//       .map((row) => {
//         const nameHeader = mapping['name'];
//         const nameIndex = excelHeaders.indexOf(nameHeader);
//         const nameValue = nameIndex !== -1 ? row[nameIndex] : null;

//         const priceHeader = mapping['price'];
//         const priceIndex = excelHeaders.indexOf(priceHeader);
//         const rawPrice = priceIndex !== -1 ? row[priceIndex] : null;

//         let cleanPrice = 0;
//         if (typeof rawPrice === 'string') {
//           cleanPrice =
//             parseFloat(rawPrice.replace(/[^0-9.,]/g, '').replace(',', '.')) ||
//             0;
//         } else if (typeof rawPrice === 'number') {
//           cleanPrice = rawPrice;
//         }

//         const grsiHeader = mapping['grsiNumber'];
//         const grsiIndex = excelHeaders.indexOf(grsiHeader);
//         const grsiValue = grsiIndex !== -1 ? row[grsiIndex] : undefined;

//         const csmHeader = mapping['csmCode'];
//         const csmIndex = excelHeaders.indexOf(csmHeader);
//         const csmValue = csmIndex !== -1 ? row[csmIndex] : undefined;

//         const modelHeader = mapping['modelOrType'];
//         const modelIndex = excelHeaders.indexOf(modelHeader);
//         const modelValue = modelIndex !== -1 ? row[modelIndex] : undefined;

//         let finalPrice = cleanPrice;
//         if (typeof rawPrice === 'string') {
//           const lowerRaw = rawPrice.toLowerCase();
//           if (
//             lowerRaw.includes('раздел') ||
//             lowerRaw.includes('№') ||
//             lowerRaw.includes('глава')
//           ) {
//             finalPrice = 0;
//           }
//         }

//         return {
//           name:
//             nameValue !== undefined && nameValue !== null
//               ? String(nameValue).trim()
//               : '',
//           price: finalPrice,
//           grsiNumber:
//             grsiValue !== undefined && grsiValue !== null
//               ? String(grsiValue).trim()
//               : undefined,
//           csmCode:
//             csmValue !== undefined && csmValue !== null
//               ? String(csmValue).trim()
//               : undefined,
//           modelOrType:
//             modelValue !== undefined && modelValue !== null
//               ? String(modelValue).trim()
//               : undefined,
//         };
//       })
//       .filter((item) => item.name && item.name.length > 3 && item.price > 0);

//     if (itemsPayload.length === 0) {
//       enqueueSnackbar(
//         'Нет валидных данных для импорта. Проверьте правильность маппинга цены.',
//         {
//           variant: 'warning',
//         }
//       );
//       return;
//     }

//     try {
//       enqueueSnackbar(
//         `📦 Отправка прейскуранта (${itemsPayload.length} строк) на сервер...`,
//         {
//           variant: 'info',
//         }
//       );

//       // Вызываем мутацию бэкенда
//       await createPricelist({
//         variables: {
//           input: {
//             title: title.trim(),
//             year: Number(year),
//             isRegulated,
//             verificationOrganizationId,
//             items: itemsPayload,
//           },
//         },
//       });
//     } catch (error) {
//       console.error('Ошибка вызова мутации импорта прайса:', error);
//     }
//   };
//   return (
//     <Box
//       sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.paper', borderRadius: 2 }}
//     >
//       {/* Шапка модуля */}
//       <Box
//         sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
//       >
//         <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
//           📥 Загрузка прейскурантов ЦСМ
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           Импортируйте регулируемые и договорные прайсы региональных центров
//           стандартизации и метрологии для автоматического расчета годовых
//           бюджетов.
//         </Typography>
//       </Box>

//       {/* Форма параметров прайса */}
//       <Grid container spacing={2} sx={{ mb: 4 }}>
//         <Grid size={{ xs: 12, sm: 4 }}>
//           <TextField
//             label="Название прейскуранта"
//             size="small"
//             fullWidth
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             disabled={submitting || isFileReading}
//             placeholder="Например: Ростест-Москва 2027 Регулируемый"
//           />
//         </Grid>
//         <Grid size={{ xs: 12, sm: 3 }}>
//           <FormControl
//             size="small"
//             fullWidth
//             error={!verificationOrganizationId && excelHeaders.length > 0}
//           >
//             <InputLabel>Организация ЦСМ</InputLabel>
//             <Select
//               value={verificationOrganizationId}
//               label="Организация ЦСМ"
//               onChange={(e) => setVerificationOrganizationId(e.target.value)}
//               disabled={submitting || isFileReading || orgLoading}
//             >
//               {orgLoading ? (
//                 <MenuItem disabled>
//                   <CircularProgress size={16} sx={{ mr: 1 }} /> Загрузка
//                   организаций...
//                 </MenuItem>
//               ) : organizations.length === 0 ? (
//                 <MenuItem disabled>Список организаций пуст</MenuItem>
//               ) : (
//                 organizations.map((org) => (
//                   <MenuItem key={org.id} value={org.id}>
//                     {formatStrictUpper(org.name)}
//                   </MenuItem>
//                 ))
//               )}
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 2 }}>
//           <TextField
//             label="Год действия"
//             type="number"
//             size="small"
//             fullWidth
//             value={year}
//             onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
//             disabled={submitting || isFileReading}
//           />
//         </Grid>

//         <Grid size={{ xs: 12, sm: 2 }}>
//           <TextField
//             label="Строка с шапкой"
//             type="number"
//             size="small"
//             fullWidth
//             value={headerRowIndex + 1} // Пользователь видит строки с 1, а в коде они с 0
//             onChange={(e) => {
//               // Защищаем от ввода отрицательных чисел и нуля
//               const val = Math.max(1, parseInt(e.target.value, 10) || 1);

//               // Передаем значение в стейт (минус 1 для перевода в индекс массива)
//               setHeaderRowIndex(val - 1);

//               // 🔄 МГНОВЕННЫЙ ПЕРЕСЧЕТ: если файл уже в памяти, сразу обновляем заголовки
//               if (excelRows.length > 0) {
//                 const targetHeaderRow = excelRows[val - 1] || excelRows[0];
//                 const headers = targetHeaderRow.map((h: any, idx: number) =>
//                   h !== undefined && h !== null
//                     ? String(h).trim()
//                     : `Колонка ${idx + 1}`
//                 );
//                 setExcelHeaders(headers);
//               }
//             }}
//             disabled={submitting || isFileReading}
//             helperText="Если сверху есть пустые строки"
//           />
//         </Grid>
//         <Grid
//           size={{ xs: 12, sm: 3 }}
//           sx={{ display: 'flex', alignItems: 'center', pl: 2 }}
//         >
//           <FormControlLabel
//             control={
//               <Switch
//                 checked={isRegulated}
//                 onChange={(e) => setIsRegulated(e.target.checked)}
//                 color="primary"
//                 disabled={submitting || isFileReading}
//               />
//             }
//             label={isRegulated ? '💰 Регулируемый тариф' : '🤝 Договорная цена'}
//           />
//         </Grid>
//       </Grid>

//       {/* Зона загрузки файла */}
//       <Box
//         sx={{
//           p: 4,
//           mb: 4,
//           border: '2px dashed',
//           borderColor: isFileReading
//             ? 'warning.main'
//             : excelHeaders.length > 0
//             ? 'success.light'
//             : 'divider',
//           borderRadius: 2,
//           bgcolor: 'grey.50',
//           textAlign: 'center',
//         }}
//       >
//         {isFileReading ? (
//           <Box
//             sx={{
//               display: 'flex',
//               flexDirection: 'column',
//               alignProps: 'center',
//               alignItems: 'center',
//               gap: 2,
//               py: 1,
//             }}
//           >
//             <CircularProgress size={32} color="warning" />
//             <Typography
//               variant="body2"
//               color="text.secondary"
//               sx={{ fontWeight: 'medium' }}
//             >
//               ⏳ Чтение и анализ структуры прайса "{fileName}"...
//             </Typography>
//           </Box>
//         ) : (
//           <Box>
//             <Typography
//               variant="body1"
//               sx={{ mb: 2, color: 'text.secondary', fontWeight: 'medium' }}
//             >
//               {excelHeaders.length > 0
//                 ? `📁 Файл прейскуранта: ${fileName} (Колонок: ${excelHeaders.length}, Записей: ${excelRows.length})`
//                 : 'Выберите Excel-файл прейскуранта для настройки соответствия цен'}
//             </Typography>

//             <Button
//               variant={excelHeaders.length > 0 ? 'outlined' : 'contained'}
//               component="label"
//               color={excelHeaders.length > 0 ? 'inherit' : 'primary'}
//               disabled={submitting}
//             >
//               {excelHeaders.length > 0
//                 ? '🔄 Выбрать другой файл'
//                 : '📁 Выбрать Excel-файл (.xlsx)'}
//               <input
//                 type="file"
//                 accept=".xlsx, .xls"
//                 hidden
//                 onChange={handleFileUpload}
//               />
//             </Button>
//           </Box>
//         )}
//       </Box>

//       {excelHeaders.length > 0 && (
//         <Grid container spacing={3}>
//           {/* Левая колонка: Настройка маппинга полей прейскуранта */}
//           <Grid size={{ xs: 12, md: 5 }}>
//             <Card
//               variant="outlined"
//               sx={{ borderRadius: 2, p: 2, bgcolor: 'grey.50' }}
//             >
//               <Typography
//                 variant="subtitle1"
//                 sx={{ fontWeight: 'bold', mb: 2 }}
//               >
//                 ⚙️ Настройка соответствия колонок прайса
//               </Typography>

//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 {PRICELIST_FIELDS.map((field) => (
//                   <FormControl
//                     key={field.key}
//                     size="small"
//                     fullWidth
//                     bg-color="background.paper"
//                   >
//                     <InputLabel>{field.label}</InputLabel>
//                     <Select
//                       value={mapping[field.key] || ''}
//                       label={field.label}
//                       onChange={(e) =>
//                         handleSelectChange(field.key, e.target.value as string)
//                       }
//                       disabled={submitting}
//                     >
//                       <MenuItem value="">
//                         {field.required ? (
//                           <em style={{ color: '#d32f2f' }}>
//                             -- Выберите обязательное поле --
//                           </em>
//                         ) : (
//                           <em>-- Пропустить поле --</em>
//                         )}
//                       </MenuItem>
//                       {excelHeaders.map((header, idx) => (
//                         <MenuItem key={idx} value={header}>
//                           {header}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 ))}
//               </Box>

//               <Button
//                 variant="contained"
//                 color="success"
//                 fullWidth
//                 size="large"
//                 disabled={submitting || isFileReading}
//                 onClick={handleStartImport}
//                 sx={{ mt: 3, fontWeight: 'bold', textTransform: 'none' }}
//               >
//                 {submitting ? (
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <CircularProgress size={20} color="inherit" />
//                     <span>⏳ Сохранение прейскуранта...</span>
//                   </Box>
//                 ) : (
//                   '🚀 Импортировать прейскурант ЦСМ'
//                 )}
//               </Button>
//             </Card>
//           </Grid>

//           {/* Правая колонка: Превью первых строк загруженного прайса */}
//           <Grid size={{ xs: 12, md: 7 }}>
//             <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
//               👀 Предпросмотр структуры прайса (Первые 4 строки)
//             </Typography>
//             <TableContainer
//               component={Paper}
//               variant="outlined"
//               sx={{ borderRadius: 2, maxHeight: 500 }}
//             >
//               <Table size="small" stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     {excelHeaders.map((h, i) => (
//                       <TableCell
//                         key={i}
//                         sx={{
//                           bgcolor: 'grey.100',
//                           fontWeight: 'bold',
//                           whiteSpace: 'nowrap',
//                         }}
//                       >
//                         {h}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {(() => {
//                     // 1. Вычисляем технический сдвиг шапки таблицы
//                     const nextRow = excelRows[headerRowIndex + 1];
//                     const isTechnicalRow =
//                       Array.isArray(nextRow) &&
//                       nextRow.some((cell) => cell === 1 || cell === '1');
//                     const previewStartShift = isTechnicalRow ? 2 : 1;

//                     // Ищем индексы колонок на основе текущего маппинга
//                     const nameIndex = excelHeaders.indexOf(
//                       mapping['name'] || ''
//                     );
//                     const priceIndex = excelHeaders.indexOf(
//                       mapping['price'] || ''
//                     );

//                     // 2. Фильтруем строки для показа
//                     const validPreviewRows = excelRows
//                       .slice(headerRowIndex + previewStartShift)
//                       .filter((row) => {
//                         // Если маппинг ещё ВООБЩЕ не настроен, покажем первые 4 строки файла для визуального контроля
//                         if (nameIndex === -1 && priceIndex === -1) return true;

//                         // Вытаскиваем значения из ячеек по индексам
//                         const nameValue =
//                           nameIndex !== -1 ? row[nameIndex] : null;
//                         const rawPrice =
//                           priceIndex !== -1 ? row[priceIndex] : null;

//                         // ЗАЩИТА ОТ ПУСТОТЫ: Если в колонке наименования пусто или строка слишком короткая — скрываем
//                         if (!nameValue || String(nameValue).trim().length <= 3)
//                           return false;

//                         // ЗАЩИТА ОТ СТРОК-ОТДЕЛОВ: Если колонка цены пустая (null, undefined, пустая строка) — скрываем сразу!
//                         if (
//                           rawPrice === undefined ||
//                           rawPrice === null ||
//                           String(rawPrice).trim() === ''
//                         )
//                           return false;

//                         // Дополнительная очистка от названий разделов (если цена — это текст названия раздела)
//                         let cleanPrice = 0;
//                         if (typeof rawPrice === 'number') {
//                           cleanPrice = rawPrice;
//                         } else if (typeof rawPrice === 'string') {
//                           const lowerRaw = rawPrice.toLowerCase();
//                           if (
//                             lowerRaw.includes('раздел') ||
//                             lowerRaw.includes('№') ||
//                             lowerRaw.includes('отдел') ||
//                             lowerRaw.includes('глава')
//                           ) {
//                             return false; // Если в ячейке цены слова-маркеры разделов — скрываем строку
//                           }

//                           const cleanStr = rawPrice
//                             .replace(/[^0-9.,]/g, '')
//                             .replace(',', '.');
//                           cleanPrice = parseFloat(cleanStr) || 0;
//                         }

//                         // В превью попадают ТОЛЬКО те строки, где цена успешно определилась и она > 0
//                         return cleanPrice > 0;
//                       });

//                     // 3. Рендерим первые 4 отфильтрованные строки
//                     const rowsToRender = validPreviewRows.slice(0, 4);

//                     if (rowsToRender.length === 0) {
//                       return (
//                         <TableRow>
//                           <TableCell
//                             colSpan={excelHeaders.length}
//                             align="center"
//                             sx={{
//                               py: 4,
//                               color: 'text.secondary',
//                               fontStyle: 'italic',
//                             }}
//                           >
//                             Сопоставьте колонки "Наименование СИ" и "Цена без
//                             НДС", чтобы автоматически скрыть пустые строки и
//                             заголовки отделов.
//                           </TableCell>
//                         </TableRow>
//                       );
//                     }

//                     return rowsToRender.map((row, rIdx) => (
//                       <TableRow key={rIdx} hover>
//                         {excelHeaders.map((_, cIdx) => (
//                           <TableCell
//                             key={cIdx}
//                             sx={{
//                               whiteSpace: 'nowrap',
//                               maxWidth: 200,
//                               overflow: 'hidden',
//                               textOverflow: 'ellipsis',
//                             }}
//                           >
//                             {row[cIdx] !== undefined ? String(row[cIdx]) : ''}
//                           </TableCell>
//                         ))}
//                       </TableRow>
//                     ));
//                   })()}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Grid>
//         </Grid>
//       )}
//     </Box>
//   );
// };
// src/modules/budget/components/PricelistExcelImporter.tsx
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
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CreatePricelistDocument,
  GetPricelistsDocument,
  GetVerificationOrganizationsListDocument,
} from '../graphql/types/__generated__/graphql';
import { useSocketApp } from '../context/SocketContext';
import { formatStrictUpper } from '../utils/capitalize';

const PRICELIST_FIELDS = [
  { key: 'name', label: 'Наименование СИ из прайса *', required: true },
  { key: 'price', label: 'Цена без НДС *', required: true },
  {
    key: 'grsiNumber',
    label: 'Номер ГРСИ (Для регулируемых)',
    required: false,
  },
  {
    key: 'csmCode',
    label: 'Код СИ / Шифр позиции (Для договорных)',
    required: false,
  },
  {
    key: 'modelOrType',
    label: 'Модель / Тип / Модификация СИ',
    required: false,
  },
];

export const PricelistExcelImporter: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { addRunningJob } = useSocketApp();

  // 1. Состояния метаданных самого прейскуранта
  const [title, setTitle] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isRegulated, setIsRegulated] = useState<boolean>(true);
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(0);
  const [verificationOrganizationId, setVerificationOrganizationId] =
    useState<string>('');

  // 2. Состояния для хранения распарсенных данных Excel
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isFileReading, setIsFileReading] = useState<boolean>(false);

  // Карта сопоставления: { [ключ_нашей_системы]: "Название_колонки_из_Excel" }
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // 3. Мутация для отправки готового прейскуранта на бэкенд
  const [createPricelist, { loading: submitting }] = useMutation(
    CreatePricelistDocument,
    {
      refetchQueries: [{ query: GetPricelistsDocument }],
      onCompleted: (res: any) => {
        const { jobId, message } = res.createPricelist;
        enqueueSnackbar(message || 'Прейскурант принят сервером.', {
          variant: 'warning',
          autoHideDuration: 10000,
        });
        if (jobId) addRunningJob(jobId, 'pricelist-import');
        setExcelHeaders([]);
        setExcelRows([]);
        setMapping({});
        setFileName('');
        setTitle('');
      },
      onError: (err) => {
        enqueueSnackbar(`Ошибка импорта: ${err.message}`, { variant: 'error' });
      },
    }
  );

  const { data: orgsData, loading: orgLoading } = useQuery(
    GetVerificationOrganizationsListDocument
  );
  const organizations = orgsData?.verificationOrganizations || [];
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsFileReading(true);

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

          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          if (!ws) throw new Error("Лист в Excel-файле не найден");

          let maxRow = 0;
          let maxCol = 0;

          for (const key in ws) {
            if (key[0] === '!') continue;
            const coord = XLSX.utils.decode_cell(key);
            if (coord.r > maxRow) maxRow = coord.r;
            if (coord.c > maxCol) maxCol = coord.c;
          }

          const safeMaxCol = Math.min(maxCol, 30);
          ws['!ref'] = XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: maxRow, c: safeMaxCol }
          });

          const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
          const finalData = rawData.filter(row => {
            return Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== "");
          });

          self.postMessage({ success: true, data: finalData });
        } catch (err) {
          self.postMessage({ success: false, error: err.message });
        }
      });
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (evt) => {
      const { success, data, error } = evt.data;

      if (!success) {
        enqueueSnackbar(`Ошибка парсинга: ${error}`, { variant: 'error' });
        setIsFileReading(false);
        worker.terminate();
        return;
      }

      if (!data || data.length === 0) {
        enqueueSnackbar('Выбранный Excel файл пуст', { variant: 'warning' });
        setIsFileReading(false);
        worker.terminate();
        return;
      }

      setExcelRows(data);
      const targetHeaderRow = data[headerRowIndex] || data[0];

      const headers = targetHeaderRow.map((h: any, index: number) =>
        h !== undefined && h !== null
          ? String(h).trim()
          : `Колонка ${index + 1}`
      );
      setExcelHeaders(headers);

      const initialMapping: Record<string, string> = {};
      PRICELIST_FIELDS.forEach((sys) => {
        const exactMatch = headers.find((h: any) => {
          if (!h || typeof h !== 'string') return false;
          const cleanHeader = h.toLowerCase().trim();
          const cleanLabel = sys.label.replace('*', '').trim().toLowerCase();
          const cleanKey = sys.key.toLowerCase();
          return cleanHeader.includes(cleanLabel) || cleanHeader === cleanKey;
        });
        if (exactMatch) initialMapping[sys.key] = exactMatch;
      });

      setMapping(initialMapping);
      setIsFileReading(false);
      worker.terminate();
    };

    worker.onerror = () => {
      enqueueSnackbar('Ошибка фонового потока при разборе файла', {
        variant: 'error',
      });
      setIsFileReading(false);
      worker.terminate();
    };

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      worker.postMessage(buffer, [buffer]);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSelectChange = (sysKey: string, excelHeader: string) => {
    setMapping((prev) => ({ ...prev, [sysKey]: excelHeader }));
  };

  const handleStartImport = async () => {
    if (!title.trim() || !verificationOrganizationId) {
      enqueueSnackbar(
        'Заполните название прейскуранта и выберите организацию ЦСМ',
        { variant: 'error' }
      );
      return;
    }

    const missingFields = PRICELIST_FIELDS.filter(
      (f) => f.required && !mapping[f.key]
    );
    if (missingFields.length > 0) {
      enqueueSnackbar(
        `Сопоставьте обязательные поля: ${missingFields
          .map((f) => f.label)
          .join(', ')}`,
        { variant: 'error' }
      );
      return;
    }

    const nextRow = excelRows[headerRowIndex + 1];
    const isTechnicalRow =
      Array.isArray(nextRow) &&
      nextRow.some((cell) => cell === 1 || cell === '1');
    const dataStartShift = isTechnicalRow ? 2 : 1;

    const itemsPayload = excelRows
      .slice(headerRowIndex + dataStartShift)
      .map((row) => {
        const nameHeader = mapping['name'];
        const nameIndex = excelHeaders.indexOf(nameHeader);
        const nameValue = nameIndex !== -1 ? row[nameIndex] : null;

        const priceHeader = mapping['price'];
        const priceIndex = excelHeaders.indexOf(priceHeader);
        const rawPrice = priceIndex !== -1 ? row[priceIndex] : null;

        let cleanPrice = 0;
        if (typeof rawPrice === 'string') {
          cleanPrice =
            parseFloat(rawPrice.replace(/[^0-9.,]/g, '').replace(',', '.')) ||
            0;
        } else if (typeof rawPrice === 'number') {
          cleanPrice = rawPrice;
        }

        const grsiHeader = mapping['grsiNumber'];
        const grsiIndex = excelHeaders.indexOf(grsiHeader);
        const grsiValue = grsiIndex !== -1 ? row[grsiIndex] : undefined;

        const csmHeader = mapping['csmCode'];
        const csmIndex = excelHeaders.indexOf(csmHeader);
        const csmValue = csmIndex !== -1 ? row[csmIndex] : undefined;

        const modelHeader = mapping['modelOrType'];
        const modelIndex = excelHeaders.indexOf(modelHeader);
        const modelValue = modelIndex !== -1 ? row[modelIndex] : undefined;

        let finalPrice = cleanPrice;
        if (typeof rawPrice === 'string') {
          const lowerRaw = rawPrice.toLowerCase();
          if (
            lowerRaw.includes('раздел') ||
            lowerRaw.includes('№') ||
            lowerRaw.includes('глава')
          ) {
            finalPrice = 0;
          }
        }

        return {
          name:
            nameValue !== undefined && nameValue !== null
              ? String(nameValue).trim()
              : '',
          price: finalPrice,
          grsiNumber:
            grsiValue !== undefined && grsiValue !== null
              ? String(grsiValue).trim()
              : undefined,
          csmCode:
            csmValue !== undefined && csmValue !== null
              ? String(csmValue).trim()
              : undefined,
          modelOrType:
            modelValue !== undefined && modelValue !== null
              ? String(modelValue).trim()
              : undefined,
        };
      })
      .filter((item) => item.name && item.name.length > 3 && item.price > 0);

    if (itemsPayload.length === 0) {
      enqueueSnackbar(
        'Нет валидных данных для импорта. Проверьте правильность маппинга цены.',
        { variant: 'warning' }
      );
      return;
    }

    try {
      enqueueSnackbar(
        `📦 Отправка прейскуранта (${itemsPayload.length} строк) на сервер...`,
        { variant: 'info' }
      );
      await createPricelist({
        variables: {
          input: {
            title: title.trim(),
            year: Number(year),
            isRegulated,
            verificationOrganizationId,
            items: itemsPayload,
          },
        },
      });
    } catch (error) {
      console.error('Ошибка вызова мутации импорта прайса:', error);
    }
  };
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 3 },
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    >
      {/* Шапка модуля */}
      <Box
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            mb: 0.5,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          📥 Загрузка прейскурантов ЦСМ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Импортируйте регулируемые и договорные прайсы региональных центров
          стандартизации для автоматического расчета годовых бюджетов.
        </Typography>
      </Box>

      {/* Форма параметров прайса */}
      {/* Форма параметров прайса */}
      <Box sx={{ mb: 4 }}>
        {/* Верхний ряд: Основные текстовые данные */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              label="Название прейскуранта"
              size="small"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting || isFileReading}
              placeholder="Например: Ростест-Москва 2027"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl
              size="small"
              fullWidth
              error={!verificationOrganizationId && excelHeaders.length > 0}
            >
              <InputLabel>Организация ЦСМ</InputLabel>
              <Select
                value={verificationOrganizationId}
                label="Организация ЦСМ"
                onChange={(e) => setVerificationOrganizationId(e.target.value)}
                disabled={submitting || isFileReading || orgLoading}
              >
                {orgLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Загрузка...
                  </MenuItem>
                ) : organizations.length === 0 ? (
                  <MenuItem disabled>Список организаций пуст</MenuItem>
                ) : (
                  organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {formatStrictUpper(org.name)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Нижний ряд: Панель управления конфигурацией импорта */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'grey.50',
            display: 'grid',
            // На десктопе (md+) выстраиваем жестко в 3 колонки в один ряд.
            // На мобильных (xs) превращаем в один вертикальный стек.
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            alignItems: 'end',
            gap: 3,
          }}
        >
          {/* Блок 1: Современный двухпозиционный переключатель-таб */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}
            >
              ТИП ТАРИФНОЙ СЕТКИ
            </Typography>
            <Box
              sx={{
                display: 'flex',
                bgcolor: 'background.paper',
                p: 0.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: 40,
                alignItems: 'center',
              }}
            >
              <Button
                variant={isRegulated ? 'contained' : 'text'}
                color={isRegulated ? 'primary' : 'inherit'}
                size="small"
                fullWidth
                disabled={submitting || isFileReading}
                onClick={() => setIsRegulated(true)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 1.5,
                  height: '100%',
                  boxShadow: isRegulated ? 1 : 0,
                }}
              >
                💰 Регулируемый
              </Button>
              <Button
                variant={!isRegulated ? 'contained' : 'text'}
                color={!isRegulated ? 'primary' : 'inherit'}
                size="small"
                fullWidth
                disabled={submitting || isFileReading}
                onClick={() => setIsRegulated(false)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 1.5,
                  height: '100%',
                  boxShadow: !isRegulated ? 1 : 0,
                }}
              >
                🤝 Договорной
              </Button>
            </Box>
          </Box>

          {/* Блок 2: Кастомный счетчик для Года действия */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}
            >
              ГОД ДЕЙСТВИЯ ПРАЙСА
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 0.5,
                height: 40,
              }}
            >
              <Button
                size="small"
                disabled={submitting || isFileReading}
                onClick={() => setYear((prev) => prev - 1)}
                sx={{
                  minWidth: 32,
                  p: 0,
                  height: '100%',
                  borderRadius: 1.5,
                  color: 'text.secondary',
                }}
              >
                −
              </Button>
              <Typography
                sx={{
                  flexGrow: 1,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                }}
              >
                {year} год
              </Typography>
              <Button
                size="small"
                disabled={submitting || isFileReading}
                onClick={() => setYear((prev) => prev + 1)}
                sx={{
                  minWidth: 32,
                  p: 0,
                  height: '100%',
                  borderRadius: 1.5,
                  color: 'text.secondary',
                }}
              >
                +
              </Button>
            </Box>
          </Box>

          {/* Блок 3: Кастомный счетчик для Строки с шапкой таблицы */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}
            >
              СТРОКА ШАПКИ (ОТСТУП СВЕРХУ)
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 0.5,
                height: 40,
              }}
            >
              <Button
                size="small"
                disabled={submitting || isFileReading || headerRowIndex <= 0}
                onClick={() => {
                  const newVal = headerRowIndex; // уменьшаем на 1 (в коде индексы с 0)
                  setHeaderRowIndex(newVal - 1);
                  if (excelRows.length > 0) {
                    const targetHeaderRow =
                      excelRows[newVal - 1] || excelRows[0];
                    setExcelHeaders(
                      targetHeaderRow.map((h: any, idx: number) =>
                        h !== undefined && h !== null
                          ? String(h).trim()
                          : `Колонка ${idx + 1}`
                      )
                    );
                  }
                }}
                sx={{
                  minWidth: 32,
                  p: 0,
                  height: '100%',
                  borderRadius: 1.5,
                  color: 'text.secondary',
                }}
              >
                −
              </Button>
              <Typography
                sx={{
                  flexGrow: 1,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                }}
              >
                Строка № {headerRowIndex + 1}
              </Typography>
              <Button
                size="small"
                disabled={submitting || isFileReading}
                onClick={() => {
                  const newVal = headerRowIndex + 2; // увеличиваем
                  setHeaderRowIndex(newVal - 1);
                  if (excelRows.length > 0) {
                    const targetHeaderRow =
                      excelRows[newVal - 1] || excelRows[0];
                    setExcelHeaders(
                      targetHeaderRow.map((h: any, idx: number) =>
                        h !== undefined && h !== null
                          ? String(h).trim()
                          : `Колонка ${idx + 1}`
                      )
                    );
                  }
                }}
                sx={{
                  minWidth: 32,
                  p: 0,
                  height: '100%',
                  borderRadius: 1.5,
                  color: 'text.secondary',
                }}
              >
                +
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Зона загрузки файла */}
      <Box
        sx={{
          p: { xs: 2, sm: 4 },
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
          wordBreak: 'break-all',
        }}
      >
        {isFileReading ? (
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
              ⏳ Чтение и анализ структуры прайса "{fileName}"...
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                color: 'text.secondary',
                fontWeight: 'medium',
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              {excelHeaders.length > 0
                ? `📁 Файл: ${fileName} (Колонок: ${excelHeaders.length}, Записей: ${excelRows.length})`
                : 'Выберите Excel-файл прейскуранта для настройки соответствия цен'}
            </Typography>

            <Button
              variant={excelHeaders.length > 0 ? 'outlined' : 'contained'}
              component="label"
              color={excelHeaders.length > 0 ? 'inherit' : 'primary'}
              disabled={submitting}
              sx={{
                width: { xs: '100%', sm: 'auto' },
              }}
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
          {/* Левая колонка: Настройка маппинга полей прейскуранта */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                p: 2,
                bgcolor: 'grey.50',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'bold', mb: 2 }}
              >
                ⚙️ Настройка соответствия колонок
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  flexGrow: 1,
                }}
              >
                {PRICELIST_FIELDS.map((field) => (
                  <FormControl
                    key={field.key}
                    size="small"
                    fullWidth
                    sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                  >
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={mapping[field.key] || ''}
                      label={field.label}
                      onChange={(e) =>
                        handleSelectChange(field.key, e.target.value as string)
                      }
                      disabled={submitting}
                    >
                      <MenuItem value="">
                        {field.required ? (
                          <em style={{ color: '#d32f2f' }}>
                            -- Выберите обязательное поле --
                          </em>
                        ) : (
                          <em>-- Пропустить поле --</em>
                        )}
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
                disabled={submitting || isFileReading}
                onClick={handleStartImport}
                sx={{
                  mt: 3,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  minHeight: 48,
                }}
              >
                {submitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>⏳ Сохранение...</span>
                  </Box>
                ) : (
                  '🚀 Импортировать прейскурант'
                )}
              </Button>
            </Card>
          </Grid>

          {/* Правая колонка: Превью первых строк загруженного прайса */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 'bold', mb: 1, mt: { xs: 2, md: 0 } }}
            >
              👀 Предпросмотр структуры прайса (Первые 4 строки)
            </Typography>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                borderRadius: 2,
                maxHeight: { xs: 350, md: 500 },
                overflowX: 'auto',
                bgcolor: 'background.paper',
              }}
            >
              <Table size="small" stickyHeader aria-label="excel preview table">
                <TableHead>
                  <TableRow>
                    {excelHeaders.map((h, i) => (
                      <TableCell
                        key={i}
                        sx={{
                          bgcolor: 'grey.100',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          zIndex: 2,
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    const nextRow = excelRows[headerRowIndex + 1];
                    const isTechnicalRow =
                      Array.isArray(nextRow) &&
                      nextRow.some((cell) => cell === 1 || cell === '1');
                    const previewStartShift = isTechnicalRow ? 2 : 1;

                    const nameIndex = excelHeaders.indexOf(
                      mapping['name'] || ''
                    );
                    const priceIndex = excelHeaders.indexOf(
                      mapping['price'] || ''
                    );

                    const validPreviewRows = excelRows
                      .slice(headerRowIndex + previewStartShift)
                      .filter((row) => {
                        if (nameIndex === -1 && priceIndex === -1) return true;

                        const nameValue =
                          nameIndex !== -1 ? row[nameIndex] : null;
                        const rawPrice =
                          priceIndex !== -1 ? row[priceIndex] : null;

                        if (!nameValue || String(nameValue).trim().length <= 3)
                          return false;
                        if (
                          rawPrice === undefined ||
                          rawPrice === null ||
                          String(rawPrice).trim() === ''
                        )
                          return false;

                        let cleanPrice = 0;
                        if (typeof rawPrice === 'number') {
                          cleanPrice = rawPrice;
                        } else if (typeof rawPrice === 'string') {
                          const lowerRaw = rawPrice.toLowerCase();
                          if (
                            lowerRaw.includes('раздел') ||
                            lowerRaw.includes('№') ||
                            lowerRaw.includes('отдел') ||
                            lowerRaw.includes('глава')
                          ) {
                            return false;
                          }
                          const cleanStr = rawPrice
                            .replace(/[^0-9.,]/g, '')
                            .replace(',', '.');
                          cleanPrice = parseFloat(cleanStr) || 0;
                        }
                        return cleanPrice > 0;
                      });

                    const rowsToRender = validPreviewRows.slice(0, 4);

                    if (rowsToRender.length === 0) {
                      return (
                        <TableRow>
                          <TableCell
                            colSpan={excelHeaders.length}
                            align="center"
                            sx={{
                              py: 4,
                              color: 'text.secondary',
                              fontStyle: 'italic',
                              px: 2,
                            }}
                          >
                            Сопоставьте колонки "Наименование СИ" и "Цена без
                            НДС", чтобы автоматически скрыть пустые строки и
                            заголовки отделов.
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return rowsToRender.map((row, rIdx) => (
                      <TableRow key={rIdx} hover>
                        {excelHeaders.map((_, cIdx) => (
                          <TableCell
                            key={cIdx}
                            sx={{
                              whiteSpace: 'nowrap',
                              maxWidth: 250,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {row[cIdx] !== undefined ? String(row[cIdx]) : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
