// import { useState } from 'react';

// import {
//   Box,
//   Typography,
//   CircularProgress,
//   TablePagination,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Container,
//   Card,
//   Stack,
// } from '@mui/material';

// import { AuditLogRow } from '../../components/AuditLogRow';
// import {
//   DeleteLogDocument,
//   GetDeviceAuditLogsDocument,
// } from '../../graphql/types/__generated__/graphql';
// import { useMutation, useQuery } from '@apollo/client/react';
// import { enqueueSnackbar } from 'notistack';

// export default function AuditLogPage() {
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [actionFilter, setActionFilter] = useState<string>('all');
//   const { data, loading, error, refetch } = useQuery(
//     GetDeviceAuditLogsDocument,
//     {
//       variables: {
//         // filter: {
//         //   deviceId: undefined,
//         //   userId: undefined,
//         //   action: actionFilter !== 'all' ? actionFilter : undefined,
//         // },
//         filter:
//           actionFilter === 'all' ? undefined : { action: actionFilter as any },
//         limit: rowsPerPage,
//         offset: page * rowsPerPage,
//       },
//       fetchPolicy: 'network-only',
//     }
//   );

//   const [deleteLog] = useMutation(DeleteLogDocument, {
//     onCompleted: () => {
//       refetch();
//       enqueueSnackbar('Лог успешно удален', {
//         variant: 'success',
//       });
//     },
//     onError: (error) => {
//       enqueueSnackbar(`Ошибка удаления: ${error.message}`, {
//         variant: 'error',
//       });
//     },
//   });

//   if (error)
//     return (
//       <Typography color="error" sx={{ m: 4 }}>
//         Ошибка: {error.message}
//       </Typography>
//     );

//   const response = data?.deviceAuditLogs;
//   const items = response?.items || [];
//   const totalCount = response?.totalCount || 0;

//   const handleDelete = async (id: string) => {
//     await deleteLog({ variables: { id: id } });
//   };

//   return (
//     <Container
//       maxWidth="lg"
//       sx={{
//         py: { xs: 1, sm: 1 },
//         height: { xs: 'calc(100dvh - 230px)', sm: 'calc(100dvh - 130px)' },
//         display: 'flex',
//         flexDirection: 'column',
//         overflow: 'hidden',
//       }}
//     >
//       {/* ================= ФИКСИРОВАННАЯ ШАПКА ================= */}
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           flexWrap: 'wrap',
//           gap: 2,
//           pb: 1,
//           borderBottom: '1px solid',
//           borderColor: 'divider',
//           bgcolor: 'background.default',
//           zIndex: 10,
//         }}
//       >
//         <Typography
//           variant="h5"
//           sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
//         >
//           Журнал аудита изменений
//         </Typography>

//         <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
//           <InputLabel id="action-filter-label">Тип действия</InputLabel>
//           <Select
//             labelId="action-filter-label"
//             value={actionFilter}
//             label="Тип действия"
//             onChange={(e) => {
//               setActionFilter(e.target.value);
//               setPage(0);
//             }}
//           >
//             <MenuItem value="all">Все действия</MenuItem>
//             <MenuItem value="create">Только создания</MenuItem>
//             <MenuItem value="update">Только изменения паспорта</MenuItem>

//             {/* 🌟 НОВЫЕ СИСТЕМНЫЕ МЕНЮ-ПУНКТЫ ФИЛЬТРАЦИИ ПЛАНИРОВАНИЯ: */}
//             <MenuItem value="assign_device_to_batch">
//               Добавление в партии поверок
//             </MenuItem>
//             <MenuItem value="remove_device_to_batch">
//               Исключение из партий поверок
//             </MenuItem>
//             <MenuItem value="verify">
//               Фиксация результатов поверок/контроля
//             </MenuItem>

//             <MenuItem value="delete">Только удаления</MenuItem>
//           </Select>
//         </FormControl>
//       </Box>

//       <Box
//         sx={{
//           flexGrow: 1,
//           overflowY: 'auto', // Разрешаем скролл только списку элементов
//           my: 2,
//           pr: 0.5, // Небольшой отступ, чтобы скроллбар не нализал на карточки
//           // Стилизуем полосу прокрутки под аккуратный MUI вид
//           '&::-webkit-scrollbar': { width: '6px' },
//           '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
//           '&::-webkit-scrollbar-thumb': {
//             bgcolor: '#cbd5e1',
//             borderRadius: '4px',
//           },
//           '&::-webkit-scrollbar-thumb:hover': { bgcolor: '#94a3b8' },
//         }}
//       >
//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
//             <CircularProgress />
//           </Box>
//         ) : items.length === 0 ? (
//           <Card
//             sx={{ p: 4, textAlign: 'center', color: 'text.secondary', my: 2 }}
//           >
//             Записи аудита по выбранным фильтрам не найдены
//           </Card>
//         ) : (
//           <Stack spacing={1.5} sx={{ py: 1 }}>
//             {items.map((log: any) => (
//               <AuditLogRow key={log.id} log={log} onDelete={handleDelete} />
//             ))}
//           </Stack>
//         )}
//       </Box>

