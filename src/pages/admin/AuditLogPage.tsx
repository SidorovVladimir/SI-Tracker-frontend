import { useState } from 'react';

import {
  Box,
  Typography,
  CircularProgress,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Card,
  Stack,
} from '@mui/material';

import { AuditLogRow } from '../../components/AuditLogRow';
import {
  DeleteLogDocument,
  GetDeviceAuditLogsDocument,
} from '../../graphql/types/__generated__/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const { data, loading, error, refetch } = useQuery(
    GetDeviceAuditLogsDocument,
    {
      variables: {
        // filter: {
        //   deviceId: undefined,
        //   userId: undefined,
        //   action: actionFilter !== 'all' ? actionFilter : undefined,
        // },
        filter:
          actionFilter === 'all' ? undefined : { action: actionFilter as any },
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      },
      fetchPolicy: 'network-only',
    }
  );
  const [deleteLog] = useMutation(DeleteLogDocument, {
    onCompleted: () => {
      refetch();
      enqueueSnackbar('Лог успешно удален', {
        variant: 'success',
      });
    },
    onError: (error) => {
      enqueueSnackbar(`Ошибка удаления: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  if (error)
    return (
      <Typography color="error" sx={{ m: 4 }}>
        Ошибка: {error.message}
      </Typography>
    );

  const response = data?.deviceAuditLogs;
  const items = response?.items || [];
  const totalCount = response?.totalCount || 0;

  const handleDelete = async (id: string) => {
    await deleteLog({ variables: { id: id } });
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 1, sm: 1 },
        height: { xs: 'calc(100dvh - 230px)', sm: 'calc(100dvh - 130px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ================= ФИКСИРОВАННАЯ ШАПКА ================= */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          zIndex: 10,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Журнал аудита изменений
        </Typography>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel id="action-filter-label">Тип действия</InputLabel>
          <Select
            labelId="action-filter-label"
            value={actionFilter}
            label="Тип действия"
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="all">Все действия</MenuItem>
            <MenuItem value="create">Только создания</MenuItem>
            <MenuItem value="update">Только изменения паспорта</MenuItem>

            {/* 🌟 НОВЫЕ СИСТЕМНЫЕ МЕНЮ-ПУНКТЫ ФИЛЬТРАЦИИ ПЛАНИРОВАНИЯ: */}
            <MenuItem value="assign_batch">
              Добавление в партии поверок
            </MenuItem>
            <MenuItem value="remove_batch">
              Исключение из партий поверок
            </MenuItem>
            <MenuItem value="verify">
              Фиксация результатов поверок/контроля
            </MenuItem>

            <MenuItem value="delete">Только удаления</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto', // Разрешаем скролл только списку элементов
          my: 2,
          pr: 0.5, // Небольшой отступ, чтобы скроллбар не нализал на карточки
          // Стилизуем полосу прокрутки под аккуратный MUI вид
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#cbd5e1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': { bgcolor: '#94a3b8' },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Card
            sx={{ p: 4, textAlign: 'center', color: 'text.secondary', my: 2 }}
          >
            Записи аудита по выбранным фильтрам не найдены
          </Card>
        ) : (
          <Stack spacing={1.5} sx={{ py: 1 }}>
            {items.map((log: any) => (
              <AuditLogRow key={log.id} log={log} onDelete={handleDelete} />
            ))}
          </Stack>
        )}
      </Box>

      {/* ================= ФИКСИРОВАННАЯ ПАГИНАЦИЯ ВНИЗУ ================= */}
      {!loading && items.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 'auto',
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: 10,
          }}
        >
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Строк:"
            sx={{
              // Компактный вид пагинации для маленьких экранов мобильных устройств
              '& .MuiTablePagination-toolbar': { px: { xs: 0.5, sm: 2 } },
              '& .MuiTablePagination-actions': { ml: { xs: 0.5, sm: 2 } },
            }}
          />
        </Box>
      )}
    </Container>
  );
}
