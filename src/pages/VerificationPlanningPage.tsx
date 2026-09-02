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
  Autocomplete,
  CircularProgress,
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
  GetVerificationOrganizationsListDocument,
  // GetVerificationBatchesDocument,
  GetYearlySummaryDocument,
} from '../graphql/types/__generated__/graphql';
import { enqueueSnackbar } from 'notistack';
import { DeviceManageSidebar } from '../components/DeviceManageSidebar';
import { BarcodePrintModal } from '../components/BarcodePrintModal';
import { QrCode } from '@mui/icons-material';
import { cleanSpaces, formatSentenceCase } from '../utils/capitalize';

interface VerificationOrganization {
  id: string;
  name: string;
}

export const VerificationPlanningPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'info' | 'create' | 'edit' | null>(
    null
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonthStr = `${currentYear}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}`;

  const { data: controlTypesData, loading: controlTypesLoading } = useQuery(
    GetMetrologyControlTypesListDocument
  );

  const {
    data: verificationOrganizationsData,
    loading: verificationOrganizationsLoading,
  } = useQuery(GetVerificationOrganizationsListDocument);

  // Локальное состояние компонента

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const currentOffset = page * rowsPerPage;

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<VerificationOrganization | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  // const [batchNumber, setBatchNumber] = useState<string>('');
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

      // setBatchNumber('');
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
    // if (selectedBatchOption === 'NEW' && !batchNumber.trim()) {
    //   enqueueSnackbar('Введите номер для новой партии!', {
    //     variant: 'info',
    //   });
    //   return;
    // }

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
              // number: batchNumber.trim(),
              plannedDate: isoPlannedDate,
              comment: `Сформировано из панели автоматического планирования`,
              verificationOrganizationId: selectedOrganization?.id,
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
      {/* 🎯 МОБИЛЬНОСТЬ: Прячем календарь на смартфонах, если открыли карточку прибора */}
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
        <YearlyCalendarSummary
          currentYear={currentYear}
          selectedMonth={selectedMonth}
          onSelectMonth={handleMonthChange}
          summaryData={summaryData?.getYearlyCalendarSummary}
          loading={summaryLoading}
        />
      </Box>

      {/* ПРАВАЯ ЧАСТЬ: Таблица пула и фильтры управления */}
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
            <TextField
              select
              size="small"
              label="Партия для сборки"
              value={selectedBatchOption}
              onChange={(e) => setSelectedBatchOption(e.target.value)}
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

            {/* {selectedBatchOption === 'NEW' && (
              <TextField
                placeholder="Номер новой партии"
                size="small"
                value="АВТОМАТИЧЕСКИ"
                // onChange={(e) => setBatchNumber(e.target.value)}
                sx={{
                  // bgcolor: 'background.paper',
                  bgcolor: 'grey.100',
                  width: { xs: '100%', sm: 180 },
                  '& .MuiInputBase-input': {
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                    fontWeight: 'bold',
                    color: 'text.secondary',
                    textAlign: 'center',
                  },
                }}
              />
            )} */}

            {selectedBatchOption === 'NEW' && (
              <TextField
                type="date"
                size="small"
                label="Дата отправки"
                slotProps={{ inputLabel: { shrink: true } }}
                value={exactPlannedDate}
                onChange={(e) => setExactPlannedDate(e.target.value)}
                sx={{
                  bgcolor: 'background.paper',
                  width: { xs: '100%', sm: 160 },
                }}
              />
            )}

            {selectedBatchOption === 'NEW' && (
              <Autocomplete
                size="small"
                options={
                  verificationOrganizationsData?.verificationOrganizations || []
                }
                getOptionLabel={(option: VerificationOrganization) =>
                  cleanSpaces(option.name)
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedOrganization}
                onChange={(_, newValue) => {
                  setSelectedOrganization(newValue);
                }}
                loading={verificationOrganizationsLoading}
                // Ваши фирменные стили для инпута
                sx={{
                  bgcolor: 'background.paper',
                  width: { xs: '100%', sm: 240 },
                  minWidth: 0,
                  '& .MuiInputBase-root': {
                    height: '40px',
                    paddingTop: '0px !important',
                    paddingBottom: '0px !important',
                  },
                  '& .MuiInputBase-input': {
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    letterSpacing: '0.6px',
                    fontWeight: 500,
                  },
                }}
                // Ваши ограничения высоты списка и тонкий скроллбар
                slotProps={{
                  paper: {
                    sx: {
                      maxHeight: { xs: 250, md: 500 },
                      '& .MuiAutocomplete-listbox': {
                        maxHeight: { xs: 250, md: 500 },
                      },
                      '& ::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '& ::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.16)',
                        borderRadius: '4px',
                      },
                    },
                  },
                }}
                // Стилизация элементов внутри выпадающего списка
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <li
                      key={key}
                      {...optionProps}
                      style={{
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                        letterSpacing: '0.6px',
                        fontWeight: 500,
                      }}
                    >
                      {cleanSpaces(option.name)}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Поверитель (ЦСМ)"
                    placeholder="Выберите организацию"
                    size="small"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {verificationOrganizationsLoading ? (
                              <CircularProgress color="inherit" size={16} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
              />
            )}

            <Button
              variant="contained"
              color={selectedBatchOption === 'NEW' ? 'primary' : 'secondary'}
              size="small"
              onClick={handleCreateAndAssignBatch}
              disabled={
                selectedDeviceIds.length === 0 && selectedBatchOption === 'NEW'
              }
              sx={{
                height: 36,
                borderRadius: 2,
                width: { xs: '100%', sm: 'auto' },
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              {selectedBatchOption === 'NEW'
                ? 'Создать и добавить'
                : `Добавить (${selectedDeviceIds.length} СИ)`}
            </Button>

            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<QrCode />}
              onClick={() => setIsBarcodeModalOpen(true)}
              // Кнопка активна, только если метролог выбрал хотя бы один прибор галочкой в таблице!
              disabled={selectedDeviceIds.length === 0}
              sx={{
                height: 36,
                width: { xs: '100%', sm: 'auto' },
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: 2,
              }}
            >
              Печать бирок ({selectedDeviceIds.length})
            </Button>
          </Box>

          {/* Вкладки типов контроля */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              width: '100%',
              mt: 2,
            }}
          >
            {/* {controlTypesLoading ? (
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
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
                }}
              >
                <Tab
                  value="ALL"
                  label={`Все приборы (${globalTotalCount})`}
                  sx={{ textTransform: 'none', fontWeight: 'bold' }}
                />
                {controlTypesData?.metrologyControlTypes
                  ?.filter(
                    (type) => type.name.toLowerCase().trim() !== 'осмотр'
                  )
                  .map((type) => {
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
                        label={`${formatSentenceCase(type.name)} (${count})`}
                        sx={{ textTransform: 'none', fontWeight: 'medium' }}
                      />
                    );
                  })}
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
            )} */}
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
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
                }}
              >
                {/* 1. Вкладка "Все приборы" */}
                <Tab
                  value="ALL"
                  label={`Все приборы (${globalTotalCount})`}
                  sx={{ textTransform: 'none', fontWeight: 'bold' }}
                />

                {/* 2. Динамические вкладки видов метрологического контроля из БД */}
                {controlTypesData?.metrologyControlTypes
                  ?.filter(
                    (type) => type.name.toLowerCase().trim() !== 'осмотр'
                  )
                  .map((type) => {
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
                        label={`${formatSentenceCase(type.name)} (${count})`}
                        sx={{ textTransform: 'none', fontWeight: 'medium' }}
                      />
                    );
                  })}

                {/* 3. Вкладка "Другие" */}
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

                {/* 🔥 4. НАША НОВАЯ ВКЛАДКА: Исключенные приборы / Резерв месяца */}
                <Tab
                  value="PAUSED"
                  label={`⏸️ В резерве (${meta?.pausedTotalCount ?? 0})`}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    // Если в этом месяце на складе есть техника — мягко подсвечиваем оранжевым
                    color:
                      (meta?.pausedTotalCount ?? 0) > 0
                        ? 'warning.main'
                        : 'text.secondary',
                    transition: 'color 0.2s',
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
          onDeviceClick={(id) => {
            setSelectedDeviceId(id);
            setViewMode('info');
          }}
        />

        {/* Пагинация пула */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Строк на странице:"
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
        refetchTable={refetchPool}
      />

      <BarcodePrintModal
        open={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        deviceIds={selectedDeviceIds}
        controlType="verification"
      />
    </Box>
  );
};
