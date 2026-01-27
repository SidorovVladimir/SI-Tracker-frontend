import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteMeasurementTypeDocument,
  GetMeasurementTypesListDocument,
} from '../../graphql/types/__generated__/graphql';
import { Link } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
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

export default function MeasurementTypesPage() {
  const { data, loading, refetch } = useQuery(GetMeasurementTypesListDocument);

  const [deleteMeasurementType] = useMutation(DeleteMeasurementTypeDocument, {
    onCompleted: () => {
      refetch();
      enqueueSnackbar('Вид измерения успешно удален', {
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
  const [selectedMeasurementTypeId, setSelectedMeasurementTypeId] =
    useState<string>('');

  if (loading)
    return (
      <Typography sx={{ p: 4, textAlign: 'center' }}>Загрузка...</Typography>
    );
  const measurementTypes = data?.measurementTypes || [];

  const handleDeleteClick = (id: string) => {
    setSelectedMeasurementTypeId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMeasurementTypeId('');
  };

  const handleConfirmDelete = async () => {
    handleCloseDialog();
    await deleteMeasurementType({
      variables: { id: selectedMeasurementTypeId },
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
          Управление видами измерений
        </Typography>
        <Button
          aria-label="Добавить вид измерения"
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
          to={routes.admin.createMeasurementType()}
        >
          {isMobile ? <Add /> : 'Добавить'}
        </Button>
      </Stack>

      {isMobile ? (
        // Мобильная версия: Список карточек
        <Stack spacing={2}>
          {measurementTypes.map((m) => (
            <Card key={m.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {m.name}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton
                    size="small"
                    color="primary"
                    sx={{ border: '1px solid', borderColor: 'primary.light' }}
                    // component={Link}
                    // to={routes.admin.editProductionSite(p.id)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    sx={{ border: '1px solid', borderColor: 'error.light' }}
                    onClick={() => handleDeleteClick(m.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
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
              {measurementTypes.map((m) => (
                <TableRow key={m.id} hover sx={{ '& > td': { py: 1.5 } }}>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{formatDate(m.createdAt)}</TableCell>
                  <TableCell>{formatDate(m.updatedAt)}</TableCell>
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
                          // component={Link}
                          // to={routes.admin.editProductionSite(eq.id)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить" arrow>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(m.id)}
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
            Вы действительно хотите удалить этот вид измерений? Это действие
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
