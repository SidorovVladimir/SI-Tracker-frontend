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
  Grid,
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
  const [isRestoringFiles, setIsRestoringFiles] = useState(false);

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

  const handleDownloadFilesBackup = async () => {
    try {
      const response = await fetch(API_ROUTES.backupFiles, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        const errText = await response.text();
        enqueueSnackbar(`Ошибка скачивания файлов: ${errText}`, {
          variant: 'error',
        });
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documents_backup_${
        new Date().toISOString().split('T')[0]
      }.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      enqueueSnackbar('📂 Архиватор документов успешно скачан!', {
        variant: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      enqueueSnackbar(`Сбой сети: ${msg}`, { variant: 'error' });
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

  const handleRestoreFilesBackup = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const confirmRestore = window.confirm(
      '⚠️ ВНИМАНИЕ!\n\n' +
        '1. Вы собираетесь полностью перезаписать папку документов на сервере. Все текущие паспорта и фото будут стерты.\n' +
        '2. ВАЖНО: Если вы восстанавливаете систему с нуля, убедитесь, что вы УЖЕ восстановили Базу данных из .sql файла.\n\n' +
        'Вы уверены, что хотите продолжить распаковку файлов?'
    );

    if (!confirmRestore) {
      e.target.value = '';
      return;
    }

    setIsRestoringFiles(true);
    try {
      enqueueSnackbar('📂 Распаковка архива документов на сервере...', {
        variant: 'info',
      });
      const response = await fetch(API_ROUTES.restoreFiles, {
        method: 'POST',
        body: file,
        credentials: 'include',
      });

      if (response.ok) {
        enqueueSnackbar(
          '🚀 Все файлы, паспорта и фотографии приборов успешно восстановлены!',
          { variant: 'success' }
        );
      } else {
        const errText = await response.text();
        enqueueSnackbar(`Ошибка распаковки: ${errText}`, {
          variant: 'error',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      enqueueSnackbar(`Сбой сети: ${msg}`, { variant: 'error' });
    } finally {
      setIsRestoringFiles(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 }, // Меньше отступы на мобилке, чтобы не красть место
        bgcolor: 'background.paper',
        borderRadius: 2,
        height: '100%',
        position: 'relative',
      }}
    >
      <Grid
        container
        spacing={2.5}
        alignItems="center"
        sx={{
          mb: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* БЛОК 1: ЗАГОЛОВОК И ОПИСАНИЕ (Занимает всю ширину на мобилке, половину на десктопе) */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              mb: 0.5,
              fontSize: { xs: '1.15rem', sm: '1.4rem', md: '1.5rem' },
              lineHeight: 1.2,
            }}
          >
            💻 Терминал сырых SQL запросов
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.85rem' }}
          >
            Инструмент прямого взаимодействия с PostgreSQL. Будьте осторожны с
            командами UPDATE и DELETE.
          </Typography>
        </Grid>

        {/* БЛОК 2: ПРЕДУПРЕЖДАЮЩИЙ ALERT (На мобилке падает вниз, на десктопе аккуратно встает по центру) */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Alert
            severity="info"
            variant="outlined"
            sx={{
              py: 0.5,
              px: 1.5,
              borderRadius: 2,
              borderColor: 'info.light',
              bgcolor: '#f0f9ff',
              '& .MuiAlert-icon': {
                fontSize: '1.2rem',
                mr: 1,
                mt: '2px',
              },
              '& .MuiAlert-message': {
                fontSize: '0.78rem',
                lineHeight: 1.35,
                color: 'info.dark',
                fontWeight: 500,
              },
            }}
          >
            💡 <b>Важно:</b> Если вы разворачиваете систему с нуля, сначала
            восстановите <b>Базу данных (.sql)</b>, и только после этого
            восстанавливайте <b>Файлы (.zip)</b>.
          </Alert>
        </Grid>

        {/* БЛОК 3: ПАНЕЛЬ КНОПОК УПРАВЛЕНИЯ (Автоматически переносится и выравнивается) */}
        <Grid
          size={{ xs: 12, lg: 4 }}
          sx={{
            display: 'flex',
            justifyContent: { xs: 'flex-start', lg: 'flex-end' },
          }}
        >
          <Grid container spacing={1.2}>
            {/* Кнопка 1: Восстановить БД */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                variant="contained"
                color="warning"
                component="label"
                disabled={isRestoring || isRestoringFiles}
                fullWidth
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
                  fontSize: '0.82rem',
                }}
              >
                {isRestoring ? '⏳ Восстановление...' : 'Восстановить БД'}
                <input
                  type="file"
                  accept=".sql"
                  hidden
                  onChange={handleRestoreBackup}
                />
              </Button>
            </Grid>

            {/* Кнопка 2: Скачать БД */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                variant="outlined"
                color="success"
                startIcon={<CloudDownload />}
                onClick={handleDownloadBackup}
                disabled={isRestoring || isRestoringFiles}
                fullWidth
                sx={{
                  fontWeight: 'bold',
                  textTransform: 'none',
                  height: 40,
                  borderRadius: 2,
                  fontSize: '0.82rem',
                }}
              >
                Скачать дамп БД
              </Button>
            </Grid>

            {/* Кнопка 3: Восстановить файлы */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                variant="outlined"
                color="warning"
                component="label"
                disabled={isRestoring || isRestoringFiles}
                fullWidth
                startIcon={
                  isRestoringFiles ? (
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
                  fontSize: '0.82rem',
                }}
              >
                {isRestoringFiles ? '⏳ Распаковка...' : 'Восстановить файлы'}
                <input
                  type="file"
                  accept=".zip"
                  hidden
                  onChange={handleRestoreFilesBackup}
                />
              </Button>
            </Grid>

            {/* Кнопка 4: Скачать файлы */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                variant="outlined"
                color="success"
                startIcon={<CloudDownload />}
                onClick={handleDownloadFilesBackup}
                disabled={isRestoring || isRestoringFiles}
                fullWidth
                sx={{
                  fontWeight: 'bold',
                  textTransform: 'none',
                  height: 40,
                  borderRadius: 2,
                  fontSize: '0.82rem',
                }}
              >
                Скачать архив файлов
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

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
        fullWidth
        startIcon={
          loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <PlayArrow />
          )
        }
        disabled={loading || isRestoring || isRestoringFiles}
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
