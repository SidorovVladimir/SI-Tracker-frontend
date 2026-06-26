// src/modules/budget/pages/BudgetPlansPage.tsx
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import {
  DeleteBudgetPlanDocument,
  GetBudgetPlansDocument,
} from '../graphql/types/__generated__/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { CreateBudgetPlanModal } from '../components/modals/CreateBudgetPlanModal';
import { enqueueSnackbar } from 'notistack';
import { formatDate } from '../utils/date';

export const BudgetPlansPage: React.FC = () => {
  const navigate = useNavigate();

  // Ключевое состояние для управления видимостью модального окна
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Запрос списка всех годовых бюджетов из базы данных
  const { data, loading, error } = useQuery(GetBudgetPlansDocument, {
    fetchPolicy: 'network-only',
  });

  const [deleteBudgetPlan, { loading: deleting }] = useMutation(
    DeleteBudgetPlanDocument,
    {
      // После удаления заставляем Apollo обновить список бюджетов на экране
      refetchQueries: [{ query: GetBudgetPlansDocument }],
    }
  );

  const handleDeletePlan = async (id: string, year: number) => {
    if (
      window.confirm(
        `Вы уверены, что хотите полностью удалить план бюджета на ${year} год? Это действие сотрет все сохраненные плановые цены для приборов.`
      )
    ) {
      try {
        await deleteBudgetPlan({ variables: { id } });
        enqueueSnackbar(`План бюджета на ${year} год успешно удален`, {
          variant: 'success',
        });
      } catch (err: any) {
        enqueueSnackbar(`Ошибка удаления бюджета: ${err.message}`, {
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
      <Alert severity="error">
        Ошибка загрузки списка бюджетов: {error.message}
      </Alert>
    );

  const plans = data?.budgetPlans || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Шапка страницы */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 'bold', mb: 0.5 }}
          >
            💰 Годовые бюджеты
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Управляйте плановыми бюджетами на поверку и калибровку средств
            измерений.
          </Typography>
        </Box>

        {/* КНОПКА, КОТОРАЯ ОТКРЫВАЕТ МОДАЛЬНОЕ ОКНО */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ fontWeight: 'bold' }}
        >
          Спланировать бюджет
        </Button>
      </Box>

      {/* Таблица со списком бюджетов по годам */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 2 }}
      >
        <Table aria-label="budget plans table">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Год планирования
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Примечание</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Дата создания</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                Действия
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}
                >
                  Бюджеты еще не создавались. Нажмите «Спланировать бюджет»,
                  чтобы запустить первый расчет.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
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
                      {/* 🎯 НОВАЯ КНОПКА УДАЛЕНИЯ БЮДЖЕТА */}
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={deleting}
                        onClick={() => handleDeletePlan(plan.id, plan.year)}
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ПОДКЛЮЧЕНИЕ МОДАЛЬНОГО ОКНА */}
      <CreateBudgetPlanModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Container>
  );
};
