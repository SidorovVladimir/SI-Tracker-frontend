// src/modules/budget/pages/BudgetPlanDetailPage.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

import { MatchMethodChip } from '../components/MatchMethodChip';
import { InlinePriceEdit } from '../components/InlinePriceEdit';
import {
  ApproveBudgetPlanDocument,
  GetBudgetPlanItemsDocument,
  UpdateBudgetPlanItemPriceDocument,
} from '../graphql/types/__generated__/graphql';
import { useMutation, useQuery } from '@apollo/client/react';

export const BudgetPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Состояние пагинации
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Состояние фильтрации
  const [searchQuery, setSearchQuery] = useState('');
  const [matchMethod, setMatchMethod] = useState<string>('');

  // GraphQL Хуки
  const { data, loading, error, refetch } = useQuery(
    GetBudgetPlanItemsDocument,
    {
      variables: {
        budgetId: id || '',
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        filter: {
          searchQuery: searchQuery || undefined,
          matchMethod: matchMethod || undefined,
        },
      },
      fetchPolicy: 'network-only',
    }
  );

  const [updatePrice] = useMutation(UpdateBudgetPlanItemPriceDocument);
  const [approveBudget] = useMutation(ApproveBudgetPlanDocument);

  if (loading && !data)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Alert severity="error">
        Ошибка загрузки строк бюджета: {error.message}
      </Alert>
    );

  const planItems = data?.budgetPlanItems.items || [];
  const totalCount = data?.budgetPlanItems.totalCount || 0;

  // Хэндлер изменения цены в строке
  const handleUpdatePrice = async (itemId: string, newPrice: number) => {
    await updatePrice({
      variables: {
        input: { itemId, manualPrice: newPrice },
      },
    });
    refetch(); // Обновляем данные на клиенте
  };

  // Хэндлер закрытия/заморозки бюджета на год
  const handleApproveBudget = async () => {
    if (
      window.confirm(
        'Вы уверены, что хотите утвердить бюджет? Это действие заморозит цены прошлых лет намертво.'
      )
    ) {
      await approveBudget({ variables: { id: id || '' } });
      window.location.reload(); // Перегружаем, чтобы залочить интерфейс
    }
  };

  // Флаг блокировки интерфейса (если бюджет уже утвержден, редактировать нельзя)
  const isApproved = false; // Для интеграции вытащите статус плана из отдельного Query или расширьте ответ

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Детализация бюджета
        </Typography>
        {!isApproved && (
          <Button
            variant="contained"
            color="success"
            startIcon={<LockIcon />}
            onClick={handleApproveBudget}
          >
            Утвердить и заморозить
          </Button>
        )}
      </Box>

      {/* Панель фильтров */}
      <Paper
        sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}
      >
        <TextField
          label="Поиск по прибору или модели"
          size="small"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          sx={{ width: 300 }}
        />
        <TextField
          select
          label="Метод поиска цены"
          size="small"
          value={matchMethod}
          onChange={(e) => {
            setMatchMethod(e.target.value);
            setPage(0);
          }}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Все методы</MenuItem>
          <MenuItem value="grsi">По ГРСИ</MenuItem>
          <MenuItem value="csm_code">По коду СИ</MenuItem>
          <MenuItem value="model_exact">По модели прибора</MenuItem>
          <MenuItem value="text_fuzzy">Нечеткий поиск</MenuItem>
          <MenuItem value="manual">Ручной ввод</MenuItem>
          <MenuItem value="not_found">Не найдено</MenuItem>
        </TextField>
      </Paper>

      {/* Таблица */}
      <TableContainer component={Paper}>
        <Table aria-label="budget plan items table">
          <TableHead>
            <TableRow>
              <TableCell>Наименование прибора</TableCell>
              <TableCell>Модель</TableCell>
              <TableCell>Серийный № / ГРСИ</TableCell>
              <TableCell align="center">Статус мэтчинга</TableCell>
              <TableCell align="right">Базовая цена (без НДС)</TableCell>
              <TableCell align="right">НДС (20%)</TableCell>
              <TableCell align="right">Итоговая стоимость</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {planItems.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.deviceName}</TableCell>
                <TableCell>{item.deviceModel}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    С/Н: {item.device.serialNumber}
                  </Typography>
                  <Typography variant="caption" display="block">
                    ГРСИ: {item.device.grsiNumber || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <MatchMethodChip method={item.matchMethod} />
                </TableCell>
                <TableCell align="right">
                  <InlinePriceEdit
                    itemId={item.id}
                    initialPrice={Number(item.basePrice)}
                    disabled={isApproved}
                    onSave={(newPrice) => handleUpdatePrice(item.id, newPrice)}
                  />
                </TableCell>
                <TableCell align="right">
                  {Number(item.vatAmount).toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                  })}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {Number(item.totalCost).toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
    </Container>
  );
};
