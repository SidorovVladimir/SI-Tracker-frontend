import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  TablePagination,
  Divider,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';
import {
  CreateRepairBatchDocument,
  AddDevicesToRepairBatchDocument,
  GetRepairDraftBatchesDocument,
  GetRepairPlanningPoolDocument,
  BulkScrapDevicesDocument,
} from '../graphql/types/__generated__/graphql';

import { DeviceManageSidebar } from '../components/DeviceManageSidebar';
import { RepairPlanningPoolTable } from '../components/RepairPlanningPoolTable';
import { ConfirmationDialog } from '../components/modals/ConfirmationDialog';

export const RepairPlanningPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'info' | 'create' | 'edit' | null>(
    null
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const currentOffset = page * rowsPerPage;

  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [exactPlannedDate, setExactPlannedDate] = useState<string>(
    new Date().toISOString().split('T')[0]!
  );
  const [selectedBatchOption, setSelectedBatchOption] = useState<string>('NEW');

  // Выгружаем черновики исключительно ремонтных ведомостей
  const { data: draftBatchesData, refetch: refetchDraftBatches } = useQuery(
    GetRepairDraftBatchesDocument,
    { fetchPolicy: 'cache-and-network' }
  );
  const activeDraftBatches = draftBatchesData?.getRepairDraftBatches ?? [];

  // Выгружаем воронку оборудования, требующего ремонта (забракованные и неисправные)
  const {
    data: poolData,
    loading: poolLoading,
    refetch: refetchPool,
  } = useQuery(GetRepairPlanningPoolDocument, {
    variables: { limit: rowsPerPage, offset: currentOffset },
    // fetchPolicy: 'cache-and-network',
    fetchPolicy: 'network-only',
  });

  const filteredDevices = poolData?.getRepairPlanningPool?.items ?? [];
  const totalCount = poolData?.getRepairPlanningPool?.totalCount ?? 0;

  const [createRepairBatch] = useMutation(CreateRepairBatchDocument);
  const [addDevicesToRepair] = useMutation(AddDevicesToRepairBatchDocument, {
    onCompleted: () => {
      enqueueSnackbar('Оборудование успешно направлено в ремонтную ведомость', {
        variant: 'success',
      });
      setSelectedDeviceIds([]);
      setSelectedBatchOption('NEW');
      refetchPool();
      refetchDraftBatches();
    },
  });

  const [bulkScrapDevices, { loading: isScrappping }] = useMutation(
    BulkScrapDevicesDocument,
    {
      // После списания принудительно обновляем воронку дефектов
      refetchQueries: [GetRepairPlanningPoolDocument],
      onCompleted: () => {
        enqueueSnackbar(
          `Выбранное оборудование успешно списано и убрано из очереди ремонта`,
          { variant: 'warning' } // Оранжевое уведомление
        );
        setSelectedDeviceIds([]); // Сбрасываем выделенные галочки
      },
      onError: (error) => {
        enqueueSnackbar(`Ошибка массового списания: ${error.message}`, {
          variant: 'error',
        });
      },
    }
  );

  const handleBulkScrap = async () => {
    if (selectedDeviceIds.length === 0) return;

    // const confirmScrap = window.confirm(
    //   `ВНИМАНИЕ!\nВы уверены, что хотите ПОЛНОСТЬЮ СПИСАТЬ выбранные приборы (${selectedDeviceIds.length} шт.)?\n\nОни будут безвозвратно выведены из эксплуатации и навсегда исчезнут из Журнала ремонтов.`
    // );

    // if (!confirmScrap) return;

    await bulkScrapDevices({
      variables: { deviceIds: selectedDeviceIds },
    }).catch(() => {});
  };

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleCreateAndAssignBatch = async () => {
    if (selectedDeviceIds.length === 0) {
      enqueueSnackbar('Выберите оборудование для направления в ремонт!', {
        variant: 'info',
      });
      return;
    }

    try {
      let targetBatchId = selectedBatchOption;

      if (selectedBatchOption === 'NEW') {
        const isoPlannedDate = new Date(
          `${exactPlannedDate}T09:00:00.000Z`
        ).toISOString();
        const { data: batchData } = await createRepairBatch({
          variables: {
            input: {
              plannedDate: isoPlannedDate,
              comment: 'Сформировано из автоматической воронки дефектов',
            },
          },
        });
        targetBatchId = batchData?.createRepairBatch?.id ?? '';
      }

      if (targetBatchId) {
        await addDevicesToRepair({
          variables: { batchId: targetBatchId, deviceIds: selectedDeviceIds },
        });
      }
    } catch (error: any) {
      enqueueSnackbar(`Ошибка формирования ведомости: ${error.message}`, {
        variant: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }, // На мобилках выстраиваем блоки вертикально
        width: '100%',
        height: { xs: 'auto', md: '100%' },
        maxHeight: { xs: 'none', md: '100%' },
        overflow: { xs: 'visible', md: 'hidden' },
        p: { xs: 1, md: 3 },
        gap: { xs: 2, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      {/* ПРАВАЯ РАБОЧАЯ ЧАСТЬ С ТАБЛИЦЕЙ */}
      <Box
        sx={{
          // 🌟 ФИКС: Полностью адаптивное управление шириной без схлопывания разметки
          width: {
            xs: viewMode ? '0%' : '100%', // На мобилках прячем, если открыт сайдбар
            md: viewMode ? 'calc(70% - 24px)' : '100%',
          },
          display: { xs: viewMode ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          flex: { xs: 'none', md: viewMode ? 'none' : 1 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          p: { xs: 1.5, md: 3 }, // Меньше паддингов на маленьких экранах
          overflow: 'hidden',
          transition: 'width 0.3s ease',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' }, // Элементы шапки встают друг под друга на мобилках
            borderBottom: 1,
            borderColor: 'divider',
            pb: 2,
            mb: 2,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
              }}
            >
              🛠️ Очередь на ремонт
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Всего оборудования, требующего восстановления: {totalCount} шт.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap', // Элементы управления переносятся, если не влезают в экран смартфона
              gap: 1.5,
              bgcolor: 'grey.50',
              p: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <TextField
              select
              size="small"
              label="Ведомость"
              value={selectedBatchOption}
              onChange={(e) => setSelectedBatchOption(e.target.value)}
              sx={{
                bgcolor: 'background.paper',
                width: { xs: '100%', sm: 220 },
              }}
            >
              <MenuItem value="NEW">➕ Создать новую ведомость...</MenuItem>
              {activeDraftBatches.length > 0 && <Divider />}
              {activeDraftBatches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  🛠️ Черновик №{batch.number}
                </MenuItem>
              ))}
            </TextField>

            {selectedBatchOption === 'NEW' && (
              <TextField
                type="date"
                size="small"
                label="Дата вывода"
                slotProps={{ inputLabel: { shrink: true } }}
                value={exactPlannedDate}
                onChange={(e) => setExactPlannedDate(e.target.value)}
                sx={{
                  bgcolor: 'background.paper',
                  width: { xs: '100%', sm: 160 },
                }}
              />
            )}

            <Button
              variant="outlined"
              color="error"
              size="small"
              disabled={selectedDeviceIds.length === 0 || isScrappping}
              onClick={() => setApproveDialogOpen(true)}
              sx={{
                height: 36,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                borderWidth: 1.5,
                '&:hover': { borderWidth: 1.5 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {isScrappping
                ? 'Списание...'
                : `Списать (${selectedDeviceIds.length})`}
            </Button>

            <Button
              variant="contained"
              color={selectedBatchOption === 'NEW' ? 'warning' : 'secondary'}
              size="small"
              onClick={handleCreateAndAssignBatch}
              disabled={
                selectedDeviceIds.length === 0 && selectedBatchOption === 'NEW'
              }
              sx={{
                height: 36,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {selectedBatchOption === 'NEW'
                ? 'Направить в ремонт'
                : `Добавить (${selectedDeviceIds.length} СИ)`}
            </Button>
          </Box>
        </Box>

        <RepairPlanningPoolTable
          devices={filteredDevices}
          loading={poolLoading}
          selectedDeviceIds={selectedDeviceIds}
          onDeviceSelect={handleDeviceSelect}
          onDeviceClick={(id) => {
            setSelectedDeviceId(id);
            setViewMode('info');
          }}
        />

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Строк:"
          sx={{ borderTop: 1, borderColor: 'divider', mt: 'auto' }}
        />
      </Box>

      <DeviceManageSidebar
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
        refetchTable={refetchPool}
      />

      <ConfirmationDialog
        open={approveDialogOpen}
        title="Списание"
        description={`ВНИМАНИЕ!\nВы уверены, что хотите ПОЛНОСТЬЮ СПИСАТЬ выбранные приборы (${selectedDeviceIds.length} шт.)?\n\nОни будут безвозвратно выведены из эксплуатации и навсегда исчезнут из Журнала ремонтов.`}
        confirmLabel="Списать"
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={handleBulkScrap}
      />
    </Box>
  );
};
