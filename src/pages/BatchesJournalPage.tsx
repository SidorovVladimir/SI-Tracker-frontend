import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  List,
  ListItemText,
  Paper,
  CircularProgress,
  IconButton,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Stack,
  ListItemButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ConfirmArshinBufferDocument,
  CreateVerificationDocument,
  DeleteVerificationBatchDocument,
  GetMetrologyControlTypesListDocument,
  // GetPlanningPoolDocument,
  GetVerificationBatchesDocument,
  GetVerificationOrganizationsListDocument,
  // GetYearlySummaryDocument,
  RemoveDevicesFromBatchDocument,
  SyncBatchWithArshinDocument,
  SyncDeviceWithArshinDocument,
  UpdateBatchStatusDocument,
} from '../graphql/types/__generated__/graphql';
import {
  Cancel,
  CheckCircleOutline,
  Delete,
  Edit,
  QrCode,
  Sync,
  WarningAmber,
} from '@mui/icons-material';
import { VerificationModal } from '../components/modals/VerificationModal';
import { enqueueSnackbar } from 'notistack';
// import { JobProgressBar } from '../components/JobProgressBar';
import { GlobalJobWatcher } from '../components/GlobalJobWatcher';
import { BarcodePrintModal } from '../components/BarcodePrintModal';
import EditDevicePage from './admin/EditDevicePage';
import { cleanSpaces } from '../utils/capitalize';
import { ArshinSelectDialog } from '../components/ArshinSelectDialog';

interface BatchesJournalPageProps {
  locallyVerifiedIds: string[];
  setLocallyVerifiedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const BatchesJournalPage: React.FC<BatchesJournalPageProps> = ({
  locallyVerifiedIds,
  setLocallyVerifiedIds,
}) => {
  const currentYear = new Date().getFullYear();

  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);

  const [journalYear, setJournalYear] = useState<number>(currentYear);
  const [statusTab, setStatusTab] = useState<string>('ACTIVE'); // 'ACTIVE' | 'DRAFT' | 'SENT' | 'COMPLETED'
  const [batchJobs, setBatchJobs] = useState<Record<string, string>>({});

  const [isBufferDialogOpen, setIsBufferDialogOpen] = useState<boolean>(false);
  const [bufferRecords, setBufferRecords] = useState<any[]>([]);
  // const [activeBufferContext, setActiveBufferContext] = useState<{
  //   deviceId: string;
  //   batchId: string;
  // } | null>(null);

  // const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);

