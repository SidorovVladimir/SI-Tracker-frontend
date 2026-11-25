import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogContent,
} from '@mui/material';

import { useMutation, useQuery } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';

import {
  GetRepairBatchesDocument,
  UpdateRepairBatchStatusDocument,
  RemoveDevicesFromRepairBatchDocument,
  CreateVerificationDocument,
  DeleteRepairBatchDocument,
  GetMetrologyControlTypesListDocument,
  GetRepairBatchByNumberDocument,
  ConfirmArshinBufferDocument,
  SyncDeviceWithArshinDocument,
} from '../graphql/types/__generated__/graphql';

import { BarcodePrintModal } from '../components/BarcodePrintModal';
import EditDevicePage from './admin/EditDevicePage';
import { RepairModal } from '../components/modals/RepairModal';
import { ConfirmationDialog } from '../components/modals/ConfirmationDialog';

import { RenderRepairBatchAccordion } from '../components/RenderRepairBatchAccordion';
import { ArshinSelectDialog } from '../components/ArshinSelectDialog';

interface RepairJournalPageProps {
  initialOpenBatchNumber?: string | null;
}

export const RepairBatchesJournalPage: React.FC<RepairJournalPageProps> = ({
  initialOpenBatchNumber,
}) => {
  const currentYear = new Date().getFullYear();

  const hasAutoFocused = useRef<boolean>(false);
  const hasAlertedDeleted = useRef<boolean>(false);

  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [journalYear, setJournalYear] = useState<number>(currentYear);
  const [statusTab, setStatusTab] = useState<string>('ACTIVE'); // 'ACTIVE' | 'DRAFT' | 'SENT' | 'COMPLETED'
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const [locallySuccessIds, setLocallySuccessIds] = useState<string[]>([]);
  const [locallyFailedIds, setLocallyFailedIds] = useState<string[]>([]);
  const [removeDialogOpen, setRemoveDialogOpen] = useState<boolean>(false);
  const [deviceToRemove, setDeviceToRemove] = useState<{
    batchId: string;
    deviceId: string;
  } | null>(null);

  const [selectedDeviceData, setSelectedDeviceData] = useState<{
    id: string;
    name: string;
    cachedControl: string;
    currentBatchId: string;
  } | null>(null);

  const [highlightedBatch, setHighlightedBatch] = useState<any | null>(null);
  const [searchBatchNumber, setSearchBatchNumber] = useState<string | null>(
    initialOpenBatchNumber ?? null
  );
  const [expandedBatchId, setExpandedBatchId] = useState<string | false>(
    searchBatchNumber ?? false
  );

  const [isBufferDialogOpen, setIsBufferDialogOpen] = useState<boolean>(false);

  const [bufferRecords, setBufferRecords] = useState<any[]>([]);

  useEffect(() => {
    if (initialOpenBatchNumber) {
      setHighlightedBatch(null);
      setSearchBatchNumber(initialOpenBatchNumber);
      setExpandedBatchId(initialOpenBatchNumber);
      hasAutoFocused.current = false;
      hasAlertedDeleted.current = false;
    }
  }, [initialOpenBatchNumber]);

  const { data: singleData, loading: isSingleLoading } = useQuery(
    GetRepairBatchByNumberDocument,
    {
      variables: { batchNumber: searchBatchNumber as string },
      skip: !Boolean(searchBatchNumber),
      // fetchPolicy: 'cache-and-network',
      fetchPolicy: 'network-only',
    }
  );

  useEffect(() => {
    if (singleData?.getRepairBatchByNumber) {
      const batch = singleData.getRepairBatchByNumber;

      setHighlightedBatch(batch);
      setExpandedBatchId(batch.id || batch.number);

      if (batch.status && !hasAutoFocused.current) {
        setStatusTab(batch.status.toUpperCase());
        hasAutoFocused.current = true;
        window.history.replaceState({}, document.title);
      }
    } else if (
      singleData &&
      !singleData.getRepairBatchByNumber &&
      searchBatchNumber &&
      !isSingleLoading
    ) {
      if (!hasAlertedDeleted.current) {
        enqueueSnackbar(
          'Запрашиваемая ремонтная ведомость не найдена. Возможно, она была удалена.',
          {
            variant: 'warning',
            preventDuplicate: true,
          }
        );
        hasAlertedDeleted.current = true;
      }

      setHighlightedBatch(null);
      setSearchBatchNumber(null);
      window.history.replaceState({}, document.title);
    }
  }, [singleData, isSingleLoading, searchBatchNumber, enqueueSnackbar]);

  const handleSubTabChange = (
    _event: React.SyntheticEvent,
    newValue: string
  ) => {
    setSelectedLinkIds([]);
    setStatusTab(newValue);
    // setArchivePage(0); // Сбрасываем страницу

    if (searchBatchNumber) {
      setHighlightedBatch(null);
      setSearchBatchNumber(null);
      hasAlertedDeleted.current = false;
      hasAutoFocused.current = false;

      window.history.replaceState({}, document.title);
    }
  };

  const { data: controlTypesData } = useQuery(
    GetMetrologyControlTypesListDocument
  );

  // ПОТОК 1: Запрашиваем ремонтные ведомости с типом 'repair'
  const { data, loading, refetch } = useQuery(GetRepairBatchesDocument, {
    variables: {
      year: journalYear,
      status: statusTab === 'ACTIVE' ? undefined : statusTab.toLowerCase(),
    },
    fetchPolicy: 'cache-and-network',
    skip: Boolean(initialOpenBatchNumber) && isSingleLoading,
  });

  const allBatches = data?.getRepairBatches ?? [];

  const archiveItems = allBatches.filter(
    (batch: any) => batch.number !== searchBatchNumber
  );
  const displayedBatches = archiveItems.filter((b) =>
    statusTab === 'ACTIVE' ? b.status === 'draft' || b.status === 'sent' : true
  );

  const [updateStatus] = useMutation(UpdateRepairBatchStatusDocument, {
    refetchQueries: [GetRepairBatchesDocument],
    onCompleted: (_data, options) => {
      enqueueSnackbar('Статус ремонтной ведомости обновлен', {
        variant: 'success',
      });
      const updatedStatus = options?.variables?.status;
      const batchId = options?.variables?.id;

      if (updatedStatus === 'sent' && statusTab === 'DRAFT') {
        setStatusTab('SENT');
        if (batchId) setExpandedBatchId(batchId);
      } else if (updatedStatus === 'completed' && statusTab === 'SENT') {
        setStatusTab('COMPLETED');
        if (batchId) setExpandedBatchId(batchId);
      }
    },

    onError: (error) => {
      enqueueSnackbar(`Ошибка обновления статуса: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const [syncDeviceWithArshin, { loading: isSyncing }] = useMutation(
    SyncDeviceWithArshinDocument,
    {
      refetchQueries: [
        // GetYearlySummaryDocument,
        // GetPlanningPoolDocument,
        GetRepairBatchesDocument,
      ],
      onCompleted: () => {
        enqueueSnackbar('Данные успешно импортированы из ФГИС Аршин!', {
          variant: 'success',
        });
      },
      onError: (error) => {
        enqueueSnackbar(`Не удалось синхронизировать: ${error.message}`, {
          variant: 'error',
        });
      },
    }
  );

  const [confirmBufferRecord, { loading: loadingConfirm }] = useMutation(
    ConfirmArshinBufferDocument,
    {
      refetchQueries: [GetRepairBatchesDocument],
      onCompleted: () => {
        enqueueSnackbar('Поверка успешно подтверждена и сохранена', {
          variant: 'success',
        });
        setIsBufferDialogOpen(false);
      },
      onError: (error) => {
        enqueueSnackbar(`Ошибка подтверждения: ${error.message}`, {
          variant: 'error',
        });
      },
    }
  );

  const [removeDevices] = useMutation(RemoveDevicesFromRepairBatchDocument, {
    refetchQueries: [GetRepairBatchesDocument],

    onCompleted: () => {
      enqueueSnackbar(
        'Оборудование извлечено из ведомости, дефект восстановлен',
        { variant: 'success' }
      );
      setHighlightedBatch(null);
      setSearchBatchNumber(null);
    },
    onError: (error) => {
      enqueueSnackbar(`Ошибка удаления: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const [deleteBatch] = useMutation(DeleteRepairBatchDocument, {
    refetchQueries: [GetRepairBatchesDocument],
    onCompleted: () => {
      enqueueSnackbar('Ремонтная ведомость удалена', { variant: 'success' });
      setHighlightedBatch(null);
      setSearchBatchNumber(null);
    },
  });

  const [createVerification] = useMutation(CreateVerificationDocument, {
    refetchQueries: [GetRepairBatchesDocument],
    onCompleted: () =>
      enqueueSnackbar('Документ сохранен. Ремонт прибора успешно закрыт!', {
        variant: 'success',
      }),
  });

  const handleLinkSelect = (linkId: string) => {
    setSelectedLinkIds((p) =>
      p.includes(linkId) ? p.filter((id) => id !== linkId) : [...p, linkId]
    );
  };
  const handleSelectAllLinks = (
    devicesInBatch: any[],
    batchId: string,
    isCompletedBatch: boolean
  ) => {
    const selectableLinkIds = devicesInBatch
      .filter((link) => {
        if (isCompletedBatch) return true;
        const currentVerification = link.device.verifications?.find(
          (v: any) => v.batchId === batchId
        );
        return (
          !!currentVerification ||
          locallySuccessIds.includes(link.device.id) ||
          locallyFailedIds.includes(link.device.id)
        );
      })
      .map((link) => link.id);

    if (selectableLinkIds.length === 0) return;
    const isAllChecked = selectableLinkIds.every((id) =>
      selectedLinkIds.includes(id)
    );

    setSelectedLinkIds((prev) =>
      isAllChecked
        ? prev.filter((id) => !selectableLinkIds.includes(id))
        : Array.from(new Set([...prev, ...selectableLinkIds]))
    );
  };

  const handleSaveVerification = async (formData: any) => {
    if (!selectedDeviceData) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    await createVerification({
      variables: {
        input: {
          deviceId: selectedDeviceData.id,
          batchId: selectedDeviceData.currentBatchId,
          date: new Date(`${formData.date}T${timeStr}.000Z`).toISOString(),
          validUntil: formData.validUntil
            ? new Date(`${formData.validUntil}T23:59:59.000Z`).toISOString()
            : null,
          protocolNumber: formData.protocolNumber,
          result: formData.result,
          documentUrl: null,
          metrologyControleTypeId: formData.metrologyControleTypeId,
          verificationOrganizationId: null,
          comment: formData.comment,
          cost: formData.cost ? parseFloat(formData.cost) : 0,
        },
      },
    });

    if (formData.result === 'годен') {
      setLocallySuccessIds((prev) => [...prev, selectedDeviceData.id]);
    } else {
      setLocallyFailedIds((prev) => [...prev, selectedDeviceData.id]);
    }
    setModalOpen(false);
  };

  const handleRemoveDevice = async (
    batchId: string,
    deviceIds: string[]
  ): Promise<void> => {
    try {
      await removeDevices({
        variables: {
          batchId,
          deviceIds,
        },
      });
      setRemoveDialogOpen(false);
      setDeviceToRemove(null);
    } catch (error) {}
  };

  const handleAccordionChange =
    (batchId: string) =>
    (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedBatchId(isExpanded ? batchId : false);
    };

  if (loading && !data) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 4 },
        bgcolor: 'grey.50',
        height: '100%',
        maxHeight: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.75rem', md: '2.125rem' },
          }}
        >
          🛠️ Ремонтные ведомости
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2,
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <TextField
            select
            size="small"
            label="Год"
            value={journalYear}
            onChange={(e) => setJournalYear(Number(e.target.value))}
            sx={{
              width: { xs: '100%', sm: 110 },
              bgcolor: 'background.paper',
              '& .MuiInputBase-root': { height: 40 },
            }}
          >
            <MenuItem value={currentYear}>{currentYear}</MenuItem>
            <MenuItem value={currentYear - 1}>{currentYear - 1}</MenuItem>
            <MenuItem value={currentYear - 2}>{currentYear - 2}</MenuItem>
          </TextField>

          <Tabs
            value={statusTab}
            // onChange={(_e, val) => {
            //   setSelectedLinkIds([]);
            //   setStatusTab(val);
            // }}
            onChange={handleSubTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              px: 0.5,
              width: { xs: '100%', md: 'auto' },
              minHeight: 40,
              maxHeight: 40,
              height: 40,
              '& .MuiTabs-scrollButtons': {
                display: { xs: 'inline-flex', md: 'none !important' },
              },
              '&::-webkit-scrollbar': { display: 'none' },
              overflow: 'hidden',
              '& .MuiTabs-flexContainer': { gap: 0.5 },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              value="ACTIVE"
              label="⚡ В работе"
              sx={{
                textTransform: 'none',
                minHeight: 40,
                py: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                whiteSpace: 'nowrap',
              }}
            />
            <Tab
              value="DRAFT"
              label="📝 Черновики"
              sx={{
                textTransform: 'none',
                minHeight: 40,
                py: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                whiteSpace: 'nowrap',
              }}
            />
            <Tab
              value="SENT"
              label="🔬 В мастерской"
              sx={{
                textTransform: 'none',
                minHeight: 40,
                py: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                whiteSpace: 'nowrap',
              }}
            />
            <Tab
              value="COMPLETED"
              label="✅ Закрытые"
              sx={{
                textTransform: 'none',
                minHeight: 40,
                py: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                whiteSpace: 'nowrap',
              }}
            />
          </Tabs>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
        {/* 🌟 1. ПОДСВЕЧЕННЫЙ ТОП-АККОРДЕОН ИЗ УВЕДОМЛЕНИЯ */}
        {highlightedBatch &&
          highlightedBatch.status?.toUpperCase() === statusTab && (
            <Box
              sx={{
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 0.5,
                bgcolor: '#f0f9ff',
                mb: 1,
              }}
            >
              <Typography
                variant="caption"
                color="primary.main"
                sx={{ fontWeight: 700, px: 1, pb: 0.5, display: 'block' }}
              >
                📌 Уведомление: запрашиваемая партия
              </Typography>
              <RenderRepairBatchAccordion
                locallySuccessIds={locallySuccessIds}
                locallyFailedIds={locallyFailedIds}
                selectedLinkIds={selectedLinkIds}
                onChange={handleAccordionChange}
                handleSelectAllLinks={handleSelectAllLinks}
                handleLinkSelect={handleLinkSelect}
                setIsBarcodeModalOpen={setIsBarcodeModalOpen}
                updateStatus={updateStatus}
                deleteBatch={deleteBatch}
                setRemoveDialogOpen={setRemoveDialogOpen}
                setDeviceToRemove={setDeviceToRemove}
                setModalOpen={setModalOpen}
                setSelectedDeviceData={setSelectedDeviceData}
                setEditingDeviceId={setEditingDeviceId}
                batch={highlightedBatch}
                isExpanded={
                  expandedBatchId === highlightedBatch.id ||
                  expandedBatchId === highlightedBatch.number
                }
                setBufferRecords={setBufferRecords}
                setIsBufferDialogOpen={setIsBufferDialogOpen}
                syncDeviceWithArshin={syncDeviceWithArshin}
                isSyncing={isSyncing}
                // // onChange={(id) => () =>
                // //   setExpandedBatchId(expandedBatchId === id ? false : id)}
                // onChange={handleAccordionChange}
                // batchJobs={batchJobs}
                // locallyVerifiedIds={locallyVerifiedIds}
                // selectedLinkIds={selectedLinkIds}
                // handleLinkSelect={handleLinkSelect}
                // handleSelectAllLinks={handleSelectAllLinks}
                // handleDeviceClick={handleDeviceClick}
                // removeDevices={removeDevices}
                // handleOpenVerificationModal={handleOpenVerificationModal}
                // deleteBatch={deleteBatch}
                // updateStatus={updateStatus}
                // setIsBarcodeModalOpen={setIsBarcodeModalOpen}
                // handleSync={handleSync}
                // cleanSpaces={cleanSpaces}
                // toCapital={toCapital}
                // isBatchSyncing={isBatchSyncing}
              />
            </Box>
          )}

        {/* 📋 2. СТАНДАРТНЫЙ ПОСТРАНИЧНЫЙ СПИСОК ЖУРНАЛА */}
        {displayedBatches.length === 0 &&
        (!highlightedBatch ||
          highlightedBatch.status?.toUpperCase() !== statusTab) ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            В этом разделе журнала пока нет созданных партий.
          </Typography>
        ) : (
          displayedBatches.map((batch: any) => (
            <RenderRepairBatchAccordion
              key={batch.id}
              batch={batch}
              locallySuccessIds={locallySuccessIds}
              locallyFailedIds={locallyFailedIds}
              selectedLinkIds={selectedLinkIds}
              isExpanded={expandedBatchId === batch.id}
              onChange={handleAccordionChange}
              handleSelectAllLinks={handleSelectAllLinks}
              handleLinkSelect={handleLinkSelect}
              setIsBarcodeModalOpen={setIsBarcodeModalOpen}
              updateStatus={updateStatus}
              deleteBatch={deleteBatch}
              setRemoveDialogOpen={setRemoveDialogOpen}
              setDeviceToRemove={setDeviceToRemove}
              setModalOpen={setModalOpen}
              setSelectedDeviceData={setSelectedDeviceData}
              setEditingDeviceId={setEditingDeviceId}
              setBufferRecords={setBufferRecords}
              setIsBufferDialogOpen={setIsBufferDialogOpen}
              syncDeviceWithArshin={syncDeviceWithArshin}
              isSyncing={isSyncing}
              // batchJobs={batchJobs}
              // locallyVerifiedIds={locallyVerifiedIds}
              // handleDeviceClick={handleDeviceClick}
              // removeDevices={removeDevices}
              // handleOpenVerificationModal={handleOpenVerificationModal}
              // handleSync={handleSync}
              // isBatchSyncing={isBatchSyncing}
            />
          ))
        )}
      </Box>

      {selectedDeviceData && (
        <RepairModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          deviceName={selectedDeviceData.name}
          deviceCachedControl={selectedDeviceData.cachedControl}
          controlTypes={controlTypesData?.metrologyControlTypes ?? []}
          onSubmit={handleSaveVerification}
        />
      )}

      <BarcodePrintModal
        open={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        historyLinkIds={selectedLinkIds}
      />

      <Dialog
        open={Boolean(editingDeviceId)}
        onClose={() => setEditingDeviceId(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 2 } } }}
      >
        <DialogContent sx={{ p: 1 }}>
          {editingDeviceId && (
            <EditDevicePage
              deviceId={editingDeviceId}
              closeDetails={() => setEditingDeviceId(null)}
              close={() => setEditingDeviceId(null)}
              refetchDevice={() => {
                refetch();
                setEditingDeviceId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={removeDialogOpen}
        title="Исключение из ведомости"
        description="Исключить прибор? Он вернется в Очередь на ремонт с исходным статусом дефекта."
        confirmLabel="Исключить"
        onClose={() => {
          setRemoveDialogOpen(false);
          setDeviceToRemove(null);
        }}
        onConfirm={() => {
          if (deviceToRemove) {
            handleRemoveDevice(deviceToRemove.batchId, [
              deviceToRemove.deviceId,
            ]);
          }
        }}
      />

      <ArshinSelectDialog
        open={isBufferDialogOpen}
        onClose={() => setIsBufferDialogOpen(false)}
        loading={loadingConfirm}
        records={bufferRecords}
        onSelect={async (bufferId) => {
          await confirmBufferRecord({ variables: { bufferId } });
        }}
      />
    </Box>
  );
};
