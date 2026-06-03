import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  MenuItem,
  TablePagination,
  Tab,
  Tabs,
} from '@mui/material';

import { YearlyCalendarSummary } from '../components/YearlyCalendarSummary';
import { PlanningPoolTable } from '../components/PlanningPoolTable';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AddDevicesToBatchDocument,
  CreateVerificationBatchDocument,
  GetDraftBatchesByMonthDocument,
  GetMetrologyControlTypesListDocument,
  GetPlanningPoolDocument,
  // GetVerificationBatchesDocument,
  GetYearlySummaryDocument,
} from '../graphql/types/__generated__/graphql';
import { enqueueSnackbar } from 'notistack';

export const VerificationPlanningPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonthStr = `${currentYear}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}`;

  const { data: controlTypesData, loading: controlTypesLoading } = useQuery(
    GetMetrologyControlTypesListDocument
  );

  // Локальное состояние компонента

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const currentOffset = page * rowsPerPage;

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [exactPlannedDate, setExactPlannedDate] = useState<string>(
    new Date().toISOString().split('T')[0]!
  );

  const [selectedBatchOption, setSelectedBatchOption] = useState<string>('NEW');

  // 2. ВСТАВЛЯЕМ НОВЫЙ ЛЕГКИЙ ХУК (Автоматически перезапускается при смене selectedMonth):
  const { data: draftBatchesData, refetch: refetchDraftBatches } = useQuery(
    GetDraftBatchesByMonthDocument,
    {
      variables: { plannedMonth: selectedMonth },
      fetchPolicy: 'cache-and-network',
    }
  );

  // 3. Переменная activeDraftBatches теперь собирается мгновенно без тяжелых циклов .filter():
  const activeDraftBatches = draftBatchesData?.getDraftBatchesByMonth ?? [];

  const {
    data: summaryData,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery(GetYearlySummaryDocument, {
    variables: { year: currentYear },
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: poolData,
    loading: poolLoading,
    refetch: refetchPool,
  } = useQuery(GetPlanningPoolDocument, {
    variables: {
      targetMonth: selectedMonth,
      limit: rowsPerPage,
      offset: currentOffset,
      controlTypeId: activeFilter,
    },
    // fetchPolicy: 'network-only',
    fetchPolicy: 'cache-and-network',
  });

  const [createBatch] = useMutation(CreateVerificationBatchDocument);

  const [addDevices] = useMutation(AddDevicesToBatchDocument, {
    onCompleted: () => {
      enqueueSnackbar('Приборы успешно распределены в партию!', {
        variant: 'success',
      });

      setBatchNumber('');
      setSelectedDeviceIds([]);
      setSelectedBatchOption('NEW');
      refetchPool();
      refetchSummary();
      refetchDraftBatches();
    },
  });

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleCreateAndAssignBatch = async () => {
    // 1. Проверяем базовое условие: метролог обязан выбрать хотя бы один прибор галочкой
    if (selectedDeviceIds.length === 0) {
      alert('Выберите приборы для добавления в партию!');

      enqueueSnackbar('Выберите приборы для добавления в партию!', {
        variant: 'info',
      });

      return;
    }

    // 2. Если выбран режим создания НОВОЙ партии, проверяем, заполнен ли номер
    if (selectedBatchOption === 'NEW' && !batchNumber.trim()) {
      enqueueSnackbar('Введите номер для новой партии!', {
        variant: 'info',
      });
      return;
    }

    try {
      let targetBatchId = selectedBatchOption;

      // Сценарий 1: Пользователь создает НОВУЮ партию
      if (selectedBatchOption === 'NEW') {
        // Создаем черновик партии на сервере
        const isoPlannedDate = new Date(
          `${exactPlannedDate}T09:00:00.000Z`
        ).toISOString();

        const { data: batchData } = await createBatch({
          variables: {
            input: {
              number: batchNumber.trim(), // Убираем случайные пробелы по краям
              plannedDate: isoPlannedDate,
              comment: `Сформировано из панели автоматического планирования`,
            },
          },
        });
        targetBatchId = batchData?.createVerificationBatch?.id ?? '';
      }

      // Сценарий 2 (и продолжение Сценария 1): Если у нас есть ID целевой партии
      if (targetBatchId) {
        // Добавляем выбранные приборы в партию (новую или существующую)
        await addDevices({
          variables: { batchId: targetBatchId, deviceIds: selectedDeviceIds },
        });
      }
    } catch (error: any) {
      enqueueSnackbar(`Ошибка при формировании партии: ${error.message}`, {
        variant: 'error',
      });
    }
  };
  const handleTabChange = (_e: any, newValue: string) => {
    setActiveFilter(newValue);
    setPage(0);
    setSelectedDeviceIds([]);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setPage(0); // Сбрасываем на 0 страницу, чтобы избежать пустых экранов
    setSelectedDeviceIds([]);
    setExactPlannedDate(`${month}-01`);
  };

  // Извлекаем массив из нового объекта ответа
  const filteredDevices = poolData?.getPlanningPoolByMonth?.items ?? [];
  const totalCount = poolData?.getPlanningPoolByMonth?.totalCount ?? 0;
  const meta = poolData?.getPlanningPoolByMonth?.meta;

  const globalTotalCount = React.useMemo(() => {
    const typesSum =
      meta?.typeCounts?.reduce((sum, t) => sum + t.count, 0) ?? 0;
    const unassigned = meta?.unassignedCount ?? 0;
    return typesSum + unassigned;
  }, [meta]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      {/* ЛЕВАЯ ЧАСТЬ: Календарь-статистика */}
      <YearlyCalendarSummary
        currentYear={currentYear}
        selectedMonth={selectedMonth}
        onSelectMonth={handleMonthChange}
        summaryData={summaryData?.getYearlyCalendarSummary}
        loading={summaryLoading}
      />

      {/* ПРАВАЯ ЧАСТЬ: Таблица пула и фильтры управления */}
      <Box
        sx={{
          flex: 1,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
            <Typography
              variant="h5"
              sx={{ fontWeight: 'bold', color: 'text.primary' }}
            >
              Пул оборудования
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Рабочий период планирования: {selectedMonth}
            </Typography>
          </Box>

          {/* ЦЕНТРАЛЬНЫЙ БЛОК: Управление партиями текущего месяца (Виден ВСЕГДА) */}
          <Box
            //
            sx={{
              display: 'flex',
              // На мобилках элементы встанут вертикальной стопкой, на ПК — в одну красивую линию
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1.5,
              bg: 'grey.50',
              p: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              width: { xs: '100%', md: 'auto' }, // Во всю ширину на мобилках
            }}
          >
            {/* Выпадающий список созданных черновиков */}
            <TextField
              select
              size="small"
              label="Партия для сборки"
              value={selectedBatchOption}
              onChange={(e) => setSelectedBatchOption(e.target.value)}
              // sx={{ bgcolor: 'background.paper', width: 220 }}
              sx={{
                bgcolor: 'background.paper',
                width: { xs: '100%', sm: 220 },
              }}
            >
              <MenuItem value="NEW">➕ Создать новую...</MenuItem>
              {activeDraftBatches.length > 0 && <Divider />}
              {activeDraftBatches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  📦 Черновик №{batch.number}
                </MenuItem>
              ))}
            </TextField>

            {/* Поле ввода названия — только для режима NEW */}
            {selectedBatchOption === 'NEW' && (
              <TextField
                placeholder="Номер новой партии"
                size="small"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                // sx={{ bgcolor: 'background.paper', width: 180 }}
                sx={{
                  bgcolor: 'background.paper',
                  width: { xs: '100%', sm: 180 },
                }}
              />
            )}
            {selectedBatchOption === 'NEW' && (
              <TextField
                type="date"
                size="small"
                label="Дата отправки"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                value={exactPlannedDate}
                onChange={(e) => setExactPlannedDate(e.target.value)}
                // sx={{ bgcolor: 'background.paper', width: 160 }}
                sx={{
                  bgcolor: 'background.paper',
                  width: { xs: '100%', sm: 160 },
                }}
              />
            )}

            {/* Кнопка действия — активна только если метролог выбрал приборы галочками */}
            <Button
              variant="contained"
              color={selectedBatchOption === 'NEW' ? 'primary' : 'secondary'}
              size="small"
              onClick={handleCreateAndAssignBatch}
              disabled={
                selectedDeviceIds.length === 0 ||
                (selectedBatchOption === 'NEW' && !batchNumber.trim())
              }
              // sx={{ textTransform: 'none', fontWeight: 'bold', height: 40 }}
              sx={{
                height: 40,
                width: { xs: '100%', sm: 'auto' },
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              {selectedBatchOption === 'NEW'
                ? 'Создать и добавить'
                : `Добавить (${selectedDeviceIds.length} СИ)`}
            </Button>
          </Box>

          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              width: '100%',
              mt: 2,
            }}
          >
            {controlTypesLoading ? (
              <Typography variant="caption">
                Загрузка фильтров контроля...
              </Typography>
            ) : (
              <Tabs
                value={activeFilter}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="primary"
              >
                {/* 1. Базовая вкладка для отображения всего пула */}
                <Tab
                  value="ALL"
                  label={`Все приборы (${globalTotalCount})`}
                  sx={{ textTransform: 'none', fontWeight: 'bold' }}
                />
                {/* 2. Динамические вкладки под каждый тип контроля из вашей БД */}
                {controlTypesData?.metrologyControlTypes.map((type) => {
                  // Считаем сколько приборов этого типа сейчас находится в пуле текущего месяца
                  const serverCountObj = meta?.typeCounts.find(
                    (t) =>
                      t.typeName.toLowerCase().trim() ===
                      type.name.toLowerCase().trim()
                  );
                  const count = serverCountObj?.count ?? 0;
                  return (
                    <Tab
                      key={type.id}
                      value={type.id}
                      label={`${type.name} (${count})`}
                      sx={{ textTransform: 'none', fontWeight: 'medium' }}
                    />
                  );
                })}
                {/* 3. Вкладка для приборов без присвоенного контроля */}
                <Tab
                  value="NOT_SPECIFIED"
                  label={`Другие / Без контроля (${
                    meta?.unassignedCount ?? 0
                  })`}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'medium',
                    color: 'text.secondary',
                  }}
                />
              </Tabs>
            )}
          </Box>
        </Box>

        {/* Таблица оборудования на MUI */}
        <PlanningPoolTable
          devices={filteredDevices}
          loading={poolLoading}
          selectedDeviceIds={selectedDeviceIds}
          onDeviceSelect={handleDeviceSelect}
        />
        <TablePagination
          component="div"
          count={totalCount} // Общее число записей из БД
          page={page} // Текущая страница
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]} // Варианты строк на выбор метролога
          labelRowsPerPage="Строк на странице:"
          sx={{ borderTop: 1, borderColor: 'divider', mt: 'auto' }}
        />
      </Box>
    </Box>
  );
};
