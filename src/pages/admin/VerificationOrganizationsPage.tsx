import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteVerificationOrganizationDocument,
  GetVerificationOrganizationsListDocument,
} from '../../graphql/types/__generated__/graphql';
import { Link } from 'react-router';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { formatDate } from '../../utils/date';
import { Add, Delete, Edit, Refresh } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import routes from '../../utils/routes';
import { enqueueSnackbar } from 'notistack';
import { cleanSpaces } from '../../utils/capitalize';

export default function VerificationOrganizationsPage() {
  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const { data, loading, refetch } = useQuery(
    GetVerificationOrganizationsListDocument,
    {
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }
  );
  useEffect(() => {
    if (data && !loading) {
      const now = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastUpdated(now);
    }
  }, [data, loading]);

  const handleManualRefresh = async () => {
    await refetch();
  };

  const [deleteVerificationOrganization] = useMutation(
    DeleteVerificationOrganizationDocument,
    {
      onCompleted: () => {
        refetch();
        enqueueSnackbar('Организация-поверитель успешно удалена', {
          variant: 'success',
        });
      },
      onError: (error) => {
        enqueueSnackbar(`Ошибка удаления: ${error.message}`, {
          variant: 'error',
        });
      },
    }
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openDialog, setOpenDialog] = useState(false);
  const [
    selectedVerificationOrganizationId,
    setSelectedVerificationOrganizationId,
  ] = useState<string>('');

  if (loading)
    return (
      <Typography sx={{ p: 4, textAlign: 'center' }}>Загрузка...</Typography>
    );
  const verificationOrganizations = data?.verificationOrganizations || [];

  const handleDeleteClick = (id: string) => {
    setSelectedVerificationOrganizationId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVerificationOrganizationId('');
  };

  const handleConfirmDelete = async () => {
    handleCloseDialog();
    await deleteVerificationOrganization({
      variables: { id: selectedVerificationOrganizationId },
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h5" fontWeight="bold">
            Организации-поверители
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              color: 'text.secondary',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}
            >
              Актуально на:{' '}
              <span
                style={{
                  color: 'var(--mui-palette-text-primary)',
                  fontWeight: 600,
                }}
              >
                {lastUpdated || '--:--:--'}
              </span>
            </Typography>

            <IconButton
              size="small"
              onClick={handleManualRefresh}
              disabled={loading}
              sx={{
                p: '2px',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
              aria-label="Обновить данные"
            >
              <Refresh sx={{ fontSize: '1.05rem' }} />
            </IconButton>
          </Box>
        </Box>
        <Button
          aria-label="Добавить организацию-поверитель"
          variant="contained"
          startIcon={isMobile ? undefined : <Add />}
          sx={{
            borderRadius: isMobile ? '50%' : undefined,
            minWidth: isMobile ? 40 : undefined,
            width: isMobile ? 40 : undefined,
            height: isMobile ? 40 : undefined,
            px: isMobile ? 0 : undefined,
            padding: isMobile ? 0 : undefined,
          }}
          component={Link}
          to={routes.admin.createVerificationOrganization()}
        >
          {isMobile ? <Add /> : 'Добавить'}
        </Button>
      </Stack>

      {isMobile ? (
        // 📱 МОБИЛЬНАЯ ВЕРСИЯ: Компактный однострочный список организаций-поверителей
        <Stack spacing={1}>
          {verificationOrganizations.map((v) => (
            <Paper
              key={v.id}
              variant="outlined"
              sx={{
                p: 1.5, // Сжали внутренние отступы для максимальной плотности
                borderRadius: 2,
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center', // Выравниваем длинный текст и кнопки по центру оси
                gap: 2,
              }}
            >
              {/* Наименование аккредитованной поверочной организации */}
              <Typography
                variant="subtitle2"
                sx={{
                  textTransform: 'uppercase',
                  fontSize: '0.825rem',
                  letterSpacing: '0.6px',
                  fontWeight: 700,
                  color: 'text.primary',
                  wordBreak: 'break-word', // Защита от излома верстки при длинных названиях ЦСМ
                  lineHeight: 1.3,
                }}
              >
                {cleanSpaces(v.name)}
              </Typography>

              {/* Кнопки действий — перенесены в один ряд с текстом без разделителей */}
              <Stack direction="row" spacing={1} flexShrink={0}>
                <IconButton
                  size="small"
                  color="primary"
                  disabled={true}
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.200',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Edit fontSize="small" sx={{ fontSize: '1.1rem' }} />
                </IconButton>

                <IconButton
                  size="small"
                  color="error"
                  sx={{
                    border: '1px solid',
                    borderColor: 'error.light',
                    width: 32,
                    height: 32,
                    bgcolor: 'rgba(211, 47, 47, 0.02)',
                  }}
                  onClick={() => handleDeleteClick(v.id)}
                >
                  <Delete fontSize="small" sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : (
        // Десктопная версия: Таблица
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, boxShadow: 1 }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  '& > th': {
                    fontWeight: 'bold',
                    bgcolor: 'background.default',
                  },
                }}
              >
                <TableCell>Название</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Дата обновления</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {verificationOrganizations.map((v) => (
                <TableRow
                  key={v.id}
                  hover
                  sx={{
                    '& > td': {
                      py: 1.5,
                      textTransform: 'uppercase',
                      fontSize: '0.825rem',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    },
                  }}
                >
                  <TableCell>{cleanSpaces(v.name)}</TableCell>
                  <TableCell>{formatDate(v.createdAt)}</TableCell>
                  <TableCell>{formatDate(v.updatedAt)}</TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Редактировать" arrow>
                        <Box component="span" sx={{ display: 'inline-block' }}>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={true}
                            // component={Link}
                            // to={routes.admin.editCity(c.id)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Удалить" arrow>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(v.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Подтвердите удаление</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Вы действительно хотите удалить эту организацию-поверитель? Это
            действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
