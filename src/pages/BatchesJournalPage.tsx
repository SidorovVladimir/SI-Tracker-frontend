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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMutation, useQuery } from '@apollo/client/react';
import {
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
  CheckCircleOutline,
  Delete,
  Edit,
  QrCode,
  Sync,
} from '@mui/icons-material';
import { VerificationModal } from '../components/modals/VerificationModal';
import { enqueueSnackbar } from 'notistack';
// import { JobProgressBar } from '../components/JobProgressBar';
import { GlobalJobWatcher } from '../components/GlobalJobWatcher';
import { BarcodePrintModal } from '../components/BarcodePrintModal';

interface BatchesJournalPageProps {
  locallyVerifiedIds: string[];
  setLocallyVerifiedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const BatchesJournalPage: React.FC<BatchesJournalPageProps> = ({
  locallyVerifiedIds,
  setLocallyVerifiedIds,
}) => {
  const currentYear = new Date().getFullYear();

  const [journalYear, setJournalYear] = useState<number>(currentYear);
  const [statusTab, setStatusTab] = useState<string>('ACTIVE'); // 'ACTIVE' | 'DRAFT' | 'SENT' | 'COMPLETED'
  const [batchJobs, setBatchJobs] = useState<Record<string, string>>({});

  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const getBackendStatusParam = () => {
    if (statusTab === 'ACTIVE') return undefined;
    return statusTab.toLowerCase();
  };
  const { data, loading, networkStatus } = useQuery(
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
            onChange={(_e, newValue) => setStatusTab(newValue)}
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
                    alignItems: 'center',
                    gap: 2,
                    width: '100%',
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold', minWidth: '150px' }}>
                    📦 Партия {batch.number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    План:{' '}
                    {new Date(+batch.plannedDate).toLocaleDateString('ru-RU')}
                  </Typography>

                  {/* Цветной статус партии */}
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
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        ml: { xs: 0, sm: 'auto' },
                      }}
                    >
                      <CircularProgress
                        size={16}
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
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bg: 'grey.50',
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Приборы в этой партии:
                </Typography>

                {/* Список приборов в партии */}
                <List dense disablePadding sx={{ mb: 2 }}>
                  {batch.devicesToBatches.map((link) => {
                    const isBackendVerified =
                      link.device.verifications?.some(
                        (v) => v.batchId === batch.id
                      ) ?? false;

                    const isLocallyVerified = locallyVerifiedIds.includes(
                      link.device.id
                    );

                    const isDeviceVerified =
                      isBackendVerified || isLocallyVerified;

                    const isChecked = selectedDeviceIds.includes(
                      link.device.id
                    );

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
                          bgcolor: 'background.paper',
                        }}
                      >
                        {isSent && (
                          <Tooltip
                            title={
                              isDeviceVerified
                                ? 'Выбрать для печати бирки'
                                : 'Печать недоступна: прибор еще не поверен'
                            }
                            placement="top"
                            arrow
                          >
                            <span>
                              <Checkbox
                                size="small"
                                checked={isChecked}
                                disabled={!isDeviceVerified}
                                onChange={() =>
                                  handleDeviceSelect(link.device.id)
                                }
                              />
                            </span>
                          </Tooltip>
                        )}

                        <ListItemText
                          primary={`${link.device.name} (${link.device.model})`}
                          secondary={`Заводской номер: ${link.device.serialNumber}`}
                          slotProps={{
                            primary: { variant: 'body2', fontWeight: 'medium' },
                            secondary: { variant: 'caption' },
                          }}
                          sx={{ m: 0 }}
                        />

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
                              {isDeviceVerified && (
                                <Tooltip
                                  title="Результаты контроля успешно сохранены в базу данных"
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

                              {!isDeviceVerified && (
                                <Tooltip
                                  title="Синхронизировать данные с ФГИС Аршин"
                                  placement="top"
                                  arrow
                                >
                                  <span>
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
                                  </span>
                                </Tooltip>
                              )}

                              <Tooltip
                                title="Внести или изменить результаты поверки/калибровки"
                                placement="top"
                                arrow
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
                              </Tooltip>
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
                      {/* <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        disabled={
                          !!batchJobs[batch.id] || isSyncing || isBatchSyncing
                        }
                        // onClick={() => {
                        //   syncBatch({ variables: { batchId: batch.id } }).catch(
                        //     () => {}
                        //   );
                        // }}
                        onClick={() => handleSync(batch.id)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 'bold',
                          width: { xs: '100%', sm: 'auto' },
                          py: { xs: 1, sm: 0.5 },
                        }}
                      >
                        {batchJobs[batch.id]
                          ? '⏳ Синхронизация...'
                          : '🔄 Проверить всю партию в Аршин'}
                      </Button> */}
                      <Tooltip
                        title={
                          isSyncDisabled &&
                          (batch?.devicesToBatches?.length ?? 0) > 0
                            ? 'Все средства измерения в этой партии уже имеют актуальную поверку'
                            : 'Проверить наличие поверок для всех СИ партии во ФГИС Аршин'
                        }
                      >
                        {/* Обертка в Box дублирует адаптивную ширину кнопки, чтобы Tooltip на смартфонах не ломал верстку */}
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
                              isSyncDisabled
                            }
                            onClick={() => handleSync(batch.id)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 'bold',
                              width: '100%', // Теперь кнопка занимает 100% от ширины Box-обертки
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
        deviceIds={selectedDeviceIds}
      />
      <GlobalJobWatcher onJobClose={handleRemoveJob} />
    </Box>
  );
};
