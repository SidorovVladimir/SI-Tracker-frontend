import { useState } from 'react';
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
import {
  Cancel,
  CheckCircleOutline,
  Delete,
  QrCode,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';

import {
  GetRepairBatchesDocument,
  UpdateRepairBatchStatusDocument,
  RemoveDevicesFromRepairBatchDocument,
  CreateVerificationDocument,
  DeleteRepairBatchDocument,
  GetMetrologyControlTypesListDocument,
} from '../graphql/types/__generated__/graphql';

import { BarcodePrintModal } from '../components/BarcodePrintModal';
import EditDevicePage from './admin/EditDevicePage';
import { RepairModal } from '../components/modals/RepairModal';
import { ConfirmationDialog } from '../components/modals/ConfirmationDialog';
// import { cleanSpaces } from '../utils/capitalize';

// interface BatchesJournalPageProps {
//   locallyVerifiedIds: string[];
//   setLocallyVerifiedIds: React.Dispatch<React.SetStateAction<string[]>>;
// }

export const RepairBatchesJournalPage = () => {
  const currentYear = new Date().getFullYear();
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [journalYear, setJournalYear] = useState<number>(currentYear);
  const [statusTab, setStatusTab] = useState<string>('ACTIVE'); // 'ACTIVE' | 'DRAFT' | 'SENT' | 'COMPLETED'
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [expandedBatchId, setExpandedBatchId] = useState<string | false>(false);
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
    currentBatchId: string;
  } | null>(null);

  const { data: controlTypesData } = useQuery(
    GetMetrologyControlTypesListDocument
  );

  // 🌟 ПОТОК 1: Запрашиваем ремонтные ведомости с типом 'repair'
  const { data, loading, refetch } = useQuery(GetRepairBatchesDocument, {
    variables: {
      year: journalYear,
      status: statusTab === 'ACTIVE' ? undefined : statusTab.toLowerCase(),
    },
    fetchPolicy: 'cache-and-network',
  });

  const allBatches = data?.getRepairBatches ?? [];
  const displayedBatches = allBatches.filter((b) =>
    statusTab === 'ACTIVE' ? b.status === 'draft' || b.status === 'sent' : true
  );

  const [updateStatus] = useMutation(UpdateRepairBatchStatusDocument, {
    refetchQueries: [GetRepairBatchesDocument],
    onCompleted: () =>
      enqueueSnackbar('Статус ремонтной ведомости обновлен', {
        variant: 'success',
      }),
  });

  const [removeDevices] = useMutation(RemoveDevicesFromRepairBatchDocument, {
    refetchQueries: [GetRepairBatchesDocument],
    onCompleted: () =>
      enqueueSnackbar(
        'Оборудование извлечено из ремонта, дефект восстановлен',
        { variant: 'success' }
      ),
  });

  const [deleteBatch] = useMutation(DeleteRepairBatchDocument, {
    refetchQueries: [GetRepairBatchesDocument],
    onCompleted: () =>
      enqueueSnackbar('Ремонтная ведомость удалена', { variant: 'success' }),
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
            onChange={(_e, val) => {
              setSelectedLinkIds([]);
              setStatusTab(val);
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
          В этом разделе пока нет созданных ремонтных ведомостей.
        </Typography>
      ) : (
        displayedBatches.map((batch) => {
          const isDraft = batch.status === 'draft';
          const isSent = batch.status === 'sent';
          const isCompleted = batch.status === 'completed';
          const deviceLinks = batch?.devicesToBatches ?? [];

          return (
            <Accordion
              key={batch.id}
              expanded={expandedBatchId === batch.id}
              onChange={(_e, exp) => setExpandedBatchId(exp ? batch.id : false)}
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
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 0.5, sm: 2 },
                      flexDirection: { xs: 'column', sm: 'row' },
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        minWidth: { xs: 'auto', sm: '140px' },
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                      }}
                    >
                      🛠️ {batch.number}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'flex-start',
                        sm: 'center',
                        gap: { xs: 0.5, sm: 1 },
                        fontSize: '0.85rem',
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 'inherit' }}
                      >
                        Выведена:{' '}
                        {new Date(+batch.plannedDate).toLocaleDateString(
                          'ru-RU'
                        )}
                      </Typography>
                      {batch.createdBy?.lastName && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
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
                            👤 Исполнитель: {batch.createdBy.lastName}{' '}
                            {batch.createdBy.firstName}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: { xs: 'space-between', sm: 'flex-end' },
                      borderTop: { xs: '1px solid', sm: 'none' },
                      borderColor: 'divider',
                      pt: { xs: 1, sm: 0 },
                    }}
                  >
                    <Chip
                      label={
                        isDraft
                          ? 'Черновик'
                          : isSent
                          ? 'В мастерской'
                          : 'Ремонт закрыт'
                      }
                      color={
                        isDraft ? 'default' : isSent ? 'warning' : 'success'
                      }
                      size="small"
                    />
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
                    Оборудование на ремонте:
                  </Typography>
                  {(isSent || isCompleted) && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
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
                    />
                  )}
                </Stack>

                {/* Список приборов внутри ремонтной ведомости */}
                <List dense disablePadding sx={{ mb: 2 }}>
                  {deviceLinks.map((link) => {
                    // const currentVerification = link.device.verifications?.find(
                    //   (v: any) => v.batchId === batch.id
                    // );
                    // const isDeviceVerified =
                    //   !!currentVerification ||
                    //   locallyVerifiedIds.includes(link.device.id);
                    // const isSuccess =
                    //   currentVerification?.result === 'годен' ||
                    //   locallyVerifiedIds.includes(link.device.id);
                    // const isFailed = currentVerification?.result === 'не годен';
                    const currentVerification = link.device.verifications?.find(
                      (v: any) => v.batchId === batch.id
                    );
                    const docResult =
                      currentVerification?.result?.trim().toLowerCase() || '';

                    // 🌟 СТРОГОЕ РАЗДЕЛЕНИЕ: Проверяем результат и по базе данных, и по локальным массивам
                    const isSuccess =
                      docResult === 'годен' ||
                      locallySuccessIds.includes(link.device.id);

                    const isFailed =
                      docResult === 'не годен' ||
                      locallyFailedIds.includes(link.device.id);

                    // Прибор считается проверенным, если по нему есть либо успех, либо брак
                    const isDeviceVerified = isSuccess || isFailed;

                    return (
                      <Paper
                        key={link.id}
                        variant="outlined"
                        sx={{
                          mb: 1,
                          p: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {(isSent || isCompleted) && (
                            <Checkbox
                              size="small"
                              checked={selectedLinkIds.includes(link.id)}
                              // 🌟 ВОЗВРАЩАЕМ ВАШУ ЛОГИКУ: в статусе "В мастерской" чекбокс заблокирован, пока прибор не отремонтирован!
                              disabled={isSent ? !isDeviceVerified : false}
                              onChange={() => handleLinkSelect(link.id)}
                              sx={{ mr: 1 }}
                            />
                          )}
                          <ListItemButton
                            onClick={() => setEditingDeviceId(link.device.id)}
                          >
                            <ListItemText
                              primary={`${link.device.name} (${link.device.model})`}
                              secondary={`Заводской номер: ${link.device.serialNumber}`}
                            />
                          </ListItemButton>
                        </Box>

                        {/* 🌟 ИНТЕРАКТИВНЫЕ КНОПКИ ДЕЙСТВИЙ */}
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {/* Кейс 1: Ведомость в статусе Черновика (Удаление доступно всегда) */}
                          {isDraft && (
                            <Tooltip
                              title="Исключить это оборудование из ведомости ремонта"
                              placement="top"
                              arrow
                            >
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => {
                                  setDeviceToRemove({
                                    batchId: batch.id,
                                    deviceId: link.device.id,
                                  });
                                  setRemoveDialogOpen(true);
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Кейс 2: Ведомость в статусе "В мастерской" (Идет ремонт) */}
                          {isSent && (
                            <>
                              {isDeviceVerified && isSuccess && (
                                <Tooltip
                                  title="Прибор успешно отремонтирован и прошел контроль."
                                  placement="top"
                                  arrow
                                >
                                  <CheckCircleOutline
                                    color="success"
                                    fontSize="small"
                                  />
                                </Tooltip>
                              )}

                              {isDeviceVerified && isFailed && (
                                <Tooltip
                                  title="Прибор признан негодным / неремонтопригодным."
                                  placement="top"
                                  arrow
                                >
                                  <Cancel color="error" fontSize="small" />
                                </Tooltip>
                              )}

                              {/* Если результаты контроля по прибору еще НЕ внесены */}
                              {!isDeviceVerified && (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  {/* ✏️ Кнопка фиксации контроля */}
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                      // 1. Сначала безопасно записываем данные прибора в стейт
                                      setSelectedDeviceData({
                                        id: link.device.id,
                                        name: link.device.name,
                                        currentBatchId: batch.id,
                                      });

                                      // 2. Затем открываем изолированное модальное окно ремонта
                                      setModalOpen(true);
                                    }}
                                    sx={{
                                      textTransform: 'none',
                                      borderRadius: 1.5,
                                      py: 0.25,
                                      px: 1.5,
                                      fontWeight: 'bold',
                                      fontSize: '0.7rem',
                                    }}
                                  >
                                    Внести контроль
                                  </Button>

                                  {/* 🗑️ НОВАЯ КНОПКА: Исключить из ремонта прямо из мастерской с откатом статуса брака */}
                                  <Tooltip
                                    title="Отменить ремонт и вернуть прибор обратно в Очередь как дефектный"
                                    placement="top"
                                    arrow
                                  >
                                    <IconButton
                                      color="error"
                                      size="small"
                                      onClick={() => {
                                        setDeviceToRemove({
                                          batchId: batch.id,
                                          deviceId: link.device.id,
                                        });
                                        setRemoveDialogOpen(true);
                                      }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                            </>
                          )}

                          {/* Кейс 3: Ведомость закрыта в Архив */}
                          {isCompleted && (
                            <Chip
                              label={isSuccess ? 'Отремонтирован' : 'Брак'}
                              color={isSuccess ? 'success' : 'error'}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.68rem',
                                fontWeight: 'bold',
                                height: 20,
                              }}
                            />
                          )}
                        </Box>
                      </Paper>
                    );
                  })}
                </List>

                {/* Управление ведомостью */}
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
                        onClick={() =>
                          deleteBatch({ variables: { id: batch.id } })
                        }
                        sx={{
                          textTransform: 'none',
                          height: 36,
                          borderRadius: 2,
                        }}
                      >
                        🗑️ Удалить ведомость
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={() =>
                          updateStatus({
                            variables: { id: batch.id, status: 'sent' },
                          })
                        }
                        sx={{
                          textTransform: 'none',
                          fontWeight: 'bold',
                          height: 36,
                          borderRadius: 2,
                        }}
                      >
                        🚀 Отправить в мастерскую
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
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        Печать бирок ({selectedLinkIds.length})
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        disabled={
                          deviceLinks.length === 0 ||
                          !deviceLinks.every(
                            (l) =>
                              !!l.device.verifications?.some(
                                (v) => v.batchId === batch.id
                              ) ||
                              locallySuccessIds.includes(l.device.id) ||
                              locallyFailedIds.includes(l.device.id)
                          )
                        }
                        onClick={() =>
                          updateStatus({
                            variables: { id: batch.id, status: 'completed' },
                          })
                        }
                        sx={{
                          textTransform: 'none',
                          fontWeight: 'bold',
                          height: 36,
                          borderRadius: 2,
                        }}
                      >
                        ✅ Закрыть ремонтную ведомость
                      </Button>
                    </>
                  )}
                  {isCompleted && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<QrCode />}
                      onClick={() => setIsBarcodeModalOpen(true)}
                      disabled={selectedLinkIds.length === 0}
                      sx={{
                        height: 36,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
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
        <RepairModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          deviceName={selectedDeviceData.name}
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
    </Box>
  );
};
