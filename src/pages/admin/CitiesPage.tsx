import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteCityDocument,
  GetSitiesDocument,
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
import { Delete, Edit } from '@mui/icons-material';
import { useState } from 'react';
import routes from '../../utils/routes';
import { enqueueSnackbar } from 'notistack';

export default function CitiesPage() {
  const { data, loading, refetch } = useQuery(GetSitiesDocument);

  const [deleteCity] = useMutation(DeleteCityDocument, {
    onCompleted: () => {
      refetch();
      enqueueSnackbar('Город успешно удален', {
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
  const [selectedCityId, setSelectedCityId] = useState<string>('');

  if (loading)
    return (
      <Typography sx={{ p: 4, textAlign: 'center' }}>Загрузка...</Typography>
    );
  const cities = data?.cities || [];

  const handleDeleteClick = (id: string) => {
    setSelectedCityId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCityId('');
  };

  const handleConfirmDelete = async () => {
    handleCloseDialog();
    await deleteCity({ variables: { id: selectedCityId } });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Управление городами
      </Typography>

      {isMobile ? (
        // Мобильная версия: Список карточек
        <Stack spacing={2}>
          {cities.map((c) => (
            <Card key={c.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {c.name}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton
                    size="small"
                    color="primary"
                    sx={{ border: '1px solid', borderColor: 'primary.light' }}
                    component={Link}
                    to={routes.admin.editCity(c.id)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    sx={{ border: '1px solid', borderColor: 'error.light' }}
                    onClick={() => handleDeleteClick(c.id)}
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
              {cities.map((c) => (
                <TableRow key={c.id} hover sx={{ '& > td': { py: 1.5 } }}>
                  <TableCell>{c.name}</TableCell>
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
                          to={routes.admin.editCity(c.id)}
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
            Вы действительно хотите удалить этот город? Это действие нельзя
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