//       {/* ================= ФИКСИРОВАННАЯ ПАГИНАЦИЯ ВНИЗУ ================= */}
//       {!loading && items.length > 0 && (
//         <Box
//           sx={{
//             display: 'flex',
//             justifyContent: 'flex-end',
//             mt: 'auto',
//             pt: 1,
//             borderTop: '1px solid',
//             borderColor: 'divider',
//             bgcolor: 'background.paper',
//             zIndex: 10,
//           }}
//         >
//           <TablePagination
//             component="div"
//             count={totalCount}
//             page={page}
//             onPageChange={(_, newPage) => setPage(newPage)}
//             rowsPerPage={rowsPerPage}
//             onRowsPerPageChange={(event) => {
//               setRowsPerPage(parseInt(event.target.value, 10));
//               setPage(0);
//             }}
//             rowsPerPageOptions={[5, 10, 25, 50]}
//             labelRowsPerPage="Строк на странице:"
//             labelDisplayedRows={({ from, to, count }) =>
//               `${from}–${to} из ${count}`
//             }
//             sx={{
//               // Компактный вид пагинации для маленьких экранов мобильных устройств
//               '& .MuiTablePagination-toolbar': { px: { xs: 0.5, sm: 2 } },
//               '& .MuiTablePagination-actions': { ml: { xs: 0.5, sm: 2 } },
//             }}
//           />
//         </Box>
//       )}
//     </Container>
//   );
// }
import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Card,
  TablePagination,
  useTheme,
  useMediaQuery,
  ListSubheader,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import {
  DeleteLogDocument,
  GetDeviceAuditLogsDocument,
} from '../../graphql/types/__generated__/graphql';
import { AuditLogRow } from '../../components/AuditLogRow';

type AuditActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'create_batch'
  | 'delete_batch'
  | 'assign_device_to_batch'
  | 'remove_device_to_batch'
  | 'verify'
  | 'create_repair_batch'
  | 'assign_device_to_repair_batch'
  | 'remove_device_to_repair_batch'
  | 'repair_batch_close'
  | 'delete_repair_batch'
  | 'device_scrap'
  | 'inspection_batch_create'
  | 'inspection_doc_save';

