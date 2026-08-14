// import React, { useState } from 'react';
// import {
//   Box,
//   Typography,
//   Button,
//   TablePagination,
//   TextField,
//   MenuItem,
// } from '@mui/material';
// import { useMutation, useQuery } from '@apollo/client/react';
// import { enqueueSnackbar } from 'notistack';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// import { InspectionPoolTable } from '../components/InspectionPoolTable';
// import { InspectionYearlyCalendar } from '../components/InspectionYearlyCalendar';
// import { DeviceManageSidebar } from '../components/DeviceManageSidebar';

// import {
//   GetInspectionPoolDocument,
//   CreateBulkInspectionDocument,
// } from '../graphql/types/__generated__/graphql';

// export const InspectionPlanningPage: React.FC = () => {
//   const [viewMode, setViewMode] = useState<'info' | 'create' | 'edit' | null>(
//     null
//   );
//   const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

//   const currentYear = new Date().getFullYear();
//   const currentMonthStr = `${currentYear}-${String(
//     new Date().getMonth() + 1
//   ).padStart(2, '0')}`;

//   const [page, setPage] = useState<number>(0);
//   const [rowsPerPage, setRowsPerPage] = useState<number>(20);
//   const currentOffset = page * rowsPerPage;

//   const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
//   const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

//   // НОВОЕ: Состояние для хранения выбранной периодичности следующего ТО (по умолчанию год)
//   const [inspectionInterval, setInspectionInterval] = useState<number>(12);

//   const { data, loading, refetch } = useQuery(GetInspectionPoolDocument, {
//     variables: {
//       targetMonth: selectedMonth,
//       limit: rowsPerPage,
//       offset: currentOffset,
//     },
//     fetchPolicy: 'cache-and-network',
//   });

//   const [executeBulkInspection, { loading: mutationLoading }] = useMutation(
//     CreateBulkInspectionDocument,
//     {
//       onCompleted: () => {
//         enqueueSnackbar(
//           'Результаты осмотра и периодичность успешно сохранены!',
//           { variant: 'success' }
//         );
//         setSelectedDeviceIds([]);
//         refetch();
//       },
//       onError: (err) => {
//         enqueueSnackbar(`Не удалось сохранить осмотр: ${err.message}`, {
//           variant: 'error',
//         });
//       },
//     }
//   );

//   const handleDeviceSelect = (deviceId: string) => {
//     setSelectedDeviceIds((prev) =>
//       prev.includes(deviceId)
//         ? prev.filter((id) => id !== deviceId)
//         : [...prev, deviceId]
//     );
//   };

//   const handleSaveInspections = () => {
//     if (!selectedDeviceIds.length) return;
//     // Прокидываем выбранные ID и выбранный интервал месяцев в мутацию
//     executeBulkInspection({
//       variables: {
//         deviceIds: selectedDeviceIds,
//         intervalMonths: inspectionInterval,
//       },
//     });
//   };

//   const poolItems = data?.getInspectionPoolByMonth?.items ?? [];
//   const totalCount = data?.getInspectionPoolByMonth?.totalCount ?? 0;
//   const yearlySummary = data?.getInspectionPoolByMonth?.yearlySummary ?? [];

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: { xs: 'column', md: 'row' },
//         width: '100%',
//         height: { xs: 'auto', md: '100%' },
//         p: { xs: 1, md: 3 },
//         gap: { xs: 2, md: 3 },
//         boxSizing: 'border-box',
//       }}
//     >
//       {/* КАЛЕНДАРЬ */}
//       <Box
//         sx={{
//           width: { xs: '100%', md: 280 },
//           display: { xs: viewMode ? 'none' : 'block' },
//           flexShrink: 0,
//         }}
//       >
//         <InspectionYearlyCalendar
//           currentYear={currentYear}
//           selectedMonth={selectedMonth}
//           onSelectMonth={(month) => {
//             setSelectedMonth(month);
//             setPage(0);
//             setSelectedDeviceIds([]);
//           }}
//           summaryData={yearlySummary}
//           loading={loading}
//         />
//       </Box>

