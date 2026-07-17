import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteCompanyDocument,
  GetCompaniesDocument,
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

export default function CompaniesPage() {
  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const { data, loading, refetch } = useQuery(GetCompaniesDocument, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

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

  const [deleteCompany] = useMutation(DeleteCompanyDocument, {
    onCompleted: () => {
      refetch();
      enqueueSnackbar('Компания успешно удалена', {
        variant: 'success',
      });
    },
    onError: (error) => {
      enqueueSnackbar(`Ошибка удаления: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  if (loading)
    return (
      <Typography sx={{ p: 4, textAlign: 'center' }}>Загрузка...</Typography>
    );
  const companies = data?.companies || [];

  const handleDeleteClick = (id: string) => {
    setSelectedCompanyId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompanyId('');
  };

  const handleConfirmDelete = async () => {
    handleCloseDialog();
    await deleteCompany({ variables: { id: selectedCompanyId } });
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
            Компании
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
          aria-label="Добавить компанию"
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
          to={routes.admin.createCompany()}
        >
          {isMobile ? <Add /> : 'Добавить'}
        </Button>
      </Stack>

      {isMobile ? (
        // 📱 МОБИЛЬНАЯ ВЕРСИЯ: Компактный двухстрочный список организаций / компаний
        <Stack spacing={1}>
          {companies.map((c) => (
            <Paper
              key={c.id}
              variant="outlined"
              sx={{
                p: 1.5, // Сжали внутренние отступы для максимальной плотности контента
                borderRadius: 2,
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center', // Выравниваем текстовый блок и кнопки управления по центру оси
                gap: 2,
              }}
            >
              {/* Левая часть: Наименование организации и её адрес */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    textTransform: 'uppercase',
                    fontSize: '0.825rem',
                    letterSpacing: '0.6px',
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1.2,
                    mb: 0.3,
                  }}
                >
                  {cleanSpaces(c.name)}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    textTransform: 'none',
                    display: 'block',
                    wordBreak: 'break-word', // Защита от излома верстки при длинных адресах
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    color: 'text.secondary',
                    lineHeight: 1.3,
                  }}
                >
                  Адрес: {cleanSpaces(c.address) || '—'}
                </Typography>
              </Box>

              {/* Правая часть: Кнопки действий — перенесены в один ряд с текстом без разделителей */}
              <Stack direction="row" spacing={1} flexShrink={0}>
                <IconButton
                  size="small"
                  color="primary"
                  component={Link}
                  to={routes.admin.editCompany(c.id)}
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
                  onClick={() => handleDeleteClick(c.id)}
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
                <TableCell>Адрес</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Дата обновления</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((c) => (
                <TableRow
                  key={c.id}
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
                  <TableCell>{cleanSpaces(c.name)}</TableCell>
                  <TableCell>{cleanSpaces(c.address) || '-'}</TableCell>
                  <TableCell>{formatDate(c.createdAt)}</TableCell>
                  <TableCell>{formatDate(c.updatedAt)}</TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Редактировать" arrow>
                        <IconButton
                          size="small"
                          color="primary"
                          component={Link}
                          to={routes.admin.editCompany(c.id)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить" arrow>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(c.id)}
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
            Вы действительно хотите удалить эту компанию? Это действие нельзя
            отменить.
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
