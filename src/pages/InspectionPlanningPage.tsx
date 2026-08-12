import React, { useState } from 'react';
import { Box, Typography, Button, TablePagination } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Импортируем наши новые облегченные компоненты

import { DeviceManageSidebar } from '../components/DeviceManageSidebar';

// Замените на ваши сгенерированные GraphQL-документы
import {
  GetInspectionPoolDocument,
  CreateBulkInspectionDocument,
} from '../graphql/types/__generated__/graphql';
import { InspectionYearlyCalendar } from '../components/InspectionYearlyCalendar';
import { InspectionPoolTable } from '../components/InspectionPoolTable';

export const InspectionPlanningPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'info' | 'create' | 'edit' | null>(
    null
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonthStr = `${currentYear}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}`;

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const currentOffset = page * rowsPerPage;

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  // Запрос пула осмотров
  const { data, loading, refetch } = useQuery(GetInspectionPoolDocument, {
    variables: {
      targetMonth: selectedMonth,
      limit: rowsPerPage,
      offset: currentOffset,
    },
    fetchPolicy: 'cache-and-network',
  });

  // Мутация группового закрытия ТО
  const [executeBulkInspection, { loading: mutationLoading }] = useMutation(
    CreateBulkInspectionDocument,
    {
      onCompleted: () => {
        enqueueSnackbar(
          'Выбранное оборудование успешно отмечено как осмотренное!',
          {
            variant: 'success',
          }
        );
        setSelectedDeviceIds([]);
        refetch(); // Приборы улетят в график следующего месяца
      },
      onError: (err) => {
        enqueueSnackbar(`Не удалось сохранить осмотр: ${err.message}`, {
          variant: 'error',
        });
      },
    }
  );

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSaveInspections = () => {
    if (!selectedDeviceIds.length) return;
    executeBulkInspection({ variables: { deviceIds: selectedDeviceIds } });
  };

  const poolItems = data?.getInspectionPoolByMonth?.items ?? [];
  const totalCount = data?.getInspectionPoolByMonth?.totalCount ?? 0;
  const yearlySummary = data?.getInspectionPoolByMonth?.yearlySummary ?? [];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        height: { xs: 'auto', md: '100%' },
        p: { xs: 1, md: 3 },
        gap: { xs: 2, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      {/* КАЛЕНДАРЬ ОБХОДОВ */}
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
          onSelectMonth={(month) => {
            setSelectedMonth(month);
            setPage(0);
            setSelectedDeviceIds([]);
          }}
          summaryData={yearlySummary}
          loading={loading}
        />
      </Box>

      {/* ЖУРНАЛ С КНОПКОЙ МАСТЕРА */}
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
              Регламентные осмотры оборудования
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Текущий период обхода цехов: {selectedMonth}
            </Typography>
          </Box>

          {/* Управление осмотрами */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'success.950',
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
              Выбрано для фиксации: {selectedDeviceIds.length} ед.
            </Typography>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={handleSaveInspections}
              disabled={selectedDeviceIds.length === 0 || mutationLoading}
              sx={{
                height: 36,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Отметить как «Осмотрено»
            </Button>
          </Box>
        </Box>

        {/* ТАБЛИЦА */}
        <InspectionPoolTable
          devices={poolItems}
          loading={loading}
          selectedDeviceIds={selectedDeviceIds}
          onDeviceSelect={handleDeviceSelect}
          onDeviceClick={(id) => {
            setSelectedDeviceId(id);
            setViewMode('info');
          }}
        />

        {/* ПАГИНАЦИЯ */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Строк:"
        />
      </Box>

      {/* САЙДБАР (Общий, переиспользуемый) */}
      <DeviceManageSidebar
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
        refetchTable={refetch}
      />
    </Box>
  );
};