//       {/* ТАБЛИЦА И УПРАВЛЕНИЕ */}
//       <Box
//         sx={{
//           width: {
//             xs: viewMode ? '0%' : '100%',
//             md: viewMode ? 'calc(70% - 24px)' : '100%',
//           },
//           display: { xs: viewMode ? 'none' : 'flex', md: 'flex' },
//           flexDirection: 'column',
//           flex: { xs: 'none', md: viewMode ? 'none' : 1 },
//           bgcolor: 'background.paper',
//           borderRadius: 2,
//           boxShadow: 1,
//           p: 3,
//           overflow: 'hidden',
//         }}
//       >
//         <Box
//           sx={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             borderBottom: 1,
//             borderColor: 'divider',
//             pb: 2,
//             mb: 2,
//             flexWrap: 'wrap',
//             gap: 2,
//           }}
//         >
//           <Box>
//             <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
//               Регламентные осмотры оборудования
//             </Typography>
//             <Typography variant="caption" color="text.secondary">
//               Текущий период обхода цехов: {selectedMonth}
//             </Typography>
//           </Box>

//           {/* НОВАЯ ИНТЕРПРИТАЦИЯ ПАНЕЛИ: Мастер выбирает срок "на лету" перед сохранением */}
//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 1.5,
//               bgcolor: '#f0fdf4',
//               p: 1,
//               px: 2,
//               borderRadius: 2,
//               border: '1px solid #c2e7d9',
//             }}
//           >
//             <TextField
//               select
//               size="small"
//               label="Повторить осмотр через"
//               value={inspectionInterval}
//               onChange={(e) =>
//                 setInspectionInterval(parseInt(e.target.value, 10))
//               }
//               sx={{ bgcolor: 'background.paper', width: 180 }}
//             >
//               <MenuItem value={1}>1 месяц</MenuItem>
//               <MenuItem value={3}>3 месяца</MenuItem>
//               <MenuItem value={6}>6 месяцев</MenuItem>
//               <MenuItem value={12}>1 год (12 мес.)</MenuItem>
//             </TextField>

//             <Button
//               variant="contained"
//               color="success"
//               size="small"
//               startIcon={<CheckCircleOutlineIcon />}
//               onClick={handleSaveInspections}
//               disabled={selectedDeviceIds.length === 0 || mutationLoading}
//               sx={{
//                 height: 36,
//                 borderRadius: 2,
//                 textTransform: 'none',
//                 fontWeight: 'bold',
//               }}
//             >
//               Отметить как «Осмотрено» ({selectedDeviceIds.length})
//             </Button>
//           </Box>
//         </Box>

//         <InspectionPoolTable
//           devices={poolItems}
//           loading={loading}
//           selectedDeviceIds={selectedDeviceIds}
//           onDeviceSelect={handleDeviceSelect}
//           onDeviceClick={(id) => {
//             setSelectedDeviceId(id);
//             setViewMode('info');
//           }}
//         />

//         <TablePagination
//           component="div"
//           count={totalCount}
//           page={page}
//           onPageChange={(_e, newPage) => setPage(newPage)}
//           rowsPerPage={rowsPerPage}
//           onRowsPerPageChange={(e) => {
//             setRowsPerPage(parseInt(e.target.value, 10));
//             setPage(0);
//           }}
//           rowsPerPageOptions={[10, 20, 50, 100]}
//           labelRowsPerPage="Строк:"
//         />
//       </Box>

//       <DeviceManageSidebar
//         viewMode={viewMode}
//         setViewMode={setViewMode}
//         selectedDeviceId={selectedDeviceId}
//         setSelectedDeviceId={setSelectedDeviceId}
//         refetchTable={refetch}
//       />
//     </Box>
//   );
// };
// import React, { useState } from 'react';
// import { Box, Typography, Button, TablePagination } from '@mui/material';
// import { useMutation, useQuery } from '@apollo/client/react';
// import { enqueueSnackbar } from 'notistack';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
// import QrCode from '@mui/icons-material/QrCode';

// import { InspectionPoolTable } from '../components/InspectionPoolTable';
// import { InspectionYearlyCalendar } from '../components/InspectionYearlyCalendar';
// import { DeviceManageSidebar } from '../components/DeviceManageSidebar';

