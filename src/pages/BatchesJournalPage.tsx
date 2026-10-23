import React, { useEffect, useRef, useState } from 'react';
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
import {
  ConfirmArshinBufferDocument,
  CreateVerificationDocument,
  DeleteVerificationBatchDocument,
  GetMetrologyControlTypesListDocument,
  GetVerificationBatchByNumberDocument,
  // GetPlanningPoolDocument,
  GetVerificationBatchesDocument,
  GetVerificationOrganizationsListDocument,
  // GetYearlySummaryDocument,
  RemoveDevicesFromBatchDocument,
  SyncBatchWithArshinDocument,
  SyncDeviceWithArshinDocument,
  UpdateBatchStatusDocument,
} from '../graphql/types/__generated__/graphql';

import { VerificationModal } from '../components/modals/VerificationModal';
import { enqueueSnackbar } from 'notistack';
// import { JobProgressBar } from '../components/JobProgressBar';
import { GlobalJobWatcher } from '../components/GlobalJobWatcher';
import { BarcodePrintModal } from '../components/BarcodePrintModal';
import EditDevicePage from './admin/EditDevicePage';
import { cleanSpaces, toCapital } from '../utils/capitalize';
import { ArshinSelectDialog } from '../components/ArshinSelectDialog';
import { RenderVerificationBatchAccordion } from '../components/RenderVerificationBatchAccordion';

interface BatchesJournalPageProps {
  locallyVerifiedIds: string[];
  setLocallyVerifiedIds: React.Dispatch<React.SetStateAction<string[]>>;
  initialOpenBatchNumber?: string | null;
}