  const handleLinkSelect = (linkId: string) => {
    setSelectedLinkIds((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
  };

  // 🎯 3. МАССОВЫЙ ВЫБОР: "Выбрать все" с учетом контекста (ЦСМ или Архив)
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

  // const handleDeviceSelect = (deviceId: string) => {
  //   setSelectedDeviceIds((prev) =>
  //     prev.includes(deviceId)
  //       ? prev.filter((id) => id !== deviceId)
  //       : [...prev, deviceId]
  //   );
  // };

  const handleDeviceClick = (id: string) => {
    setEditingDeviceId(id);
  };

  // const handleSelectAllDevices = (devicesInBatch: any[], batchId: string) => {
  //   // 1. Фильтруем приборы партии, у которых поверка пройдена (isDeviceVerified = true)
  //   const selectableDeviceIds = devicesInBatch
  //     .filter((link) => {
  //       const currentVerification = link.device.verifications?.find(
  //         (v: any) => v.batchId === batchId
  //       );
  //       const isBackendVerified = !!currentVerification;
  //       const isLocallyVerified = locallyVerifiedIds.includes(link.device.id);

  //       return isBackendVerified || isLocallyVerified; // Условие доступности чекбокса
  //     })
  //     .map((link) => link.device.id);

  //   if (selectableDeviceIds.length === 0) return;

  //   // 2. Проверяем, выбраны ли уже ВСЕ доступные приборы этой партии
  //   const isAllChecked = selectableDeviceIds.every((id) =>
  //     selectedDeviceIds.includes(id)
  //   );

  //   if (isAllChecked) {
  //     // Если все уже выбраны — убираем их из общего стейта (снимаем галочки)
  //     setSelectedDeviceIds((prev) =>
  //       prev.filter((id) => !selectableDeviceIds.includes(id))
  //     );
  //   } else {
  //     // Если выбраны не все — добавляем только те id, которых еще нет в стейте selectedDeviceIds
  //     setSelectedDeviceIds((prev) => {
  //       const uniqueIds = new Set([...prev, ...selectableDeviceIds]);
  //       return Array.from(uniqueIds);
  //     });
  //   }
  // };

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
    onCompleted: () => {
      enqueueSnackbar('Статус партии обновлен', {
        variant: 'success',
      });
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

  const [expandedBatchId, setExpandedBatchId] = useState<string | false>(false);

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

  // const handleStatusChange = async (
  //   batchId: string,
  //   nextStatus: 'sent' | 'completed'
  // ) => {
  //   try {
  //     await updateStatus({ variables: { id: batchId, status: nextStatus } });
  //   } catch (e: any) {
  //     alert(`Ошибка обновления: ${e.message}`);
  //   }
  // };

  // const handleRemoveDeviceFromBatch = async (
  //   batchId: string,
  //   deviceId: string,
  //   deviceName: string
  // ) => {
  //   const confirmDelete = window.confirm(
  //     `Вы уверены, что хотите исключить прибор "${deviceName}" из этой партии?`
  //   );
  //   if (!confirmDelete) return;

  //   try {
  //     await removeDevices({
  //       variables: {
  //         batchId,
  //         deviceIds: [deviceId],
  //       },
  //     });
  //   } catch (e: any) {
  //     alert(`Ошибка при удалении прибора: ${e.message}`);
  //   }
  // };

  const allBatches = data?.getVerificationBatches ?? [];
  const displayedBatches = allBatches.filter((batch) => {
    if (statusTab === 'ACTIVE')
      return batch.status === 'draft' || batch.status === 'sent';
    return true;
  });

  // if (loading)
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
  //       <CircularProgress />
  //     </Box>
  //   );

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

  // const handleDeleteBatch = async (batchId: string, batchNumber: string) => {
  //   const confirmDelete = window.confirm(
  //     `Вы уверены, что хотите ПОЛНОСТЬЮ удалить партию "${batchNumber}"? Все приборы из неё вернутся в общий пул.`
  //   );
  //   if (!confirmDelete) return;

  //   try {
  //     await deleteBatch({ variables: { id: batchId } });
  //     alert('Партия успешно удалена');
  //   } catch (e: any) {
  //     alert(`Ошибка удаления партии: ${e.message}`);
  //   }
  // };

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
            onChange={(_e, newValue) => {
              setSelectedLinkIds([]);
              setStatusTab(newValue);
            }}
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

      {displayedBatches.length === 0 ? (
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
        displayedBatches.map((batch) => {
          const isDraft = batch.status === 'draft';
          const isSent = batch.status === 'sent';
          const isCompleted = batch.status === 'completed';
          const isExpanded = expandedBatchId === batch.id;
          const currentJobId = batchJobs[batch.id];

          const deviceLinks = batch?.devicesToBatches ?? [];

          const isAllDevicesVerified =
            deviceLinks.length > 0 &&
            deviceLinks.every((link) => {
              const isBackendVerified =
                link.device.verifications?.some(
                  (v) => v.batchId === batch.id
                ) ?? false;

              const isLocallyVerified = locallyVerifiedIds.includes(
                link.device.id
              );

              return isBackendVerified || isLocallyVerified;
            });

          const isSyncDisabled =
            deviceLinks.length === 0 || isAllDevicesVerified;

          return (
            <Accordion
              key={batch.id}
              expanded={isExpanded}
              onChange={handleAccordionChange(batch.id)}
              sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}
              component={Paper}
              variant="outlined"
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                    width: '100%',
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  {/* ЛЕВАЯ ЧАСТЬ: Номер, Даты, Организция, Автор */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 0.5, sm: 2 },
                      flexDirection: { xs: 'column', sm: 'row' },
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    {/* Номер партии */}
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        minWidth: { xs: 'auto', sm: '140px' },
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                      }}
                    >
                      📦 {batch.number}
                    </Typography>

                    {/* Метаданные (План, ЦСМ, Автор) */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 0.5, sm: 1 },
                        fontSize: '0.85rem',
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 'inherit' }}
                      >
                        План:{' '}
                        {new Date(+batch.plannedDate).toLocaleDateString(
                          'ru-RU'
                        )}
                      </Typography>

                      {/* Организация */}
                      {batch.verificationOrganization?.name && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {/* Точка видна только на десктопе */}
                          <Box
                            component="span"
                            sx={{
                              color: 'grey.400',
                              display: { xs: 'none', sm: 'inline' },
                            }}
                          >
                            •
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: '0.75rem', sm: 'inherit' },
                              textTransform: 'uppercase',
                              fontWeight: 500,
                              letterSpacing: '0.5px',
                              bgcolor: { xs: 'grey.100', sm: 'transparent' },
                              px: { xs: 1, sm: 0 },
                              py: { xs: 0.25, sm: 0 },
                              borderRadius: { xs: 1, sm: 0 },
                            }}
                          >
                            🏢{' '}
                            {cleanSpaces(batch.verificationOrganization.name)}
                          </Typography>
                        </Box>
                      )}

                      {/* Автор */}
                      {batch.createdBy?.firstName &&
                        batch.createdBy?.lastName && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {/* Точка видна только на десктопе */}
                            <Box
                              component="span"
                              sx={{
                                color: 'grey.400',
                                display: { xs: 'none', sm: 'inline' },
                              }}
                            >
                              •
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: 'inherit' }}
                            >
                              👤 {batch.createdBy.lastName}{' '}
                              {batch.createdBy.firstName}
                            </Typography>
                          </Box>
                        )}
                    </Box>
                  </Box>

                  {/* ПРАВАЯ ЧАСТЬ: Статус и Лонг-процесс */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: { xs: 'space-between', sm: 'flex-end' },
                      // На мобилке пушим статус чуть ниже и делаем разделительную линию сверху (опционально)
                      borderTop: { xs: '1px solid', sm: 'none' },
                      borderColor: 'divider',
                      pt: { xs: 1, sm: 0 },
                    }}
                  >
                    <Chip
                      label={
                        batch.status === 'draft'
                          ? 'Черновик'
                          : batch.status === 'sent'
                          ? 'В лаборатории'
                          : 'Завершена'
                      }
                      color={
                        batch.status === 'draft'
                          ? 'default'
                          : batch.status === 'sent'
                          ? 'info'
                          : 'success'
                      }
                      size="small"
                    />

                    {currentJobId && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <CircularProgress
                          size={14}
                          thickness={5}
                          color="warning"
                        />
                        <Typography
                          variant="caption"
                          color="warning.main"
                          sx={{ fontWeight: 'medium' }}
                        >
                          В очереди...
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bg: 'grey.50',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Приборы в этой партии:
                  </Typography>

                  {/* {isSent &&
                    (() => {
                      const selectableInBatch = batch.devicesToBatches.filter(
                        (link) => {
                          const currentVerification =
                            link.device.verifications?.find(
                              (v) => v.batchId === batch.id
                            );
                          return (
                            !!currentVerification ||
                            locallyVerifiedIds.includes(link.device.id)
                          );
                        }
                      );

                      const selectableIds = selectableInBatch.map(
                        (link) => link.device.id
                      );

                      // Сколько из них выделено в данный момент
                      const checkedCount = selectableIds.filter((id) =>
                        selectedDeviceIds.includes(id)
                      ).length;

                      const isAllChecked =
                        selectableIds.length > 0 &&
                        checkedCount === selectableIds.length;
                      const isIndeterminate =
                        checkedCount > 0 && checkedCount < selectableIds.length;

                      return (
                        <Tooltip
                          title="Выбрать все поверенные приборы партии"
                          placement="top"
                          arrow
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={isAllChecked}
                                indeterminate={isIndeterminate}
                                disabled={selectableIds.length === 0}
                                onChange={() =>
                                  handleSelectAllDevices(
                                    batch.devicesToBatches,
                                    batch.id
                                  )
                                }
                              />
                            }
                            label={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 500 }}
                              >
                                Выбрать все
                              </Typography>
                            }
                            sx={{ mr: 0 }}
                          />
                        </Tooltip>
                      );
                    })()} */}

                  {(isSent || isCompleted) &&
                    (() => {
                      const selectableInBatch = batch.devicesToBatches.filter(
                        (link) => {
                          // Если партия в Архиве — доступны ВСЕ приборы без исключения
                          if (isCompleted) return true;

                          // Если партия в ЦСМ — только те, что поверены на сервере или локально
                          const currentVerification =
                            link.device.verifications?.find(
                              (v) => v.batchId === batch.id
                            );
                          return (
                            !!currentVerification ||
                            locallyVerifiedIds.includes(link.device.id)
                          );
                        }
                      );

                      const selectableIds = selectableInBatch.map(
                        (link) => link.id
                      );
                      const checkedCount = selectableIds.filter((id) =>
                        selectedLinkIds.includes(id)
                      ).length;

                      const isAllChecked =
                        selectableIds.length > 0 &&
                        checkedCount === selectableIds.length;
                      const isIndeterminate =
                        checkedCount > 0 && checkedCount < selectableIds.length;

                      return (
                        <Tooltip
                          title="Выбрать приборы для печати бирок"
                          placement="top"
                          arrow
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={isAllChecked}
                                indeterminate={isIndeterminate}
                                disabled={selectableIds.length === 0}
                                // Передаем флаг isCompleted, чтобы функция знала, какой режим фильтрации использовать
                                onChange={() =>
                                  handleSelectAllLinks(
                                    batch.devicesToBatches,
                                    batch.id,
                                    isCompleted
                                  )
                                }
                              />
                            }
                            label={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 500 }}
                              >
                                Выбрать все
                              </Typography>
                            }
                            sx={{ mr: 0 }}
                          />
                        </Tooltip>
                      );
                    })()}
                </Stack>

                {/* Список приборов в партии */}
                <List dense disablePadding sx={{ mb: 2 }}>
                  {batch.devicesToBatches.map((link) => {
                    // const isBackendVerified =
                    //   link.device.verifications?.some(
                    //     (v) => v.batchId === batch.id
                    //   ) ?? false;

                    const currentVerification = link.device.verifications?.find(
                      (v) => v.batchId === batch.id
                    );

                    const isBackendVerified = !!currentVerification;

                    const isVerificationPassed = isBackendVerified
                      ? currentVerification?.result === 'Годен'
                      : false;

                    const isVerificationFailed = isBackendVerified
                      ? currentVerification?.result === 'Не годен'
                      : false;

                    const isLocallyVerified = locallyVerifiedIds.includes(
                      link.device.id
                    );

                    const isDeviceSuccessVerified =
                      isVerificationPassed || isLocallyVerified;

                    const isDeviceVerified =
                      isBackendVerified || isLocallyVerified;

                    // const isChecked = selectedDeviceIds.includes(
                    //   link.device.id
                    // );

                    // Проверяем, есть ли в буфере хоть какие-то записи (даже если она всего одна)
                    const hasBufferRecords =
                      (link.device.arshinBuffers?.length ?? 0) > 0;

                    // Мягкую оранжевую подсветку включаем только если в буфере ЧТО-ТО ЕСТЬ,
                    // но прибор еще НЕ получил официальный статус поверки в системе
                    const showBufferWarning =
                      hasBufferRecords && !isDeviceVerified;

                    return (
                      <Paper
                        key={link.id}
                        variant="outlined"
                        sx={{
                          mb: 1,
                          p: 1.5,
                          display: 'flex',
                          // На смартфонах карточка вытягивается вертикально, на ПК — в линию
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'stretch', sm: 'center' },
                          gap: { xs: 1.5, sm: 0 },
                          // bgcolor: 'background.paper',
                          borderColor: showBufferWarning
                            ? 'amber.300'
                            : 'divider',
                          bgcolor: showBufferWarning
                            ? 'amber.50/20'
                            : 'background.paper',
                        }}
                      >
                        {/* {isSent && (
                          <Tooltip
                            title={
                              isDeviceVerified
                                ? 'Выбрать для печати бирки'
                                : 'Печать недоступна: прибор еще не поверен'
                            }
                            placement="top"
                            arrow
                          >
                            <Box
                              component="span"
                              sx={{ display: 'inline-flex' }}
                            >
                              <Checkbox
                                size="small"
                                checked={isChecked}
                                disabled={!isDeviceVerified}
                                onChange={() =>
                                  handleDeviceSelect(link.device.id)
                                }
                              />
                            </Box>
                          </Tooltip>
                        )} */}

                        {(isSent || isCompleted) && (
                          <Tooltip
                            title={
                              isCompleted || isDeviceVerified
                                ? 'Выбрать для печати бирки'
                                : 'Печать недоступна: прибор еще не поверен'
                            }
                            placement="top"
                            arrow
                          >
                            <Box
                              component="span"
                              sx={{ display: 'inline-flex', mr: 1 }}
                            >
                              <Checkbox
                                size="small"
                                checked={selectedLinkIds.includes(link.id)} // Проверка по link.id
                                // В архиве чекбокс ВСЕГДА активен. В ЦСМ — только если прибор поверен
                                disabled={isSent ? !isDeviceVerified : false}
                                onChange={() => handleLinkSelect(link.id)} // В стейт летит link.id
                              />
                            </Box>
                          </Tooltip>
                        )}

                        <ListItemButton
                          key={link.device.id}
                          onClick={() => handleDeviceClick(link.device.id)}
                        >
                          <ListItemText
                            primary={`${link.device.name} (${link.device.model})`}
                            secondary={`Заводской номер: ${link.device.serialNumber}`}
                            slotProps={{
                              primary: {
                                variant: 'body2',
                                fontWeight: 'medium',
                              },
                              secondary: { variant: 'caption' },
                            }}
                            sx={{ m: 0 }}
                          />
                        </ListItemButton>

                        {/* ИНТЕРАКТИВНЫЕ ДЕЙСТВИЯ С ПРИБОРАМИ */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            justifyContent: { xs: 'end', sm: 'center' },
                          }}
                        >
                          {/* Если черновик — выводим корзину для удаления */}
                          {isDraft && (
                            <Tooltip
                              title="Исключить это оборудование из партии отправки"
                              placement="top"
                              arrow
                            >
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() =>
                                  removeDevices({
                                    variables: {
                                      batchId: batch.id,
                                      deviceIds: [link.device.id],
                                    },
                                  }).catch(() => {})
                                }
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Если партия в лаборатории (sent) — выводим кнопку редактирования (модалки) и галочку */}
                          {isSent && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              {isDeviceSuccessVerified &&
                                !isVerificationFailed && (
                                  <Tooltip
                                    title="Прибор прошел контроль (Годен). Результаты сохранены в базу данных."
                                    placement="top"
                                    arrow
                                  >
                                    <CheckCircleOutline
                                      color="success"
                                      fontSize="small"
                                      style={{ cursor: 'pointer' }}
                                    />
                                  </Tooltip>
                                )}

                              {isVerificationFailed && (
                                <Tooltip
                                  title="Прибор не прошел контроль (Не годен). Результаты сохранены в базу данных."
                                  placement="top"
                                  arrow
                                >
                                  <Cancel
                                    color="error"
                                    fontSize="small"
                                    style={{ cursor: 'pointer' }}
                                  />
                                </Tooltip>
                              )}

                              {/* {!isDeviceVerified && (
                                <Tooltip
                                  title="Синхронизировать данные с ФГИС Аршин"
                                  placement="top"
                                  arrow
                                >
                                  <Box
                                    component="span"
                                    sx={{ display: 'inline-flex' }}
                                  >
                                    <IconButton
                                      color="warning"
                                      size="small"
                                      disabled={
                                        !!batchJobs[batch.id] ||
                                        isSyncing ||
                                        isBatchSyncing
                                      }
                                      onClick={() => {
                                        syncDeviceWithArshin({
                                          variables: {
                                            input: {
                                              deviceId: link.device.id,
                                              batchId: batch.id,
                                            },
                                          },
                                        }).catch(() => {});
                                      }}
                                    >
                                      <Sync
                                        fontSize="small"
                                        sx={{
                                          animation: isSyncing
                                            ? 'spin 1s linear infinite'
                                            : 'none',
                                          '@keyframes spin': {
                                            '0%': { transform: 'rotate(0deg)' },
                                            '100%': {
                                              transform: 'rotate(360deg)',
                                            },
                                          },
                                        }}
                                      />
                                    </IconButton>
                                  </Box>
                                </Tooltip>
                              )} */}

                              {!isDeviceVerified && (
                                <>
                                  {/* КЕЙС 1: В буфере есть записи -> Кнопка выбора горит ВСЕГДА */}
                                  {hasBufferRecords && (
                                    <Tooltip
                                      title="Открыть найденные записи ФГИС Аршин для выбора"
                                      placement="top"
                                      arrow
                                    >
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="warning"
                                        startIcon={
                                          <WarningAmber fontSize="small" />
                                        }
                                        disabled={
                                          !!batchJobs[batch.id] ||
                                          isSyncing ||
                                          isBatchSyncing
                                        }
                                        onClick={() => {
                                          setBufferRecords(
                                            link.device.arshinBuffers ?? []
                                          );
                                          setIsBufferDialogOpen(true);
                                        }}
                                        sx={{
                                          textTransform: 'none',
                                          borderRadius: 1.5,
                                          py: 0.25,
                                          px: 1,
                                          fontWeight: 'bold',
                                          fontSize: '0.7rem',
                                          width: { xs: '100%', sm: 'auto' },
                                        }}
                                      >
                                        Выбрать (
                                        {link.device.arshinBuffers?.length ?? 0}
                                        )
                                      </Button>
                                    </Tooltip>
                                  )}

                                  {/* КЕЙС 2: Ваша стандартная кнопка повторной синхронизации с анимацией спина */}
                                  <Tooltip
                                    title="Запросить/обновить данные из ФГИС Аршин"
                                    placement="top"
                                    arrow
                                  >
                                    <Box
                                      component="span"
                                      sx={{ display: 'inline-flex' }}
                                    >
                                      <IconButton
                                        color="warning"
                                        size="small"
                                        disabled={
                                          !!batchJobs[batch.id] ||
                                          isSyncing ||
                                          isBatchSyncing
                                        }
                                        onClick={() => {
                                          syncDeviceWithArshin({
                                            variables: {
                                              input: {
                                                deviceId: link.device.id,
                                                batchId: batch.id,
                                              },
                                            },
                                          }).catch(() => {});
                                        }}
                                      >
                                        <Sync
                                          fontSize="small"
                                          sx={{
                                            animation: isSyncing
                                              ? 'spin 1s linear infinite'
                                              : 'none',
                                            '@keyframes spin': {
                                              '0%': {
                                                transform: 'rotate(0deg)',
                                              },
                                              '100%': {
                                                transform: 'rotate(360deg)',
                                              },
                                            },
                                          }}
                                        />
                                      </IconButton>
                                    </Box>
                                  </Tooltip>

                                  {/* КЕЙС 3: Ваша стандартная кнопка ручного ввода (карандаш) */}
                                  <Tooltip
                                    title="Внести или изменить результаты поверки/калибровки вручную"
                                    placement="top"
                                    arrow
                                  >
                                    <Box
                                      component="span"
                                      sx={{ display: 'inline-flex' }}
                                    >
                                      <IconButton
                                        color="primary"
                                        size="small"
                                        disabled={
                                          !!batchJobs[batch.id] ||
                                          isSyncing ||
                                          isBatchSyncing
                                        }
                                        onClick={() =>
                                          handleOpenVerificationModal(
                                            link.device.id,
                                            link.device.name,
                                            batch.id
                                          )
                                        }
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Tooltip>
                                </>
                              )}

                              {/* <Tooltip
                                title="Внести или изменить результаты поверки/калибровки"
                                placement="top"
                                arrow
                              >
                                <Box
                                  component="span"
                                  sx={{ display: 'inline-flex' }}
                                >
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    disabled={
                                      !!batchJobs[batch.id] ||
                                      isSyncing ||
                                      isBatchSyncing ||
                                      isDeviceVerified
                                    }
                                    onClick={() =>
                                      handleOpenVerificationModal(
                                        link.device.id,
                                        link.device.name,
                                        batch.id
                                      )
                                    }
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Tooltip> */}
                            </Box>
                          )}

                          {isCompleted && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              {isDeviceSuccessVerified &&
                                !isVerificationFailed && (
                                  <Tooltip
                                    title="Прибор прошел контроль (Годен). Результаты сохранены в базу данных."
                                    placement="top"
                                    arrow
                                  >
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                      }}
                                    >
                                      <CheckCircleOutline
                                        color="success"
                                        fontSize="small"
                                        sx={{ cursor: 'pointer' }}
                                      />
                                      <Typography
                                        variant="caption"
                                        fontWeight="medium"
                                        color="success.main"
                                        sx={{
                                          display: {
                                            xs: 'inline',
                                            sm: 'inline',
                                          },
                                        }}
                                      >
                                        Годен
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                )}

                              {isVerificationFailed && (
                                <Tooltip
                                  title="Прибор не прошел контроль (Не годен). Результаты сохранены в базу данных."
                                  placement="top"
                                  arrow
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }}
                                  >
                                    <Cancel
                                      color="error"
                                      fontSize="small"
                                      sx={{ cursor: 'pointer' }}
                                    />
                                    <Typography
                                      variant="caption"
                                      fontWeight="medium"
                                      color="error.main"
                                      sx={{
                                        display: { xs: 'inline', sm: 'inline' },
                                      }}
                                    >
                                      Не годен
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    );
                  })}
                </List>

                {/* Управление жизненным циклом партии */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1.5,
                    justifyContent: 'end',
                    width: '100%',
                    mt: 2,
                  }}
                >
                  {isDraft && (
                    <>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={async () =>
                          await deleteBatch({ variables: { id: batch.id } })
                        }
                        sx={{
                          textTransform: 'none',
                          width: { xs: '100%', sm: 'auto' },
                          py: { xs: 1, sm: 0.5 },
                          height: 36,
                          borderRadius: 2,
                        }}
                      >
                        🗑️ Удалить партию
                      </Button>
                      <Button
                        variant="contained"
                        color="info"
                        size="small"
                        onClick={async () =>
                          await updateStatus({
                            variables: { id: batch.id, status: 'sent' },
                          })
                        }
                        sx={{
                          textTransform: 'none',
                          fontWeight: 'bold',
                          width: { xs: '100%', sm: 'auto' },
                          py: { xs: 1, sm: 0.5 },
                          height: 36,
                          borderRadius: 2,
                        }}
                      >
                        🚀 Отправить в ЦСМ
                      </Button>
                    </>
                  )}
                  {isSent && (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<QrCode />}
                        onClick={() => setIsBarcodeModalOpen(true)}
                        disabled={selectedLinkIds.length === 0}
                        sx={{
                          height: 36,
                          width: { xs: '100%', sm: 'auto' },
                          textTransform: 'none',
                          fontWeight: 'bold',
                          borderRadius: 2,
                        }}
                      >
                        Печать бирок ({selectedLinkIds.length})
                      </Button>

                      <Tooltip
                        title={
                          isSyncDisabled &&
                          (batch?.devicesToBatches?.length ?? 0) > 0
                            ? 'Все средства измерения в этой партии уже имеют актуальную поверку'
                            : 'Проверить наличие поверок для всех СИ партии во ФГИС Аршин'
                        }
                      >
                        <Box
                          sx={{
                            width: { xs: '100%', sm: 'auto' },
                            display: 'inline-block',
                          }}
                        >
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            disabled={
                              !!batchJobs[batch.id] ||
                              isSyncing ||
                              isBatchSyncing ||
                              isSyncDisabled ||
                              deviceLinks.length === 1
                            }
                            onClick={() => handleSync(batch.id)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 'bold',
                              width: '100%',
                              py: { xs: 1, sm: 0.5 },
                              height: 36,
                              borderRadius: 2,
                            }}
                          >
                            {batchJobs[batch.id]
                              ? '⏳ Синхронизация...'
                              : '🔄 Проверить всю партию в Аршин'}
                          </Button>
                        </Box>
                      </Tooltip>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        disabled={
                          !!batchJobs[batch.id] || isSyncing || isBatchSyncing
                        }
                        onClick={() =>
                          updateStatus({
                            variables: { id: batch.id, status: 'completed' },
                          }).catch(() => {})
                        }
                        sx={{
                          textTransform: 'none',
                          fontWeight: 'bold',
                          width: { xs: '100%', sm: 'auto' },
                          py: { xs: 1, sm: 0.5 },
                          height: 36,
                          borderRadius: 2,
                        }}
                      >
                        ✅ Приборы вернулись (Закрыть поверку)
                      </Button>
                    </>
                  )}

                  {isCompleted && (
                    <Button
                      variant="contained" // Сделаем её яркой акцентной в архиве
                      color="primary"
                      size="small"
                      startIcon={<QrCode />}
                      onClick={() => setIsBarcodeModalOpen(true)}
                      disabled={selectedLinkIds.length === 0}
                      sx={{
                        height: 36,
                        width: { xs: '100%', sm: 'auto' },
                        textTransform: 'none',
                        fontWeight: 'bold',
                        borderRadius: 2,
                      }}
                    >
                      Печать архивных бирок ({selectedLinkIds.length})
                    </Button>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
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
