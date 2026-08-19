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
  Checkbox,
  FormControlLabel,
  Stack,
  ListItemButton,
  Dialog,
  DialogContent,
  TablePagination,
  TextField,
  MenuItem,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useQuery } from '@apollo/client/react';
// Не забудьте обновить GraphQL фрагмент/запрос в .graphql файле фронтенда перед кодогенерацией!
import { GetInspectionArchiveDocument } from '../graphql/types/__generated__/graphql';
import { Cancel, CheckCircleOutline, QrCode } from '@mui/icons-material';
import { BarcodePrintModal } from '../components/BarcodePrintModal';
import EditDevicePage from './admin/EditDevicePage';

export const InspectionJournalPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentYear = new Date().getFullYear();

  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  // const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [expandedBatchId, setExpandedBatchId] = useState<string | false>(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [journalYear, setJournalYear] = useState<number>(currentYear);

  const [archivePage, setArchivePage] = useState<number>(0);
  const [archiveRowsPerPage, setArchiveRowsPerPage] = useState<number>(10);

  const { data, loading, networkStatus, refetch } = useQuery(
    GetInspectionArchiveDocument,
    {
      variables: {
        year: journalYear,
        limit: archiveRowsPerPage,
        offset: archivePage * archiveRowsPerPage,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }
  );

  const archiveItems = data?.getInspectionBatchesArchive?.items ?? [];
  const archiveTotalCount = data?.getInspectionBatchesArchive?.totalCount ?? 0;

  // const handleDeviceSelect = (deviceId: string) => {
  //   setSelectedDeviceIds((prev) =>
  //     prev.includes(deviceId)
  //       ? prev.filter((id) => id !== deviceId)
  //       : [...prev, deviceId]
  //   );
  // };

  // const handleSelectAllDevices = (linksInBatch: any[]) => {
  //   const deviceIds = (linksInBatch ?? [])
  //     .filter((l) => l?.device?.id)
  //     .map((l) => l.device.id);
  //   if (deviceIds.length === 0) return;

  //   const isAllChecked = deviceIds.every((id) =>
  //     selectedDeviceIds.includes(id)
  //   );

  //   if (isAllChecked) {
  //     setSelectedDeviceIds((prev) =>
  //       prev.filter((id) => !deviceIds.includes(id))
  //     );
  //   } else {
  //     setSelectedDeviceIds((prev) =>
  //       Array.from(new Set([...prev, ...deviceIds]))
  //     );
  //   }
  // };

  const handleLinkSelect = (linkId: string) => {
    setSelectedLinkIds((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
  };

  // 3. Функция выбора/сброса ВСЕХ приборов текущего акта осмотра
  const handleSelectAllLinks = (linksInBatch: any[]) => {
    // Вытаскиваем ID строк связей
    const linkIds = (linksInBatch ?? []).filter((l) => l?.id).map((l) => l.id);
    if (linkIds.length === 0) return;

    const isAllChecked = linkIds.every((id) => selectedLinkIds.includes(id));

    if (isAllChecked) {
      // Снимаем галочки со всей партии
      setSelectedLinkIds((prev) => prev.filter((id) => !linkIds.includes(id)));
    } else {
      // Ставим галочки на всю партию
      setSelectedLinkIds((prev) => Array.from(new Set([...prev, ...linkIds])));
    }
  };

  const handleAccordionChange =
    (batchId: string) =>
    (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedBatchId(isExpanded ? batchId : false);
    };

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
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            📜 Журнал выполненных осмотров
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
          >
            Архив закрытых актов. Выберите приборы галочками внутри актов для
            массовой печати бирок.
          </Typography>
        </Box>

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
            onChange={(e) => {
              setJournalYear(Number(e.target.value));
              setArchivePage(0);
            }}
            sx={{
              width: { xs: '100%', sm: 110 },
              bgcolor: 'background.paper',
              '& .MuiInputBase-root': { height: 38 },
            }}
          >
            <MenuItem value={currentYear}>{currentYear}</MenuItem>
            <MenuItem value={currentYear - 1}>{currentYear - 1}</MenuItem>
            <MenuItem value={currentYear - 2}>{currentYear - 2}</MenuItem>
          </TextField>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<QrCode />}
            onClick={() => setIsBarcodeModalOpen(true)}
            disabled={selectedLinkIds.length === 0}
            sx={{
              height: 38,
              width: { xs: '100%', sm: 'auto' },
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          >
            Печать бирок ({selectedLinkIds.length})
          </Button>
        </Box>
      </Box>
      {/* СПИСОК АКТОВ ИЗ АРХИВА */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {archiveItems.length === 0 ? (
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
            Архивных записей не найдено.
          </Typography>
        ) : (
          archiveItems.map((batch) => {
            const isExpanded = expandedBatchId === batch.id;
            const links = batch?.devicesToBatches ?? [];

            // Расчеты для чекбоксов
            // const deviceIds = links
            //   .filter((l: any) => l?.device?.id)
            //   .map((l: any) => l.device.id);
            // const checkedCount = deviceIds.filter((id) =>
            //   selectedDeviceIds.includes(id)
            // ).length;

            // const isAllChecked =
            //   deviceIds.length > 0 && checkedCount === deviceIds.length;
            // const isIndeterminate =
            //   checkedCount > 0 && checkedCount < deviceIds.length;

            const linkIds = links
              .filter((l: any) => l?.id)
              .map((l: any) => l.id);
            const checkedCount = linkIds.filter((id) =>
              selectedLinkIds.includes(id)
            ).length;

            const isAllChecked =
              linkIds.length > 0 && checkedCount === linkIds.length;
            const isIndeterminate =
              checkedCount > 0 && checkedCount < linkIds.length;
            // Считаем брак по статусу строки 'dismantled'
            const failedCount = links.filter(
              (l: any) => l.deviceStatus === 'dismantled'
            ).length;

            return (
              <Accordion
                key={batch.id}
                expanded={isExpanded}
                onChange={handleAccordionChange(batch.id)}
                sx={{ borderRadius: 2, '&:before': { display: 'none' } }}
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
                    <Typography sx={{ fontWeight: 'bold', minWidth: '140px' }}>
                      📦 Акт № {batch.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      от{' '}
                      {batch.date
                        ? new Date(batch.date).toLocaleDateString('ru-RU')
                        : '—'}
                    </Typography>

                    <Box
                      sx={{
                        ml: { xs: 0, sm: 'auto' },
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      <Chip
                        label={`Приборов: ${links.length}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                      {failedCount > 0 && (
                        <Chip
                          label={`Брак: ${failedCount}`}
                          size="small"
                          color="error"
                          sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}
                        />
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
                      Список приборов в акте:
                    </Typography>

                    <Tooltip
                      title="Выбрать все приборы этого акта"
                      placement="top"
                      arrow
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={isAllChecked}
                            indeterminate={isIndeterminate}
                            // disabled={deviceIds.length === 0}
                            // onChange={() => handleSelectAllDevices(links)}
                            disabled={linkIds.length === 0}
                            onChange={() => handleSelectAllLinks(links)}
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
                  </Stack>

                  <List dense disablePadding>
                    {links.map((link: any) => {
                      if (!link?.device) return null;
                      const { device, deviceStatus } = link;
                      // const isChecked = selectedDeviceIds.includes(device.id);
                      const isSuccess = deviceStatus === 'returned';

                      const isChecked = selectedLinkIds.includes(link.id); // Проверяем стейт по ID связи

                      return (
                        <Paper
                          key={link.id} // Кэш Apollo нормализуется по id связи! Затирание исключено.
                          variant="outlined"
                          sx={{
                            mb: 1,
                            p: 1.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'stretch', sm: 'center' },
                            gap: { xs: 1.5, sm: 0 },
                            bgcolor: 'background.paper',
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
                            <Checkbox
                              size="small"
                              checked={isChecked}
                              // onChange={() => handleDeviceSelect(device.id)} // В стейт летит чистый UUID прибора
                              onChange={() => handleLinkSelect(link.id)}
                              sx={{ mr: 1 }}
                            />

                            <ListItemButton
                              onClick={() => setEditingDeviceId(device.id)} // Откроет карточку по честному UUID прибора
                              sx={{ p: 0, textAlign: 'left', borderRadius: 1 }}
                            >
                              <ListItemText
                                primary={`${device.name} (${device.model})`}
                                secondary={`Заводской номер: ${device.serialNumber}`}
                                slotProps={{
                                  primary: {
                                    variant: 'body2',
                                    fontWeight: 500,
                                  },
                                  secondary: { variant: 'caption' },
                                }}
                                sx={{ m: 0 }}
                              />
                            </ListItemButton>
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: { xs: 'end', sm: 'center' },
                            }}
                          >
                            {isSuccess ? (
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
                                />
                                <Typography
                                  variant="caption"
                                  fontWeight="medium"
                                  color="success.main"
                                >
                                  Годен
                                </Typography>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <Cancel color="error" fontSize="small" />
                                <Typography
                                  variant="caption"
                                  fontWeight="medium"
                                  color="error.main"
                                >
                                  Не годен
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      );
                    })}
                  </List>

                  {batch.comment && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1, px: 0.5 }}
                    >
                      <b>Комментарий к акту:</b> {batch.comment}
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>

      <TablePagination
        component="div"
        count={archiveTotalCount}
        page={archivePage}
        onPageChange={(_e, newPage) => setArchivePage(newPage)}
        rowsPerPage={archiveRowsPerPage}
        onRowsPerPageChange={(e) => {
          setArchiveRowsPerPage(parseInt(e.target.value, 10));
          setArchivePage(0);
        }}
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage={isMobile ? 'Строк:' : 'Строк архива:'}
        sx={{
          mt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': { px: { xs: 0, sm: 2 } },
        }}
      />

      <BarcodePrintModal
        open={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        // deviceIds={selectedDeviceIds}
        historyLinkIds={selectedLinkIds}
      />

      <Dialog
        open={Boolean(editingDeviceId)}
        onClose={() => setEditingDeviceId(null)}
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
    </Box>
  );
};