// import { BarcodePrintModal } from '../components/BarcodePrintModal';

// import {
//   GetInspectionPoolDocument,
//   CreateBulkInspectionDocument,
// } from '../graphql/types/__generated__/graphql';
// import { InspectionSaveModal } from '../components/modals/InspectionSaveModal';

// export const InspectionPlanningPage: React.FC = () => {
//   const [viewMode, setViewMode] = useState<'info' | 'create' | 'edit' | null>(
//     null
//   );
//   const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
//   const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
//   const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

//   const currentYear = new Date().getFullYear();
//   const currentMonthStr = `${currentYear}-${String(
//     new Date().getMonth() + 1
//   ).padStart(2, '0')}`;

//   const [page, setPage] = useState<number>(0);
//   const [rowsPerPage, setRowsPerPage] = useState<number>(20);
//   const currentOffset = page * rowsPerPage;

//   const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
//   const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

//   const { data, loading, refetch } = useQuery(GetInspectionPoolDocument, {
//     variables: {
//       targetMonth: selectedMonth,
//       limit: rowsPerPage,
//       offset: currentOffset,
//     },
//     fetchPolicy: 'cache-and-network',
//   });

//   const [executeBulkInspection, { loading: mutationLoading }] = useMutation(
//     CreateBulkInspectionDocument,
//     {
//       onCompleted: () => {
//         enqueueSnackbar('Акт обхода успешно сформирован в системе!', {
//           variant: 'success',
//         });
//         setSelectedDeviceIds([]);
//         setIsSubmitModalOpen(false);
//         refetch();
//       },
//     }
//   );

//   const handleDeviceSelect = (deviceId: string) => {
//     setSelectedDeviceIds((prev) =>
//       prev.includes(deviceId)
//         ? prev.filter((id) => id !== deviceId)
//         : [...prev, deviceId]
//     );
//   };

//   const poolItems = data?.getInspectionPoolByMonth?.items ?? [];
//   const totalCount = data?.getInspectionPoolByMonth?.totalCount ?? 0;
//   const yearlySummary = data?.getInspectionPoolByMonth?.yearlySummary ?? [];
//   const selectedDeviceObjects = poolItems.filter((d) =>
//     selectedDeviceIds.includes(d.id)
//   );

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: { xs: 'column', md: 'row' },
//         width: '100%',
//         height: { xs: 'auto', md: '100%' },
//         p: { xs: 1, md: 3 },
//         gap: { xs: 2, md: 3 },
//         boxSizing: 'border-box',
//       }}
//     >
//       <Box
//         sx={{
//           width: { xs: '100%', md: 280 },
//           display: { xs: viewMode ? 'none' : 'block' },
//           flexShrink: 0,
//         }}
//       >
//         <InspectionYearlyCalendar
//           currentYear={currentYear}
//           selectedMonth={selectedMonth}
//           onSelectMonth={(m) => {
//             setSelectedMonth(m);
//             setPage(0);
//             setSelectedDeviceIds([]);
//           }}
//           summaryData={yearlySummary}
//           loading={loading}
//         />
//       </Box>

//       <Box
//         sx={{
//           width: {
//             xs: viewMode ? '0%' : '100%',
//             md: viewMode ? 'calc(70% - 24px)' : '100%',
//           },
//           display: { xs: viewMode ? 'none' : 'flex', md: 'flex' },
//           flexDirection: 'column',
//           flex: { xs: 'none', md: viewMode ? 'none' : 1 },
//           bgcolor: 'background.paper',
//           borderRadius: 2,
//           boxShadow: 1,
//           p: 3,
//           overflow: 'hidden',
//         }}
//       >
//         <Box
//           sx={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             borderBottom: 1,
//             borderColor: 'divider',
//             pb: 2,
//             mb: 2,
//             flexWrap: 'wrap',
//             gap: 2,
//           }}
//         >
//           <Box>
//             <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
//               Регламентные осмотры оборудования
//             </Typography>
//             <Typography variant="caption" color="text.secondary">
//               Текущий период обхода цехов: {selectedMonth}
//             </Typography>
//           </Box>

