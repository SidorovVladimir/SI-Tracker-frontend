import React, { useEffect } from 'react';
import { useSocketApp } from '../context/SocketContext';
import { Box, Paper, Typography, LinearProgress } from '@mui/material';

// 1. Описываем интерфейс пропсов для связи со страницей журнала
interface GlobalJobWatcherProps {
  onJobClose?: (batchId: string) => void;
}

export const GlobalJobWatcher: React.FC<GlobalJobWatcherProps> = ({
  onJobClose,
}) => {
  const { runningJobs } = useSocketApp();

  // Вытаскиваем все задачи: и активные, и завершенные
  const jobsArray = Object.values(runningJobs);

  const activeJobs = jobsArray.filter((job) => job.status === 'active');

  // 2. СЛЕДИМ ЗА ФИНАЛОМ ЗАДАЧИ ЧЕРЕЗ EFFECT
  useEffect(() => {
    jobsArray.forEach((job) => {
      if (job.status === 'completed' || job.status === 'failed') {
        const timer = setTimeout(() => {
          if (onJobClose && job.batchId) {
            onJobClose(job.batchId);
          }
        }, 4000);

        return () => clearTimeout(timer);
      }
    });
  }, [jobsArray, onJobClose]);

  if (activeJobs.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 16, sm: 24 },
        right: { xs: 0, sm: 24 },
        left: { xs: 0, sm: 'auto' },
        px: { xs: 2, sm: 0 },
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        maxWidth: { xs: '100%', sm: 360 },
        width: '100%',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      {activeJobs.map((job) => {
        const isRestore = job.name === 'db-restore';
        return (
          <Paper
            key={job.jobId}
            elevation={6}
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderLeft: '4px solid',
              borderColor: isRestore ? 'error.main' : 'warning.main',
              borderRadius: 2,
              pointerEvents: 'auto',
              width: '100%',
              boxSizing: 'border-box',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12)',
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography
                variant="body2"
                fontWeight="bold"
                noWrap
                sx={{ maxWidth: '80%', color: 'text.primary' }}
              >
                {isRestore && '🛠️ Восстановление базы данных...'}
                {job.name === 'arshin-sync' && '🔬 Синхронизация с ФГИС Аршин'}
                {job.name === 'device-import' && '📦 Импорт приборов из Excel'}
              </Typography>
              <Typography
                variant="caption"
                color="warning.main"
                fontWeight="bold"
              >
                {job.percentage}%
              </Typography>
            </Box>

            <LinearProgress
              variant={isRestore ? 'indeterminate' : 'determinate'}
              value={isRestore ? undefined : job.percentage}
              color={isRestore ? 'error' : 'warning'}
              sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'grey.100' }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {isRestore ? (
                'Все операции заблокированы до окончания процесса.'
              ) : (
                <>
                  Обработано приборов: <strong>{job.current}</strong> из{' '}
                  <strong>{job.total}</strong>
                </>
              )}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
};
