// import React from 'react';
// import {
//   Box,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   CircularProgress,
//   Chip,
//   Alert,
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { useSnackbar } from 'notistack';
// import { useMutation, useQuery } from '@apollo/client/react';
// import {
//   GetPricelistsDocument,
//   DeletePricelistDocument,
// } from '../graphql/types/__generated__/graphql';
// import { formatDate } from '../utils/date';

// export const PricelistListPage: React.FC = () => {
//   const { enqueueSnackbar } = useSnackbar();

//   // Загрузка прейскурантов из базы данных
//   const { data, loading, error } = useQuery(GetPricelistsDocument, {
//     fetchPolicy: 'network-only',
//   });
//   const pricelists = data?.pricelists || [];

//   // Мутация удаления
//   const [deletePricelist, { loading: deleting }] = useMutation(
//     DeletePricelistDocument,
//     {
//       refetchQueries: [{ query: GetPricelistsDocument }],
//     }
//   );

//   const handleDelete = async (id: string, title: string) => {
//     if (
//       window.confirm(
//         `Вы уверены, что хотите удалить прейскурант "${title}"? Это каскадно сотрет все его цены.`
//       )
//     ) {
//       try {
//         await deletePricelist({ variables: { id } });
//         enqueueSnackbar('Прейскурант успешно удален', { variant: 'success' });
//       } catch (err: any) {
//         enqueueSnackbar(`Ошибка удаления: ${err.message}`, {
//           variant: 'error',
//         });
//       }
//     }
//   };

//   if (loading)
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
//         <CircularProgress />
//       </Box>
//     );
//   if (error)
//     return (
//       <Alert severity="error">Ошибка загрузки архива: {error.message}</Alert>
//     );

//   return (
//     <Box>
//       <TableContainer
//         component={Paper}
//         variant="outlined"
//         sx={{ borderRadius: 2 }}
//       >
//         <Table aria-label="pricelists table">
//           <TableHead>
//             <TableRow sx={{ bgcolor: 'grey.50' }}>
//               <TableCell sx={{ fontWeight: 'bold' }}>
//                 Название прейскуранта
//               </TableCell>
//               <TableCell sx={{ fontWeight: 'bold' }}>Организация ЦСМ</TableCell>
//               <TableCell sx={{ fontWeight: 'bold' }}>Год действия</TableCell>
//               <TableCell sx={{ fontWeight: 'bold' }}>Тип тарифа</TableCell>
//               <TableCell sx={{ fontWeight: 'bold' }}>Дата загрузки</TableCell>
//               <TableCell align="right" sx={{ fontWeight: 'bold' }}>
//                 Действия
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {pricelists.length === 0 ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={6}
//                   align="center"
//                   sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}
//                 >
//                   В системе пока нет загруженных прейскурантов ЦСМ. Перейдите на
//                   вкладку импорта, чтобы добавить первый прайс.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               pricelists.map((list: any) => (
//                 <TableRow key={list.id} hover>
//                   <TableCell sx={{ fontWeight: 'bold' }}>
//                     {list.title}
//                   </TableCell>
//                   <TableCell>
//                     {list.verificationOrganization?.name || '—'}
//                   </TableCell>
//                   <TableCell>{list.year} г.</TableCell>
//                   <TableCell>
//                     <Chip
//                       label={list.isRegulated ? 'Регулируемый' : 'Договорной'}
//                       color={list.isRegulated ? 'primary' : 'default'}
//                       size="small"
//                       variant="outlined"
//                       sx={{ fontWeight: 'bold' }}
//                     />
//                   </TableCell>
//                   <TableCell>{formatDate(list.createdAt)}</TableCell>
//                   <TableCell align="right">
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       size="small"
//                       startIcon={<DeleteIcon />}
//                       disabled={deleting}
//                       onClick={() => handleDelete(list.id, list.title)}
//                       sx={{ textTransform: 'none' }}
//                     >
//                       Удалить
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };
// src/modules/budget/pages/PriceListPage.tsx
import React, { useState } from 'react';
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
  Typography,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  GetPricelistsDocument,
  DeletePricelistDocument,
} from '../graphql/types/__generated__/graphql';
import { formatDate } from '../utils/date';
import { ConfirmationDialog } from '../components/modals/ConfirmationDialog';
import { formatStrictUpper } from '../utils/capitalize';