//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 1.5,
//               bgcolor: '#f0fdf4',
//               p: 1,
//               px: 2,
//               borderRadius: 2,
//               border: '1px solid #c2e7d9',
//             }}
//           >
//             <Typography
//               variant="body2"
//               sx={{ fontWeight: 600, color: 'success.dark' }}
//             >
//               Выбрано оборудования: {selectedDeviceIds.length} ед.
//             </Typography>

//             <Button
//               variant="outlined"
//               color="primary"
//               size="small"
//               startIcon={<QrCode />}
//               onClick={() => setIsBarcodeModalOpen(true)}
//               disabled={selectedDeviceIds.length === 0}
//               sx={{
//                 height: 36,
//                 textTransform: 'none',
//                 fontWeight: 'bold',
//                 borderRadius: 2,
//                 bgcolor: 'background.paper',
//               }}
//             >
//               Печать бирок ({selectedDeviceIds.length})
//             </Button>

//             <Button
//               variant="contained"
//               color="success"
//               size="small"
//               startIcon={<CheckCircleOutlineIcon />}
//               onClick={() => setIsSubmitModalOpen(true)}
//               disabled={selectedDeviceIds.length === 0}
//               sx={{
//                 height: 36,
//                 borderRadius: 2,
//                 textTransform: 'none',
//                 fontWeight: 'bold',
//               }}
//             >
//               Внести результаты обхода
//             </Button>
//           </Box>
//         </Box>

//         <InspectionPoolTable
//           devices={poolItems}
//           loading={loading}
//           selectedDeviceIds={selectedDeviceIds}
//           onDeviceSelect={handleDeviceSelect}
//           onDeviceClick={(id) => {
//             setSelectedDeviceId(id);
//             setViewMode('info');
//           }}
//         />

//         <TablePagination
//           component="div"
//           count={totalCount}
//           page={page}
//           onPageChange={(_e, pId) => setPage(pId)}
//           rowsPerPage={rowsPerPage}
//           onRowsPerPageChange={(e) => {
//             setRowsPerPage(parseInt(e.target.value, 10));
//             setPage(0);
//           }}
//           rowsPerPageOptions={[10, 20, 50, 100]}
//           labelRowsPerPage="Строк:"
//         />
//       </Box>

//       <DeviceManageSidebar
//         viewMode={viewMode}
//         setViewMode={setViewMode}
//         selectedDeviceId={selectedDeviceId}
//         setSelectedDeviceId={setSelectedDeviceId}
//         refetchTable={refetch}
//       />
//       <InspectionSaveModal
//         open={isSubmitModalOpen}
//         onClose={() => setIsSubmitModalOpen(false)}
//         selectedDevices={selectedDeviceObjects}
//         loading={mutationLoading}
//         onSave={(items, interval) =>
//           executeBulkInspection({
//             variables: { items, intervalMonths: interval },
//           })
//         }
//       />
//       <BarcodePrintModal
//         open={isBarcodeModalOpen}
//         onClose={() => setIsBarcodeModalOpen(false)}
//         deviceIds={selectedDeviceIds}
//       />
//     </Box>
//   );
// };
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TablePagination,
  Tabs,
  Tab,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QrCode from '@mui/icons-material/QrCode';

import { InspectionPoolTable } from '../components/InspectionPoolTable';
import { InspectionYearlyCalendar } from '../components/InspectionYearlyCalendar';
import { DeviceManageSidebar } from '../components/DeviceManageSidebar';

import { BarcodePrintModal } from '../components/BarcodePrintModal';

// Импортируем строго сгенерированные документы под новые типы контракта
import {
  GetInspectionPoolDocument,
  CreateBulkInspectionDocument,
  GetInspectionArchiveDocument,
} from '../graphql/types/__generated__/graphql';
import { InspectionSaveModal } from '../components/modals/InspectionSaveModal';

