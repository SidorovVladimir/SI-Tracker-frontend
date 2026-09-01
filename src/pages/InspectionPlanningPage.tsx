import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
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
  GetInspectionCalendarSummaryDocument,
  GetDevicesWithRelationsListDocument,
  // GetInspectionArchiveDocument,
} from '../graphql/types/__generated__/graphql';
import { InspectionSaveModal } from '../components/modals/InspectionSaveModal';
import { Search } from '@mui/icons-material';

export const InspectionPlanningPage: React.FC = () => {
  // const [activeMainTab, setActiveMainTab] = useState<number>(0); // 0 = Пул задач, 1 = Архив актов
  const [viewMode, setViewMode] = useState<'info' | 'create' | 'edit' | null>(
    null
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const [manuallyAddedDevices, setManuallyAddedDevices] = useState<any[]>([]);
  const [searchSerial, setSearchSerial] = useState('');

  const currentYear = new Date().getFullYear();
  const currentMonthStr = `${currentYear}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}`;

  // Пагинация Вкладки 1 (Пул)
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  // Пагинация Вкладки 2 (Архив актов)
  // const [archivePage, setArchivePage] = useState<number>(0);
  // const [archiveRowsPerPage, setArchiveRowsPerPage] = useState<number>(10);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  // Запрос Вкладки 1: Пул задач на ТО
  const { data, loading, refetch } = useQuery(GetInspectionPoolDocument, {
    variables: {
      targetMonth: selectedMonth,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    },
    // skip: activeMainTab !== 0,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: summaryData,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery(GetInspectionCalendarSummaryDocument, {
    fetchPolicy: 'cache-and-network',
  });

  // Запрос Вкладки 2: Архив актов ТО (переиспользует общий метод без костылей LIKE)
  // const { data: archiveData, refetch: refetchArchive } = useQuery(
  //   GetInspectionArchiveDocument,
  //   {
  //     variables: {
  //       limit: archiveRowsPerPage,
  //       offset: archivePage * archiveRowsPerPage,
  //     },
  //     skip: activeMainTab !== 1,
  //     fetchPolicy: 'cache-and-network',
  //   }
  // );

  // 🔥 ЛЕНИВЫЙ ЗАПРОС: Ищет любой прибор в системе по серийнику при вводе
  const [searchDevice, { loading: searchLoading }] = useLazyQuery(
    GetDevicesWithRelationsListDocument,
    {
      fetchPolicy: 'network-only',
    }
  );

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSerial.trim()) return;

    try {
      // Запускаем ленивый запрос и ждем результат выполнения
      const { data: resultData } = await searchDevice({
        variables: {
          limit: 1,
          offset: 0,
          filter: {
            serialNumber: searchSerial.trim(),
            includeArchived: false,
          },
        },
      });

      // Достаем первый найденный прибор (обратите внимание на GetDevicesWithRelationsListQuery из вашей ошибки)
      // Если у вас кодогенератор назвал поле по-другому, подставьте ваше (например: getDevicesWithRelations)
      const found = resultData?.devicesWithRelations?.items?.[0];

      if (!found) {
        enqueueSnackbar('Прибор с таким заводским номером не найден!', {
          variant: 'warning',
        });
        return;
      }

      // Проверяем, нет ли его уже в таблице плановых задач или среди ранее добавленных вручную
      const isAlreadyInPool =
        dbPoolItems.some((d) => d.id === found.id) ||
        manuallyAddedDevices.some((d) => d.id === found.id);

      if (isAlreadyInPool) {
        enqueueSnackbar(
          'Этот прибор уже находится в списке на текущий месяц!',
          { variant: 'info' }
        );
        setSearchSerial('');
        return;
      }

      // Форматируем прибор под плоский контракт вашей таблицы InspectionPoolTable
      const adaptedDevice = {
        id: found.id,
        name: found.name,
        model: found.model,
        serialNumber: found.serialNumber,
        lastInspectionDate: found.latestInspection?.date ?? null,
        validUntil: new Date().toISOString(),
        isOverdue: false,
        isManualExtra: true,
      };

      // Обновляем стейты страницы
      setManuallyAddedDevices((prev) => [...prev, adaptedDevice]);
      setSelectedDeviceIds((prev) => [...prev, found.id]); // Автоматически взводим галочку выбора!
      setSearchSerial('');
      enqueueSnackbar(
        `Прибор ${found.name} успешно добавлен в рабочий список!`,
        { variant: 'success' }
      );
    } catch (err: any) {
      enqueueSnackbar(`Ошибка при поиске прибора: ${err.message}`, {
        variant: 'error',
      });
    }
  };

  // Мутация отправки результатов обхода
  const [executeBulkInspection, { loading: mutationLoading }] = useMutation(
    CreateBulkInspectionDocument,
    {
      onCompleted: () => {
        enqueueSnackbar('Акт осмотра успешно сформирован в системе!', {
          variant: 'success',
        });
        setSelectedDeviceIds([]);
        setIsSubmitModalOpen(false);
        refetch();
        refetchSummary();
        // refetchArchive()
      },
      onError: (err) => {
        enqueueSnackbar(`Ошибка сохранения: ${err.message}`, {
          variant: 'error',
        });
      },
    }
  );

  // const poolItems = data?.getInspectionPoolByMonth?.items ?? [];
  // const totalCount = data?.getInspectionPoolByMonth?.totalCount ?? 0;

  const dbPoolItems = data?.getInspectionPoolByMonth?.items ?? [];

  const poolItems = [...manuallyAddedDevices, ...dbPoolItems];
  const totalCount =
    (data?.getInspectionPoolByMonth?.totalCount ?? 0) +
    manuallyAddedDevices.length;

  // const archiveItems = archiveData?.getInspectionBatchesArchive?.items ?? [];
  // const archiveTotalCount =
  //   archiveData?.getInspectionBatchesArchive?.totalCount ?? 0;

  const selectedDeviceObjects = poolItems.filter((d) =>
    selectedDeviceIds.includes(d.id)
  );

  // const archivePoolDevices = React.useMemo(() => {
  //   const flatDevices: any[] = [];
  //   archiveItems.forEach((batch: any) => {
  //     batch.devices?.forEach((device: any) => {
  //       if (!device) return;
  //       flatDevices.push({
  //         id: device.id,
  //         // Красиво склеиваем имя прибора и номер акта ТО
  //         name: `${device.name} (Акт: ${batch.number})`,
  //         model: device.model,
  //         serialNumber: device.serialNumber,
  //         controlType: 'Осмотр',
  //         lastInspectionDate: batch.date, // Дата проведения этого ТО
  //         validUntil: batch.date,
  //         // Если прибор бракованный — передаем true, чтобы ваша таблица подсветила строку красным
  //         isOverdue: !device.isSuccess,
  //       });
  //     });
  //   });
  //   return flatDevices;
  // }, [archiveItems]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        height: { xs: 'auto', md: '100%' },
        maxHeight: { xs: 'none', md: '100%' },
        overflow: { xs: 'visible', md: 'hidden' },
        p: { xs: 1, md: 3 },
        gap: { xs: 2, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          height: { xs: 'auto', md: '100%' },
          maxHeight: { xs: 'none', md: '100%' },
          // overflowY: { xs: 'visible', md: 'auto' },
          overflowX: 'hidden',
          flexShrink: 0,
          width: { xs: '100%', md: 280 },
          display: { xs: viewMode ? 'none' : 'block' },
          transition: 'all 0.3s ease',
        }}
      >
        <InspectionYearlyCalendar
          currentYear={currentYear}
          selectedMonth={selectedMonth}
          onSelectMonth={(m) => {
            setSelectedMonth(m);
            setPage(0);
            setSelectedDeviceIds([]);
            setManuallyAddedDevices([]);
          }}
          summaryData={summaryData?.getInspectionCalendarSummary}
          loading={summaryLoading}
        />
      </Box>

      <Box
        sx={{
          // 🎯 ИСПРАВЛЕНО: Если сайдбар открыт — плавно сжимаем таблицу до 70% на ПК, освобождая место.
          // На мобилках при открытом сайдбаре полностью скрываем таблицу, чтобы не ломать экран.
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
          transition: 'width 0.3s ease, flex 0.3s ease', // Красивая плавная анимация сдвига
        }}
      >
        {/* Панель заголовка и фильтров контроля */}
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
          {/* Название и подпись */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              График планового обслуживания
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Рабочий период обхода: {selectedMonth}
            </Typography>
          </Box>

          {/* Управление партиями текущего месяца */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1.5,
              bgcolor: 'grey.50',
              p: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              width: { xs: '100%', md: 'auto' },
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

        {/* <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: 'blue.50',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: 'primary.dark',
              minWidth: 150,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            🔎 Внеплановый осмотр:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Введи или отсканируй заводской номер прибора и нажми Enter..."
            value={searchSerial}
            onChange={(e) => setSearchSerial(e.target.value)}
            disabled={searchLoading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {searchLoading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <Search color="primary" />
                    )}
                  </InputAdornment>
                ),
              },
            }}
            sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={searchLoading || !searchSerial.trim()}
            sx={{
              height: 36,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
            }}
          >
            Добавить
          </Button>
        </Box> */}
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            mb: 3,
            p: 2,
            bgcolor: 'grey.50', // Мягкий нейтральный фон в стиле вашей страницы
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'primary.light',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' }, // На мобилках в столбик, на ПК в ряд
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            gap: 2,
          }}
        >
          {/* Слева: Текстовый маркер в виде аккуратного чипса (только на ПК) */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, pt: 0.5 }}>
            <Chip
              icon={<Search style={{ fontSize: 14 }} />}
              label="Внеплановый осмотр"
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 'bold',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                height: 28,
                borderRadius: '6px',
              }}
            />
          </Box>

          {/* Центр: Поле ввода с подсказками */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <TextField
              fullWidth
              size="small"
              label="Заводской номер прибора"
              placeholder="Введите серийный номер"
              value={searchSerial}
              onChange={(e) => setSearchSerial(e.target.value)}
              disabled={searchLoading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      {searchLoading ? (
                        <CircularProgress size={18} />
                      ) : (
                        <Search color="action" style={{ fontSize: 20 }} />
                      )}
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* Живой текст-помощник */}
            <Typography
              variant="caption"
              color={searchSerial.trim() ? 'primary.main' : 'text.secondary'}
              sx={{
                pl: 1,
                fontWeight: searchSerial.trim() ? 500 : 400,
                transition: 'color 0.2s',
              }}
            >
              {searchSerial.trim()
                ? '👉 Нажмите Enter или кнопку «Найти», чтобы перехватить прибор в текущий список'
                : '💡 Кнопка «Найти» выполнит поиск по всей базе данных, включая приборы из других журналов.'}
            </Typography>
          </Box>

          {/* Справа: Кнопка действия */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={searchLoading || !searchSerial.trim()}
            sx={{
              height: 40, // Идеально выравнивается с TextField с учетом label
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: 2,
              px: 4,
              boxShadow: 0,
              '&:hover': { boxShadow: 0 },
            }}
          >
            Найти
          </Button>
        </Box>
        <InspectionPoolTable
          devices={poolItems}
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
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            mt: 'auto',

            '& .MuiTablePagination-toolbar': {
              px: { xs: 1, sm: 2 },
              minHeight: 48,

              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            },

            // 1. Убираем текст "Строк на странице:" на смартфонах
            '& .MuiTablePagination-selectLabel': {
              display: { xs: 'none', sm: 'block' },
            },

            // 2. Убираем выпадающий список выбора количества строк на смартфонах
            '& .MuiTablePagination-selectRoot': {
              display: { xs: 'none', sm: 'inline-flex' },
            },

            // 3. Сжимаем отступы у счетчика страниц (например: 1–20 из 145)
            '& .MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              fontWeight: 'medium',
              ml: { xs: 0, sm: 'auto' },
            },

            // 4. Защитный отступ справа для стрелочек переключения на мобилках
            '& .MuiTablePagination-actions': {
              ml: 1,
              // 🎯 Сдвигаем стрелочки левее на 56px, чтобы они не перекрывались парящей кнопкой помощи!
              mr: { xs: '56px', sm: 0 },
              '& .MuiIconButton-root': {
                p: { xs: 0.5, sm: 1 }, // Делаем стрелочки чуть компактнее для удобного нажатия
              },
            },
          }}
        />
      </Box>

      <DeviceManageSidebar
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
        // refetchTable={activeMainTab === 0 ? refetch : refetchArchive}
        refetchTable={refetch}
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
        }}
        deviceIds={selectedDeviceIds}
        controlType="inspection"
      />
    </Box>
  );
};
