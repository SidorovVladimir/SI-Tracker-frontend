import React from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  GetPricelistsDocument,
  DeletePricelistDocument,
} from '../graphql/types/__generated__/graphql';

export const PricelistListPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Загрузка прейскурантов из базы данных
  const { data, loading, error } = useQuery(GetPricelistsDocument, {
    fetchPolicy: 'network-only',
  });
  const pricelists = data?.pricelists || [];

  // Мутация удаления
  const [deletePricelist, { loading: deleting }] = useMutation(
    DeletePricelistDocument,
    {
      refetchQueries: [{ query: GetPricelistsDocument }],
    }
  );

  const handleDelete = async (id: string, title: string) => {
    if (
      window.confirm(
        `Вы уверены, что хотите удалить прейскурант "${title}"? Это каскадно сотрет все его цены.`
      )
    ) {
      try {
        await deletePricelist({ variables: { id } });
        enqueueSnackbar('Прейскурант успешно удален', { variant: 'success' });
      } catch (err: any) {
        enqueueSnackbar(`Ошибка удаления: ${err.message}`, {
          variant: 'error',
        });
      }
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Alert severity="error">Ошибка загрузки архива: {error.message}</Alert>
    );

  return (
    <Box>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 2 }}
      >
        <Table aria-label="pricelists table">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Название прейскуранта
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Организация ЦСМ</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Год действия</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Тип тарифа</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Дата загрузки</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                Действия
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pricelists.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}
                >
                  В системе пока нет загруженных прейскурантов ЦСМ. Перейдите на
                  вкладку импорта, чтобы добавить первый прайс.
                </TableCell>
              </TableRow>
            ) : (
              pricelists.map((list: any) => (
                <TableRow key={list.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {list.title}
                  </TableCell>
                  <TableCell>
                    {list.verificationOrganization?.name || '—'}
                  </TableCell>
                  <TableCell>{list.year} г.</TableCell>
                  <TableCell>
                    <Chip
                      label={list.isRegulated ? 'Регулируемый' : 'Договорной'}
                      color={list.isRegulated ? 'primary' : 'default'}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(list.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      disabled={deleting}
                      onClick={() => handleDelete(list.id, list.title)}
                      sx={{ textTransform: 'none' }}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