export const InspectionPlanningPage: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<number>(0); // 0 = Пул задач, 1 = Архив актов
  const [viewMode, setViewMode] = useState<'info' | 'create' | 'edit' | null>(
    null
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonthStr = `${currentYear}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}`;

  // Пагинация Вкладки 1 (Пул)
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  // Пагинация Вкладки 2 (Архив актов)
  const [archivePage, setArchivePage] = useState<number>(0);
  const [archiveRowsPerPage, setArchiveRowsPerPage] = useState<number>(10);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  // Запрос Вкладки 1: Пул задач на ТО
  const { data, loading, refetch } = useQuery(GetInspectionPoolDocument, {
    variables: {
      targetMonth: selectedMonth,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    },
    skip: activeMainTab !== 0,
    fetchPolicy: 'cache-and-network',
  });

  // Запрос Вкладки 2: Архив актов ТО (переиспользует общий метод без костылей LIKE)
  const { data: archiveData, refetch: refetchArchive } = useQuery(
    GetInspectionArchiveDocument,
    {
      variables: {
        limit: archiveRowsPerPage,
        offset: archivePage * archiveRowsPerPage,
      },
      skip: activeMainTab !== 1,
      fetchPolicy: 'cache-and-network',
    }
  );

  // Мутация отправки результатов обхода
  const [executeBulkInspection, { loading: mutationLoading }] = useMutation(
    CreateBulkInspectionDocument,
    {
      onCompleted: () => {
        enqueueSnackbar('Акт обхода цехов успешно сформирован в системе!', {
          variant: 'success',
        });
        setSelectedDeviceIds([]);
        setIsSubmitModalOpen(false);
        refetch();
        refetchArchive(); // Обновляем архив, чтобы свежий акт сразу появился там
      },
      onError: (err) => {
        enqueueSnackbar(`Ошибка сохранения: ${err.message}`, {
          variant: 'error',
        });
      },
    }
  );

  const poolItems = data?.getInspectionPoolByMonth?.items ?? [];
  const totalCount = data?.getInspectionPoolByMonth?.totalCount ?? 0;
  const yearlySummary = data?.getInspectionPoolByMonth?.yearlySummary ?? [];

  const archiveItems = archiveData?.getInspectionBatchesArchive?.items ?? [];
  const archiveTotalCount =
    archiveData?.getInspectionBatchesArchive?.totalCount ?? 0;

  const selectedDeviceObjects = poolItems.filter((d) =>
    selectedDeviceIds.includes(d.id)
  );

  const archivePoolDevices = React.useMemo(() => {
    const flatDevices: any[] = [];
    archiveItems.forEach((batch: any) => {
      batch.devices?.forEach((device: any) => {
        if (!device) return;
        flatDevices.push({
          id: device.id,
          // Красиво склеиваем имя прибора и номер акта ТО
          name: `${device.name} (Акт: ${batch.number})`,
          model: device.model,
          serialNumber: device.serialNumber,
          controlType: 'Осмотр',
          lastInspectionDate: batch.date, // Дата проведения этого ТО
          validUntil: batch.date,
          // Если прибор бракованный — передаем true, чтобы ваша таблица подсветила строку красным
          isOverdue: !device.isSuccess,
        });
      });
    });
    return flatDevices;
  }, [archiveItems]);

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 1, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxSizing: 'border-box',
      }}
    >
      {/* ВЕРХНИЕ НАД-ТАБЫ СТРАНИЦЫ */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeMainTab}
          onChange={(_e, val) => {
            setActiveMainTab(val);
            setSelectedDeviceIds([]);
          }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            label="📋 Текущие задачи на осмотр"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          />
          <Tab
            label="📦 Архив актов ТО цеха"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          />
        </Tabs>
      </Box>

      {/* РЕЖИМ 1: ПУЛ ТЕКУЩИХ ЗАДАЧ */}
      {activeMainTab === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: { xs: '100%', md: 280 },
              display: { xs: viewMode ? 'none' : 'block' },
              flexShrink: 0,
            }}
          >
            <InspectionYearlyCalendar
              currentYear={currentYear}
              selectedMonth={selectedMonth}
              onSelectMonth={(m) => {
                setSelectedMonth(m);
                setPage(0);
                setSelectedDeviceIds([]);
              }}
              summaryData={yearlySummary}
              loading={loading}
            />
          </Box>

          <Box
            sx={{
              width: {
                xs: viewMode ? '0%' : '100%',
                md: viewMode ? 'calc(70% - 24px)' : '100%',
              },
              display: { xs: viewMode ? 'none' : 'flex', md: 'flex' },
              flexDirection: 'column',
              flex: { xs: 'none', md: viewMode ? 'none' : 1 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
              p: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: 1,
                borderColor: 'divider',
                pb: 2,
                mb: 2,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  График планового обслуживания
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Рабочий период обхода: {selectedMonth}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: '#f0fdf4',
                  p: 1,
                  px: 2,
                  borderRadius: 2,
                  border: '1px solid #c2e7d9',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'success.dark' }}
                >
                  Выбрано оборудования: {selectedDeviceIds.length} ед.
                </Typography>

                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<QrCode />}
                  onClick={() => setIsBarcodeModalOpen(true)}
                  disabled={selectedDeviceIds.length === 0}
                  sx={{
                    height: 36,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  Печать бирок ({selectedDeviceIds.length})
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => setIsSubmitModalOpen(true)}
                  disabled={selectedDeviceIds.length === 0}
                  sx={{
                    height: 36,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Внести результаты
                </Button>
              </Box>
            </Box>

            <InspectionPoolTable
              devices={poolItems}
              loading={loading}
              selectedDeviceIds={selectedDeviceIds}
              onDeviceSelect={(id) =>
                setSelectedDeviceIds((prev) =>
                  prev.includes(id)
                    ? prev.filter((x) => x !== id)
                    : [...prev, id]
                )
              }
              onDeviceClick={(id) => {
                setSelectedDeviceId(id);
                setViewMode('info');
              }}
            />
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_e, pId) => setPage(pId)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
              labelRowsPerPage="Строк:"
            />
          </Box>
        </Box>
      )}

      {/* РЕЖИМ 2: АРХИВ ВЫПОЛНЕННЫХ АКТОВ ТО */}
      {activeMainTab === 1 && (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 2,
            boxShadow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Журнал выполненных регламентных обходов
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Используйте чекбоксы строк, чтобы выбрать приборы из нужных
                актов, и нажмите кнопку печати справа
              </Typography>
            </Box>

            {/* КНОПКА ПЕЧАТИ ИЗ АРХИВА */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<QrCode />}
              onClick={() => setIsBarcodeModalOpen(true)}
              disabled={selectedDeviceIds.length === 0}
              sx={{
                height: 36,
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: 2,
              }}
            >
              Печать бирок из архива ({selectedDeviceIds.length})
            </Button>
          </Box>

          {/* 🔥 ПОВТОРНОЕ ИСПОЛЬЗОВАНИЕ ИМЕННО ВАШЕЙ ТАБЛИЦЫ ТО ПОД АРХИВ */}
          <InspectionPoolTable
            devices={archivePoolDevices} // Сюда скармливаем наш плоский массив из Шага 1
            loading={loading}
            selectedDeviceIds={selectedDeviceIds}
            onDeviceSelect={(id) =>
              setSelectedDeviceIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
            onDeviceClick={(id) => {
              setSelectedDeviceId(id);
              setViewMode('info');
            }}
          />

          <TablePagination
            component="div"
            count={archiveTotalCount}
            page={archivePage}
            onPageChange={(_e, pId) => setArchivePage(pId)}
            rowsPerPage={archiveRowsPerPage}
            onRowsPerPageChange={(e) => {
              setArchiveRowsPerPage(parseInt(e.target.value, 10));
              setArchivePage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Строк архива:"
          />
        </Box>
      )}

      {/* УНИВЕРСАЛЬНЫЕ ОКНА СТРАНИЦЫ */}
      <DeviceManageSidebar
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
        refetchTable={activeMainTab === 0 ? refetch : refetchArchive}
      />
      <InspectionSaveModal
        open={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        selectedDevices={selectedDeviceObjects}
        loading={mutationLoading}
        onSave={(items, interval) =>
          executeBulkInspection({
            variables: { items, intervalMonths: interval },
          })
        }
      />

      <BarcodePrintModal
        open={isBarcodeModalOpen}
        onClose={() => {
          setIsBarcodeModalOpen(false);
          // Лишний сброс printDeviceIds отсюда тоже удаляем
        }}
        deviceIds={selectedDeviceIds}
      />
    </Box>
  );
};
