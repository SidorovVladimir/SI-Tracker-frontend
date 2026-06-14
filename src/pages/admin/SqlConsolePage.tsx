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
import { CloudDownload, CloudUpload, PlayArrow } from '@mui/icons-material';
import { useLazyQuery } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { API_ROUTES } from '../../config';
import { useSocketApp } from '../../context/SocketContext';

export const SqlConsolePage: React.FC = () => {
  const [queryText, setQueryText] = useState<string>(
    'SELECT * FROM devices LIMIT 5;'
  );

  const { addRunningJob } = useSocketApp();

  const { enqueueSnackbar } = useSnackbar();
  const [isRestoring, setIsRestoring] = useState(false);

  // Используем useLazyQuery, чтобы запрос улетал только по нажатию кнопки
  const [runSql, { data, loading }] = useLazyQuery(ExecuteRawSqlDocument, {
    fetchPolicy: 'network-only',
  });

  const handleExecute = () => {
    if (!queryText.trim()) return;
    runSql({ variables: { sqlQuery: queryText } });
  };

  const sqlResult = data?.executeRawSql;

  const handleDownloadBackup = async () => {
    try {
      const response = await fetch(API_ROUTES.backup, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errText = await response.text();
        enqueueSnackbar(`Ошибка скачивания: ${errText}`, { variant: 'error' });
        return;
      }

      // Создаём blob и триггерим скачивание
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `si_tracker_backup_${
        new Date().toISOString().split('T')[0]
      }.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      enqueueSnackbar('📦 Дамп успешно скачан!', { variant: 'success' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      enqueueSnackbar(`Сбой сети: ${errorMessage}`, { variant: 'error' });
    }
  };

  const handleRestoreBackup = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = window.confirm(
      '⚠️ ВНИМАНИЕ! Вы собираетесь полностью перезаписать текущую базу данных. Все текущие несохраненные данные будут стерты. Продолжить?'
    );
    if (!confirmRestore) return;

    setIsRestoring(true);

    try {
      enqueueSnackbar(
        '📦 Шаг 1/2: Загрузка файла резервной копии на сервер...',
        {
          variant: 'info',
          key: 'db-restore-toast',
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          autoHideDuration: 30000,
        }
      );
      const response = await fetch(API_ROUTES.restore, {
        method: 'POST',
        body: file,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });
      console.log(response);

      if (response.ok || response.status === 202) {
        const data = await response.json();
        enqueueSnackbar(
          '🛠️ Шаг 2/2: Файл загружен. Применяются SQL-скрипты. База данных заблокирована...',
          {
            variant: 'warning',
            key: 'db-restore-toast',
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            autoHideDuration: 60000,
          }
        );

        if (data.jobId) {
          addRunningJob(data.jobId, 'db-restore');
        }
        // Перезагружаем страницу, чтобы обновить все кэши и данные на экране
        // setTimeout(() => window.location.reload(), 1500);
      } else {
        const errText = await response.text();
        enqueueSnackbar(`Ошибка: ${errText}`, { variant: 'error' });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      enqueueSnackbar(`Сбой сети: ${errorMessage}`, { variant: 'error' });
    } finally {
      setIsRestoring(false);
    }
  };

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            💻 Терминал сырых SQL запросов
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Инструмент прямого взаимодействия с PostgreSQL. Будьте осторожны с
            командами UPDATE и DELETE.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="warning"
            component="label"
            disabled={isRestoring}
            startIcon={
              isRestoring ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CloudUpload />
              )
            }
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              height: 40,
              borderRadius: 2,
            }}
          >
            {isRestoring ? '⏳ Восстановление...' : 'Восстановить БД из .sql'}
            <input
              type="file"
              accept=".sql"
              hidden
              onChange={handleRestoreBackup}
            />
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<CloudDownload />}
            // Браузер сам сделает GET-запрос по этой ссылке, передаст куки авторизации и скачает файл
            onClick={handleDownloadBackup}
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              height: 40,
              borderRadius: 2,
            }}
          >
            Скачать дамп БД (.sql)
          </Button>
        </Box>
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