export default function AuditLogPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionFilter, setActionFilter] = useState<AuditActionType | 'all'>(
    'all'
  );

  const { data, loading, error, refetch } = useQuery(
    GetDeviceAuditLogsDocument,
    {
      variables: {
        // filter: actionFilter === 'all' ? undefined : { action: actionFilter },
        filter:
          actionFilter === 'all' ? undefined : { action: actionFilter as any },
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      },
      fetchPolicy: 'network-only',
    }
  );

  const [deleteLog] = useMutation(DeleteLogDocument, {
    onCompleted: () => {
      refetch();
      enqueueSnackbar('Лог успешно удален', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(`Ошибка удаления: ${err.message}`, { variant: 'error' });
    },
  });

  if (error)
    return (
      <Typography color="error" sx={{ m: 4 }}>
        Ошибка: {error.message}
      </Typography>
    );

  const response = data?.deviceAuditLogs;
  const items = response?.items || [];
  const totalCount = response?.totalCount || 0;

  const handleDelete = async (id: string) => {
    await deleteLog({ variables: { id } });
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 1, sm: 1 },
        height: { xs: 'calc(100dvh - 230px)', sm: 'calc(100dvh - 130px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ================= ФИКСИРОВАННАЯ ШАПКА ================= */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          zIndex: 10,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Журнал аудита изменений
        </Typography>

        <FormControl size="small" sx={{ width: { xs: '100%', sm: 280 } }}>
          <InputLabel id="action-filter-label">Тип действия</InputLabel>
          <Select
            labelId="action-filter-label"
            value={actionFilter}
            label="Тип действия"
            native={isMobile}
            onChange={(e) => {
              setActionFilter(e.target.value as any);
              setPage(0);
            }}
          >
            {isMobile ? <MobileOptions /> : DesktopMenuItems}
          </Select>
        </FormControl>
      </Box>

      {/* ================= СКРОЛЛИРУЕМЫЙ СПИСОК КАРТОЧЕК ================= */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          my: 2,
          pr: 0.5,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#cbd5e1',
            borderRadius: '4px',
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Card
            sx={{ p: 4, textAlign: 'center', color: 'text.secondary', my: 2 }}
          >
            Записи не найдены
          </Card>
        ) : (
          <Stack spacing={1.5} sx={{ py: 1 }}>
            {items.map((log: any) => (
              <AuditLogRow key={log.id} log={log} onDelete={handleDelete} />
            ))}
          </Stack>
        )}
      </Box>

      {/* ================= ФИКСИРОВАННАЯ ПАГИНАЦИЯ ================= */}
      {!loading && items.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 'auto',
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: 10,
          }}
        >
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Строк:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} из ${count}`
            }
          />
        </Box>
      )}
    </Container>
  );
}

// 📱 Нативные опции для экономии места на мобильных экранах
const MobileOptions = () => (
  <>
    <option value="all">Все действия</option>
    <optgroup label="Базовые операции">
      <option value="create">📦 Добавление в систему</option>
      <option value="update">📝 Изменение паспорта</option>
      <option value="delete">🗑️ Удаление из системы</option>
    </optgroup>
    <optgroup label="Планировщик поверок">
      <option value="create_batch">📋 Создание партии</option>
      <option value="assign_device_to_batch">🚚 Добавление в партию</option>
      <option value="remove_device_to_batch">🔄 Исключение из партии</option>
      <option value="delete_batch">❌ Удаление пустой партии</option>
      <option value="verify">🔬 Результаты (Аршин)</option>
    </optgroup>
    <optgroup label="Журнал ремонтов">
      <option value="create_repair_batch">📋 Создание ведомости</option>
      <option value="assign_device_to_repair_batch">
        🛠️ Направление в ремонт
      </option>
      <option value="remove_device_to_repair_batch">
        🗑️ Исключение из ремонта
      </option>
      <option value="delete_repair_batch">❌ Удаление ведомости</option>
      <option value="device_scrap">🟥 Списание оборудования</option>
    </optgroup>
    <optgroup label="Журнал осмотров">
      <option value="inspection_batch_create">📋 Ведомость осмотров</option>
      <option value="inspection_doc_save">📄 Акт ТО</option>
    </optgroup>
  </>
);

// 💻 Элементы меню для десктопного MUI селекта
const DesktopMenuItems = [
  <MenuItem key="all" value="all">
    Все действия
  </MenuItem>,
  <ListSubheader key="h-base" sx={{ fontWeight: 'bold', lineHeight: '30px' }}>
    Базовые операции
  </ListSubheader>,
  <MenuItem key="create" value="create">
    📦 Добавление прибора в систему
  </MenuItem>,
  <MenuItem key="update" value="update">
    📝 Изменение паспорта СИ
  </MenuItem>,
  <MenuItem key="delete" value="delete">
    🗑️ Удаление прибора из системы
  </MenuItem>,
  <ListSubheader key="h-verify" sx={{ fontWeight: 'bold', lineHeight: '30px' }}>
    Планировщик поверок
  </ListSubheader>,
  <MenuItem key="create_batch" value="create_batch">
    📋 Создание партии на поверку
  </MenuItem>,
  <MenuItem key="assign_device_to_batch" value="assign_device_to_batch">
    🚚 Добавление прибора в партию поверок
  </MenuItem>,
  <MenuItem key="remove_device_to_batch" value="remove_device_to_batch">
    🔄 Исключение прибора из партии поверок
  </MenuItem>,
  <MenuItem key="delete_batch" value="delete_batch">
    ❌ Удаление пустой партии поверок
  </MenuItem>,
  <MenuItem key="verify" value="verify">
    🔬 Результаты контроля (ФГИС Аршин)
  </MenuItem>,
  <ListSubheader key="h-repair" sx={{ fontWeight: 'bold', lineHeight: '30px' }}>
    Журнал ремонтов
  </ListSubheader>,
  <MenuItem key="create_repair_batch" value="create_repair_batch">
    📋 Создание ремонтной ведомости
  </MenuItem>,
  <MenuItem
    key="assign_device_to_repair_batch"
    value="assign_device_to_repair_batch"
  >
    🛠️ Направление прибора в ремонт
  </MenuItem>,
  <MenuItem
    key="remove_device_to_repair_batch"
    value="remove_device_to_repair_batch"
  >
    🗑️ Исключение прибора из ведомости ремонтов
  </MenuItem>,
  <MenuItem key="delete_repair_batch" value="delete_repair_batch">
    ❌ Удаление пустой ведомости ремонта
  </MenuItem>,
  <MenuItem key="device_scrap" value="device_scrap">
    🟥 Списание оборудования
  </MenuItem>,
  <ListSubheader key="h-ins" sx={{ fontWeight: 'bold', lineHeight: '30px' }}>
    Журнал осмотров
  </ListSubheader>,
  <MenuItem key="inspection_batch_create" value="inspection_batch_create">
    📋 Фиксация ведомости осмотров
  </MenuItem>,
  <MenuItem key="inspection_doc_save" value="inspection_doc_save">
    📄 Сохранение единичного акта осмотра
  </MenuItem>,
];
