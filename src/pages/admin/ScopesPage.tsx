import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteScopeDocument,
  GetScopesListDocument,
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
import { Add, Delete, Edit } from '@mui/icons-material';
import { useState } from 'react';
import routes from '../../utils/routes';
import { enqueueSnackbar } from 'notistack';
import { cleanSpaces } from '../../utils/capitalize';

export default function ScopesPage() {
  const { data, loading, refetch } = useQuery(GetScopesListDocument);

  const [deleteScope] = useMutation(DeleteScopeDocument, {
    onCompleted: () => {
      refetch();
      enqueueSnackbar('Сфера успешно удалена', {
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
  const [selectedScopeId, setSelectedScopeId] = useState<string>('');

  if (loading)
    return (
      <Typography sx={{ p: 4, textAlign: 'center' }}>Загрузка...</Typography>
    );
  const scopesList = data?.scopes || [];

  const handleDeleteClick = (id: string) => {
    setSelectedScopeId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedScopeId('');
  };

  const handleConfirmDelete = async () => {
    handleCloseDialog();
    await deleteScope({
      variables: { id: selectedScopeId },
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Управление сферами применения
        </Typography>
        <Button
          aria-label="Добавить сферу применения"
          variant="contained"
          disabled={true}
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
          to={routes.admin.createScope()}
        >
          {isMobile ? <Add /> : 'Добавить'}
        </Button>
      </Stack>

      {isMobile ? (
        // 📱 МОБИЛЬНАЯ ВЕРСИЯ: Компактный однострочный список сфер применения ГРОЕИ
        <Stack spacing={1}>
          {scopesList.map((sc) => (
            <Paper
              key={sc.id}
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
              {/* Наименование сферы госрегулирования */}
              <Typography
                variant="subtitle2"
                sx={{
                  textTransform: 'uppercase',
                  fontSize: '0.825rem',
                  letterSpacing: '0.6px',
                  fontWeight: 700,
                  color: 'text.primary',
                  wordBreak: 'break-word', // Защита от излома верстки при длинных названиях сфер
                  lineHeight: 1.3,
                }}
              >
                {cleanSpaces(sc.name)}
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
                  disabled={true}
                  sx={{
                    border: '1px solid',
                    borderColor: 'error.light',
                    width: 32,
                    height: 32,
                    bgcolor: 'rgba(211, 47, 47, 0.02)',
                  }}
                  onClick={() => handleDeleteClick(sc.id)}
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
              {scopesList.map((sc) => (
                <TableRow
                  key={sc.id}
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
                  <TableCell>{cleanSpaces(sc.name)}</TableCell>
                  <TableCell>{formatDate(sc.createdAt)}</TableCell>
                  <TableCell>{formatDate(sc.updatedAt)}</TableCell>
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
                            // to={routes.admin.editProductionSite(eq.id)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Удалить" arrow>
                        <Box component="span" sx={{ display: 'inline-block' }}>
                          <IconButton
                            disabled={true}
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(sc.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
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
            Вы действительно хотите удалить эту сферу применения? Это действие
            нельзя отменить.
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
