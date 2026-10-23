import React from 'react';
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
  Checkbox,
  FormControlLabel,
  Stack,
  ListItemButton,
  Tooltip,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Delete,
  CheckCircleOutline,
  Cancel,
  WarningAmber,
  Sync,
  Edit,
  QrCode,
} from '@mui/icons-material';

interface RenderVerificationBatchAccordionProps {
  batch: any;
  isExpanded: boolean;
  onChange: (
    batchId: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  batchJobs: Record<string, string>;
  locallyVerifiedIds: string[];
  selectedLinkIds: string[];
  handleLinkSelect: (linkId: string) => void;
  handleSelectAllLinks: (
    linksInBatch: any[],
    batchId: string,
    isCompleted: boolean
  ) => void;
  handleDeviceClick: (deviceId: string) => void;
  removeDevices: (options: any) => Promise<any>;
  syncDeviceWithArshin: (options: any) => Promise<any>;
  handleOpenVerificationModal: (
    deviceId: string,
    deviceName: string,
    batchId: string
  ) => void;
  deleteBatch: (options: any) => Promise<any>;
  updateStatus: (options: any) => Promise<any>;
  setIsBarcodeModalOpen: (open: boolean) => void;
  handleSync: (batchId: string) => void;
  cleanSpaces: (str: string) => string;
  toCapital: (str: string) => string;
  isSyncing: boolean;
  isBatchSyncing: boolean;
  setBufferRecords: (records: any[]) => void;
  setIsBufferDialogOpen: (open: boolean) => void;
}

export const RenderVerificationBatchAccordion: React.FC<
  RenderVerificationBatchAccordionProps
> = ({
  batch,
  isExpanded,
  onChange,
  batchJobs,
  locallyVerifiedIds,
  selectedLinkIds,
  handleLinkSelect,
  handleSelectAllLinks,
  handleDeviceClick,
  removeDevices,
  syncDeviceWithArshin,
  handleOpenVerificationModal,
  deleteBatch,
  updateStatus,
  setIsBarcodeModalOpen,
  handleSync,
  cleanSpaces,
  toCapital,
  isSyncing,
  isBatchSyncing,
  setBufferRecords,
  setIsBufferDialogOpen,
}) => {
  const isDraft = batch.status === 'draft' || batch.status === 'DRAFT';
  const isSent = batch.status === 'sent' || batch.status === 'SENT';
  const isCompleted =
    batch.status === 'completed' || batch.status === 'COMPLETED';
  const currentJobId = batchJobs[batch.id];
  const deviceLinks = batch?.devicesToBatches ?? [];

  // Вычисляем, все ли средства измерений в этой партии уже поверены
  const isAllDevicesVerified =
    deviceLinks.length > 0 &&
    deviceLinks.every((link: any) => {
      const isBackendVerified =
        link.device.verifications?.some((v: any) => v.batchId === batch.id) ??
        false;
      const isLocallyVerified = locallyVerifiedIds.includes(link.device.id);
      return isBackendVerified || isLocallyVerified;
    });

  const isSyncDisabled = deviceLinks.length === 0 || isAllDevicesVerified;

  // // Безопасный парсер даты: защищает от NaN при передаче готовых строк ISO
  // const formatPlannedDate = (dateInput: any) => {
  //   if (!dateInput) return '—';
  //   const timestamp = Number(dateInput);
  //   const parsedDate = !isNaN(timestamp)
  //     ? new Date(timestamp)
  //     : new Date(dateInput);
  //   return isNaN(parsedDate.getTime())
  //     ? '—'
  //     : parsedDate.toLocaleDateString('ru-RU');
  // };
  return (
    <Accordion
      key={batch.id}
      expanded={isExpanded}
      onChange={onChange(batch.id)}
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
          {/* ЛЕВАЯ ЧАСТЬ: Номер, Даты, Организация, Автор */}
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
                План: {new Date(+batch.plannedDate).toLocaleDateString('ru-RU')}
              </Typography>

              {batch.verificationOrganization?.name && (
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
                    🏢 {cleanSpaces(batch.verificationOrganization.name)}
                  </Typography>
                </Box>
              )}

              {batch.createdBy?.firstName && batch.createdBy?.lastName && (
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
                    👤 {toCapital(batch.createdBy.lastName)}{' '}
                    {toCapital(batch.createdBy.firstName)}
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
              borderTop: { xs: '1px solid', sm: 'none' },
              borderColor: 'divider',
              pt: { xs: 1, sm: 0 },
            }}
          >
            <Chip
              label={
                isDraft ? 'Черновик' : isSent ? 'В лаборатории' : 'Завершена'
              }
              color={isDraft ? 'default' : isSent ? 'info' : 'success'}
              size="small"
            />

            {currentJobId && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} thickness={5} color="warning" />
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
          bgcolor: 'grey.50',
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

          {(isSent || isCompleted) &&
            (() => {
              const selectableInBatch = deviceLinks.filter((link: any) => {
                if (isCompleted) return true;
                const currentVerification = link.device.verifications?.find(
                  (v: any) => v.batchId === batch.id
                );
                return (
                  !!currentVerification ||
                  locallyVerifiedIds.includes(link.device.id)
                );
              });

              const selectableIds = selectableInBatch.map(
                (link: any) => link.id as string
              );
              const checkedCount = selectableIds.filter((id: string) =>
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
          {deviceLinks.map((link: any) => {
            if (!link?.device) return null;
            const currentVerification = link.device.verifications?.find(
              (v: any) => v.batchId === batch.id
            );
            const isBackendVerified = !!currentVerification;
            const isVerificationPassed = isBackendVerified
              ? currentVerification?.result === 'годен'
              : false;
            const isVerificationFailed = isBackendVerified
              ? currentVerification?.result === 'не годен'
              : false;
            const isLocallyVerified = locallyVerifiedIds.includes(
              link.device.id
            );
            const isDeviceSuccessVerified =
              isVerificationPassed || isLocallyVerified;
            const isDeviceVerified = isBackendVerified || isLocallyVerified;

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
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: { xs: 1.5, sm: 0 },
                  borderColor: showBufferWarning ? 'amber.300' : 'divider',
                  bgcolor: showBufferWarning
                    ? 'amber.50/20'
                    : 'background.paper',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    flexGrow: 1,
                  }}
                >
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
                          checked={selectedLinkIds.includes(link.id)}
                          disabled={isSent ? !isDeviceVerified : false}
                          onChange={() => handleLinkSelect(link.id)}
                        />
                      </Box>
                    </Tooltip>
                  )}

                  <ListItemButton
                    onClick={() => handleDeviceClick(link.device.id)}
                  >
                    <ListItemText
                      primary={`${link.device.name} (${link.device.model})`}
                      secondary={`Заводской номер: ${link.device.serialNumber}`}
                      slotProps={{
                        primary: { variant: 'body2', fontWeight: 'medium' },
                        secondary: { variant: 'caption' },
                      }}
                      sx={{ m: 0 }}
                    />
                  </ListItemButton>
                </Box>

                {/* ИНТЕРАКТИВНЫЕ ДЕЙСТВИЯ С ПРИБОРАМИ */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifycontent: { xs: 'end', sm: 'center' },
                  }}
                >
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

                  {isSent && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isDeviceSuccessVerified && !isVerificationFailed && (
                        <Tooltip
                          title="Прибор прошел контроль (Годен). Результаты сохранены."
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
                          title="Прибор не прошел контроль (Не годен). Результаты сохранены."
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
                                  !!batchJobs[batch.id] ||
                                  isSyncing ||
                                  isBatchSyncing
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
                            title="Внести или изменить результаты поверки вручную"
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

                          {!hasBufferRecords && (
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
                        </>
                      )}
                    </Box>
                  )}

                  {isCompleted && (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {isDeviceSuccessVerified && !isVerificationFailed ? (
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
                      ) : (
                        isVerificationFailed && (
                          <Tooltip
                            title="Прибор не прошел контроль (Не годен). Результаты сохранены."
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
                        )
                      )}
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })}
        </List>

        {/* Управление жизненным циклом партии поверок */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            justifycontent: 'end',
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
                  isSyncDisabled && deviceLinks.length > 0
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
                    ? !isAllDevicesVerified
                    : false
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
              variant="contained"
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
};
