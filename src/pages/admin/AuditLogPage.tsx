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
} from '@mui/material';

import { AuditLogRow } from '../../components/AuditLogRow';
import { GetDeviceAuditLogsDocument } from '../../graphql/types/__generated__/graphql';
import { useQuery } from '@apollo/client/react';

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { data, loading, error } = useQuery(GetDeviceAuditLogsDocument, {
    variables: {
      // filter: actionFilter !== 'all' ? { action: actionFilter } : null,
      filter: {},
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    },
    fetchPolicy: 'network-only',
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Журнал аудита изменений
        </Typography>

        {/* Панель фильтрации */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
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
            <MenuItem value="update">Только изменения</MenuItem>
            <MenuItem value="delete">Только удаления</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          Записи аудита по выбранным фильтрам не найдены
        </Card>
      ) : (
        <Box>
          {items.map((log: any) => (
            <AuditLogRow key={log.id} log={log} />
          ))}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
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
            />
          </Box>
        </Box>
      )}
    </Container>
  );
}
