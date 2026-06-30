import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {
  DeleteBudgetPlanDocument,
  GetBudgetPlansDocument,
} from '../graphql/types/__generated__/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { CreateBudgetPlanModal } from '../components/modals/CreateBudgetPlanModal';
import { enqueueSnackbar } from 'notistack';
import { formatDate } from '../utils/date';
import { ConfirmationDialog } from '../components/modals/ConfirmationDialog';

export const BudgetPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    year: number;
  }>({
    open: false,
    id: '',
    year: 0,
  });

  const { data, loading, error } = useQuery(GetBudgetPlansDocument, {
    fetchPolicy: 'network-only',
  });

  const [deleteBudgetPlan, { loading: deleting }] = useMutation(
    DeleteBudgetPlanDocument,
    {
      refetchQueries: [{ query: GetBudgetPlansDocument }],
    }
  );

  const triggerDeleteDialog = (id: string, year: number) => {
    setDeleteConfirm({ open: true, id, year });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBudgetPlan({ variables: { id: deleteConfirm.id } });
      enqueueSnackbar(
        `План бюджета на ${deleteConfirm.year} год успешно удален`,
        { variant: 'success' }
      );
    } catch (err: any) {
      enqueueSnackbar(`Ошибка удаления бюджета: ${err.message}`, {
        variant: 'error',
      });
    } finally {
      setDeleteConfirm({ open: false, id: '', year: 0 });
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
      <Alert severity="error">
        Ошибка загрузки списка бюджетов: {error.message}
      </Alert>
    );

  const plans = data?.budgetPlans || [];

  return (
    <Container
      maxWidth="xl"
      sx={{ mt: { xs: 1, sm: 2 }, mb: 4, px: { xs: 0, sm: 2 } }}
    >
      {/* Шапка страницы: на мобилках элементы встают в колонку */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 'bold',
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            💰 Годовые бюджеты
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Управляйте плановыми бюджетами на поверку и калибровку СИ.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ fontWeight: 'bold', width: { xs: '100%', sm: 'auto' } }}
        >
          Спланировать бюджет
        </Button>
      </Box>

      {/* Пустое состояние */}
      {plans.length === 0 && (
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
          Бюджеты еще не создавались. Нажмите «Спланировать бюджет», чтобы
          запустить первый расчет.
        </Paper>
      )}

      {plans.length > 0 && (
        <>
          {/* 🖥️ ДЕСКТОПНАЯ ВЕРСИЯ: Скрывается на экранах меньше 960px (md) */}
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2, display: { xs: 'none', md: 'block' } }}
          >
            <Table aria-label="budget plans table">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Год планирования
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Примечание</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Дата создания
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Действия
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {plan.year} год
                    </TableCell>
                    <TableCell>
                      {plan.status === 'approved' ? (
                        <Chip label="Заморожен" color="success" size="small" />
                      ) : (
                        <Chip
                          label="Черновик"
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {plan.comment || '—'}
                    </TableCell>
                    <TableCell>{formatDate(plan.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          disabled={deleting}
                          onClick={() =>
                            triggerDeleteDialog(plan.id, plan.year)
                          }
                          sx={{ textTransform: 'none' }}
                        >
                          Удалить
                        </Button>
                        <IconButton
                          color="primary"
                          onClick={() =>
                            navigate(`/budget/plans/details/${plan.id}`)
                          }
                          title="Открыть детализацию"
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ: Список карточек. Скрывается на десктопах (md+) */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {plans.map((plan) => (
              <Paper
                key={plan.id}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}
              >
                {/* Строка 1: Год и статус */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {plan.year} год
                  </Typography>
                  {plan.status === 'approved' ? (
                    <Chip label="Заморожен" color="success" size="small" />
                  ) : (
                    <Chip
                      label="Черновик"
                      color="warning"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Строка 2: Дата создания */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1 }}
                >
                  Создан: {formatDate(plan.createdAt)}
                </Typography>

                {/* Строка 3: Примечание */}
                {plan.comment && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                      bgcolor: 'grey.50',
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    {plan.comment}
                  </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Строка 4: Кнопки действий */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    startIcon={<DeleteOutlineIcon />}
                    disabled={deleting}
                    onClick={() => triggerDeleteDialog(plan.id, plan.year)}
                    sx={{ textTransform: 'none' }}
                  >
                    Удалить
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(`/budget/plans/details/${plan.id}`)}
                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                  >
                    Детализация
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        </>
      )}

      <CreateBudgetPlanModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <ConfirmationDialog
        open={deleteConfirm.open}
        title="Удаление плана бюджета"
        description={`Вы уверены, что хотите полностью удалить план бюджета на ${deleteConfirm.year} год? Это действие сотрет все сохраненные плановые цены для приборов.`}
        confirmLabel="Удалить"
        isDanger
        loading={deleting}
        onClose={() => setDeleteConfirm({ open: false, id: '', year: 0 })}
        onConfirm={handleConfirmDelete}
      />
    </Container>
  );
};