export const BatchesJournalPage: React.FC<BatchesJournalPageProps> = ({
  locallyVerifiedIds,
  setLocallyVerifiedIds,
  initialOpenBatchNumber,
}) => {
  const currentYear = new Date().getFullYear();

  const hasAutoFocused = useRef<boolean>(false);
  const hasAlertedDeleted = useRef<boolean>(false);

  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);

  const [journalYear, setJournalYear] = useState<number>(currentYear);
  const [statusTab, setStatusTab] = useState<string>('ACTIVE'); // 'ACTIVE' | 'DRAFT' | 'SENT' | 'COMPLETED'
  const [batchJobs, setBatchJobs] = useState<Record<string, string>>({});

  const [isBufferDialogOpen, setIsBufferDialogOpen] = useState<boolean>(false);
  const [bufferRecords, setBufferRecords] = useState<any[]>([]);

  const [highlightedBatch, setHighlightedBatch] = useState<any | null>(null);
  const [searchBatchNumber, setSearchBatchNumber] = useState<string | null>(
    initialOpenBatchNumber ?? null
  );
  const [expandedBatchId, setExpandedBatchId] = useState<string | false>(
    searchBatchNumber ?? false
  );

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
    GetVerificationBatchByNumberDocument,
    {
      variables: { batchNumber: searchBatchNumber as string },
      skip: !Boolean(searchBatchNumber),
      // fetchPolicy: 'cache-and-network',
      fetchPolicy: 'network-only',
    }
  );

  useEffect(() => {
    if (singleData?.getVerificationBatchByNumber) {
      const batch = singleData.getVerificationBatchByNumber;

      setHighlightedBatch(batch);
      setExpandedBatchId(batch.id || batch.number);

      if (batch.status && !hasAutoFocused.current) {
        setStatusTab(batch.status.toUpperCase());
        hasAutoFocused.current = true;
        window.history.replaceState({}, document.title);
      }
    } else if (
      singleData &&
      !singleData.getVerificationBatchByNumber &&
      searchBatchNumber &&
      !isSingleLoading
    ) {
      if (!hasAlertedDeleted.current) {
        enqueueSnackbar(
          'Запрашиваемая партия не найдена. Возможно, она была удалена.',
          {
            variant: 'warning',
            preventDuplicate: true,
          }
        );
        hasAlertedDeleted.current = true; // Закрываем замок на замок
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

  //  const handlePageChange = (newPage: number) => {
  //   setArchivePage(newPage);

  //   // Карточка останется закрепленной сверху при перелистывании страниц.
  // };

  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);

  const handleLinkSelect = (linkId: string) => {
    setSelectedLinkIds((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
  };

  //  3. МАССОВЫЙ ВЫБОР: "Выбрать все" с учетом контекста (ЦСМ или Архив)
  const handleSelectAllLinks = (
    devicesInBatch: any[],
    batchId: string,
    isCompletedBatch: boolean
  ) => {
    // Фильтруем приборы партии, доступные для выделения
    const selectableLinkIds = devicesInBatch
      .filter((link) => {
        // Если партия в Архиве — доступны ВСЕ приборы без исключения
        if (isCompletedBatch) return true;

        // If партия в ЦСМ — только те, что поверены на сервере или локально
        const currentVerification = link.device.verifications?.find(
          (v: any) => v.batchId === batchId
        );
        const isBackendVerified = !!currentVerification;
        const isLocallyVerified = locallyVerifiedIds.includes(link.device.id);

        return isBackendVerified || isLocallyVerified; // Чекбокс доступен только для поверенных СИ
      })
      .map((link) => link.id); // 🎯 Сохраняем именно link.id строки связи

    if (selectableLinkIds.length === 0) return;

    // Проверяем, выбраны ли уже ВСЕ доступные приборы этой партии
    const isAllChecked = selectableLinkIds.every((id) =>
      selectedLinkIds.includes(id)
    );

    if (isAllChecked) {
      // Если все уже выбраны — снимаем галочки с этой партии
      setSelectedLinkIds((prev) =>
        prev.filter((id) => !selectableLinkIds.includes(id))
      );
    } else {
      // Если выбраны не все — добавляем недостающие link.id в общий стейт
      setSelectedLinkIds((prev) => {
        const uniqueIds = new Set([...prev, ...selectableLinkIds]);
        return Array.from(uniqueIds);
      });
    }
  };

  const handleDeviceClick = (id: string) => {
    setEditingDeviceId(id);
  };

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const getBackendStatusParam = () => {
    if (statusTab === 'ACTIVE') return undefined;
    return statusTab.toLowerCase();
  };
  const { data, loading, networkStatus, refetch } = useQuery(
    GetVerificationBatchesDocument,
    {
      variables: {
        year: journalYear,
        status: getBackendStatusParam(),
      },

      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
      skip: Boolean(initialOpenBatchNumber) && isSingleLoading,
    }
  );

  const { data: organizationsData } = useQuery(
    GetVerificationOrganizationsListDocument
  );
  const { data: controlTypesData } = useQuery(
    GetMetrologyControlTypesListDocument
  );
  const [updateStatus] = useMutation(UpdateBatchStatusDocument, {
    refetchQueries: [
      // GetYearlySummaryDocument,
      // GetPlanningPoolDocument,
      GetVerificationBatchesDocument,
    ],
    onCompleted: (_data, options) => {
      enqueueSnackbar('Статус партии обновлен', {
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
  const [removeDevices] = useMutation(RemoveDevicesFromBatchDocument, {
    refetchQueries: [
      // GetYearlySummaryDocument,
      // GetPlanningPoolDocument,
      GetVerificationBatchesDocument,
    ],
    onCompleted: () => {
      enqueueSnackbar('Прибор удален из партии!', {
        variant: 'success',
      });
    },
    onError: (error) => {
      enqueueSnackbar(`Ошибка удаления: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const [createVerification] = useMutation(CreateVerificationDocument, {
    refetchQueries: [GetVerificationBatchesDocument],
    onCompleted: () => {
      enqueueSnackbar('Данные поверки успешно сохранены в паспорт прибора!', {
        variant: 'success',
      });
    },
    onError: (error) => {
      enqueueSnackbar(`Ошибка сохранения поверки: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const [deleteBatch] = useMutation(DeleteVerificationBatchDocument, {
    refetchQueries: [
      // GetYearlySummaryDocument,
      // GetPlanningPoolDocument,
      GetVerificationBatchesDocument,
    ],
    onCompleted: () => {
      enqueueSnackbar('Партия успешно удалена', {
        variant: 'success',
      });
    },
    onError: (error) => {
      enqueueSnackbar(`Ошибка создания: ${error.message}`, {
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
        GetVerificationBatchesDocument,
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
      refetchQueries: [GetVerificationBatchesDocument],
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

  const [syncBatch, { loading: isBatchSyncing }] = useMutation(
    SyncBatchWithArshinDocument
  );

  const handleSync = async (batchId: string) => {
    try {
      const { data } = await syncBatch({ variables: { batchId } });

      if (data?.syncBatchWithArshin?.jobId) {
        const { jobId } = data.syncBatchWithArshin;
        // const { jobId, message } = data.syncBatchWithArshin;

        // Показываем синюю плашку о старте фонового процесса
        // enqueueSnackbar(message, { variant: 'info' });

        // Записываем jobId именно для этой партии
        setBatchJobs((prev) => ({
          ...prev,
          [batchId]: jobId,
        }));
      } else {
        console.error('Бэкенд не вернул jobId!');
      }
    } catch (error) {
      console.error('Ошибка вызова мутации:', error);
    }
  };

  const handleRemoveJob = (batchId: string) => {
    setBatchJobs((prev) => {
      const copy = { ...prev };
      delete copy[batchId];
      return copy;
    });
  };

  const handleAccordionChange =
    (batchId: string) =>
    (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedBatchId(isExpanded ? batchId : false);
    };

  // const [locallyVerifiedIds, setLocallyVerifiedIds] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedDeviceData, setSelectedDeviceData] = useState<{
    id: string;
    name: string;
    currentBatchId: string;
  } | null>(null);

  const handleOpenVerificationModal = (
    deviceId: string,
    deviceName: string,
    batchId: string
  ) => {
    setSelectedDeviceData({
      id: deviceId,
      name: deviceName,
      currentBatchId: batchId,
    });
    setModalOpen(true);
  };
  const handleSaveVerification = async (formData: any) => {
    if (!selectedDeviceData) return;

    const now = new Date();
    // Получаем текущее время в формате HH:MM:SS
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
          documentUrl: formData.documentUrl ?? null,
          metrologyControleTypeId: formData.metrologyControleTypeId,
          verificationOrganizationId: formData.verificationOrganizationId,
          comment: formData.comment,
          cost: formData.cost ? parseFloat(formData.cost) : 0,
        },
      },
    });

    setLocallyVerifiedIds((prev) => [...prev, selectedDeviceData.id]);

    setModalOpen(false);
  };

  const allBatches = data?.getVerificationBatches ?? [];
  const archiveItems = allBatches.filter(
    (batch: any) => batch.number !== searchBatchNumber
  );
  const displayedBatches = archiveItems.filter((batch) => {
    if (statusTab === 'ACTIVE')
      return batch.status === 'draft' || batch.status === 'sent';
    return true;
  });

  // networkStatus === 1 означает самую первую загрузку, когда в памяти абсолютно пусто.
  // Если статус равен 4 (refetch) или 6 (poll/переключение переменных), мы НЕ показываем спиннер!
  const isFirstLoading = loading && networkStatus === 1;

  if (isFirstLoading && !data) {
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
        WebkitOverflowScrolling: 'touch',
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
          🚚 Журнал партий
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' }, // Смена направления для самых маленьких экранов
            alignItems: 'center',
            gap: 2,
            width: { xs: '100%', md: 'auto' },
          }}
        >
          {/* Выбор года архива */}
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

          {/* Вкладки под-статусов журнала */}
          <Tabs
            value={statusTab}
            // onChange={(_e, newValue) => {
            //   setSelectedLinkIds([]);
            //   setStatusTab(newValue);
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

              // 🎯 ЖЕСТКОЕ ГАСИЛОВО СКРОЛЛА И СТРЕЛОЧЕК НА ПК:
              minHeight: 40,
              maxHeight: 40,
              height: 40,

              // Скрываем боковые стрелочки на больших экранах (md и выше)
              '& .MuiTabs-scrollButtons': {
                display: { xs: 'inline-flex', md: 'none !important' },
              },

              // Полностью убираем любые намеки на скроллбары (вертикальные и горизонтальные) на ПК
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
              label="🔬 В ЦСМ"
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
              label="✅ Архив"
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
              <RenderVerificationBatchAccordion
                batch={highlightedBatch}
                isExpanded={
                  expandedBatchId === highlightedBatch.id ||
                  expandedBatchId === highlightedBatch.number
                }
                // onChange={(id) => () =>
                //   setExpandedBatchId(expandedBatchId === id ? false : id)}
                onChange={handleAccordionChange}
                batchJobs={batchJobs}
                locallyVerifiedIds={locallyVerifiedIds}
                selectedLinkIds={selectedLinkIds}
                handleLinkSelect={handleLinkSelect}
                handleSelectAllLinks={handleSelectAllLinks}
                handleDeviceClick={handleDeviceClick}
                removeDevices={removeDevices}
                syncDeviceWithArshin={syncDeviceWithArshin}
                handleOpenVerificationModal={handleOpenVerificationModal}
                deleteBatch={deleteBatch}
                updateStatus={updateStatus}
                setIsBarcodeModalOpen={setIsBarcodeModalOpen}
                handleSync={handleSync}
                cleanSpaces={cleanSpaces}
                toCapital={toCapital}
                isSyncing={isSyncing}
                isBatchSyncing={isBatchSyncing}
                setBufferRecords={setBufferRecords} // 🌟 Передаем сюда стейт
                setIsBufferDialogOpen={setIsBufferDialogOpen} // 🌟 Передаем сюда стейт
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
            Партий со статусом {statusTab} не найдено.
          </Typography>
        ) : (
          displayedBatches.map((batch: any) => (
            <RenderVerificationBatchAccordion
              key={batch.id}
              batch={batch}
              isExpanded={expandedBatchId === batch.id}
              // onChange={(id) => () =>
              //   setExpandedBatchId(expandedBatchId === id ? false : id)}
              onChange={handleAccordionChange}
              batchJobs={batchJobs}
              locallyVerifiedIds={locallyVerifiedIds}
              selectedLinkIds={selectedLinkIds}
              handleLinkSelect={handleLinkSelect}
              handleSelectAllLinks={handleSelectAllLinks}
              handleDeviceClick={handleDeviceClick}
              removeDevices={removeDevices}
              syncDeviceWithArshin={syncDeviceWithArshin}
              handleOpenVerificationModal={handleOpenVerificationModal}
              deleteBatch={deleteBatch}
              updateStatus={updateStatus}
              setIsBarcodeModalOpen={setIsBarcodeModalOpen}
              handleSync={handleSync}
              cleanSpaces={cleanSpaces}
              toCapital={toCapital}
              isSyncing={isSyncing}
              isBatchSyncing={isBatchSyncing}
              setBufferRecords={setBufferRecords} // 🌟 Передаем сюда стейт
              setIsBufferDialogOpen={setIsBufferDialogOpen} // 🌟 Передаем сюда стейт
            />
          ))
        )}
      </Box>

      {selectedDeviceData && (
        <VerificationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          deviceName={selectedDeviceData.name}
          controlTypes={controlTypesData?.metrologyControlTypes ?? []}
          organizations={organizationsData?.verificationOrganizations ?? []}
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
        // disableEnforceFocus
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 4, p: { xs: 1.5, sm: 2.5 } } },
        }}
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

      <GlobalJobWatcher onJobClose={handleRemoveJob} />
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
