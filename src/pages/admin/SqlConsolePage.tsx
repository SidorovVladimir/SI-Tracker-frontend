import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';

import { ExecuteRawSqlDocument } from '../../graphql/types/__generated__/graphql';
import { PlayArrow } from '@mui/icons-material';
import { useLazyQuery } from '@apollo/client/react';

export const SqlConsolePage: React.FC = () => {
  const [queryText, setQueryText] = useState<string>(
    'SELECT * FROM devices LIMIT 5;'
  );

  // Используем useLazyQuery, чтобы запрос улетал только по нажатию кнопки
  const [runSql, { data, loading }] = useLazyQuery(ExecuteRawSqlDocument, {
    fetchPolicy: 'network-only',
  });

  const handleExecute = () => {
    if (!queryText.trim()) return;
    runSql({ variables: { sqlQuery: queryText } });
  };

  const sqlResult = data?.executeRawSql;

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        height: '100%',
      }}
    >
      <Box
        sx={{
          mb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          💻 Терминал сырых SQL запросов
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Инструмент прямого взаимодействия с PostgreSQL. Будьте осторожны с
          командами UPDATE и DELETE.
        </Typography>
      </Box>

      {/* Поле ввода SQL кода */}
      <TextField
        multiline
        rows={6}
        fullWidth
        variant="outlined"
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
        placeholder="Введите SQL запрос здесь..."
        slotProps={{
          input: {
            sx: {
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              bgcolor: 'grey.900',
              color: 'common.white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
            },
          },
        }}
        sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}
      />

      <Button
        variant="contained"
        color="primary"
        startIcon={
          loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <PlayArrow />
          )
        }
        disabled={loading}
        onClick={handleExecute}
        sx={{ fontWeight: 'bold', textTransform: 'none', px: 4, mb: 3 }}
      >
        {loading ? 'Выполнение...' : 'Выполнить запрос'}
      </Button>

      {/* Вывод Ошибки СУБД, если она есть */}
      {sqlResult && !sqlResult.success && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Ошибка выполнения SQL:
          </Typography>
          <Box
            component="pre"
            sx={{
              m: 0,
              mt: 1,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
            }}
          >
            {sqlResult.errorMessage}
          </Box>
        </Alert>
      )}

      {/* Вывод успешного результата */}
      {sqlResult && sqlResult.success && (
        <Box>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Запрос успешно выполнен. Затронуто строк: {sqlResult.affectedRows}
          </Alert>

          {sqlResult.columns.length > 0 ? (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2, maxHeight: 500 }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {sqlResult.columns.map((colName, index) => (
                      <TableCell
                        key={index}
                        sx={{
                          bgcolor: 'grey.100',
                          fontWeight: 'bold',
                          fontFamily: 'monospace',
                        }}
                      >
                        {colName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sqlResult.rows.map((row: any, rIdx: number) => (
                    <TableRow key={rIdx} hover>
                      {sqlResult.columns.map((colName, cIdx) => {
                        const cellValue = row[colName];
                        return (
                          <TableCell
                            key={cIdx}
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                            }}
                          >
                            {/* Красиво выводим JSON-объекты в ячейке, если они там лежат */}
                            {typeof cellValue === 'object' && cellValue !== null
                              ? JSON.stringify(cellValue)
                              : String(cellValue ?? 'NULL')}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                p: 2,
                textAlign: 'center',
                border: '1px dashed divider',
                borderRadius: 2,
              }}
            >
              Запрос не вернул строк с данными (актуально для INSERT, UPDATE,
              DELETE команд).
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
