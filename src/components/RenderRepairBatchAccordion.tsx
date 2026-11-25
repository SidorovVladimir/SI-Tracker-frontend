import {
  Delete,
  CheckCircleOutline,
  Cancel,
  QrCode,
  ExpandMore,
  WarningAmber,
  Sync,
  Edit,
} from '@mui/icons-material';
import {
  Accordion,
  Paper,
  AccordionSummary,
  Box,
  Typography,
  Chip,
  AccordionDetails,
  Stack,
  FormControlLabel,
  Checkbox,
  List,
  ListItemButton,
  ListItemText,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import { toCapital } from '../utils/capitalize';

interface RenderRepairBatchAccordionProps {
  batch: any;
  locallySuccessIds: string[];
  locallyFailedIds: string[];
  selectedLinkIds: string[];
  isExpanded: boolean;
  onChange: (
    batchId: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  handleSelectAllLinks: (
    linksInBatch: any[],
    batchId: string,
    isCompleted: boolean
  ) => void;
  handleLinkSelect: (linkId: string) => void;
  setIsBarcodeModalOpen: (open: boolean) => void;
  updateStatus: (options: any) => Promise<any>;
  deleteBatch: (options: any) => Promise<any>;

  setRemoveDialogOpen: (val: boolean) => void;
  setDeviceToRemove: ({
    batchId,
    deviceId,
  }: {
    batchId: string;
    deviceId: string;
  }) => void;
  setModalOpen: (open: boolean) => void;
  setSelectedDeviceData: ({
    id,
    name,
    cachedControl,
    currentBatchId,
  }: {
    id: string;
    name: string;
    cachedControl: string;
    currentBatchId: string;
  }) => void;
  setBufferRecords: (records: any[]) => void;
  setEditingDeviceId: (val: string) => void;
  setIsBufferDialogOpen: (open: boolean) => void;
  syncDeviceWithArshin: (options: any) => Promise<any>;
  isSyncing: boolean;
  // batchJobs: Record<string, string>;
  // locallyVerifiedIds: string[];
  // handleDeviceClick: (deviceId: string) => void;
  // removeDevices: (options: any) => Promise<any>;
  // handleOpenVerificationModal: (
  //   deviceId: string,
  //   deviceName: string,
  //   batchId: string
  // ) => void;
  // handleSync: (batchId: string) => void;

  // isBatchSyncing: boolean;
}

export const RenderRepairBatchAccordion: React.FC<
  RenderRepairBatchAccordionProps
> = ({
  batch,
  locallySuccessIds,
  locallyFailedIds,
  selectedLinkIds,
  isExpanded,
  handleSelectAllLinks,
  onChange,
  handleLinkSelect,
  setIsBarcodeModalOpen,
  updateStatus,
  deleteBatch,
  setRemoveDialogOpen,
  setDeviceToRemove,
  setModalOpen,
  setSelectedDeviceData,
  setEditingDeviceId,
  setBufferRecords,
  setIsBufferDialogOpen,
  isSyncing,
  syncDeviceWithArshin,
  // batchJobs,
  // locallyVerifiedIds,
  // handleDeviceClick,
  // removeDevices,
  // handleOpenVerificationModal,
  // handleSync,

  // isBatchSyncing,
}) => {
  console.log(batch);
  const isDraft = batch.status === 'draft';
  const isSent = batch.status === 'sent';
  const isCompleted = batch.status === 'completed';
  const deviceLinks = batch?.devicesToBatches ?? [];

  const selectableInBatch = batch.devicesToBatches.filter((link: any) => {
    // Если партия в Архиве — доступны ВСЕ приборы без исключения
    if (isCompleted) return true;

    // Если партия в ЦСМ — только те, что поверены на сервере или локально
    const currentVerification = link.device.verifications?.find(
      (v: any) => v.batchId === batch.id
    );
    return (
      !!currentVerification ||
      locallySuccessIds.includes(link.device.id) ||
      locallyFailedIds.includes(link.device.id)
    );
  });

  const selectableIds = selectableInBatch.map((link: any) => link.id);
  const checkedCount = selectableIds.filter((id: string) =>
    selectedLinkIds.includes(id)
  ).length;

  const isAllChecked =
    selectableIds.length > 0 && checkedCount === selectableIds.length;
  const isIndeterminate =
    checkedCount > 0 && checkedCount < selectableIds.length;

  return (
    <Accordion
      key={batch.id}
      expanded={isExpanded}
      // onChange={(_e, exp) => setExpandedBatchId(exp ? batch.id : false)}
      onChange={onChange(batch.id)}
      sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}
      component={Paper}
      variant="outlined"
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
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
                {new Date(+batch.plannedDate).toLocaleDateString('ru-RU')}
              </Typography>
              {batch.createdBy?.lastName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    👤 Исполнитель: {toCapital(batch.createdBy.lastName)}{' '}
                    {toCapital(batch.createdBy.firstName)}
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
                isDraft ? 'Черновик' : isSent ? 'В мастерской' : 'Ремонт закрыт'
              }
              color={isDraft ? 'default' : isSent ? 'warning' : 'success'}
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
                  checked={isAllChecked}
                  indeterminate={isIndeterminate}
                  disabled={selectableIds.length === 0}
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
          {deviceLinks.map((link: any) => {
            const currentVerification = link.device.verifications?.find(
              (v: any) => v.batchId === batch.id
            );
            const docResult =
              currentVerification?.result?.trim().toLowerCase() || '';

            // СТРОГОЕ РАЗДЕЛЕНИЕ: Проверяем результат и по базе данных, и по локальным массивам
            const isSuccess =
              docResult === 'годен' ||
              locallySuccessIds.includes(link.device.id);

            const isFailed =
              docResult === 'не годен' ||
              locallyFailedIds.includes(link.device.id);

            // Прибор считается проверенным, если по нему есть либо успех, либо брак
            const isDeviceVerified = isSuccess || isFailed;

            const hasBufferRecords =
              (link.device.arshinBuffers?.length ?? 0) > 0;
            const showBufferWarning = hasBufferRecords && !isDeviceVerified;

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
                  borderColor: showBufferWarning ? 'amber.300' : 'divider',
                  bgcolor: showBufferWarning
                    ? 'amber.50/20'
                    : 'background.paper',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {(isSent || isCompleted) && (
                    <Checkbox
                      size="small"
                      checked={selectedLinkIds.includes(link.id)}
                      //  ВОЗВРАЩАЕМ ВАШУ ЛОГИКУ: в статусе "В мастерской" чекбокс заблокирован, пока прибор не отремонтирован!
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

                {/*  ИНТЕРАКТИВНЫЕ КНОПКИ ДЕЙСТВИЙ */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                          title="Прибор прошел контроль (Годен). Результаты сохранены."
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
                          title="Прибор не прошел контроль (Не годен). Результаты сохранены."
                          placement="top"
                          arrow
                        >
                          <Cancel color="error" fontSize="small" />
                        </Tooltip>
                      )}

                      {/* Если результаты контроля по прибору еще НЕ внесены */}
                      {!isDeviceVerified && (
                        <>
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
                                startIcon={<WarningAmber fontSize="small" />}
                                disabled={
                                  // !!batchJobs[batch.id] ||
                                  isSyncing
                                  // isBatchSyncing
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
                                {link.device.arshinBuffers?.length ?? 0})
                              </Button>
                            </Tooltip>
                          )}

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
                                  // !!batchJobs[batch.id] ||
                                  isSyncing
                                  // isBatchSyncing
                                }
                                onClick={() =>
                                  syncDeviceWithArshin({
                                    variables: {
                                      input: {
                                        deviceId: link.device.id,
                                        batchId: batch.id,
                                      },
                                    },
                                  }).catch(() => {})
                                }
                              >
                                <Sync
                                  fontSize="small"
                                  sx={{
                                    animation: isSyncing
                                      ? 'spin 1s linear infinite'
                                      : 'none',
                                    '@keyframes spin': {
                                      '0%': { transform: 'rotate(0deg)' },
                                      '100%': { transform: 'rotate(360deg)' },
                                    },
                                  }}
                                />
                              </IconButton>
                            </Box>
                          </Tooltip>

                          <Tooltip
                            title="Внести результаты контроля вручную"
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
                                disabled={isSyncing}
                                onClick={() => {
                                  // 1. Сначала безопасно записываем данные прибора в стейт
                                  setSelectedDeviceData({
                                    id: link.device.id,
                                    name: link.device.name,
                                    cachedControl: link.device.cachedControl,
                                    currentBatchId: batch.id,
                                  });

                                  // 2. Затем открываем изолированное модальное окно ремонта
                                  setModalOpen(true);
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Box>
                          </Tooltip>

                          {/* ✏️ Кнопка фиксации контроля */}
                          {/* <Button
                            size="small"
                            variant="contained"
                            disabled={isSyncing}
                            color="primary"
                            onClick={() => {
                              // 1. Сначала безопасно записываем данные прибора в стейт
                              setSelectedDeviceData({
                                id: link.device.id,
                                name: link.device.name,
                                cachedControl: link.device.cachedControl,
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
                          </Button> */}

                          {/* 🗑️ НОВАЯ КНОПКА: Исключить из ремонта прямо из мастерской с откатом статуса брака */}
                          {!hasBufferRecords && (
                            <Tooltip
                              title="Отменить ремонт и вернуть прибор обратно в Очередь как дефектный"
                              placement="top"
                              arrow
                            >
                              <IconButton
                                color="error"
                                size="small"
                                disabled={isSyncing}
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
                        </>
                      )}
                    </>
                  )}

                  {/* Кейс 3: Ведомость закрыта в Архив */}
                  {isCompleted && (
                    <Chip
                      label={isSuccess ? 'Годен' : 'Не годен'}
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
                onClick={() => deleteBatch({ variables: { id: batch.id } })}
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
                    (l: any) =>
                      !!l.device.verifications?.some(
                        (v: any) => v.batchId === batch.id
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
};