export const PricelistListPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    title: string;
  }>({
    open: false,
    id: '',
    title: '',
  });

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

  const triggerDeleteDialog = (id: string, title: string) => {
    setDeleteConfirm({ open: true, id, title });
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePricelist({ variables: { id: deleteConfirm.id } });
      enqueueSnackbar('Прейскурант успешно удален', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(`Ошибка удаления: ${err.message}`, { variant: 'error' });
    } finally {
      setDeleteConfirm({ open: false, id: '', title: '' });
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
    <Box sx={{ px: { xs: 0, sm: 1 } }}>
      {/* Пустое состояние */}
      {pricelists.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
            color: 'text.secondary',
            fontStyle: 'italic',
            borderRadius: 2,
          }}
        >
          В системе пока нет загруженных прейскурантов ЦСМ. Перейдите на вкладку
          импорта, чтобы добавить первый прайс.
        </Paper>
      )}

      {pricelists.length > 0 && (
        <>
          {/* 🖥️ ДЕСКТОПНАЯ ВЕРСИЯ: Отображается от md (960px) и выше */}
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2, display: { xs: 'none', md: 'block' } }}
          >
            <Table aria-label="pricelists table">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Название прейскуранта
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Организация ЦСМ
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Год действия
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Тип тарифа</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Дата загрузки
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Действия
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pricelists.map((list: any) => (
                  <TableRow key={list.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatStrictUpper(list.title)}
                    </TableCell>
                    <TableCell>
                      {formatStrictUpper(list.verificationOrganization?.name)}
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
                    <TableCell>{formatDate(list.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        disabled={deleting}
                        onClick={() => triggerDeleteDialog(list.id, list.title)}
                        sx={{ textTransform: 'none' }}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ: Отображается на экранах xs и sm, скрыта на md+ */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {pricelists.map((list: any) => (
              <Paper
                key={list.id}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}
              >
                {/* Название прайса и статус тарифа */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 'bold', lineHeight: 1.2 }}
                  >
                    {formatStrictUpper(list.title)}
                  </Typography>
                  <Chip
                    label={list.isRegulated ? 'Рег.' : 'Дог.'}
                    color={list.isRegulated ? 'primary' : 'default'}
                    size="small"
                    variant="filled"
                    sx={{ fontWeight: 'bold', height: 20, fontSize: '0.75rem' }}
                  />
                </Box>

                {/* Организация ЦСМ с иконкой */}
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <BusinessIcon fontSize="inherit" color="action" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ maxWidth: '100%' }}
                  >
                    {formatStrictUpper(list.verificationOrganization?.name)}
                  </Typography>
                </Box>

                {/* Год действия с иконкой */}
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <CalendarMonthIcon fontSize="inherit" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Период: {list.year} г.
                  </Typography>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* Дата загрузки и кнопка действия */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Загружен: {formatDate(list.createdAt)}
                  </Typography>

                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    disabled={deleting}
                    onClick={() => triggerDeleteDialog(list.id, list.title)}
                    sx={{ textTransform: 'none', py: 0.5 }}
                  >
                    Удалить
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        </>
      )}
      <ConfirmationDialog
        open={deleteConfirm.open}
        title="Удаление прейскуранта"
        description={`Вы уверены, что хотите удалить прейскурант "${deleteConfirm.title}"? Это каскадно сотрет все его цены из системы.`}
        confirmLabel="Удалить"
        isDanger
        loading={deleting}
        onClose={() => setDeleteConfirm({ open: false, id: '', title: '' })}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};
